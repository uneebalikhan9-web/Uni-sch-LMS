const { pool } = require('../config/database');

async function extendAdmissions() {
  try {
    console.log('Extending Admissions Database...');
    
    // 1. Create logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admission_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action_text VARCHAR(255) NOT NULL,
        action_type ENUM('application', 'interview', 'verification', 'merit', 'other') DEFAULT 'other',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Clear and Seed Interviews (to match the names in applications)
    await pool.query('DELETE FROM admission_interviews');
    await pool.query(`
      INSERT INTO admission_interviews (application_id, interview_date, interview_time, interviewer, status) VALUES 
      (5, '2025-03-20', '10:00:00', 'Prof. Johnson', 'Scheduled'),
      (3, '2025-03-21', '11:30:00', 'Dr. Smith', 'Scheduled')
    `);

    // 3. Seed Logs
    await pool.query('DELETE FROM admission_logs');
    await pool.query(`
      INSERT INTO admission_logs (action_text, action_type) VALUES 
      ('Emma Watson submitted initial lead', 'application'),
      ('Liam Brown interview scheduled with Prof. Johnson', 'interview'),
      ('Noah Anderson moved to Merit List', 'merit'),
      ('Lucas Jackson admission confirmed', 'application'),
      ('Sophia Lee document verification pending', 'verification')
    `);

    console.log('Admissions Database extended successfully!');

  } catch (err) {
    console.error('Error extending admissions:', err);
  } finally {
    process.exit();
  }
}

extendAdmissions();
