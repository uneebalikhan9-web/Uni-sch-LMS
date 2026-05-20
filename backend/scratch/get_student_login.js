const { pool } = require('../config/database');

async function run() {
  try {
    const [students] = await pool.query(`
      SELECT u.email, u.name, s.roll_number 
      FROM users u
      JOIN students s ON u.id = s.user_id
      LIMIT 5
    `);
    console.log('Students logins:');
    console.log(students);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
