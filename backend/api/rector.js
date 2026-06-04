const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken, isRector } = require('../middleware/auth');

// Helper: get campus_id from rector's user record
async function getRectorCampusIds(user) {
  if (user.role === 'super_admin') {
    const [rows] = await pool.query('SELECT id FROM campuses');
    return rows.length > 0 ? rows.map(r => r.id) : [0];
  }
  if (user.client_id) {
    const [rows] = await pool.query('SELECT id FROM campuses WHERE client_id = ?', [user.client_id]);
    return rows.length > 0 ? rows.map(r => r.id) : [user.campus_id || 0];
  }
  return [user.campus_id || 0];
}

// @route   GET /api/rector/stats
router.get('/stats', verifyToken, isRector, async (req, res) => {
  try {
    const campusIds = await getRectorCampusIds(req.user);

    // Students in this campus (via classes -> campus_id)
    const [[{ totalStudents }]] = await pool.query(`
      SELECT COUNT(DISTINCT sc.student_id) as totalStudents 
      FROM student_classes sc
      JOIN classes cl ON sc.class_id = cl.id
      WHERE cl.campus_id IN (?) AND sc.status = 'approved'
    `, [campusIds]);

    // Faculty in this campus (employees whose dept is under campus faculties)
    const [[{ totalFaculty }]] = await pool.query(`
      SELECT COUNT(DISTINCT e.id) as totalFaculty
      FROM employees e
      JOIN users u ON e.user_id = u.id
      WHERE u.campus_id IN (?)
    `, [campusIds]);

    // Active courses in this campus
    const [[{ totalCourses }]] = await pool.query(`
      SELECT COUNT(DISTINCT c.id) as totalCourses 
      FROM courses c
      JOIN classes cl ON c.class_id = cl.id
      WHERE cl.campus_id IN (?) AND c.status = 'active'
    `, [campusIds]);

    // Classes in this campus
    const [[{ totalClasses }]] = await pool.query(
      "SELECT COUNT(*) as totalClasses FROM classes WHERE campus_id IN (?)", [campusIds]
    );

    // Departments linked to this campus via faculties
    const [[{ totalDepts }]] = await pool.query(`
      SELECT COUNT(DISTINCT d.id) as totalDepts 
      FROM departments d
      JOIN faculties f ON d.faculty_id = f.id
      WHERE d.campus_id IN (?)
    `, [campusIds]);

    // YoY student enrollment growth
    const currentYear = new Date().getFullYear();
    const [[{ thisYear }]] = await pool.query(`
      SELECT COUNT(DISTINCT sc.student_id) as thisYear 
      FROM student_classes sc JOIN classes cl ON sc.class_id = cl.id
      WHERE cl.campus_id IN (?) AND YEAR(sc.created_at) = ?
    `, [campusIds, currentYear]);

    const [[{ lastYear }]] = await pool.query(`
      SELECT COUNT(DISTINCT sc.student_id) as lastYear 
      FROM student_classes sc JOIN classes cl ON sc.class_id = cl.id
      WHERE cl.campus_id IN (?) AND YEAR(sc.created_at) = ?
    `, [campusIds, currentYear - 1]);

    const growthTrend = lastYear > 0
      ? `${Math.round(((thisYear - lastYear) / lastYear) * 100) >= 0 ? '+' : ''}${Math.round(((thisYear - lastYear) / lastYear) * 100)}%`
      : (thisYear > 0 ? '+100%' : '+0%');

    // Faculty growth
    const [[{ facThisYear }]] = await pool.query(`
      SELECT COUNT(*) as facThisYear FROM employees e JOIN users u ON e.user_id = u.id
      WHERE u.campus_id IN (?) AND YEAR(e.created_at) = ?
    `, [campusIds, currentYear]);

    const [[{ facLastYear }]] = await pool.query(`
      SELECT COUNT(*) as facLastYear FROM employees e JOIN users u ON e.user_id = u.id
      WHERE u.campus_id IN (?) AND YEAR(e.created_at) = ?
    `, [campusIds, currentYear - 1]);

    const facGrowth = facLastYear > 0
      ? `${Math.round(((facThisYear - facLastYear) / facLastYear) * 100) >= 0 ? '+' : ''}${Math.round(((facThisYear - facLastYear) / facLastYear) * 100)}%`
      : (facThisYear > 0 ? '+100%' : '+0%');

    // Institutional score
    const institutionalScore = totalClasses > 0
      ? Math.min(Math.round((totalCourses / totalClasses) * 10), 100)
      : 0;

    res.json({
      success: true,
      stats: {
        totalEnrollment: totalStudents.toString(),
        facultyStrength: totalFaculty.toString(),
        activeCourses: totalCourses,
        totalDepts,
        growthTrend,
        facGrowth,
        institutionalScore
      }
    });
  } catch (error) {
    console.error('Rector Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
});

// @route   GET /api/rector/faculty
router.get('/faculty', verifyToken, isRector, async (req, res) => {
  try {
    const campusIds = await getRectorCampusIds(req.user);

    const [faculty] = await pool.query(`
      SELECT 
        u.name,
        IFNULL(e.designation, 'Staff') as desig,
        IFNULL(d.name, 'General') as dept,
        CONCAT(
          IFNULL((SELECT COUNT(*) FROM courses c 
                  JOIN classes cl ON c.class_id = cl.id 
                  WHERE c.teacher_id = e.id AND c.status = 'active' AND cl.campus_id IN (?)), 0),
          ' course(s)'
        ) as load_hrs,
        IFNULL(u.status, 'active') as status
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE u.campus_id IN (?)
      ORDER BY u.name ASC
      LIMIT 100
    `, [campusIds, campusIds]);

    res.json({ success: true, faculty });
  } catch (error) {
    console.error('Rector Faculty Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching faculty' });
  }
});

// @route   GET /api/rector/students
router.get('/students', verifyToken, isRector, async (req, res) => {
  try {
    const campusIds = await getRectorCampusIds(req.user);

    const [rows] = await pool.query(`
      SELECT 
        YEAR(sc.created_at) as year,
        COUNT(DISTINCT sc.student_id) as intake,
        CONCAT(
          ROUND(
            (SUM(CASE WHEN s.academic_status != 'suspended' THEN 1 ELSE 0 END) / COUNT(DISTINCT sc.student_id)) * 100,
          0), '%') as retention,
        IFNULL(ROUND(AVG(s.current_gpa), 2), 'N/A') as gpa
      FROM student_classes sc
      JOIN classes cl ON sc.class_id = cl.id
      JOIN students s ON sc.student_id = s.id
      WHERE cl.campus_id IN (?) AND sc.status = 'approved'
      GROUP BY YEAR(sc.created_at)
      ORDER BY year DESC
    `, [campusIds]);

    const trends = rows.map((row, index) => {
      const prevRow = rows[index + 1];
      let growth = 'N/A';
      if (prevRow && prevRow.intake > 0) {
        const pct = Math.round(((row.intake - prevRow.intake) / prevRow.intake) * 100);
        growth = (pct >= 0 ? '+' : '') + pct + '%';
      }
      return { ...row, growth };
    });

    res.json({ success: true, trends });
  } catch (error) {
    console.error('Rector Trends Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching trends' });
  }
});

