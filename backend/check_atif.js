const { pool } = require('./config/database'); 
async function run() {
  const [users] = await pool.query('SELECT id, name, campus_id, client_id, role FROM users WHERE name LIKE "%Atif%"');
  console.log({users});
  process.exit(0);
}
run();
