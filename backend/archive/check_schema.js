const { pool } = require('./config/database');

async function checkSchema() {
  try {
    const [rows] = await pool.query('SHOW COLUMNS FROM student_classes');
    console.log('Columns in student_classes:', rows.map(r => r.Field));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