// @route   GET /api/rector/compliance
router.get('/compliance', verifyToken, isRector, async (req, res) => {
  try {
    const campusIds = await getRectorCampusIds(req.user);

    const [compliance] = await pool.query(`
      SELECT 
        p.name,
        IFNULL(p.accreditation_status, 'Pending') as body,
        DATE_FORMAT(DATE_ADD(p.created_at, INTERVAL 2 YEAR), '%Y') as valid,
        DATE_FORMAT(p.created_at, '%Y') as last,
        CASE
          WHEN (SELECT COUNT(*) FROM students s WHERE s.program_id = p.id) = 0 THEN 'High'
          WHEN (SELECT COUNT(*) FROM students s WHERE s.program_id = p.id) < 5 THEN 'Medium'
          ELSE 'Low'
        END as risk
      FROM programs p
      JOIN departments d ON p.department_id = d.id
      JOIN faculties f ON d.faculty_id = f.id
      WHERE d.campus_id IN (?)
      ORDER BY p.name ASC
    `, [campusIds]);

    res.json({ success: true, compliance });
  } catch (error) {
    console.error('Rector Compliance Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching compliance' });
  }
});

// @route   GET /api/rector/finance
router.get('/finance', verifyToken, isRector, async (req, res) => {
  try {
    const campusIds = await getRectorCampusIds(req.user);

    const [[{ totalRevenue }]] = await pool.query(
      "SELECT IFNULL(SUM(fc.total_amount), 0) as totalRevenue FROM finance_challans fc WHERE fc.status = 'paid' AND fc.campus_id IN (?)", [campusIds]
    );
    const [[{ totalExpenses }]] = await pool.query(
      'SELECT IFNULL(SUM(amount), 0) as totalExpenses FROM finance_expenses WHERE campus_id IN (?)', [campusIds]
    );
    const [[{ payrollDisbursed }]] = await pool.query(
      "SELECT IFNULL(SUM(fp.net_payable), 0) as payrollDisbursed FROM finance_payroll fp JOIN employees e ON fp.employee_id = e.id JOIN users u ON e.user_id = u.id WHERE fp.status = 'disbursed' AND u.campus_id IN (?)", [campusIds]
    );
    const [[{ totalBudget }]] = await pool.query(
      "SELECT IFNULL(SUM(fp.net_payable), 0) as totalBudget FROM finance_payroll fp JOIN employees e ON fp.employee_id = e.id JOIN users u ON e.user_id = u.id WHERE u.campus_id IN (?)", [campusIds]
    );

    const [spendingByDept] = await pool.query(`
      SELECT d.name, IFNULL(SUM(fe.amount), 0) as amount
      FROM departments d
      JOIN faculties f ON d.faculty_id = f.id
      LEFT JOIN finance_expenses fe ON fe.campus_id = d.id
      WHERE d.campus_id IN (?)
      GROUP BY d.id
      ORDER BY amount DESC
      LIMIT 8
    `, [campusIds]);

    const totalCost = totalExpenses + payrollDisbursed;
    const operatingMargin = totalRevenue > 0
      ? parseFloat(((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1))
      : 0;
    const budgetAdherence = totalBudget > 0
      ? parseFloat(Math.min((payrollDisbursed / totalBudget * 100), 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        payrollDisbursed,
        operatingMargin,
        budgetAdherence,
        spendingByDept: spendingByDept.filter(d => d.amount > 0)
      }
    });
  } catch (error) {
    console.error('Rector Finance Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching finance data' });
  }
});

