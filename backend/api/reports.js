const express = require('express');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

// ==================== GENERATE REPORT (Teacher or HOD) ====================
// POST /api/reports/generate/:courseId
// Marks course as completed AND auto-generates the report in one call

router.post('/generate/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const user = req.user;

  // Only teacher, principal, admin, super_admin can generate
  const allowed = ['teacher', 'principal', 'admin', 'super_admin'];
  if (!allowed.includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    // 1. Get course info
    const [[course]] = await pool.query(`
      SELECT c.id, c.title, c.teacher_id, c.class_id, c.campus_id,
             cl.name as class_name,
             cam.name as campus_name,
             u.name as teacher_name
      FROM courses c
      LEFT JOIN classes cl ON c.class_id = cl.id
      LEFT JOIN campuses cam ON c.campus_id = cam.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `, [courseId]);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Permission check: teacher can only complete their own course
    if (user.role === 'teacher' && course.teacher_id !== user.id) {
      return res.status(403).json({ success: false, message: 'You can only complete your own course' });
    }

    // HOD can only complete courses in their campus
    if (user.role === 'principal' && course.campus_id !== user.campus_id) {
      return res.status(403).json({ success: false, message: 'Access denied to this campus course' });
    }

    // Check if report already exists
    const [[existingReport]] = await pool.query(
      'SELECT id FROM course_reports WHERE course_id = ?',
      [courseId]
    );
    if (existingReport) {
      return res.status(400).json({ success: false, message: 'Report already generated for this course' });
    }

    // 2. Collect stats

    // Total enrolled students
    const [[{ total_students }]] = await pool.query(
      "SELECT COUNT(*) as total_students FROM enrollments WHERE course_id = ? AND status = 'approved'",
      [courseId]
    );

    // Average attendance (present records / total attendance records * 100)
    const [[attStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance
      WHERE course_id = ?
    `, [courseId]);
    const avg_attendance = attStats.total_records > 0
      ? parseFloat(((attStats.present_count / attStats.total_records) * 100).toFixed(2))
      : 0;

    // Average marks from grades table (if any)
    const [[marksStats]] = await pool.query(`
      SELECT 
        COALESCE(AVG(percentage), 0) as avg_marks,
        SUM(CASE WHEN percentage >= 50 THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN percentage < 50 THEN 1 ELSE 0 END) as fail_count
      FROM grades
      WHERE course_id = ?
    `, [courseId]);

    // Total assignments
    const [[{ total_assignments }]] = await pool.query(
      'SELECT COUNT(*) as total_assignments FROM assignments WHERE course_id = ?',
      [courseId]
    );

    // 3. Mark course as completed
    await pool.query("UPDATE courses SET status = 'completed' WHERE id = ?", [courseId]);

    // 4. Insert the report
    const [result] = await pool.query(`
      INSERT INTO course_reports 
        (course_id, course_title, class_name, campus_id, campus_name, teacher_id, teacher_name,
         total_students, avg_attendance, avg_marks, pass_count, fail_count, total_assignments,
         completed_at, generated_by, generated_by_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `, [
      course.id,
      course.title,
      course.class_name || 'N/A',
      course.campus_id,
      course.campus_name || 'N/A',
      course.teacher_id,
      course.teacher_name || 'N/A',
      total_students,
      avg_attendance,
      parseFloat(parseFloat(marksStats.avg_marks).toFixed(2)),
      marksStats.pass_count || 0,
      marksStats.fail_count || 0,
      total_assignments,
      user.role,
      user.role
    ]);

    res.status(201).json({
      success: true,
      message: `Report generated for "${course.title}"`,
      report_id: result.insertId,
      summary: {
        course: course.title,
        total_students,
        avg_attendance,
        avg_marks: parseFloat(parseFloat(marksStats.avg_marks).toFixed(2)),
        pass_count: marksStats.pass_count || 0,
        fail_count: marksStats.fail_count || 0,
        total_assignments
      }
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, message: 'Error generating report: ' + error.message });
  }
});

// ==================== GET ALL REPORTS (Super Admin & BD) ====================
// GET /api/reports

router.get('/', async (req, res) => {
  const allowed = ['super_admin', 'bd_agent'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    const [reports] = await pool.query(`
      SELECT * FROM course_reports ORDER BY completed_at DESC
    `);
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

// ==================== GET CAMPUS REPORTS (HOD) ====================
// GET /api/reports/campus

router.get('/campus', async (req, res) => {
  const allowed = ['principal', 'admin'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. HODs only.' });
  }

  try {
    const campusId = req.user.campus_id;
    const [reports] = await pool.query(
      'SELECT * FROM course_reports WHERE campus_id = ? ORDER BY completed_at DESC',
      [campusId]
    );
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get campus reports error:', error);
    res.status(500).json({ success: false, message: 'Error fetching campus reports' });
  }
});

// ==================== GET MY GENERATED REPORTS (Teacher) ====================
// GET /api/reports/my

router.get('/my', async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Teachers only' });
  }

  try {
    const [reports] = await pool.query(
      'SELECT * FROM course_reports WHERE teacher_id = ? ORDER BY completed_at DESC',
      [req.user.id]
    );
    res.json({ success: true, reports });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ success: false, message: 'Error fetching reports' });
  }
});

// ==================== GET SINGLE REPORT ====================
// GET /api/reports/:id

router.get('/:id', async (req, res) => {
  const allowed = ['super_admin', 'bd_agent', 'principal', 'admin', 'teacher'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  try {
    const [[report]] = await pool.query(
      'SELECT * FROM course_reports WHERE id = ?',
      [req.params.id]
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // HOD can only see their campus
    if (req.user.role === 'principal' && report.campus_id !== req.user.campus_id) {
      return res.status(403).json({ success: false, message: 'Access denied to this report' });
    }
    // Teacher can only see their own
    if (req.user.role === 'teacher' && report.teacher_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this report' });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, message: 'Error fetching report' });
  }
});

// ==================== GET DETAILED REPORT (With Students & Teacher Progress) ====================
// GET /api/reports/:id/details
router.get('/:id/details', async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    // 1. Get report header
    const [[report]] = await pool.query('SELECT * FROM course_reports WHERE id = ?', [id]);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // Role-based access check
    if (user.role === 'principal' && report.campus_id !== user.campus_id) {
      return res.status(403).json({ success: false, message: 'Access denied to this campus report' });
    }
    if (user.role === 'teacher' && report.teacher_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this report' });
    }

    // 2. Get students pass/fail breakdown
    // Joined with grades to get marks - COALESCE to avoid nulls
    const [students] = await pool.query(`
      SELECT 
        u.id, u.name, 
        COALESCE(g.marks_obtained, 0) as marks_obtained, 
        COALESCE(g.max_marks, 100) as max_marks, 
        COALESCE(g.percentage, 0) as percentage,
        CASE WHEN COALESCE(g.percentage, 0) >= 50 THEN 'Pass' ELSE 'Fail' END as status
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      LEFT JOIN grades g ON e.course_id = g.course_id AND e.student_id = g.student_id
      WHERE e.course_id = ? AND e.status = 'approved'
      ORDER BY u.name ASC
    `, [report.course_id]);

    // 3. Get Teacher Performance Summary (Average Rating from feedback)
    // Wrap in try-catch in case table is missing or use COALESCE
    let feedback = { avg_rating: 0, feedback_count: 0 };
    try {
      const [[res]] = await pool.query(`
        SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as feedback_count
        FROM course_feedback
        WHERE course_id = ?
      `, [report.course_id]);
      if (res) feedback = res;
    } catch (e) {
      console.warn('Feedback table access failed, skipping feedback metrics');
    }

    res.json({
      success: true,
      report,
      students,
      teacher_performance: {
        avg_student_marks: report.avg_marks || 0,
        avg_attendance: report.avg_attendance || 0,
        rating: parseFloat(feedback.avg_rating || 0).toFixed(1),
        feedback_count: feedback.feedback_count || 0
      }
    });

  } catch (error) {
    console.error('Get detailed report error:', error);
    res.status(500).json({ success: false, message: 'Error fetching detailed report' });
  }
});

module.exports = router;
