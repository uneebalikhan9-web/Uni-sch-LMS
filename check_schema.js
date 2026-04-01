require('dotenv').config({ path: './backend/.env' });
const { pool } = require('./backend/config/database');

async function checkSchema() {
  try {
    const tables = ['classes', 'courses', 'labs'];
    for (const table of tables) {
      console.log(`\n--- Schema for table: ${table} ---`);
      const [columns] = await pool.query(`DESCRIBE ${table}`);
      console.table(columns);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
