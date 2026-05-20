const { pool } = require('./config/database');

const createMissingTables = async () => {
  try {
    console.log('Checking and creating missing tables...');

    // HR Leave Requests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hr_leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        leave_type VARCHAR(50),
        start_date DATE,
        end_date DATE,
        reason TEXT,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // HR Job Postings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hr_job_postings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        department VARCHAR(100),
        posted_by INT,
        status ENUM('Active', 'Closed') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Missing tables checked/created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  }
};

createMissingTables();
