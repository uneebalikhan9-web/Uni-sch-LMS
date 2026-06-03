const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lancersnexus_mastercore'
  });

  try {
    console.log("Creating platform_settings table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert defaults
    const defaults = [
      ['maintenance_mode', 'false', 'Enable global maintenance mode for all tenants'],
      ['allow_new_registrations', 'true', 'Allow onboarding of new universities'],
      ['free_trial_days', '14', 'Default free trial days for new clients'],
      ['system_email', 'no-reply@lancerstech.com', 'Global sender email address']
    ];
    
    for (const [key, value, desc] of defaults) {
      await pool.query(
        'INSERT IGNORE INTO platform_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
        [key, value, desc]
      );
    }
    
    console.log("Table platform_settings created and defaults inserted!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    pool.end();
  }
}

migrate();
