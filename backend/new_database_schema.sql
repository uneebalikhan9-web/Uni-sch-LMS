-- HEC-Compliant University ERP Schema Overhaul Patches

-- ==========================================
-- Phase 1 Foundation Fixes
-- ==========================================

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) DEFAULT NULL,
  `building` varchar(100) DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `room_type` enum('lecture','lab','seminar','auditorium','exam_hall') DEFAULT 'lecture',
  `capacity` int(11) DEFAULT 30,
  `is_air_conditioned` tinyint(1) DEFAULT 0,
  `has_projector` tinyint(1) DEFAULT 0,
  `has_smart_board` tinyint(1) DEFAULT 0,
  `is_available` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `semesters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `term_type` enum('Fall','Spring','Summer') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `registration_open` datetime DEFAULT NULL,
  `registration_close` datetime DEFAULT NULL,
  `add_drop_deadline` datetime DEFAULT NULL,
  `withdrawal_deadline` datetime DEFAULT NULL,
  `midterm_start` date DEFAULT NULL,
  `midterm_end` date DEFAULT NULL,
  `final_start` date DEFAULT NULL,
  `final_end` date DEFAULT NULL,
  `result_publish_date` date DEFAULT NULL,
  `status` enum('upcoming','active','frozen','completed') DEFAULT 'upcoming',
  `is_summer` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. FK constraints on courses and classes
UPDATE courses SET teacher_id = NULL WHERE teacher_id NOT IN (SELECT id FROM employees);
ALTER TABLE courses ADD CONSTRAINT fk_course_teacher FOREIGN KEY (teacher_id) REFERENCES employees(id) ON DELETE SET NULL;

UPDATE classes SET teacher_id = NULL WHERE teacher_id NOT IN (SELECT id FROM employees);
ALTER TABLE classes ADD CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 3. Room Management adjustments
ALTER TABLE timetables ADD COLUMN room_id int(11) DEFAULT NULL AFTER end_time;
ALTER TABLE timetables DROP COLUMN room_number;
ALTER TABLE classes ADD COLUMN room_id int(11) DEFAULT NULL AFTER program_id;

-- 4. Add UNIQUE keys
ALTER TABLE enrollments ADD UNIQUE KEY unique_enrollment (student_id, course_id, semester);
ALTER TABLE timetables ADD UNIQUE KEY unique_teacher_slot (teacher_id, day_of_week, start_time, academic_year, semester);
ALTER TABLE timetables ADD UNIQUE KEY unique_room_slot (room_id, day_of_week, start_time, academic_year, semester);

-- 5. Merge system_logs and audit_logs
ALTER TABLE system_logs RENAME TO audit_logs;
ALTER TABLE audit_logs ADD COLUMN log_type enum('system','security','academic','finance') DEFAULT 'system' AFTER action;

-- 6. Fix finance_challans.semester
ALTER TABLE finance_challans ADD COLUMN semester_id int(11) DEFAULT NULL AFTER status;
ALTER TABLE finance_challans DROP COLUMN semester;


-- ==========================================
-- Phase 2 Academic Core Overhaul
-- ==========================================

-- 1. Create Degree Plans tables
CREATE TABLE IF NOT EXISTS `degree_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_id` int(11) NOT NULL,
  `version` varchar(20) NOT NULL,
  `effective_from` year(4) DEFAULT NULL,
  `min_credit_hours` int(11) DEFAULT 130,
  `max_credit_hours` int(11) DEFAULT 140,
  `core_credit_hours` int(11) DEFAULT NULL,
  `elective_credit_hours` int(11) DEFAULT NULL,
  `general_education_hours` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `approved_by_hec` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `degree_plan_courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `degree_plan_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `semester_number` int(11) NOT NULL,
  `is_core` tinyint(1) DEFAULT 1,
  `is_optional` tinyint(1) DEFAULT 0,
  `category` enum('core','elective','general','lab','project','thesis') DEFAULT 'core',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`degree_plan_id`) REFERENCES `degree_plans`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Course Prerequisites table
CREATE TABLE IF NOT EXISTS `course_prerequisites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `prerequisite_course_id` int(11) NOT NULL,
  `min_grade` varchar(5) DEFAULT 'D',
  `prerequisite_type` enum('hard','soft','co-requisite') DEFAULT 'hard',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`prerequisite_course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Course Sections and Schedules
CREATE TABLE IF NOT EXISTS `course_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `section_label` varchar(10) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `max_capacity` int(11) DEFAULT 30,
  `current_enrolled` int(11) DEFAULT 0,
  `waitlist_capacity` int(11) DEFAULT 10,
  `waitlist_count` int(11) DEFAULT 0,
  `status` enum('open','full','waitlist','closed','cancelled') DEFAULT 'open',
  `is_auto_created` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_course_section` (`course_id`, `semester_id`, `section_label`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `section_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `schedule_type` enum('lecture','lab','tutorial') DEFAULT 'lecture',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_time_slot` (`room_id`, `day_of_week`, `start_time`, `semester_id`),
  UNIQUE KEY `unique_section_time_slot` (`section_id`, `day_of_week`, `start_time`),
  FOREIGN KEY (`section_id`) REFERENCES `course_sections`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Grade Policies table
CREATE TABLE IF NOT EXISTS `grade_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) DEFAULT NULL,
  `grade_letter` varchar(5) NOT NULL,
  `min_percentage` decimal(5,2) NOT NULL,
  `max_percentage` decimal(5,2) NOT NULL,
  `grade_points` decimal(3,2) NOT NULL,
  `is_passing` tinyint(1) DEFAULT 1,
  `effective_from` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed HEC standard grade policies if table is empty
