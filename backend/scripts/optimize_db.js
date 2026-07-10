const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' }); // Make sure we load the env if running from scripts folder or root

async function runOptimization() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'university_lms'
  };

  console.log('Connecting to database...');
  const connection = await mysql.createConnection(config);

  const queries = [
    // 1. Users Table Indexes
    "ALTER TABLE users ADD INDEX IF NOT EXISTS idx_email (email);",
    "ALTER TABLE users ADD INDEX IF NOT EXISTS idx_role (role);",
    "ALTER TABLE users ADD INDEX IF NOT EXISTS idx_campus_id (campus_id);",
    
    // 2. Course Sections Indexes
    "ALTER TABLE course_sections ADD INDEX IF NOT EXISTS idx_course_id (course_id);",
    "ALTER TABLE course_sections ADD INDEX IF NOT EXISTS idx_teacher_id (teacher_id);",
    "ALTER TABLE course_sections ADD INDEX IF NOT EXISTS idx_semester_id (semester_id);",

    // 3. Enrollments Indexes
    "ALTER TABLE enrollment_registrations ADD INDEX IF NOT EXISTS idx_student_id (student_id);",
    "ALTER TABLE enrollment_registrations ADD INDEX IF NOT EXISTS idx_section_id (section_id);",
    "ALTER TABLE enrollment_registrations ADD INDEX IF NOT EXISTS idx_status (status);",

    // 4. Finance Challans Indexes
    "ALTER TABLE finance_challans ADD INDEX IF NOT EXISTS idx_student_id (student_id);",
    "ALTER TABLE finance_challans ADD INDEX IF NOT EXISTS idx_status (status);",
    
    // 5. Student Attendance Indexes
    "ALTER TABLE student_attendance ADD INDEX IF NOT EXISTS idx_student_id (student_id);",
    "ALTER TABLE student_attendance ADD INDEX IF NOT EXISTS idx_section_id (section_id);",
    "ALTER TABLE student_attendance ADD INDEX IF NOT EXISTS idx_date (date);",

    // 6. Logs Indexes (For fast analytics queries)
    "ALTER TABLE logs ADD INDEX IF NOT EXISTS idx_user_id (user_id);",
    "ALTER TABLE logs ADD INDEX IF NOT EXISTS idx_action (action);",
    "ALTER TABLE logs ADD INDEX IF NOT EXISTS idx_created_at (created_at);"
  ];

  console.log('Applying performance indexes. This may take a moment depending on data size...');
  
  for (let query of queries) {
    try {
      await connection.query(query);
      console.log(`✅ Success: ${query.substring(0, 50)}...`);
    } catch (error) {
      // Ignore if index already exists (Error code 1061) or table doesn't exist
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log(`⚠️ Index already exists, skipping: ${query.substring(0, 50)}...`);
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log(`⚠️ Table does not exist, skipping: ${query.substring(0, 50)}...`);
      } else if (error.message.includes('ADD INDEX IF NOT EXISTS')) {
        // Some older MySQL/MariaDB versions do not support 'IF NOT EXISTS' for ADD INDEX
        try {
          const fallbackQuery = query.replace('ADD INDEX IF NOT EXISTS', 'ADD INDEX');
          await connection.query(fallbackQuery);
          console.log(`✅ Success (Fallback): ${fallbackQuery.substring(0, 50)}...`);
        } catch (fbError) {
          if (fbError.code === 'ER_DUP_KEYNAME') {
             console.log(`⚠️ Index already exists, skipping: ${query.substring(0, 50)}...`);
          } else {
             console.error(`❌ Error on fallback:`, fbError.message);
          }
        }
      } else {
        console.error(`❌ Error on: ${query}\n`, error.message);
      }
    }
  }

  console.log('\n🚀 Database Optimization Complete!');
  await connection.end();
}

runOptimization().catch(console.error);
