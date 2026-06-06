const { pool } = require('./config/database'); 
async function run() {
  const req = { user: { role: 'librarian', campus_id: 1, client_id: 4 } };
  let query = "SELECT u.id, u.name, u.email, u.created_at, c.name as campus_name FROM users u LEFT JOIN campuses c ON u.campus_id = c.id WHERE u.role = 'teacher'";
  const params = [];
  if (req.user.role !== 'super_admin' && req.user.campus_id) {
    query += ' AND u.campus_id = ?';
    params.push(req.user.campus_id);
  }
  const [teachers] = await pool.query(query, params);
  console.log(teachers);
  process.exit(0);
}
run();