INSERT IGNORE INTO `grade_policies` (`id`, `campus_id`, `grade_letter`, `min_percentage`, `max_percentage`, `grade_points`, `is_passing`) VALUES
(1, NULL, 'A+', 90.00, 100.00, 4.00, 1),
(2, NULL, 'A',  85.00, 89.99,  4.00, 1),
(3, NULL, 'A-', 80.00, 84.99,  3.70, 1),
(4, NULL, 'B+', 75.00, 79.99,  3.30, 1),
(5, NULL, 'B',  71.00, 74.99,  3.00, 1),
(6, NULL, 'B-', 68.00, 70.99,  2.70, 1),
(7, NULL, 'C+', 64.00, 67.99,  2.30, 1),
(8, NULL, 'C',  60.00, 63.99,  2.00, 1),
(9, NULL, 'C-', 57.00, 59.99,  1.70, 1),
(10, NULL, 'D+', 53.00, 56.99,  1.30, 1),
(11, NULL, 'D',  50.00, 52.99,  1.00, 1),
(12, NULL, 'F',  0.00,  49.99,  0.00, 0);

-- 5. Create course_final_grades table
CREATE TABLE IF NOT EXISTS `course_final_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enrollment_id` int(11) DEFAULT NULL,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `section_id` int(11) DEFAULT NULL,
  `semester_id` int(11) NOT NULL,
  `total_marks` decimal(5,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `letter_grade` varchar(5) DEFAULT NULL,
  `grade_points` decimal(3,2) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_course_semester` (`student_id`, `course_id`, `semester_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create student_semester_records
CREATE TABLE IF NOT EXISTS `student_semester_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `credits_attempted` decimal(5,2) DEFAULT 0.00,
  `credits_earned` decimal(5,2) DEFAULT 0.00,
  `semester_gpa` decimal(4,3) DEFAULT 0.000,
  `cumulative_gpa` decimal(4,3) DEFAULT 0.000,
  `academic_standing` enum('good','warning','probation','suspension','dismissed') DEFAULT 'good',
  `is_frozen` tinyint(1) DEFAULT 0,
  `freeze_reason` text DEFAULT NULL,
  `min_credit_hours_met` tinyint(1) DEFAULT 0,
  `max_credit_hours_ok` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_semester` (`student_id`, `semester_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`semester_id`) REFERENCES `semesters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stored Procedures
DROP PROCEDURE IF EXISTS sp_calculate_semester_gpa;
DROP PROCEDURE IF EXISTS sp_validate_enrollment;

DELIMITER //

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

  -- 1. Calculate semester GPA
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

  -- 2. Calculate cumulative GPA (CGPA)
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

  -- 3. Insert or Update student_semester_records
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

  -- 4. Update current_gpa in students table
  UPDATE students SET current_gpa = v_cumulative_gpa WHERE id = p_student_id;
END //

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

  -- Get section details
  SELECT course_id, semester_id, max_capacity, current_enrolled
  INTO v_course_id, v_semester_id, v_section_capacity, v_current_enrolled
  FROM course_sections
  WHERE id = p_section_id;

  -- Get course credit hours
  SELECT credit_hours INTO v_course_credit_hours FROM courses WHERE id = v_course_id;

  -- Get student standing and CGPA
  SELECT IFNULL(current_gpa, 0.00), academic_status
  INTO v_student_cgpa, v_student_status
  FROM students
  WHERE id = p_student_id;

  -- 1. Check if section is full
  IF v_current_enrolled >= v_section_capacity THEN
    SET p_allowed = 0;
    SET p_result = 'SECTION_FULL';
  END IF;

  -- 2. Check if student already enrolled in this course in the same semester
  IF p_allowed = 1 AND EXISTS (
    SELECT 1 FROM enrollments 
    WHERE student_id = p_student_id AND course_id = v_course_id AND semester = v_semester_id AND status != 'dropped'
  ) THEN
    SET p_allowed = 0;
    SET p_result = 'ALREADY_ENROLLED';
  END IF;

  -- 3. Check prerequisites
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

  -- 4. Check credit hour limits
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

  -- 5. Timetable Clash Detection
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
END //

DELIMITER ;
