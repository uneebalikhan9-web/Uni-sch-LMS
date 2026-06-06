const { pool } = require('./config/database'); 
async function run() {
  const campusIds = [1, 9];
  const [rows] = await pool.query('SELECT COUNT(*) as c FROM users WHERE campus_id IN (?)', [campusIds]);
  console.log(rows);
  const currentYear = 2026;
  const [rows2] = await pool.query('SELECT COUNT(*) as c FROM users WHERE campus_id IN (?) AND YEAR(created_at) = ?', [campusIds, currentYear]);
  console.log(rows2);
  process.exit(0);
}
run();
