const { pool } = require('./config/database'); 
async function run() {
  try {
    const campusIds = [1];
    const [departments] = await pool.query(`
      SELECT 
        d.id,
        d.name as dept
      FROM departments d
      JOIN faculties f ON d.faculty_id = f.id
      WHERE d.campus_id IN (?)
      LIMIT 15
    `, [campusIds]);
    console.log("depts ok", departments);
  } catch(err) {
    console.error("Error 2:", err.message);
  }
  process.exit(0);
}
run();
