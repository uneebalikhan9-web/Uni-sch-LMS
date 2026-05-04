/**
 * apply_schema.js
 * Run this ONCE to re-initialize the LancersNexus_MasterCore database.
 * Command: node apply_schema.js
 */
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config();

async function applySchema() {
  console.log('🔧 Connecting to MySQL...');

  // First connect WITHOUT selecting a database so we can DROP/CREATE it
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,  // CRITICAL: allows running the full SQL file
  });

  console.log('✅ Connected!');

  const sqlFile = path.join(__dirname, 'master_nexus_schema.sql');
  console.log(`📄 Reading schema from: ${sqlFile}`);
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('🚀 Applying schema... (this may take a few seconds)');
  await conn.query(sql);

  console.log('✅ Schema applied successfully!');
  console.log('');
  console.log('📋 Default credentials:');
  console.log('   Email   : nexus.admin@lancerstech.com');
  console.log('   Password: LancersNexus@2026');
  console.log('');
  console.log('🎉 Database LancersNexus_MasterCore is ready!');

  await conn.end();
}

applySchema().catch(err => {
  console.error('❌ Schema apply failed:', err.message);
  console.error(err);
  process.exit(1);
});
