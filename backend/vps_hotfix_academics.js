const { pool } = require('./config/database');

async function fix() {
  try {
    console.log('Running hotfix for Academics & Graduation modules...');

    // 1. Add missing columns to students table if they don't exist
    try {
      await pool.query('ALTER TABLE students ADD COLUMN current_gpa DECIMAL(3,2) DEFAULT 0.00');
      console.log('Added current_gpa to students.');
    } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }

    try {
      await pool.query('ALTER TABLE students ADD COLUMN academic_status ENUM("regular", "probation", "suspended", "graduated", "good", "warning", "dismissed") DEFAULT "regular"');
      console.log('Added academic_status to students.');
    } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') throw e; }

    // 2. Create missing tables directly
    const tables = [
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

    for (let i = 0; i < tables.length; i++) {
      await pool.query(tables[i]);
      console.log(`Checked/Created academic table ${i + 1}/${tables.length}`);
    }

    // Insert default grade policies if empty
    const [gp] = await pool.query('SELECT COUNT(*) as cnt FROM grade_policies');
    if (gp[0].cnt === 0) {
      await pool.query(`
        INSERT INTO grade_policies (grade_letter, grade_points, min_percentage, max_percentage, is_passing) VALUES
        ('A', 4.00, 85, 100, 1),
        ('A-', 3.70, 80, 84.99, 1),
        ('B+', 3.30, 75, 79.99, 1),
        ('B', 3.00, 71, 74.99, 1),
        ('B-', 2.70, 68, 70.99, 1),
        ('C+', 2.30, 64, 67.99, 1),
        ('C', 2.00, 61, 63.99, 1),
        ('C-', 1.70, 58, 60.99, 1),
        ('D+', 1.30, 54, 57.99, 1),
        ('D', 1.00, 50, 53.99, 1),
        ('F', 0.00, 0, 49.99, 0)
      `);
      console.log('Inserted default grade policies.');
    }

    console.log('✅ Academics hotfix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during hotfix:', error);
    process.exit(1);
  }
}

fix();
