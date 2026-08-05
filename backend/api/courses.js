const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isAdmin, isTeacher, isStudent } = require('../middleware/auth');

const router = express.Router();

// Get all available courses (Filtered by campus if not super_admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const { role, campus_id } = req.user;
     
    let query = `
      SELECT c.*, 
        COALESCE(
          (SELECT u.name FROM users u JOIN employees emp ON emp.user_id = u.id WHERE emp.id = c.teacher_id),
          (SELECT name FROM users WHERE id = c.teacher_id AND role = 'teacher')
        ) as teacher_name, 
        cl.name as class_name 
      FROM courses c
      LEFT JOIN classes cl ON c.class_id = cl.id
    `;
    
    const params = [];
    let whereClauses = [];

    // Filter by status (default to active if not specified, or show all if status='all')
    if (status === 'all') {
      // No status filter
    } else if (status) {
      whereClauses.push(`c.status = ?`);
      params.push(status);
    } else {
      whereClauses.push(`c.status = 'active'`);
    }

    // Filter by campus_id if not super_admin
    if (role !== 'super_admin') {
      whereClauses.push(`c.campus_id = ?`);
      params.push(campus_id);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }
    
    query += ` ORDER BY c.created_at DESC`;

    const [courses] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

// Create new course (admin and principal/HOD)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, teacher_id, class_id } = req.body;
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'principal';
    const campusId = req.user.campus_id;

    if (!isAdminUser) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not allowed to create courses.`
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Course title is required'
      });
    }

    if (!class_id) {
       return res.status(400).json({
        success: false,
        message: 'Class ID is required (Courses must belong to a Class)'
      });
    }

    const finalTeacherId = teacher_id || null;

    const [result] = await pool.query(
      'INSERT INTO courses (title, description, teacher_id, class_id, created_by_admin, campus_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, finalTeacherId, class_id, isAdminUser, campusId]
    );

    const newCourseId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: {
        id: newCourseId,
        title,
        description,
        teacher_id: finalTeacherId,
        class_id,
        campus_id: campusId,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
});

// Update Course Status (Complete/Reactivate)
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'active', 'completed', 'archived'
        const user = req.user;

        if (!['active', 'completed', 'archived'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Check Permissions
        const [course] = await pool.query('SELECT teacher_id FROM courses WHERE id = ?', [id]);
        if (course.length === 0) return res.status(404).json({ success: false, message: 'Course not found' });

        const isPowerUser = ['admin', 'principal', 'super_admin'].includes(user.role);
        console.log(`Permission check: user=${user.email}, role=${user.role}, isPowerUser=${isPowerUser}`);

        if (!isPowerUser && course[0].teacher_id !== user.employee_id) {
            console.log(`Access Denied: user.employee_id=${user.employee_id}, teacher_id=${course[0].teacher_id}`);
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        
        if (status === 'active' && !isPowerUser) {
             return res.status(403).json({ success: false, message: 'Only Admins/HODs can reactivate courses.' });
        }

        await pool.query('UPDATE courses SET status = ? WHERE id = ?', [status, id]);

        res.json({ success: true, message: `Course marked as ${status}` });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: 'Error updating status' });
    }
});

// Student enrolls in a course
router.post('/:courseId/enroll', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.student_id;

    // Check if course exists
    const [courses] = await pool.query('SELECT id FROM courses WHERE id = ?', [courseId]);

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const [existing] = await pool.query(
      'SELECT id FROM enrollments WHERE course_id = ? AND student_id = ?',
      [courseId, studentId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Enroll student as pending (teacher must approve)
    const semester = req.user.semester || 0;
    const academicYear = new Date().getFullYear().toString();
    const [result] = await pool.query(
      'INSERT INTO enrollments (course_id, student_id, semester, academic_year, status) VALUES (?, ?, ?, ?, ?)',
      [courseId, studentId, semester, academicYear, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'Enrollment request sent! Waiting for teacher approval.',
      enrollment: {
        id: result.insertId,
        course_id: courseId,
        student_id: studentId,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error enrolling in course'
    });
  }
});

// Get student's enrolled courses
router.get('/my-enrollments', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.student_id;

    const [enrollments] = await pool.query(`
      SELECT c.*, 
        COALESCE(
          (SELECT u.name FROM users u JOIN employees emp ON emp.user_id = u.id WHERE emp.id = c.teacher_id),
          (SELECT name FROM users WHERE id = c.teacher_id AND role = 'teacher')
        ) as teacher_name, 
        e.enrolled_at, e.status, cl.name as class_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN classes cl ON c.class_id = cl.id
      WHERE e.student_id = ?
      
      UNION
      
      SELECT c.*, 
        COALESCE(
          (SELECT u.name FROM users u JOIN employees emp ON emp.user_id = u.id WHERE emp.id = c.teacher_id),
          (SELECT name FROM users WHERE id = c.teacher_id AND role = 'teacher')
        ) as teacher_name, 
        NOW() as enrolled_at, 'approved' as status, cl.name as class_name
      FROM student_classes sc
      JOIN courses c ON sc.class_id = c.class_id
      LEFT JOIN classes cl ON c.class_id = cl.id
      WHERE sc.student_id = ?
      
      ORDER BY enrolled_at DESC
    `, [studentId, studentId]);

    res.status(200).json({
      success: true,
      enrollments: enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrollments'
    });
  }
});

// Get enrolled students for a course (teacher/admin only)
router.get('/:courseId/students', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Fetch all students who are in the class assigned to this course
    const query = `
      SELECT u.id as user_id, s.id as student_id, u.name, u.email
      FROM users u
      JOIN students s ON u.id = s.user_id
      JOIN student_classes sc ON s.id = sc.student_id
      JOIN courses c ON sc.class_id = c.class_id
      WHERE c.id = ?
      ORDER BY u.name
    `;
    const params = [courseId];

    const [students] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      students: students
    });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course students'
    });
  }
});

// Update Course (Admin and Principal)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isPrincipal = req.user.role === 'principal';
    
    if (!isAdminUser && !isPrincipal) {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    const { id } = req.params;
    const { title, description, teacher_id, class_id } = req.body;

    if (isPrincipal) {
      // Principal can update all fields for their campus courses
      const [[existing]] = await pool.query('SELECT campus_id FROM courses WHERE id = ?', [id]);
      if (!existing) return res.status(404).json({ success: false, message: 'Course not found' });
      if (existing.campus_id !== req.user.campus_id) return res.status(403).json({ success: false, message: 'Access denied.' });
      await pool.query(
        'UPDATE courses SET title = ?, description = ?, teacher_id = ?, class_id = ? WHERE id = ?',
        [title, description, teacher_id || null, class_id || null, id]
      );
    } else {
      // Admin can update everything
      await pool.query(
        'UPDATE courses SET title = ?, description = ?, teacher_id = ?, class_id = ? WHERE id = ?',
        [title, description, teacher_id || null, class_id || null, id]
      );
    }

    res.status(200).json({ success: true, message: 'Course updated successfully' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Error updating course' });
  }
});

// Delete Course (Admin and Principal/HOD)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const isAdminUser = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isPrincipal = req.user.role === 'principal';
    if (!isAdminUser && !isPrincipal) {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }
    const { id } = req.params;

    // Principal can only delete courses from their own campus
    if (isPrincipal) {
      const [[course]] = await pool.query('SELECT campus_id FROM courses WHERE id = ?', [id]);
      if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
      if (course.campus_id !== req.user.campus_id) {
        return res.status(403).json({ success: false, message: 'Access denied: not your campus.' });
      }
    }

    await pool.query('DELETE FROM enrollments WHERE course_id = ?', [id]).catch(() => {});
    await pool.query('DELETE FROM assignments WHERE course_id = ?', [id]).catch(() => {});
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Error deleting course' });
  }
});

module.exports = router;

