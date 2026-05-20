const { pool } = require('./config/database');

async function migrate() {
  try {
    console.log('Starting migration...');

    // 1. Fix Attendance Table
    console.log('Updating Attendance table...');
    // Check if columns exist first
    const [cols] = await pool.query('SHOW COLUMNS FROM attendance');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('class_id')) {
      console.log('Adding class_id to attendance...');
      await pool.query('ALTER TABLE attendance ADD COLUMN class_id INT AFTER id');
      await pool.query('ALTER TABLE attendance ADD CONSTRAINT fk_attendance_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE');
    }

    if (!colNames.includes('teacher_id')) {
      console.log('Adding teacher_id to attendance...');
      await pool.query('ALTER TABLE attendance ADD COLUMN teacher_id INT AFTER course_id');
      await pool.query('ALTER TABLE attendance ADD CONSTRAINT fk_attendance_teacher FOREIGN KEY (teacher_id) REFERENCES employees(id) ON DELETE SET NULL');
    }

    // 2. Create Grades Table
    console.log('Creating Grades table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        teacher_id INT NOT NULL,
        exam_type VARCHAR(100) NOT NULL,
        marks_obtained DECIMAL(5,2) NOT NULL,
        max_marks INT DEFAULT 100,
        grade_letter VARCHAR(5),
        percentage DECIMAL(5,2),
        exam_date DATE,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES employees(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Migration successfully completed!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    process.exit();
  }
}

migrate();
