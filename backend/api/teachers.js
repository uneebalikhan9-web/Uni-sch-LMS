const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { verifyToken, isTeacher } = require('../middleware/auth');
const { generateRollNumber } = require('../utils/rollNumber');

const router = express.Router();

// All routes require teacher authentication
router.use(verifyToken);
router.use(isTeacher);

/**
 * ENROLLMENT APPROVAL SYSTEM 
 * Allows teachers to review and approve/reject course requests
 */

// Get pending requests (both Course Enrollments and Class Registrations) for teacher's courses/classes
router.get('/pending-enrollments', async (req, res) => {
  try {
    const teacherId = req.user.employee_id;

    // 1. Get pending Course enrollments
    const [courseRequests] = await pool.query(`
      SELECT 'course' as type, e.id as request_id, e.course_id, e.student_id, e.enrolled_at,
             u.name as student_name, u.email as student_email,
             c.title as label, cl.name as class_name, cl.section as class_section
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN classes cl ON c.class_id = cl.id
      WHERE c.teacher_id = ? AND e.status = 'pending'
    `, [teacherId]);

    // 2. Get pending Class registrations (where this teacher is the class teacher)
    const [classRequests] = await pool.query(`
      SELECT 'class' as type, sc.id as request_id, sc.class_id, sc.student_id, sc.assigned_at as enrolled_at,
             u.name as student_name, u.email as student_email,
             cl.name as label, cl.name as class_name, cl.section as class_section
      FROM student_classes sc
      JOIN users u ON sc.student_id = u.id
      JOIN classes cl ON sc.class_id = cl.id
      WHERE cl.teacher_id = ? AND sc.status = 'pending'
    `, [teacherId]);

    // Combine and sort
    const allRequests = [...courseRequests, ...classRequests].sort((a, b) => 
      new Date(b.enrolled_at) - new Date(a.enrolled_at)
    );

    res.status(200).json({
      success: true,
      pendingEnrollments: allRequests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ success: false, message: 'Error fetching requests', error: error.message });
  }
});

// Approve enrollment request
router.post('/enrollments/:enrollmentId/approve', async (req, res) => {
  const { enrollmentId } = req.params;
  const teacherId = req.user.employee_id;
  
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

// Approve class registration
router.post('/class-requests/:requestId/approve', async (req, res) => {
  try {
    const { requestId } = req.params;
    const teacherId = req.user.employee_id;

    const [request] = await pool.query(`
      SELECT sc.id FROM student_classes sc JOIN classes cl ON sc.class_id = cl.id
      WHERE sc.id = ? AND cl.teacher_id = ? AND sc.status = 'pending'
    `, [requestId, teacherId]);

    if (request.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });

    await pool.query('UPDATE student_classes SET status = "approved" WHERE id = ?', [requestId]);
    res.status(200).json({ success: true, message: 'Class registration approved!' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

// Reject class registration
router.post('/class-requests/:requestId/reject', async (req, res) => {
  try {
    const { requestId } = req.params;
    const teacherId = req.user.employee_id;

    const [request] = await pool.query(`
      SELECT sc.id FROM student_classes sc JOIN classes cl ON sc.class_id = cl.id
      WHERE sc.id = ? AND cl.teacher_id = ? AND sc.status = 'pending'
    `, [requestId, teacherId]);

    if (request.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });

    await pool.query('DELETE FROM student_classes WHERE id = ?', [requestId]);
    res.status(200).json({ success: true, message: 'Class registration rejected' });
  } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

// ============= STUDENT MANAGEMENT =============

// ============= STUDENT MANAGEMENT =============

// Get students in teacher's campus or courses/classes
router.get('/students', async (req, res) => {
  try {
    const { campus_id, employee_id: teacherId } = req.user;
    const [students] = await pool.query(`
      SELECT DISTINCT u.id as user_id, s.id as student_id, u.name, u.email, s.roll_number, s.semester, u.created_at,
             s.father_name, s.father_cnic, s.last_education, s.father_number, s.bform_number,
             sc.class_id
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN student_classes sc ON s.id = sc.student_id
      LEFT JOIN classes cl ON sc.class_id = cl.id
      WHERE u.role = 'student' AND (
        u.campus_id = ? 
        OR c.teacher_id = ? 
        OR cl.teacher_id = ?
      )
      GROUP BY s.id
      ORDER BY u.name
    `, [campus_id, teacherId, teacherId]);
    res.status(200).json({ success: true, students });
  } catch (err) { 
    console.error('Error fetching teacher students:', err);
    res.status(500).json({ success: false, message: 'Error fetching students' }); 
  }
});

// Create new student (Teacher adding)
router.post('/students', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { name, email, password, semester } = req.body;
    const { campus_id } = req.user;

    if (!name || !email || !password) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Email exists' });
    }

    const rollNumber = await generateRollNumber(campus_id, semester || 1);
    const hashedPassword = await bcrypt.hash(password, 12);

    // 1. Create user
    const [uResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'student', true, campus_id]
    );

    // 2. Create student profile
    await connection.query(
      'INSERT INTO students (user_id, roll_number, semester) VALUES (?, ?, ?)',
      [uResult.insertId, rollNumber, semester || 1]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: 'Student created!', student_id: uResult.insertId });
  } catch (err) { 
    await connection.rollback();
    console.error('Teacher student create error:', err);
    res.status(500).json({ success: false, message: 'Error creating student' }); 
  } finally {
    connection.release();
  }
});

// Other teacher routes (courses, stats, assignments, etc.)

router.get('/courses/:courseId/assignments', async (req, res) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.employee_id;
      const [courses] = await pool.query('SELECT id FROM courses WHERE id = ? AND teacher_id = ?', [courseId, teacherId]);
      if (courses.length === 0) return res.status(403).json({ success: false, message: 'Access denied' });
      const [assignments] = await pool.query('SELECT a.*, COUNT(DISTINCT s.id) as total_submissions FROM assignments a LEFT JOIN submissions s ON a.id = s.assignment_id WHERE a.course_id = ? GROUP BY a.id ORDER BY a.created_at DESC', [courseId]);
      res.status(200).json({ success: true, assignments });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.get('/assignments/:assignmentId/submissions', async (req, res) => {
    try {
      const { assignmentId } = req.params;
      const [submissions] = await pool.query(`
        SELECT s.*, u.name as student_name, u.email as student_email, m.marks_obtained, m.feedback, m.graded_at, m.id as mark_id, a.max_marks 
        FROM submissions s 
        JOIN students st ON s.student_id = st.id
        JOIN users u ON st.user_id = u.id 
        JOIN assignments a ON s.assignment_id = a.id 
        LEFT JOIN marks m ON s.id = m.submission_id 
        WHERE s.assignment_id = ? 
        ORDER BY s.submitted_at DESC
      `, [assignmentId]);
      res.status(200).json({ success: true, submissions });
    } catch (err) { res.status(500).json({ success: false, message: 'Error fetching submissions' }); }
});

router.post('/submissions/:submissionId/grade', async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { marks_obtained, feedback } = req.body;
      const teacherId = req.user.employee_id;
      const [existing] = await pool.query('SELECT id FROM marks WHERE submission_id = ?', [submissionId]);
      if (existing.length > 0) {
        await pool.query('UPDATE marks SET marks_obtained = ?, feedback = ?, graded_by = ?, graded_at = NOW() WHERE submission_id = ?', [marks_obtained, feedback, teacherId, submissionId]);
      } else {
        await pool.query('INSERT INTO marks (submission_id, marks_obtained, feedback, graded_by) VALUES (?, ?, ?, ?)', [submissionId, marks_obtained, feedback, teacherId]);
      }
      res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: 'Error' }); }
});

