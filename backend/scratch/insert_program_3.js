const { pool } = require('../config/database');

async function run() {
  try {
    await pool.query(`
      INSERT INTO programs (id, name, code, level) 
      VALUES (3, 'BS Software Engineering', 'BSSE', 'Undergraduate')
      ON DUPLICATE KEY UPDATE name='BS Software Engineering', code='BSSE'
    `);
    console.log('Successfully inserted BS Software Engineering with ID = 3!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
