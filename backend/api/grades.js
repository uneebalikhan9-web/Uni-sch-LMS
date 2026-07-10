const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isTeacher, isStudent, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// -------------------------------------------------------
// Helper: Get grade letter + points from DB grade_policies
// -------------------------------------------------------
async function computeGradeFromDB(percentage, campus_id) {
  const [policies] = await pool.query(
    `SELECT grade_letter, grade_points, is_passing 
     FROM grade_policies 
     WHERE (campus_id = ? OR campus_id IS NULL) 
       AND ? BETWEEN min_percentage AND max_percentage
     ORDER BY campus_id DESC 
     LIMIT 1`,
    [campus_id, percentage]
  );
  if (policies.length > 0) {
    return { letter_grade: policies[0].grade_letter, grade_points: policies[0].grade_points, is_passing: policies[0].is_passing };
  }
  return { letter_grade: 'F', grade_points: 0.00, is_passing: false };
}

// =====================================================
// TEACHER: Enter/Update Final Grade for a student
// POST /api/grades/final
// =====================================================
router.post('/final', verifyToken, isTeacher, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const teacher_id = req.user.employee_id;
    const campus_id = req.user.campus_id;
    const {
      student_id,
      course_id,
      section_id,
      semester_id,
      midterm_marks,     // out of 30
      final_marks,       // out of 50
      assignment_marks,  // out of 10
      quiz_marks,        // out of 5
      lab_marks,         // out of 5
      total_out_of       // default 100
    } = req.body;

    if (!student_id || !course_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'student_id, course_id, semester_id are required' });
    }

    // Verify teacher is assigned to this section/course
    const [authCheck] = await pool.query(
      `SELECT 1 FROM course_sections cs
       LEFT JOIN teacher_section_assignments tsa ON tsa.section_id = cs.id
       WHERE cs.course_id = ? AND cs.semester_id = ?
         AND (cs.teacher_id = ? OR tsa.teacher_id = ?)
       LIMIT 1`,
      [course_id, semester_id, teacher_id, teacher_id]
    );
    if (authCheck.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied: You are not assigned to this course section' });
    }

    // Calculate total marks and percentage
    const mid = parseFloat(midterm_marks) || 0;
    const fin = parseFloat(final_marks) || 0;
    const asgn = parseFloat(assignment_marks) || 0;
    const quiz = parseFloat(quiz_marks) || 0;
    const lab = parseFloat(lab_marks) || 0;
    const totalOOF = parseFloat(total_out_of) || 100;

    const total_marks = mid + fin + asgn + quiz + lab;
    const percentage = (total_marks / totalOOF) * 100;

    const { letter_grade, grade_points } = await computeGradeFromDB(percentage, campus_id);

    // Find enrollment_id
    const [enrollment] = await pool.query(
      `SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? LIMIT 1`,
      [student_id, course_id]
    );
    const enrollment_id = enrollment.length > 0 ? enrollment[0].id : null;

    // Upsert into course_final_grades
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO course_final_grades 
        (enrollment_id, student_id, course_id, section_id, semester_id,
         total_marks, percentage, letter_grade, grade_points, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE
         total_marks = VALUES(total_marks),
         percentage = VALUES(percentage),
         letter_grade = VALUES(letter_grade),
         grade_points = VALUES(grade_points),
         is_published = 0`,
      [enrollment_id, student_id, course_id, section_id || null, semester_id,
       total_marks, percentage.toFixed(2), letter_grade, grade_points]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Grade saved successfully',
      grade: { total_marks, percentage: percentage.toFixed(2), letter_grade, grade_points }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Save final grade error:', error);
    res.status(500).json({ success: false, message: 'Error saving grade: ' + error.message });
  } finally {
    connection.release();
  }
});

// =====================================================
// TEACHER: Bulk enter grades for entire section
// POST /api/grades/final/bulk
// =====================================================
router.post('/final/bulk', verifyToken, isTeacher, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const teacher_id = req.user.employee_id;
    const campus_id = req.user.campus_id;
    const { course_id, section_id, semester_id, students_grades } = req.body;
    // students_grades = [{ student_id, midterm_marks, final_marks, assignment_marks, quiz_marks, lab_marks }]

    if (!course_id || !semester_id || !Array.isArray(students_grades)) {
      return res.status(400).json({ success: false, message: 'course_id, semester_id, students_grades[] are required' });
    }

    // Verify teacher access
    const [authCheck] = await pool.query(
      `SELECT 1 FROM course_sections cs
       LEFT JOIN teacher_section_assignments tsa ON tsa.section_id = cs.id
       WHERE cs.course_id = ? AND cs.semester_id = ?
         AND (cs.teacher_id = ? OR tsa.teacher_id = ?)
       LIMIT 1`,
      [course_id, semester_id, teacher_id, teacher_id]
    );
    if (authCheck.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied: Not assigned to this course' });
    }

    await connection.beginTransaction();
    let saved = 0;

    for (const sg of students_grades) {
      const { student_id, midterm_marks, final_marks, assignment_marks, quiz_marks, lab_marks } = sg;
      if (!student_id) continue;

      const mid = parseFloat(midterm_marks) || 0;
      const fin = parseFloat(final_marks) || 0;
      const asgn = parseFloat(assignment_marks) || 0;
      const quiz = parseFloat(quiz_marks) || 0;
      const lab = parseFloat(lab_marks) || 0;
      const total_marks = mid + fin + asgn + quiz + lab;
      const percentage = total_marks; // Assuming already out of 100

      const { letter_grade, grade_points } = await computeGradeFromDB(percentage, campus_id);

      const [enrollment] = await connection.query(
        'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? LIMIT 1',
        [student_id, course_id]
      );
      const enrollment_id = enrollment.length > 0 ? enrollment[0].id : null;

      await connection.query(
        `INSERT INTO course_final_grades 
          (enrollment_id, student_id, course_id, section_id, semester_id,
           total_marks, percentage, letter_grade, grade_points, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE
           total_marks = VALUES(total_marks),
           percentage = VALUES(percentage),
           letter_grade = VALUES(letter_grade),
           grade_points = VALUES(grade_points),
           is_published = 0`,
        [enrollment_id, student_id, course_id, section_id || null, semester_id,
         total_marks, percentage.toFixed(2), letter_grade, grade_points]
      );
      saved++;
    }

    await connection.commit();
    res.status(201).json({ success: true, message: `${saved} grades saved successfully` });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk grades error:', error);
    res.status(500).json({ success: false, message: 'Error saving bulk grades: ' + error.message });
  } finally {
    connection.release();
  }
});

// =====================================================
// TEACHER/REGISTRAR: Publish grades for a section/semester
// PUT /api/grades/publish
// =====================================================
router.put('/publish', verifyToken, async (req, res) => {
  try {
    const { course_id, semester_id, section_id } = req.body;
    const campus_id = req.user.campus_id;

    if (!course_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'course_id and semester_id are required' });
    }

    let query = 'UPDATE course_final_grades SET is_published = 1 WHERE course_id = ? AND semester_id = ?';
    const params = [course_id, semester_id];

    if (section_id) {
      query += ' AND section_id = ?';
      params.push(section_id);
    }

    const [result] = await pool.query(query, params);

    // After publishing, trigger GPA recalculation for all affected students
    const [students] = await pool.query(
      'SELECT DISTINCT student_id FROM course_final_grades WHERE course_id = ? AND semester_id = ? AND is_published = 1',
      [course_id, semester_id]
    );

    for (const { student_id } of students) {
      await pool.query('CALL sp_calculate_semester_gpa(?, ?)', [student_id, semester_id]);
    }

    // Update academic standing for each student (probation check)
    await pool.query(
      `UPDATE students s
       JOIN (SELECT student_id, cumulative_gpa FROM student_semester_records WHERE semester_id = ?) ssr ON ssr.student_id = s.id
       SET s.academic_status = CASE
         WHEN ssr.cumulative_gpa < 1.50 THEN 'suspended'
         WHEN ssr.cumulative_gpa < 2.00 THEN 'probation'
         WHEN ssr.cumulative_gpa >= 2.00 AND s.academic_status = 'probation' THEN 'active'
         ELSE s.academic_status
       END`,
      [semester_id]
    );

    res.json({
      success: true,
      message: `${result.affectedRows} grades published. GPA recalculated for ${students.length} students.`
    });
  } catch (error) {
    console.error('Publish grades error:', error);
    res.status(500).json({ success: false, message: 'Error publishing grades: ' + error.message });
  }
});

// =====================================================
// GET: Final grades for a course section (Teacher/Registrar)
// GET /api/grades/final/section/:sectionId
// =====================================================
router.get('/final/section/:sectionId', verifyToken, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { semester_id } = req.query;

    let query = `
      SELECT cfg.*, 
        u.name as student_name, s.roll_number,
        c.title as course_title, c.code as course_code, c.credit_hours
      FROM course_final_grades cfg
      JOIN students s ON s.id = cfg.student_id
      JOIN users u ON u.id = s.user_id
      JOIN courses c ON c.id = cfg.course_id
      WHERE cfg.section_id = ?
    `;
    const params = [sectionId];

    if (semester_id) {
      query += ' AND cfg.semester_id = ?';
      params.push(semester_id);
    }

    query += ' ORDER BY u.name';

    const [grades] = await pool.query(query, params);
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get section grades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// GET: Grades for a course (Teacher view)
// GET /api/grades/final/course/:courseId
// =====================================================
router.get('/final/course/:courseId', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester_id } = req.query;

    let query = `
      SELECT cfg.*, 
        u.name as student_name, s.roll_number
      FROM course_final_grades cfg
      JOIN students s ON s.id = cfg.student_id
      JOIN users u ON u.id = s.user_id
      WHERE cfg.course_id = ?
    `;
    const params = [courseId];

    if (semester_id) {
      query += ' AND cfg.semester_id = ?';
      params.push(semester_id);
    }

    query += ' ORDER BY u.name';

    const [grades] = await pool.query(query, params);
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Get course grades error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// STUDENT: Get my grades + GPA summary
// GET /api/grades/my-academic-record
// =====================================================
router.get('/my-academic-record', verifyToken, isStudent, async (req, res) => {
  try {
    const student_id = req.user.student_id;

    // --- AUTO-FIX SCHEMA INJECTION START ---
    try {
      const dbFixes = [
        'ALTER TABLE students ADD COLUMN current_gpa DECIMAL(3,2) DEFAULT 0.00',
        'ALTER TABLE students ADD COLUMN academic_status ENUM("regular", "probation", "suspended", "graduated", "good", "warning", "dismissed") DEFAULT "regular"',
        'ALTER TABLE students ADD COLUMN father_name VARCHAR(100) DEFAULT NULL',
        'ALTER TABLE students ADD COLUMN cnic VARCHAR(20) DEFAULT NULL',
        'ALTER TABLE students ADD COLUMN bform_number VARCHAR(20) DEFAULT NULL',
        'ALTER TABLE courses ADD COLUMN course_type ENUM("theory","lab","theory+lab","seminar","internship") DEFAULT "theory"',
        'ALTER TABLE courses ADD COLUMN credit_hours INT(11) DEFAULT 3',
        'ALTER TABLE semesters ADD COLUMN term_type ENUM("Fall","Spring","Summer") DEFAULT "Fall"',
        'ALTER TABLE semesters ADD COLUMN is_summer TINYINT(1) DEFAULT 0',
        'ALTER TABLE programs ADD COLUMN level VARCHAR(50) DEFAULT "Undergraduate"'
      ];
      for (let q of dbFixes) {
        try { await pool.query(q); } catch(e) {} // ignore duplicates
      }
      
      const tables = [
        `CREATE TABLE IF NOT EXISTS \`exam_results\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`enrollment_id\` int(11) NOT NULL,
          \`marks_obtained\` decimal(5,2) DEFAULT 0.00,
          \`grade\` varchar(5) DEFAULT NULL,
          \`gpa\` decimal(3,2) DEFAULT 0.00,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS \`program_graduation_policies\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`program_id\` int(11) NOT NULL,
          \`required_credits\` int(11) NOT NULL DEFAULT 130,
          \`minimum_cgpa\` decimal(3,2) NOT NULL DEFAULT 2.00,
          \`campus_id\` int(11) NOT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS \`graduation_applications\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`student_id\` int(11) NOT NULL,
          \`campus_id\` int(11) NOT NULL,
          \`status\` enum('pending','approved','rejected') DEFAULT 'pending',
          \`applied_at\` timestamp NOT NULL DEFAULT current_timestamp(),
          \`reviewed_by\` int(11) DEFAULT NULL,
          \`remarks\` text DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS \`grade_policies\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`grade_letter\` varchar(5) NOT NULL,
          \`grade_points\` decimal(3,2) NOT NULL,
          \`min_percentage\` decimal(5,2) NOT NULL,
          \`max_percentage\` decimal(5,2) NOT NULL,
          \`is_passing\` tinyint(1) DEFAULT 1,
          \`campus_id\` int(11) DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS \`course_final_grades\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`enrollment_id\` int(11) DEFAULT NULL,
          \`student_id\` int(11) NOT NULL,
          \`course_id\` int(11) NOT NULL,
          \`section_id\` int(11) DEFAULT NULL,
          \`semester_id\` int(11) NOT NULL,
          \`total_marks\` decimal(5,2) DEFAULT 0.00,
          \`percentage\` decimal(5,2) DEFAULT 0.00,
          \`letter_grade\` varchar(5) DEFAULT NULL,
          \`grade_points\` decimal(3,2) DEFAULT 0.00,
          \`is_published\` tinyint(1) DEFAULT 0,
          \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY (\`student_id\`, \`course_id\`, \`semester_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS \`student_semester_records\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`student_id\` int(11) NOT NULL,
          \`semester_id\` int(11) NOT NULL,
          \`credits_attempted\` decimal(5,2) DEFAULT 0.00,
          \`credits_earned\` decimal(5,2) DEFAULT 0.00,
          \`semester_gpa\` decimal(4,3) DEFAULT 0.000,
          \`cumulative_gpa\` decimal(4,3) DEFAULT 0.000,
          \`academic_standing\` varchar(50) DEFAULT 'good',
          \`is_frozen\` tinyint(1) DEFAULT 0,
          \`freeze_reason\` text DEFAULT NULL,
          \`min_credit_hours_met\` tinyint(1) DEFAULT 0,
          \`max_credit_hours_ok\` tinyint(1) DEFAULT 1,
          \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY (\`student_id\`, \`semester_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
      ];
      for (let q of tables) { try { await pool.query(q); } catch(e) {} }

      await pool.query(`
        CREATE OR REPLACE VIEW \`vw_student_transcript\` AS
        SELECT 
            s.id AS student_id, s.roll_number, u.name AS student_name, s.father_name, s.cnic, s.bform_number,
            p.name AS program_name, p.code AS program_code, c.title AS course_title, c.code AS course_code,
            c.credit_hours, e.semester AS enrollment_semester, er.marks_obtained, er.grade, er.gpa
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN programs p ON s.program_id = p.id
        JOIN enrollments e ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN exam_results er ON er.enrollment_id = e.id;
      `);
    } catch (autoFixErr) {
      console.error('Auto fix inline error:', autoFixErr);
    }
    // --- AUTO-FIX SCHEMA INJECTION END ---

    // Check if student ID is undefined
    if (!student_id) {
       return res.status(400).json({ success: false, message: 'Student ID not found in token' });
    }

    // Get all published final grades grouped by semester
    const [grades] = await pool.query(
      `SELECT cfg.*, 
        c.title as course_title, c.code as course_code, c.credit_hours, c.course_type,
        sem.name as semester_name, sem.term_type
       FROM course_final_grades cfg
       JOIN courses c ON c.id = cfg.course_id
       JOIN semesters sem ON sem.id = cfg.semester_id
       WHERE cfg.student_id = ? AND cfg.is_published = 1
       ORDER BY sem.start_date, c.code`,
      [student_id]
    );

    // Get semester GPA records
    const [semRecords] = await pool.query(
      `SELECT ssr.*, sem.name as semester_name, sem.term_type
       FROM student_semester_records ssr
       JOIN semesters sem ON sem.id = ssr.semester_id
       WHERE ssr.student_id = ?
       ORDER BY sem.start_date`,
      [student_id]
    );

    // Get latest CGPA from students table
    const [[student]] = await pool.query(
      `SELECT s.current_gpa as cgpa, s.academic_status, s.semester as current_semester,
              p.name as program_name, p.level as program_level
       FROM students s JOIN programs p ON p.id = s.program_id
       WHERE s.id = ?`,
      [student_id]
    );

    // Group grades by semester
    const bySemester = {};
    grades.forEach(g => {
      if (!bySemester[g.semester_id]) {
        bySemester[g.semester_id] = {
          semester_name: g.semester_name,
          term_type: g.term_type,
          courses: []
        };
      }
      bySemester[g.semester_id].courses.push(g);
    });

    res.json({
      success: true,
      student: student || {},
      grades_by_semester: bySemester,
      semester_records: semRecords
    });
  } catch (error) {
    console.error('Get academic record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      debug_error: error.message,
      debug_sql: error.sql 
    });
  }
});

