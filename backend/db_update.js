const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db'
  });
  
  try {
    const defaultModules = JSON.stringify(["rector", "principals", "bd", "hr", "finance", "registrar", "admissions", "exams", "library", "it"]);
    
    // Add column
    await connection.query("ALTER TABLE lancers_clients ADD COLUMN allowed_modules TEXT");
    console.log('Column added successfully');
    
    // Update existing records
    await connection.query("UPDATE lancers_clients SET allowed_modules = ?", [defaultModules]);
    console.log('Existing records updated');
    
  } catch(e) {
    if(e.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists');
    } else {
      console.error(e);
    }
  }
  await connection.end();
}

run();
