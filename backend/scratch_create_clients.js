const { pool } = require('./config/database');

async function createClientsTable() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lancers_clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        university_name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL UNIQUE,
        admin_name VARCHAR(255) NOT NULL,
        admin_email VARCHAR(255) NOT NULL UNIQUE,
        package_type ENUM('Basic', 'Premium', 'Enterprise') DEFAULT 'Premium',
        subscription_status ENUM('Active', 'Suspended', 'Trial') DEFAULT 'Active',
        monthly_fee DECIMAL(10, 2) DEFAULT 0.00,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created lancers_clients table successfully.');

    // Check if empty, then seed some dummy data
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM lancers_clients');
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO lancers_clients (university_name, domain, admin_name, admin_email, package_type, subscription_status, monthly_fee)
        VALUES 
        ('National University of Science', 'nust.lancerstech.com', 'Dr. Ahmed Raza', 'vc@nust.edu.pk', 'Enterprise', 'Active', 5000.00),
        ('Fast University', 'fast.lancerstech.com', 'Dr. Salman', 'admin@fast.edu.pk', 'Premium', 'Active', 2500.00),
        ('Iqra University', 'iqra.lancerstech.com', 'Mr. Kamran', 'vc@iqra.edu.pk', 'Basic', 'Suspended', 1000.00)
      `);
      console.log('Inserted dummy clients.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

createClientsTable();
