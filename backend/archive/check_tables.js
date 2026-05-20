const { pool } = require('./config/database');

async function checkTables() {
  try {
    const [attendance] = await pool.query('SHOW COLUMNS FROM attendance');
    console.log('Attendance columns:', attendance.map(c => c.Field).join(', '));

    const [grades] = await pool.query('SHOW TABLES LIKE "grades"');
    if (grades.length > 0) {
      const [gradeCols] = await pool.query('SHOW COLUMNS FROM grades');
      console.log('Grades columns:', gradeCols.map(c => c.Field).join(', '));
    } else {
      console.log('Grades table does NOT exist!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}

checkTables();
