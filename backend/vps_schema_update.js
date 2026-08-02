const { pool } = require('./config/database');

async function updateVPSDatabase() {
  console.log('🚀 Starting VPS Database Schema Update...');
  
  try {
    // 1. Update `users` table
    console.log('⏳ Checking users table for institution_type...');
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM users LIKE "institution_type"');
      if (columns.length === 0) {
        console.log('➕ Adding "institution_type" column to users...');
        await pool.query("ALTER TABLE users ADD COLUMN institution_type ENUM('university', 'school') DEFAULT 'university'");
        console.log('✅ Column "institution_type" added successfully.');
      } else {
        console.log('ℹ️ Column "institution_type" already exists in users.');
      }
    } catch (err) {
      console.error('❌ Error updating users table:', err.message);
    }

    // 2. Update `student_classes` table
    console.log('⏳ Checking student_classes table for status...');
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM student_classes LIKE "status"');
      if (columns.length === 0) {
        console.log('➕ Adding "status" column to student_classes...');
        await pool.query("ALTER TABLE student_classes ADD COLUMN status VARCHAR(20) DEFAULT 'approved'");
        console.log('✅ Column "status" added successfully.');
      } else {
        console.log('ℹ️ Column "status" already exists in student_classes.');
      }
    } catch (err) {
      console.error('❌ Error updating student_classes table:', err.message);
    }

    // 3. Check for face_descriptors table
    console.log('⏳ Checking face_descriptors table...');
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS face_descriptors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          descriptor JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ face_descriptors table check passed (exists or created).');
    } catch (err) {
      console.error('❌ Error creating face_descriptors table:', err.message);
    }

    console.log('\n✨ VPS Database Schema Update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Critical error updating database:', error);
    process.exit(1);
  }
}

updateVPSDatabase();
