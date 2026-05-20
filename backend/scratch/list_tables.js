const { pool } = require('../config/database');

async function run() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables:');
    console.log(tables);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
