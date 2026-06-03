const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lancersnexus_mastercore'
  });

  try {
    const [clients] = await pool.query('SELECT * FROM lancers_clients');
    console.log("ALL CLIENTS:");
    console.table(clients);

    const [superAdmins] = await pool.query('SELECT id, name, email, role, client_id FROM users WHERE role IN ("super_admin", "superadmin")');
    console.log("ALL SUPER ADMINS:");
    console.table(superAdmins);

    const [campuses] = await pool.query('SELECT id, name, client_id FROM campuses ORDER BY id DESC LIMIT 10');
    console.log("RECENT CAMPUSES:");
    console.table(campuses);

  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

checkDB();
