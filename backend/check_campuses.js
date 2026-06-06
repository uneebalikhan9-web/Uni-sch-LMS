const { pool } = require('./config/database'); 
async function run() {
  const [campuses] = await pool.query('SELECT id, name, client_id FROM campuses');
  const [clients] = await pool.query('SELECT id, name FROM lancers_clients');
  console.log({campuses, clients});
  process.exit(0);
}
run();
