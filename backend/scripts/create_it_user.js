const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

async function createITAdmin() {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE role = "it_admin"');
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('itadmin123', 10);
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['IT Administrator', 'it@lancerstech.com', hashedPassword, 'it_admin']
      );
      console.log('✓ IT Admin user created: it@lancerstech.com / itadmin123');
    } else {
      console.log('✓ IT Admin user already exists');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  process.exit();
}

createITAdmin();
