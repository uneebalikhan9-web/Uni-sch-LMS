const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lancersnexus_mastercore'
  });
  const [rows] = await connection.query('SELECT * FROM campus_attendance ORDER BY id DESC LIMIT 5');
  console.log(rows);
  await connection.end();
}
run();
