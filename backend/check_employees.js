const { pool } = require('./config/database'); 
async function run() {
  const [users] = await pool.query('SELECT id, name, role FROM users WHERE role="teacher"');
  const [employees] = await pool.query('SELECT id, user_id FROM employees');
  console.log({users, employees});
  process.exit(0);
}
run();
