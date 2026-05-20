const { pool } = require('./config/database');
async function ensureTables() {
  try {
    console.log("Ensuring Rectorate tables...");
    
    // 1. institutional_kpis
    await pool.query(`
      CREATE TABLE IF NOT EXISTS institutional_kpis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,2) NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 2. exams (if missing)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        course_id INT,
        max_marks INT DEFAULT 100,
        exam_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. exam_results (if missing)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_id INT,
        student_id INT,
        marks_obtained DECIMAL(5,2),
        gpa DECIMAL(3,2),
        remarks TEXT,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
      )
    `);

    // 4. attendance (if missing)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        course_id INT,
        date DATE,
        status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
        remarks TEXT
      )
    `);

    console.log("✅ All Rectorate tables are ensured and ready.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Table Creation Error:", err);
    process.exit(1);
  }
}
ensureTables();
