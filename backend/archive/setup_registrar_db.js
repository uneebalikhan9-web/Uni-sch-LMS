const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupRegistrarDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'LancersNexus_MasterCore'
    });

    console.log('Connected to the database.');

    // 1. Create registrar_degrees table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS registrar_degrees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        degree_title VARCHAR(255),
        issue_date DATE,
        serial_number VARCHAR(50) UNIQUE,
        status ENUM('Pending', 'Verified', 'Issued') DEFAULT 'Pending',
        FOREIGN KEY (student_id) REFERENCES users(id)
      )
    `);

    // 2. Create registrar_transcript_requests table
    await dummyExecute(connection, `
      CREATE TABLE IF NOT EXISTS registrar_transcript_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        request_date DATE,
        status ENUM('Pending', 'Processing', 'Completed', 'Rejected') DEFAULT 'Pending',
        notes TEXT,
        FOREIGN KEY (student_id) REFERENCES users(id)
      )
    `);

    // 3. Create registrar_degree_verifications table
    await dummyExecute(connection, `
      CREATE TABLE IF NOT EXISTS registrar_degree_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        degree_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        requester_email VARCHAR(100),
        request_date DATE,
        status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
        FOREIGN KEY (degree_id) REFERENCES registrar_degrees(id)
      )
    `);

    // 4. Insert dummy students if needed
    // First check if students exist
    const [students] = await connection.execute('SELECT id FROM students LIMIT 1');
    if (students.length === 0) {
      console.log('No students found, inserting dummy students...');
      
      // Need a program to associate with
      await connection.execute(`INSERT IGNORE INTO programs (id, name, code) VALUES (1, 'BS Computer Science', 'BSCS'), (2, 'BBA Marketing', 'BBA-M')`);
      
      // Insert users
      await connection.execute(`INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
        (101, 'Emma Richardson', 'emma@student.com', 'pass', 'student'),
        (102, 'James Chen', 'james@student.com', 'pass', 'student'),
        (103, 'Michael Adebayo', 'michael@student.com', 'pass', 'student')`);
        
      // Insert students
      await connection.execute(`INSERT IGNORE INTO students (id, user_id, program_id, roll_number, admission_year, academic_status) VALUES 
        (101, 101, 1, 'STU-2024-001', 2024, 'regular'),
        (102, 102, 2, 'STU-2024-002', 2023, 'graduated'),
        (103, 103, 1, 'STU-2024-004', 2024, 'suspended')`);
    }

    // Insert dummy degrees
    await connection.execute(`
      INSERT IGNORE INTO registrar_degrees (id, student_id, degree_title, issue_date, serial_number, status) VALUES 
      (1, 102, 'BBA Marketing', '2025-01-10', 'LTS-D-2024-1289', 'Issued'),
      (2, 101, 'BS Computer Science', '2026-01-15', 'LTS-D-2025-0932', 'Pending')
    `);

    // Insert dummy verifications
    await connection.execute(`
      INSERT IGNORE INTO registrar_degree_verifications (id, degree_id, company_name, request_date, status) VALUES 
      (1, 1, 'Google Inc.', '2025-03-15', 'Pending'),
      (2, 2, 'Goldman Sachs', '2025-03-14', 'Pending')
    `);

    // Insert dummy transcripts
    await connection.execute(`
      INSERT IGNORE INTO registrar_transcript_requests (id, student_id, request_date, status) VALUES 
      (1, 101, '2025-03-16', 'Pending'),
      (2, 102, '2025-03-12', 'Processing')
    `);

    console.log('Registrar Database Setup Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up DB:', error);
    process.exit(1);
  }
}

async function dummyExecute(connection, query) {
  try {
    await connection.execute(query);
  } catch (err) {
    console.log('Skipped/Warning:', err.message);
  }
}

setupRegistrarDB();
