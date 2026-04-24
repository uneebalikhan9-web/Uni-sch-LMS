require('dotenv').config();
const { pool } = require('./config/database');

async function fixDatabase() {
  console.log('🔍 Starting database fix...');
  
  try {
    // 1. Add status column to student_classes if it doesn't exist
    try {
      console.log('⏳ Checking student_classes table...');
      const [columns] = await pool.query('SHOW COLUMNS FROM student_classes LIKE "status"');
      
      if (columns.length === 0) {
        console.log('➕ Adding "status" column to student_classes...');
        await pool.query("ALTER TABLE student_classes ADD COLUMN status VARCHAR(20) DEFAULT 'approved'");
        console.log('✅ Column "status" added successfully.');
      } else {
        console.log('ℹ️ Column "status" already exists in student_classes.');
      }
    } catch (err) {
      console.error('❌ Error updating student_classes:', err.message);
    }

    // 2. Ensure existing records have a status
    console.log('⏳ Updating existing records...');
    await pool.query("UPDATE student_classes SET status = 'approved' WHERE status IS NULL");
    
    // 3. Check for campus_id in classes if needed (just in case)
    try {
      const [classCols] = await pool.query('SHOW COLUMNS FROM classes LIKE "campus_id"');
      if (classCols.length === 0) {
        console.log('➕ Adding "campus_id" to classes table...');
        await pool.query("ALTER TABLE classes ADD COLUMN campus_id INT NULL");
      }
    } catch (err) {}

    console.log('\n✨ Database fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Critical error fixing database:', error);
    process.exit(1);
  }
}

fixDatabase();
