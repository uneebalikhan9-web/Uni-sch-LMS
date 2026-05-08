const { pool } = require('../config/database');

async function initITDB() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS it_tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject VARCHAR(255) NOT NULL,
      description TEXT,
      priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
      category VARCHAR(100),
      status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
      user_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS it_system_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      config_key VARCHAR(100) UNIQUE NOT NULL,
      config_value TEXT,
      description TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS it_audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      action VARCHAR(255) NOT NULL,
      user_id INT,
      details JSON,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `INSERT IGNORE INTO it_system_config (config_key, config_value, description) VALUES 
      ('app_name', 'Lancers Tech LMS', 'Main application name'),
      ('smtp_host', 'smtp.lancerstech.com', 'SMTP Server Host'),
      ('maintenance_mode', 'false', 'Enable/Disable maintenance mode'),
      ('max_upload_size', '50MB', 'Maximum file upload size')`
  ];

  for (let query of queries) {
    try {
      await pool.query(query);
      console.log('✓ Query executed successfully');
    } catch (err) {
      console.error('❌ Error executing query:', err.message);
    }
  }
  process.exit();
}

initITDB();
