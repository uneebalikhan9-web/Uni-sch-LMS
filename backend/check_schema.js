require('dotenv').config();
const { pool } = require('./config/database');

async function checkSchema() {
  try {
    const tables = ['classes', 'courses', 'labs', 'users'];
    for (const table of tables) {
      console.log(`\n--- Schema for table: ${table} ---`);
      try {
        const [columns] = await pool.query(`DESCRIBE ${table}`);
        console.table(columns);
      } catch (err) {
        console.error(`Error describing ${table}: ${err.message}`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
