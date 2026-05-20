const { pool } = require('../config/database');

async function run() {
  try {
    const [rows] = await pool.query("SELECT id, name, email, role FROM users WHERE name LIKE '%rehan%'");
    console.log('Rehan users in DB:');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