router.get('/courses', async (req, res) => {
    const fs = require('fs');
    const logFile = 'debug_teacher_courses.log';
    const timestamp = new Date().toISOString();
    try {
      const teacherId = req.user.employee_id;
      fs.appendFileSync(logFile, `${timestamp} - Fetching courses for teacher_id: ${teacherId} (User ID: ${req.user.id})\n`);

      const [courses] = await pool.query(`
        SELECT c.*, cl.name as class_name, COUNT(DISTINCT CASE WHEN e.status = 'approved' THEN e.id END) as enrolled_students
        FROM courses c
        LEFT JOIN classes cl ON c.class_id = cl.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE c.teacher_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [teacherId]);
      
      fs.appendFileSync(logFile, `${timestamp} - Found ${courses.length} courses\n`);
      res.status(200).json({ success: true, courses: courses });
    } catch (err) { 
      fs.appendFileSync(logFile, `${timestamp} - ERROR: ${err.message}\n`);
      res.status(500).json({ success: false, message: 'Error' }); 
    }
});

router.get('/stats', async (req, res) => {
    const fs = require('fs');
    const logFile = 'debug_teacher_stats.log';
    const timestamp = new Date().toISOString();
    try {
      const teacherId = req.user.employee_id;
      fs.appendFileSync(logFile, `${timestamp} - Fetching stats for teacher_id: ${teacherId}\n`);

      const [[{ total_courses }]] = await pool.query('SELECT COUNT(*) as total_courses FROM courses WHERE teacher_id = ?', [teacherId]);
      const [[{ total_students }]] = await pool.query('SELECT COUNT(DISTINCT e.student_id) as total_students FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = ? AND e.status = "approved"', [teacherId]);
      const [[{ total_classes }]] = await pool.query('SELECT COUNT(DISTINCT class_id) as total_classes FROM courses WHERE teacher_id = ?', [teacherId]);
      const [[{ total_assignments }]] = await pool.query('SELECT COUNT(*) as total_assignments FROM assignments a JOIN courses c ON a.course_id = c.id WHERE c.teacher_id = ?', [teacherId]);
      const [[{ total_graded }]] = await pool.query('SELECT COUNT(*) as total_graded FROM marks m JOIN submissions s ON m.submission_id = s.id JOIN assignments a ON s.assignment_id = a.id JOIN courses c ON a.course_id = c.id WHERE c.teacher_id = ?', [teacherId]);
      const [[{ total_pending }]] = await pool.query('SELECT COUNT(*) as total_pending FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = ? AND e.status = "pending"', [teacherId]);
      
      const [recent_students] = await pool.query(`
        SELECT u.id, u.name, u.email, c.title as course_title, e.enrolled_at 
        FROM enrollments e 
        JOIN students s ON e.student_id = s.id
        JOIN users u ON s.user_id = u.id 
        JOIN courses c ON e.course_id = c.id 
        WHERE c.teacher_id = ? AND e.status = "approved" 
        ORDER BY e.enrolled_at DESC LIMIT 5
      `, [teacherId]);
      
      fs.appendFileSync(logFile, `${timestamp} - Stats: Courses:${total_courses}, Students:${total_students}, Classes:${total_classes}\n`);
      res.status(200).json({ success: true, stats: { total_courses, total_students, total_classes, total_assignments, total_graded, total_pending, recent_students } });
    } catch (err) { 
      fs.appendFileSync(logFile, `${timestamp} - ERROR: ${err.message}\n`);
      console.error('Teacher stats error:', err);
      res.status(500).json({ success: false, message: 'Error fetching stats' }); 
    }
});

module.exports = router;
