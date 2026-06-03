const { pool } = require('./config/database');

async function fixDB() {
  const connection = await pool.getConnection();
  try {
    // 1. Delete all dummy data
    await connection.query('DELETE FROM lancers_clients');
    
    // 2. Fetch the super_admin
    const [users] = await connection.query('SELECT * FROM users WHERE role = "super_admin"');
    
    if (users.length > 0) {
      const vc = users[0];
      console.log('Found VC:', vc.name, vc.email);
      // 3. Insert the VC into lancers_clients
      await connection.query(`
        INSERT INTO lancers_clients (university_name, domain, admin_name, admin_email, package_type, subscription_status, monthly_fee)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'Lancers Nexus University',
        'nexus.lancerstech.com',
        vc.name,
        vc.email,
        'Enterprise',
        'Active',
        5000.00
      ]);
      console.log('Inserted actual VC as client.');
    } else {
      console.log('No super_admin found in users table.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixDB();
