const { pool } = require('./config/database');
async function checkPrograms() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM programs');
    console.log(JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkPrograms();
