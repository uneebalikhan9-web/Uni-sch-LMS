const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isTeacher } = require('../middleware/auth');

const router = express.Router();

// All routes require teacher authentication
router.use(verifyToken);
router.use(isTeacher);

/**
 * ENROLLMENT APPROVAL SYSTEM 
 * Allows teachers to review and approve/reject course requests
 */

// Get pending enrollment requests for teacher's courses
router.get('/pending-enrollments', async (req, res) => {
  try {
    const teacherId = req.user.id;

    const [pendingEnrollments] = await pool.query(`
      SELECT e.id as enrollment_id, e.course_id, e.student_id, e.status, e.enrolled_at,
             u.name as student_name, u.email as student_email,
             c.title as course_title, cl.name as class_name, cl.section as class_section
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN classes cl ON c.class_id = cl.id
      WHERE c.teacher_id = ? AND e.status = 'pending'
      ORDER BY e.enrolled_at DESC
    `, [teacherId]);

    res.status(200).json({
      success: true,
      pendingEnrollments: pendingEnrollments
    });
  } catch (error) {
    console.error('Get pending enrollments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching pending enrollments', error: error.message });
  }
});

// Approve enrollment request
router.post('/enrollments/:enrollmentId/approve', async (req, res) => {
  const { enrollmentId } = req.params;
  const teacherId = req.user.id;
  
  console.log(`[TeacherAPI] Approval attempt - Enrollment ID: ${enrollmentId}, Teacher: ${teacherId}`);

  try {
    // 1. Verify this enrollment exists and belongs to teacher's course
    const [enrollment] = await pool.query(`
      SELECT e.id, c.teacher_id
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = ? AND c.teacher_id = ? AND e.status = 'pending'
    `, [enrollmentId, teacherId]);

    if (enrollment.length === 0) {
      console.warn(`[TeacherAPI] Enrollment ${enrollmentId} not found or unauthorized for teacher ${teacherId}`);
      return res.status(404).json({ 
        success: false, 
        message: 'Enrollment request not found or not authorized for this teacher' 
      });
    }

    // 2. Update status to approved
    await pool.query('UPDATE enrollments SET status = ? WHERE id = ?', ['approved', enrollmentId]);

    console.log(`✅ [TeacherAPI] Enrollment ${enrollmentId} approved successfully`);
    res.status(200).json({ success: true, message: 'Student enrollment approved!' });
  } catch (error) {
    console.error('[TeacherAPI] Approve enrollment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error approving enrollment', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Reject enrollment request
router.post('/enrollments/:enrollmentId/reject', async (req, res) => {
  const { enrollmentId } = req.params;
  const teacherId = req.user.id;

  console.log(`[TeacherAPI] Rejection attempt - Enrollment ID: ${enrollmentId}`);

  try {
    // 1. Verify ownership
    const [enrollment] = await pool.query(`
      SELECT e.id, c.teacher_id
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = ? AND c.teacher_id = ? AND e.status = 'pending'
    `, [enrollmentId, teacherId]);

    if (enrollment.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment request not found or unauthorized' });
    }

    // 2. Reject by deleting the request
    await pool.query('DELETE FROM enrollments WHERE id = ?', [enrollmentId]);

    console.log(`❌ [TeacherAPI] Enrollment ${enrollmentId} rejected`);
    res.status(200).json({ success: true, message: 'Student enrollment rejected' });
  } catch (error) {
    console.error('[TeacherAPI] Reject enrollment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error rejecting enrollment', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Other teacher routes (courses, stats, assignments, etc.)

router.get('/courses/:courseId/assignments', async (req, res) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.id;
      const [courses] = await pool.query('SELECT id FROM courses WHERE id = ? AND teacher_id = ?', [courseId, teacherId]);
      if (courses.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
      const [assignments] = await pool.query('SELECT a.*, COUNT(DISTINCT s.id) as total_submissions FROM assignments a LEFT JOIN submissions s ON a.id = s.assignment_id WHERE a.course_id = ? GROUP BY a.id ORDER BY a.created_at DESC', [courseId]);
      res.status(200).json({ success: true, assignments });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.get('/assignments/:assignmentId/submissions', async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const [submissions] = await pool.query('SELECT s.*, u.name as student_name, u.email as student_email, m.marks_obtained, m.feedback, m.graded_at, m.id as mark_id, a.max_marks FROM submissions s JOIN users u ON s.student_id = u.id JOIN assignments a ON s.assignment_id = a.id LEFT JOIN marks m ON s.id = m.submission_id WHERE s.assignment_id = ? ORDER BY s.submitted_at DESC', [assignmentId]);
      res.status(200).json({ success: true, submissions });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.post('/submissions/:submissionId/grade', async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { marks_obtained, feedback } = req.body;
      const teacherId = req.user.id;
      const [existing] = await pool.query('SELECT id FROM marks WHERE submission_id = ?', [submissionId]);
      if (existing.length > 0) {
        await pool.query('UPDATE marks SET marks_obtained = ?, feedback = ?, graded_by = ?, graded_at = NOW() WHERE submission_id = ?', [marks_obtained, feedback, teacherId, submissionId]);
      } else {
        await pool.query('INSERT INTO marks (submission_id, marks_obtained, feedback, graded_by) VALUES (?, ?, ?, ?)', [submissionId, marks_obtained, feedback, teacherId]);
      }
      res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

// Restoration of other routes from previous check 
router.get('/courses', async (req, res) => {
    try {
      const teacherId = req.user.id;
      const [courses] = await pool.query(`
        SELECT c.*, cl.name as class_name, COUNT(DISTINCT CASE WHEN e.status = 'approved' THEN e.id END) as enrolled_students
        FROM courses c
        LEFT JOIN classes cl ON c.class_id = cl.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE c.teacher_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [teacherId]);
      res.status(200).json({ success: true, courses: courses });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.get('/stats', async (req, res) => {
    try {
      const teacherId = req.user.id;
      const [[{ total_courses }]] = await pool.query('SELECT COUNT(*) as total_courses FROM courses WHERE teacher_id = ?', [teacherId]);
      const [[{ total_students }]] = await pool.query('SELECT COUNT(DISTINCT e.student_id) as total_students FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = ? AND e.status = "approved"', [teacherId]);
      const [[{ total_classes }]] = await pool.query('SELECT COUNT(DISTINCT class_id) as total_classes FROM courses WHERE teacher_id = ?', [teacherId]);
      const [[{ total_assignments }]] = await pool.query('SELECT COUNT(*) as total_assignments FROM assignments a JOIN courses c ON a.course_id = c.id WHERE c.teacher_id = ?', [teacherId]);
      const [[{ total_graded }]] = await pool.query('SELECT COUNT(*) as total_graded FROM marks m JOIN submissions s ON m.submission_id = s.id JOIN assignments a ON s.assignment_id = a.id JOIN courses c ON a.course_id = c.id WHERE c.teacher_id = ?', [teacherId]);
      const [[{ total_pending }]] = await pool.query('SELECT COUNT(*) as total_pending FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = ? AND e.status = "pending"', [teacherId]);
      const [recent_students] = await pool.query('SELECT u.id, u.name, u.email, c.title as course_title, e.enrolled_at FROM enrollments e JOIN users u ON e.student_id = u.id JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = ? AND e.status = "approved" ORDER BY e.enrolled_at DESC LIMIT 5', [teacherId]);
      res.status(200).json({ success: true, stats: { total_courses, total_students, total_classes, total_assignments, total_graded, total_pending, recent_students } });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

module.exports = router;
