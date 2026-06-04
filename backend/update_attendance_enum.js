const { pool } = require('./config/database');

async function updateEnum() {
  try {
    await pool.query("ALTER TABLE attendance MODIFY COLUMN status ENUM('present','absent','late','excused','leave') DEFAULT 'present'");
    console.log('Enum updated');
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

updateEnum();
