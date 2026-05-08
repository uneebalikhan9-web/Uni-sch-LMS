const { pool } = require('../config/database');

async function initAdmissions() {
  try {
    console.log('Creating Admissions tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admission_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        program_id INT,
        stage ENUM('Lead', 'Applied', 'Shortlisted', 'Interview', 'Merit List', 'Admitted') DEFAULT 'Lead',
        score DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_VALUE
      )
    `.replace('CURRENT_VALUE', 'CURRENT_TIMESTAMP'));

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admission_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT,
        document_type VARCHAR(100),
        status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES admission_applications(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admission_interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT,
        interview_date DATE,
        interview_time TIME,
        interviewer VARCHAR(255),
        status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
        FOREIGN KEY (application_id) REFERENCES admission_applications(id) ON DELETE CASCADE
      )
    `);

    console.log('Admissions tables created successfully!');
    
    // Seed some data if empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM admission_applications');
    if (rows[0].count === 0) {
      console.log('Seeding initial admissions data...');
      await pool.query(`
        INSERT INTO admission_applications (name, email, program_id, stage, score) VALUES 
        ('Emma Watson', 'emma@example.com', 1, 'Lead', 85.00),
        ('James Wilson', 'james@example.com', 2, 'Lead', 78.00),
        ('Sophia Lee', 'sophia@example.com', 3, 'Applied', 92.00),
        ('Oliver Chen', 'oliver@example.com', 1, 'Applied', 88.00),
        ('Liam Brown', 'liam@example.com', 1, 'Interview', 91.00),
        ('Noah Anderson', 'noah@example.com', 3, 'Merit List', 96.00),
        ('Lucas Jackson', 'lucas@example.com', 1, 'Admitted', 95.00)
      `);
      console.log('Seed data inserted.');
    }

  } catch (err) {
    console.error('Error initializing admissions:', err);
  } finally {
    process.exit();
  }
}

initAdmissions();
