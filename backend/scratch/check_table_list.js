const { pool } = require('../config/database');

async function run() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const list = tables.map(t => Object.values(t)[0]);
    console.log("All tables in DB:", list.join(', '));
    console.log("Does 'grades' table exist?", list.includes('grades'));
    console.log("Does 'course_reports' table exist?", list.includes('course_reports'));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
