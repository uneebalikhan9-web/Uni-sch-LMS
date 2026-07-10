const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: String(process.env.DB_PASSWORD || process.env.DB_PASS || ''),
    database: process.env.DB_NAME || 'lancersnexus_mastercore',
    multipleStatements: true
  });

  try {
    console.log('Creating stored procedures...');
    const sql = `
DROP PROCEDURE IF EXISTS sp_calculate_semester_gpa;
DROP PROCEDURE IF EXISTS sp_validate_enrollment;

CREATE PROCEDURE sp_calculate_semester_gpa(
  IN p_student_id INT,
  IN p_semester_id INT
)
BEGIN
  DECLARE v_total_grade_points DECIMAL(10,2) DEFAULT 0.00;
  DECLARE v_credits_attempted DECIMAL(5,2) DEFAULT 0.00;
  DECLARE v_credits_earned DECIMAL(5,2) DEFAULT 0.00;
  DECLARE v_semester_gpa DECIMAL(4,3) DEFAULT 0.000;
  DECLARE v_cumulative_gpa DECIMAL(4,3) DEFAULT 0.000;
  DECLARE v_cumulative_grade_points DECIMAL(10,2) DEFAULT 0.00;
  DECLARE v_cumulative_credit_hours DECIMAL(5,2) DEFAULT 0.00;

  SELECT 
    IFNULL(SUM(cfg.grade_points * c.credit_hours), 0.00),
    IFNULL(SUM(c.credit_hours), 0.00),
    IFNULL(SUM(CASE WHEN cfg.grade_points > 0 THEN c.credit_hours ELSE 0.00 END), 0.00)
  INTO v_total_grade_points, v_credits_attempted, v_credits_earned
  FROM course_final_grades cfg
  JOIN courses c ON cfg.course_id = c.id
  WHERE cfg.student_id = p_student_id 
    AND cfg.semester_id = p_semester_id
    AND cfg.is_published = 1;

  IF v_credits_attempted > 0 THEN
    SET v_semester_gpa = v_total_grade_points / v_credits_attempted;
  ELSE
    SET v_semester_gpa = 0.000;
  END IF;

  SELECT 
    IFNULL(SUM(cfg.grade_points * c.credit_hours), 0.00),
    IFNULL(SUM(c.credit_hours), 0.00)
  INTO v_cumulative_grade_points, v_cumulative_credit_hours
  FROM course_final_grades cfg
  JOIN courses c ON cfg.course_id = c.id
  WHERE cfg.student_id = p_student_id 
    AND cfg.is_published = 1;

  IF v_cumulative_credit_hours > 0 THEN
    SET v_cumulative_gpa = v_cumulative_grade_points / v_cumulative_credit_hours;
  ELSE
    SET v_cumulative_gpa = 0.000;
  END IF;

  INSERT INTO student_semester_records (
    student_id, 
    semester_id, 
    credits_attempted, 
    credits_earned, 
    semester_gpa, 
    cumulative_gpa, 
    academic_standing
  ) VALUES (
    p_student_id, 
    p_semester_id, 
    v_credits_attempted, 
    v_credits_earned, 
    v_semester_gpa, 
    v_cumulative_gpa, 
    'good'
  )
  ON DUPLICATE KEY UPDATE 
    credits_attempted = v_credits_attempted,
    credits_earned = v_credits_earned,
    semester_gpa = v_semester_gpa,
    cumulative_gpa = v_cumulative_gpa;

  UPDATE students SET current_gpa = v_cumulative_gpa WHERE id = p_student_id;
END;

CREATE PROCEDURE sp_validate_enrollment(
  IN p_student_id INT,
  IN p_section_id INT,
  OUT p_result VARCHAR(255),
  OUT p_allowed TINYINT
)
BEGIN
  DECLARE v_course_id INT;
  DECLARE v_semester_id INT;
  DECLARE v_section_capacity INT;
  DECLARE v_current_enrolled INT;
  DECLARE v_student_cgpa DECIMAL(3,2) DEFAULT 0.00;
  DECLARE v_student_status VARCHAR(50);
  DECLARE v_current_semester_credits INT DEFAULT 0;
  DECLARE v_course_credit_hours INT DEFAULT 0;
  DECLARE v_prereq_not_met INT DEFAULT 0;
  DECLARE v_clash_exists INT DEFAULT 0;

  SET p_allowed = 1;
  SET p_result = 'ALLOWED';

  SELECT course_id, semester_id, max_capacity, current_enrolled
  INTO v_course_id, v_semester_id, v_section_capacity, v_current_enrolled
  FROM course_sections
  WHERE id = p_section_id;

  SELECT credit_hours INTO v_course_credit_hours FROM courses WHERE id = v_course_id;

  SELECT IFNULL(current_gpa, 0.00), academic_status
  INTO v_student_cgpa, v_student_status
  FROM students
  WHERE id = p_student_id;

  IF v_current_enrolled >= v_section_capacity THEN
    SET p_allowed = 0;
    SET p_result = 'SECTION_FULL';
  END IF;

  IF p_allowed = 1 AND EXISTS (
    SELECT 1 FROM enrollments 
    WHERE student_id = p_student_id AND course_id = v_course_id AND semester = v_semester_id AND status != 'dropped'
  ) THEN
    SET p_allowed = 0;
    SET p_result = 'ALREADY_ENROLLED';
  END IF;

  IF p_allowed = 1 THEN
    SELECT COUNT(*) INTO v_prereq_not_met
    FROM course_prerequisites cp
    WHERE cp.course_id = v_course_id
      AND cp.prerequisite_type = 'hard'
      AND NOT EXISTS (
        SELECT 1 FROM course_final_grades cfg
        WHERE cfg.student_id = p_student_id
          AND cfg.course_id = cp.prerequisite_course_id
          AND cfg.grade_points >= 1.00
          AND cfg.is_published = 1
      );
    
    IF v_prereq_not_met > 0 THEN
      SET p_allowed = 0;
      SET p_result = 'PREREQUISITE_NOT_MET';
    END IF;
  END IF;

  IF p_allowed = 1 THEN
    SELECT IFNULL(SUM(c.credit_hours), 0) INTO v_current_semester_credits
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = p_student_id AND e.semester = v_semester_id AND e.status != 'dropped';

    IF v_student_status = 'probation' AND (v_current_semester_credits + v_course_credit_hours) > 12 THEN
      SET p_allowed = 0;
      SET p_result = 'PROBATION_CREDIT_LIMIT_EXCEEDED';
    ELSEIF v_student_cgpa >= 3.50 AND (v_current_semester_credits + v_course_credit_hours) > 24 THEN
      SET p_allowed = 0;
      SET p_result = 'MAX_EXCEPTIONAL_CREDIT_LIMIT_EXCEEDED';
    ELSEIF v_student_cgpa < 3.50 AND v_student_status != 'probation' AND (v_current_semester_credits + v_course_credit_hours) > 21 THEN
      SET p_allowed = 0;
      SET p_result = 'REGULAR_CREDIT_LIMIT_EXCEEDED';
    END IF;
  END IF;

  IF p_allowed = 1 THEN
    SELECT COUNT(*) INTO v_clash_exists
    FROM section_schedules ss1
    JOIN section_schedules ss2 ON ss1.day_of_week = ss2.day_of_week
      AND (
        (ss1.start_time >= ss2.start_time AND ss1.start_time < ss2.end_time) OR
        (ss1.end_time > ss2.start_time AND ss1.end_time <= ss2.end_time) OR
        (ss1.start_time <= ss2.start_time AND ss1.end_time >= ss2.end_time)
      )
    WHERE ss1.section_id = p_section_id
      AND ss2.semester_id = v_semester_id
      AND ss2.section_id IN (
        SELECT DISTINCT cs.id
        FROM enrollments e
        JOIN course_sections cs ON e.course_id = cs.course_id AND e.semester = cs.semester_id
        WHERE e.student_id = p_student_id AND e.semester = v_semester_id AND e.status != 'dropped'
      )
      AND ss2.section_id != p_section_id;

    IF v_clash_exists > 0 THEN
      SET p_allowed = 0;
      SET p_result = 'TIMETABLE_CLASH';
    END IF;
  END IF;
END;
    `;

    await connection.query(sql);
    console.log('Procedures created successfully!');
  } catch (error) {
    console.error('Error executing schema:', error);
  } finally {
    await connection.end();
  }
}

run();
