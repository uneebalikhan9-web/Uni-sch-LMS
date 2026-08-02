const { pool } = require('./config/database');

async function finalFix() {
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email LIKE "teststudent%"');
    const userIds = users.map(u => u.id);
    
    if (userIds.length > 0) {
      const [students] = await pool.query('SELECT id FROM students WHERE user_id IN (?)', [userIds]);
      const studentIds = students.map(s => s.id);
      
      if (studentIds.length > 0) {
        // Change enrollment status to 'approved' so teachers can see them
        await pool.query('UPDATE enrollments SET status = "approved" WHERE student_id IN (?)', [studentIds]);
        console.log('Updated enrollments status to approved');
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
finalFix();
