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
    console.log("Creating client_invoices table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS client_invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('Paid', 'Pending', 'Overdue') DEFAULT 'Pending',
        billing_month VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES lancers_clients(id) ON DELETE CASCADE
      )
    `);
    console.log("Table client_invoices created successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    pool.end();
  }
}

migrate();
