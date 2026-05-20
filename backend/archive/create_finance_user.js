const { pool } = require('./config/database');
const bcrypt = require('bcrypt');

async function createFinanceUser() {
  try {
    const email = 'finance@lancerstech.com';
    const password = 'LancersNexus@2026';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('--- Lancers Tech Finance User Creation ---');
    
    // 1. Create User
    const [result] = await pool.query(
      'INSERT IGNORE INTO users (name, email, password, role, status, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Finance Manager', email, hashedPassword, 'finance_manager', 'active', 1, 1]
    );

    if (result.affectedRows > 0) {
      const userId = result.insertId;
      console.log(`✅ User created with ID: ${userId}`);

      // 2. Create Employee Profile
      await pool.query(
        'INSERT IGNORE INTO employees (user_id, employee_code, designation, joining_date) VALUES (?, ?, ?, CURDATE())',
        [userId, 'FIN-001', 'Chief Accounts Officer']
      );
      console.log('✅ Employee profile created');
    } else {
      console.log('ℹ️ User already exists or could not be created.');
    }

    console.log('\nTry logging in now with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createFinanceUser();
