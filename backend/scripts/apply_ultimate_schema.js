const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function applyUltimateSchema() {
  console.log('🚀 Starting ULTIMATE Database Setup...');
  console.log('🔧 Connecting to MySQL...');

  try {
    const dbName = process.env.DB_NAME || 'test67';

    const conn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: String(process.env.DB_PASSWORD || process.env.DB_PASS || ''),
      multipleStatements: true,
    });

    console.log('✅ Connected to MySQL!');
    
    console.log(`🔨 Cleaning and Creating database: ${dbName}...`);
    await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await conn.query(`CREATE DATABASE \`${dbName}\``);
    await conn.query(`USE \`${dbName}\``);



    const sqlFile = path.join(__dirname, '../lancers_nexus_ultimate_schema.sql');
    console.log(`📄 Reading ultimate schema from: ${sqlFile}`);
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🔥 Applying schema and seeding data... (10 items per category)');
    await conn.query(sql);

    console.log('✅ ULTIMATE Schema applied successfully!');
    console.log('');
    console.log('🌟 12+ Portals Ready: Super Admin, Rector, Registrar, Finance, HR, Librarian, HOD, Teacher, Student, Admission, BD.');
    console.log('');
    console.log('📋 Default Super Admin Credentials:');
    console.log('   Email   : nexus.admin@lancerstech.com');
    console.log('   Password: LancersNexus@2026');
    console.log('');
    
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema apply failed:', err.message);
    process.exit(1);
  }
}

applyUltimateSchema();
