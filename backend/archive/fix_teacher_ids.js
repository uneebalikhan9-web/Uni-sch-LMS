const { pool } = require('./config/database');

async function fixData() {
  try {
    console.log('Checking for invalid teacher_id in courses...');
    const [invalidCourses] = await pool.query(`
      SELECT c.id, c.teacher_id, c.title
      FROM courses c
      LEFT JOIN employees e ON c.teacher_id = e.id
      WHERE c.teacher_id IS NOT NULL AND e.id IS NULL
    `);

    console.log(`Found ${invalidCourses.length} courses with invalid teacher_id (not in employees table).`);

    for (const course of invalidCourses) {
      // Check if the teacher_id was actually a user_id
      const [employee] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [course.teacher_id]);
      if (employee.length > 0) {
        const correctEmployeeId = employee[0].id;
        console.log(`Fixing Course "${course.title}" (ID: ${course.id}): Changing teacher_id from ${course.teacher_id} (user_id) to ${correctEmployeeId} (employee_id)`);
        await pool.query('UPDATE courses SET teacher_id = ? WHERE id = ?', [correctEmployeeId, course.id]);
      } else {
        console.warn(`Could not find an employee record for user_id ${course.teacher_id} (Course: ${course.title}). Setting to NULL.`);
        await pool.query('UPDATE courses SET teacher_id = NULL WHERE id = ?', [course.id]);
      }
    }

    console.log('Checking for invalid teacher_id in timetables...');
    const [invalidTimetables] = await pool.query(`
      SELECT t.id, t.teacher_id
      FROM timetables t
      LEFT JOIN employees e ON t.teacher_id = e.id
      WHERE e.id IS NULL
    `);

    console.log(`Found ${invalidTimetables.length} timetables with invalid teacher_id.`);

    for (const t of invalidTimetables) {
      const [employee] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [t.teacher_id]);
      if (employee.length > 0) {
        const correctEmployeeId = employee[0].id;
        console.log(`Fixing Timetable (ID: ${t.id}): Changing teacher_id from ${t.teacher_id} to ${correctEmployeeId}`);
        await pool.query('UPDATE timetables SET teacher_id = ? WHERE id = ?', [correctEmployeeId, t.id]);
      } else {
        console.warn(`Could not find an employee record for user_id ${t.teacher_id} (Timetable: ${t.id}). Deleting entry.`);
        await pool.query('DELETE FROM timetables WHERE id = ?', [t.id]);
      }
    }

    console.log('Data fix complete.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
}

fixData();
