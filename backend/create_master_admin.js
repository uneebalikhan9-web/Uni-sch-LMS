const { pool } = require('./config/database');
const bcrypt = require('bcrypt');

async function createMasterAdmin() {
  const connection = await pool.getConnection();
  try {
    const email = 'master@lancerstech.com';
    const password = 'masterpassword'; // simple password for the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.query('UPDATE users SET password = ?, role = "master_admin" WHERE email = ?', [hashedPassword, email]);
      console.log('Updated existing master admin user.');
    } else {
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Lancers Tech Owner', email, hashedPassword, 'master_admin']
      );
      console.log('Created new master admin user.');
    }
    console.log(`Login Email: ${email}`);
    console.log(`Login Password: ${password}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

createMasterAdmin();
