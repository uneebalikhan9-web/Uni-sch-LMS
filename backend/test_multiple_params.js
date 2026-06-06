const { pool } = require('./config/database'); 

async function run() {
  const campusIds = [1];
  const currentYear = 2026;
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(DISTINCT sc.student_id) as totalStudents 
      FROM student_classes sc
      JOIN classes cl ON sc.class_id = cl.id
      WHERE cl.campus_id IN (?) AND YEAR(sc.created_at) = ?
    `, [campusIds, currentYear]);
    console.log("query passed");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
