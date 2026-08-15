const { pool } = require('./config/database');

async function run() {
  try {
    console.log('Adding watch_time_seconds to submissions table...');
    await pool.query('ALTER TABLE submissions ADD COLUMN watch_time_seconds INT DEFAULT 0');
    console.log('Column added successfully.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    process.exit(0);
  }
}

run();