// =====================================================
// REGISTRAR: Manually trigger GPA recalculation
// POST /api/grades/recalculate-gpa
// =====================================================
router.post('/recalculate-gpa', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { student_id, semester_id } = req.body;

    if (!student_id || !semester_id) {
      return res.status(400).json({ success: false, message: 'student_id and semester_id are required' });
    }

    await pool.query('CALL sp_calculate_semester_gpa(?, ?)', [student_id, semester_id]);

    // Get updated record
    const [record] = await pool.query(
      `SELECT ssr.*, sem.name as semester_name
       FROM student_semester_records ssr
       JOIN semesters sem ON sem.id = ssr.semester_id
       WHERE ssr.student_id = ? AND ssr.semester_id = ?`,
      [student_id, semester_id]
    );

    res.json({
      success: true,
      message: 'GPA recalculated successfully',
      record: record[0] || null
    });
  } catch (error) {
    console.error('Recalculate GPA error:', error);
    res.status(500).json({ success: false, message: 'Error: ' + error.message });
  }
});

// =====================================================
// GET: Grade policies for campus
// GET /api/grades/policies
// =====================================================
router.get('/policies', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [policies] = await pool.query(
      `SELECT * FROM grade_policies 
       WHERE campus_id = ? OR campus_id IS NULL 
       ORDER BY min_percentage DESC`,
      [campus_id]
    );
    res.json({ success: true, policies });
  } catch (error) {
    console.error('Get grade policies error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// GET: Attendance eligibility report for a semester
// GET /api/grades/attendance-eligibility?semester_id=X
// =====================================================
router.get('/attendance-eligibility', verifyToken, async (req, res) => {
  try {
    const { semester_id, course_id } = req.query;
    const campus_id = req.user.campus_id;

    let query = `
      SELECT 
        ae.student_id, ae.course_id,
        ae.roll_number, ae.student_name, ae.course_title, ae.course_code,
        ae.total_classes, ae.attended, ae.attendance_pct, ae.exam_status
      FROM vw_attendance_eligibility ae
      JOIN courses c ON c.id = ae.course_id
      WHERE c.campus_id = ?
    `;
    const params = [campus_id];

    if (course_id) {
      query += ' AND ae.course_id = ?';
      params.push(course_id);
    }

    query += ' ORDER BY ae.course_title, ae.attendance_pct';

    const [report] = await pool.query(query, params);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Attendance eligibility error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// LEGACY: Old grades table routes (kept for backward compat)
// =====================================================
router.get('/legacy/course/:courseId', verifyToken, isTeacher, async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacher_id = req.user.employee_id;

    const [courses] = await pool.query(
      'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
      [courseId, teacher_id]
    );
    if (courses.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this course' });
    }

    const [grades] = await pool.query(
      `SELECT g.*, u.name as student_name, u.email as student_email
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE g.course_id = ?
       ORDER BY u.name, g.exam_date DESC`,
      [courseId]
    );
    res.status(200).json({ success: true, grades });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching grades' });
  }
});

module.exports = router;
