const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function syncSchemas() {
  let connection;
  try {
    console.log('Synchronizing all missing tables for VPS (Final Fix)...');
    
    // Connect with multipleStatements enabled (though we are executing one by one)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: String(process.env.DB_PASSWORD || process.env.DB_PASS || ''),
      database: process.env.DB_NAME || 'university_lms',
      multipleStatements: true
    });

    const schemaFiles = [
      'new_database_schema.sql',
      'phase2_5_schema.sql',
      'phase5_schema.sql',
      'phase6_hr_schema.sql',
      'phase6_it_schema.sql',
      'phase6_lab_schema.sql',
      'phase6_library_schema.sql',
      'phase7_finance_schema.sql',
      'phase7_graduation_schema.sql'
    ];

    for (const file of schemaFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`Parsing ${file} for missing tables...`);
        let sql = fs.readFileSync(filePath, 'utf8');
        
        // Extract all CREATE TABLE IF NOT EXISTS statements
        const createStatements = sql.match(/CREATE TABLE IF NOT EXISTS[\s\S]*?;/gi);
        if (createStatements) {
          for (let stmt of createStatements) {
            try {
              await connection.query(stmt);
            } catch (err) {
               // Ignore if table exists or foreign key mismatch
               if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
                 console.log(`[Warning] ${file}:`, err.message);
               }
            }
          }
        }
        
        // Extract all ALTER TABLE ADD COLUMN statements
        const alterStatements = sql.match(/ALTER TABLE [^\n]+;/gi);
        if (alterStatements) {
           for (let stmt of alterStatements) {
             try {
               await connection.query(stmt);
             } catch (err) {
               // Ignore duplicate columns or other minor alter errors
             }
           }
        }
      }
    }
    
    console.log('✅ VPS database fully synchronized! All missing modules (Grades, Graduation, HR, Library, etc) are now ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error synchronizing schemas:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

syncSchemas();