// @route   GET /api/rector/departments
router.get('/departments', verifyToken, isRector, async (req, res) => {
  try {
    const campusIds = await getRectorCampusIds(req.user);

    const [departments] = await pool.query(`
      SELECT 
        d.id,
        d.name as dept,
        IFNULL(
          CONCAT(
            ROUND(
              (SELECT COUNT(DISTINCT sc.student_id) FROM student_classes sc 
               JOIN classes cl ON sc.class_id = cl.id 
               JOIN programs p2 ON cl.program_id = p2.id 
               WHERE p2.department_id = d.id AND sc.status = 'approved') /
              NULLIF((SELECT COUNT(DISTINCT sc2.student_id) FROM student_classes sc2 
                      JOIN classes cl2 ON sc2.class_id = cl2.id 
                      JOIN programs p3 ON cl2.program_id = p3.id 
                      WHERE p3.department_id = d.id), 0) * 100, 1
            ), '%'
          ), 'N/A'
        ) as rate,
        'N/A' as att,
        CASE
          WHEN (SELECT COUNT(DISTINCT sc3.student_id) FROM student_classes sc3 
                JOIN classes cl3 ON sc3.class_id = cl3.id 
                JOIN programs p4 ON cl3.program_id = p4.id 
                WHERE p4.department_id = d.id AND sc3.status = 'approved') > 10 THEN 'Good'
          WHEN (SELECT COUNT(DISTINCT sc3.student_id) FROM student_classes sc3 
                JOIN classes cl3 ON sc3.class_id = cl3.id 
                JOIN programs p4 ON cl3.program_id = p4.id 
                WHERE p4.department_id = d.id AND sc3.status = 'approved') > 0 THEN 'Growing'
          ELSE 'No Students'
        END as status,
        CASE
          WHEN (SELECT COUNT(DISTINCT sc3.student_id) FROM student_classes sc3 
                JOIN classes cl3 ON sc3.class_id = cl3.id 
                JOIN programs p4 ON cl3.program_id = p4.id 
                WHERE p4.department_id = d.id AND sc3.status = 'approved') > 10 THEN '#10b981'
          WHEN (SELECT COUNT(DISTINCT sc3.student_id) FROM student_classes sc3 
                JOIN classes cl3 ON sc3.class_id = cl3.id 
                JOIN programs p4 ON cl3.program_id = p4.id 
                WHERE p4.department_id = d.id AND sc3.status = 'approved') > 0 THEN '#f59e0b'
          ELSE '#94a3b8'
        END as color,
        CASE
          WHEN (SELECT COUNT(DISTINCT sc3.student_id) FROM student_classes sc3 
                JOIN classes cl3 ON sc3.class_id = cl3.id 
                JOIN programs p4 ON cl3.program_id = p4.id 
                WHERE p4.department_id = d.id AND sc3.status = 'approved') > 10 THEN '#dcfce7'
          WHEN (SELECT COUNT(DISTINCT sc3.student_id) FROM student_classes sc3 
                JOIN classes cl3 ON sc3.class_id = cl3.id 
                JOIN programs p4 ON cl3.program_id = p4.id 
                WHERE p4.department_id = d.id AND sc3.status = 'approved') > 0 THEN '#fef3c7'
          ELSE '#f1f5f9'
        END as bg
      FROM departments d
      JOIN faculties f ON d.faculty_id = f.id
      WHERE d.campus_id IN (?)
      LIMIT 15
    `, [campusIds]);

    res.json({ success: true, departments });
  } catch (error) {
    console.error('Rector Departments Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching departments' });
  }
});

