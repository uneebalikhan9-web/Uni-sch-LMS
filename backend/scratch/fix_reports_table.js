const { pool } = require('../config/database');

async function run() {
  try {
    console.log('Dropping old course_reports table...');
    await pool.query('DROP TABLE IF EXISTS course_reports');
    console.log('✅ Old table dropped');

    console.log('Creating new course_reports table with all required columns...');
    await pool.query(`
      CREATE TABLE course_reports (
        id INT NOT NULL AUTO_INCREMENT,
        course_id INT NOT NULL,
        course_title VARCHAR(255) NOT NULL DEFAULT '',
        class_name VARCHAR(255) NOT NULL DEFAULT 'N/A',
        campus_id INT DEFAULT NULL,
        campus_name VARCHAR(255) DEFAULT NULL,
        teacher_id INT DEFAULT NULL,
        teacher_name VARCHAR(255) DEFAULT NULL,
        total_students INT DEFAULT 0,
        avg_attendance DECIMAL(5,2) DEFAULT 0.00,
        avg_marks DECIMAL(5,2) DEFAULT 0.00,
        pass_count INT DEFAULT 0,
        fail_count INT DEFAULT 0,
        total_assignments INT DEFAULT 0,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        generated_by VARCHAR(255) DEFAULT NULL,
        generated_by_role VARCHAR(255) DEFAULT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ New course_reports table created successfully!');

    const [cols] = await pool.query('SHOW COLUMNS FROM course_reports');
    console.log('Columns:', cols.map(c => c.Field).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

run();
