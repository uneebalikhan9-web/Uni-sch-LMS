const { pool } = require('./config/database'); 

async function run() {
  const campusIds = [1];
  try {
    const [[{ totalStudents }]] = await pool.query(`
      SELECT COUNT(DISTINCT sc.student_id) as totalStudents 
      FROM student_classes sc
      JOIN classes cl ON sc.class_id = cl.id
      WHERE cl.campus_id IN (?) AND sc.status = 'approved'
    `, [campusIds]);
    console.log("totalStudents:", totalStudents);

    const [[{ totalFaculty }]] = await pool.query(`
      SELECT COUNT(DISTINCT e.id) as totalFaculty
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE u.campus_id IN (?)
    `, [campusIds]);
    console.log("totalFaculty ok");

    const [[{ totalCourses }]] = await pool.query(`
      SELECT COUNT(DISTINCT c.id) as totalCourses 
      FROM courses c
      JOIN classes cl ON c.class_id = cl.id
      WHERE cl.campus_id IN (?) AND c.status = 'active'
    `, [campusIds]);
    console.log("totalCourses ok");

    const [[{ totalClasses }]] = await pool.query(
      "SELECT COUNT(*) as totalClasses FROM classes WHERE campus_id IN (?)", [campusIds]
    );
    console.log("totalClasses ok");

    const [[{ totalDepts }]] = await pool.query(`
      SELECT COUNT(DISTINCT d.id) as totalDepts 
      FROM departments d
      JOIN faculties f ON d.faculty_id = f.id
      WHERE d.campus_id IN (?)
    `, [campusIds]);
    console.log("totalDepts ok");
  } catch (err) {
    console.error("Stats Error:", err);
  }

  process.exit(0);
}
run();
