const { pool } = require('./config/database'); 
async function run() {
  const [users] = await pool.query('SELECT id, name, campus_id, client_id, role FROM users WHERE role="rector"');
  console.log({users});
  process.exit(0);
}
run();
