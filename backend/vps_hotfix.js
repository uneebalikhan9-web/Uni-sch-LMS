const { pool } = require('./config/database');

async function fix() {
  try {
    console.log('Running hotfix for VPS database without deleting data...');

    // 1. Create lancers_clients
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lancers_clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        university_name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL UNIQUE,
        admin_name VARCHAR(100),
        admin_email VARCHAR(255),
        package_type ENUM('Basic', 'Premium', 'Enterprise') DEFAULT 'Basic',
        subscription_status ENUM('Active', 'Suspended', 'Cancelled') DEFAULT 'Active',
        monthly_fee DECIMAL(10,2) DEFAULT 0.00,
        logo_url VARCHAR(255),
        primary_color VARCHAR(50) DEFAULT '#0d6efd',
        allowed_modules JSON,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('1. lancers_clients table checked.');

    // 2. Add client_id to users if not exists
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN client_id INT NULL`);
      console.log('2. Added client_id to users.');
    } catch(e) { 
        if(e.code !== 'ER_DUP_FIELDNAME') throw e; 
        else console.log('2. client_id already exists in users, skipping.');
    }

    // 3. Create platform_settings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        description VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default maintenance mode
    await pool.query(`
      INSERT IGNORE INTO platform_settings (setting_key, setting_value, description) 
      VALUES ('maintenance_mode', 'false', 'Enable/disable platform maintenance mode')
    `);
    console.log('3. platform_settings table checked.');

    console.log('✅ VPS Hotfix completed successfully! No data was deleted. Server is now ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during hotfix:', error);
    process.exit(1);
  }
}

fix();
