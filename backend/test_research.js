const { pool } = require('./config/database'); 

async function run() {
  const campusIds = [1];
  try {
    const [rows] = await pool.query(`
      SELECT 
        CONCAT('Active Research — ', c.title) as title,
        u.name as lead_pi,
        CONCAT(COUNT(DISTINCT e2.student_id), ' students') as funding,
        CONCAT(c.academic_year) as duration,
        CASE
          WHEN COUNT(DISTINCT e2.student_id) > 10 THEN 'High'
          WHEN COUNT(DISTINCT e2.student_id) > 4 THEN 'Medium'
          ELSE 'Low'
        END as impact
      FROM courses c
      JOIN classes cl ON c.class_id = cl.id
      JOIN employees emp ON c.teacher_id = emp.id
      JOIN users u ON emp.user_id = u.id
      LEFT JOIN enrollments e2 ON e2.course_id = c.id AND e2.status = 'approved'
      WHERE cl.campus_id IN (?) AND c.status = 'active'
      GROUP BY c.id
      ORDER BY COUNT(DISTINCT e2.student_id) DESC
      LIMIT 20
    `, [campusIds]);
    console.log("Research ok");
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
