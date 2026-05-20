const { pool } = require('../config/database');

async function run() {
  try {
    // 1. Get all courses
    const [courses] = await pool.query('SELECT id, title FROM courses');
    console.log('Courses in DB:', courses.map(c => `${c.id}: ${c.title}`));

    // 2. Get all students
    const [students] = await pool.query('SELECT id FROM students');
    console.log('Students count:', students.length);

    // 3. Clear existing enrollments
    console.log('Cleaning old enrollments...');
    await pool.query('DELETE FROM enrollments');

    // 4. Enroll all students in all courses
    console.log('Enrolling all students in all courses...');
    for (const student of students) {
      for (const course of courses) {
        await pool.query(
          'INSERT INTO enrollments (student_id, course_id, semester, academic_year, status) VALUES (?, ?, ?, ?, ?)',
          [student.id, course.id, 1, '2026', 'approved']
        );
      }
    }

    console.log('All student enrollments seeded successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
