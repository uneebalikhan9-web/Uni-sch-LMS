const { pool } = require('../config/database');

async function run() {
  try {
    const [exams] = await pool.query('SELECT COUNT(*) as count FROM exams');
    const [results] = await pool.query('SELECT COUNT(*) as count FROM exam_results');
    console.log('EXAMS COUNT IN DB:', exams[0].count);
    console.log('RESULTS COUNT IN DB:', results[0].count);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
