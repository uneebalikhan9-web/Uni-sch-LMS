const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runFixes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lancersnexus_mastercore',
    multipleStatements: true
  });

  try {
    const sqlPath = path.join(__dirname, 'database_fixes_phase1.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing Phase 1 Foundation Fixes...');
    await connection.query(sqlScript);
    console.log('Successfully applied database fixes!');
  } catch (error) {
    console.error('Error executing SQL script:', error);
  } finally {
    await connection.end();
  }
}

runFixes();
