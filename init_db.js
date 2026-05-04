const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    multipleStatements: true
  });

  try {
    console.log('🚀 Reading master_nexus_schema.sql...');
    const schemaPath = path.join(__dirname, 'backend', 'master_nexus_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('⏳ Executing schema (this may take a few seconds)...');
    await connection.query(schemaSql);

    console.log('✅ Database "LancersNexus_MasterCore" created and initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
