const { pool } = require('../config/database');

async function run() {
  try {
    const [enrollments] = await pool.query('DESCRIBE enrollments');
    console.log('Enrollments structure:');
    console.log(enrollments);

    const [sc] = await pool.query('DESCRIBE student_classes');
    console.log('Student classes structure:');
    console.log(sc);

    const [rows] = await pool.query('SELECT * FROM enrollments LIMIT 5');
    console.log('Enrollments data:');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
