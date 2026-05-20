const { pool } = require('../config/database');

async function run() {
  try {
    const [rows] = await pool.query('SELECT * FROM programs');
    console.log('PROGRAMS IN DB:', rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