// @route   GET /api/rector/research
// @desc    Return faculty as researchers (no dummy research_projects table)
router.get('/research', verifyToken, isRector, async (req, res) => {
  try {
    const campusIds = await getRectorCampusIds(req.user);

    const [research] = await pool.query(`
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

    res.json({ success: true, research });
  } catch (error) {
    console.error('Rector Research Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching research data' });
  }
});

// @route   GET /api/rector/strategy
router.get('/strategy', verifyToken, isRector, async (req, res) => {
  try {
    const campusIds = await getRectorCampusIds(req.user);

    const [growthData] = await pool.query(`
      SELECT YEAR(sc.created_at) as year, COUNT(DISTINCT sc.student_id) as count
      FROM student_classes sc
      JOIN classes cl ON sc.class_id = cl.id
      WHERE cl.campus_id IN (?) AND sc.status = 'approved'
      GROUP BY YEAR(sc.created_at)
      ORDER BY year ASC
    `, [campusIds]);

    const [enrollmentBreakdown] = await pool.query(`
      SELECT p.name, COUNT(DISTINCT sc.student_id) as count
      FROM programs p
      JOIN departments d ON p.department_id = d.id
      JOIN faculties f ON d.faculty_id = f.id
      LEFT JOIN classes cl ON cl.program_id = p.id AND cl.campus_id = d.campus_id
      LEFT JOIN student_classes sc ON sc.class_id = cl.id AND sc.status = 'approved'
      WHERE d.campus_id IN (?)
      GROUP BY p.id
      ORDER BY count DESC
      LIMIT 6
    `, [campusIds]);

    const [[{ totalStudents }]] = await pool.query(`
      SELECT COUNT(DISTINCT sc.student_id) as totalStudents
      FROM student_classes sc JOIN classes cl ON sc.class_id = cl.id
      WHERE cl.campus_id IN (?) AND sc.status = 'approved'
    `, [campusIds]);

    const [[{ totalTeachers }]] = await pool.query(`
      SELECT COUNT(*) as totalTeachers FROM users WHERE role = 'teacher' AND campus_id IN (?)
    `, [campusIds]);

    const ratio = totalTeachers > 0 ? totalStudents / totalTeachers : 0;
    const efficiency = ratio > 0 ? Math.min(Math.round((20 / ratio) * 100), 100) : 0;
    // Quality based on enrollment fill rate
    const [[{ totalClasses }]] = await pool.query('SELECT COUNT(*) as totalClasses FROM classes WHERE campus_id IN (?)', [campusIds]);
    const quality = totalClasses > 0 ? Math.min(Math.round((totalStudents / (totalClasses * 30)) * 100), 100) : 0;

    res.json({
      success: true,
      data: {
        growthData,
        enrollmentBreakdown,
        efficiency,
        quality,
        tip: totalStudents > 0
          ? (ratio > 30
            ? `High student-teacher ratio (${Math.round(ratio)}:1). Consider hiring more faculty.`
            : totalStudents < 5
              ? `Only ${totalStudents} enrolled students. Focus on enrollment drives.`
              : 'Institutional health is optimal.')
          : 'No student data available yet for this campus.'
      }
    });
  } catch (error) {
    console.error('Rector Strategy Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching strategy data' });
  }
});

module.exports = router;
