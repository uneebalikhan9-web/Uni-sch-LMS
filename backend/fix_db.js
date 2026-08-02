const { pool } = require('./config/database');

async function fixDB() {
  try {
    // 1. Check for departments
    const [depts] = await pool.query('SELECT * FROM departments LIMIT 1');
    let deptId;
    if (depts.length === 0) {
      const [res] = await pool.query('INSERT INTO departments (name, code, campus_id) VALUES ("Computer Science", "CS", 1)');
      deptId = res.insertId;
      console.log('Created department:', deptId);
    } else {
      deptId = depts[0].id;
      console.log('Found department:', deptId);
    }

    // 2. Fix program 1
    await pool.query('UPDATE programs SET department_id = ? WHERE id = 1', [deptId]);
    console.log('Updated program 1 with department:', deptId);

    // 3. Fix user's campus_id to match shaheryar
    const [users] = await pool.query('SELECT client_id, campus_id FROM users WHERE email = "shaheryar@gmail.com" LIMIT 1');
    if (users.length > 0) {
      const shaheryar = users[0];
      // if shaheryar's campus_id is null, maybe use the campus that matches his client_id
      let targetCampusId = shaheryar.campus_id;
      
      if (!targetCampusId) {
        const [camps] = await pool.query('SELECT id FROM campuses WHERE client_id = ? LIMIT 1', [shaheryar.client_id]);
        if (camps.length > 0) targetCampusId = camps[0].id;
      }
      
      if (targetCampusId) {
        await pool.query('UPDATE users SET campus_id = ? WHERE email LIKE "teststudent%"', [targetCampusId]);
        console.log('Updated test students to campus_id:', targetCampusId);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
fixDB();
