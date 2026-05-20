const { pool } = require('../config/database');

async function run() {
  try {
    const [users] = await pool.query('SELECT name, email, role FROM users');
    console.log('Seeded Users:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}): ${u.role}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
