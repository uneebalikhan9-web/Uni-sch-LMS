const { pool } = require('../config/database');

async function run() {
  try {
    const [enrollments] = await pool.query(`
      SELECT en.*, u.name as student_name, c.title as course_title 
      FROM enrollments en
      JOIN students s ON en.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN courses c ON en.course_id = c.id
    `);
    console.log('All Student Enrollments in DB:');
    enrollments.forEach(en => {
      console.log(`- Student: ${en.student_name} (ID: ${en.student_id}) enrolled in Course: ${en.course_title} (ID: ${en.course_id}), Status: ${en.status}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
