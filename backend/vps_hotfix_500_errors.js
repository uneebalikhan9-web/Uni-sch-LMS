const { pool } = require('./config/database');

async function fix() {
  try {
    console.log('Running ULTIMATE hotfix for Grades and Graduation 500 errors...');

    // 1. Check and add columns to students
    const studentCols = [
      'ALTER TABLE students ADD COLUMN current_gpa DECIMAL(3,2) DEFAULT 0.00',
      'ALTER TABLE students ADD COLUMN academic_status ENUM("regular", "probation", "suspended", "graduated", "good", "warning", "dismissed") DEFAULT "regular"',
      'ALTER TABLE students ADD COLUMN father_name VARCHAR(100) DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN cnic VARCHAR(20) DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN bform_number VARCHAR(20) DEFAULT NULL'
    ];
    for (let q of studentCols) {
      try { await pool.query(q); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME') console.log('Ignored:', e.message); }
    }

    // 2. Create tables that might be missing
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    for (let q of tables) {
      try { await pool.query(q); } catch (e) { console.log('Table error ignored:', e.message); }
    }

    // 3. Create the missing transcript view for Graduation module
    const createView = `
      CREATE OR REPLACE VIEW \`vw_student_transcript\` AS
      SELECT 
          s.id AS student_id,
          s.roll_number,
          u.name AS student_name,
          s.father_name,
          s.cnic,
          s.bform_number,
          p.name AS program_name,
          p.code AS program_code,
          c.title AS course_title,
          c.code AS course_code,
          c.credit_hours,
          e.semester AS enrollment_semester,
          er.marks_obtained,
          er.grade,
          er.gpa
      FROM students s
      JOIN users u ON s.user_id = u.id
      JOIN programs p ON s.program_id = p.id
      JOIN enrollments e ON e.student_id = s.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN exam_results er ON er.enrollment_id = e.id;
    `;
    try {
      await pool.query(createView);
      console.log('Created vw_student_transcript view.');
    } catch (e) {
      console.log('Error creating view:', e.message);
    }

    console.log('--------------------------------------------------');
    console.log('TESTING QUERIES THAT CAUSE 500 ERRORS:');

    // Test query 1 (Grades)
    try {
      await pool.query('SELECT s.current_gpa, s.academic_status FROM students s JOIN programs p ON p.id = s.program_id LIMIT 1');
      console.log('✅ Grades Query 1: PASS');
    } catch(e) { console.log('❌ Grades Query 1 FAILED:', e.message); }

    // Test query 2 (Grades)
    try {
      await pool.query('SELECT cfg.*, c.title, sem.name FROM course_final_grades cfg JOIN courses c ON c.id = cfg.course_id JOIN semesters sem ON sem.id = cfg.semester_id LIMIT 1');
      console.log('✅ Grades Query 2: PASS');
    } catch(e) { console.log('❌ Grades Query 2 FAILED:', e.message); }

    // Test query 3 (Grades)
    try {
      await pool.query('SELECT ssr.*, sem.name FROM student_semester_records ssr JOIN semesters sem ON sem.id = ssr.semester_id LIMIT 1');
      console.log('✅ Grades Query 3: PASS');
    } catch(e) { console.log('❌ Grades Query 3 FAILED:', e.message); }

    // Test query 4 (Graduation)
    try {
      await pool.query('SELECT * FROM vw_student_transcript LIMIT 1');
      console.log('✅ Graduation Query: PASS');
    } catch(e) { console.log('❌ Graduation Query FAILED:', e.message); }

    console.log('--------------------------------------------------');
    console.log('✅ Ultimate hotfix completed! Please review any ❌ messages above if they exist.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

fix();
