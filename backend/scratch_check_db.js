const { pool } = require('./config/database');
async function checkColumns() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM students');
    console.log(JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkColumns();
