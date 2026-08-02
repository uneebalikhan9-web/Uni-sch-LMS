const { pool } = require('./config/database');

async function checkJoins() {
  try {
    const [users] = await pool.query(`SELECT id, campus_id, client_id FROM users WHERE email LIKE 'teststudent%'`);
    console.log('Users:', users);

    if (users.length > 0) {
      const [students] = await pool.query(`SELECT * FROM students WHERE user_id = ?`, [users[0].id]);
      console.log('Students:', students);

      if (students.length > 0) {
        const program_id = students[0].program_id;
        const [programs] = await pool.query(`SELECT * FROM programs WHERE id = ?`, [program_id]);
        console.log('Program:', programs);
        
        if (programs.length > 0) {
          const department_id = programs[0].department_id;
          const [departments] = await pool.query(`SELECT * FROM departments WHERE id = ?`, [department_id]);
          console.log('Department:', departments);
        }
        
        const campus_id = users[0].campus_id;
        const [campuses] = await pool.query(`SELECT * FROM campuses WHERE id = ?`, [campus_id]);
        console.log('Campus:', campuses);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
checkJoins();
