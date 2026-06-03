const { pool } = require('./config/database');

async function migrateAdmissions() {
  const tables = [
    'admission_applications',
    'admission_logs',
    'admission_documents',
    'admission_interviews'
  ];

  try {
    for (const table of tables) {
      // Check if column already exists
      const [columns] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE 'campus_id'`);
      if (columns.length === 0) {
        console.log(`Adding campus_id to ${table}...`);
        await pool.query(`ALTER TABLE ${table} ADD COLUMN campus_id INT DEFAULT 1`);
      } else {
        console.log(`campus_id already exists in ${table}`);
      }
    }
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateAdmissions();
