const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isStudent, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// STUDENT: Enroll in a course section
// POST /api/enrollment/enroll
// =====================================================
router.post('/enroll', verifyToken, isStudent, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const student_id = req.user.student_id;
    const { section_id } = req.body;

    if (!section_id) {
      return res.status(400).json({ success: false, message: 'section_id is required' });
    }

    // Run enrollment validation stored procedure
    const [[validation]] = await connection.query(
      'CALL sp_validate_enrollment(?, ?, @result, @allowed)',
      [student_id, section_id]
    );
    const [[{ '@result': result, '@allowed': allowed }]] = await connection.query(
      'SELECT @result, @allowed'
    );

    if (!allowed) {
      const messages = {
        'SECTION_FULL': 'This section is full. You have been added to the waitlist.',
        'ALREADY_ENROLLED': 'You are already enrolled in this course this semester.',
        'PREREQUISITE_NOT_MET': 'You have not met the prerequisites for this course.',
        'PROBATION_CREDIT_LIMIT_EXCEEDED': 'Students on probation cannot exceed 12 credit hours.',
        'MAX_EXCEPTIONAL_CREDIT_LIMIT_EXCEEDED': 'Maximum credit hour limit exceeded (24 CH for CGPA ≥ 3.5).',
        'REGULAR_CREDIT_LIMIT_EXCEEDED': 'Maximum credit hour limit exceeded (21 CH per semester).',
        'TIMETABLE_CLASH': 'This section has a timetable conflict with your current schedule.'
      };

      // If section full, add to waitlist instead
      if (result === 'SECTION_FULL') {
        const [section] = await connection.query(
          'SELECT semester_id, waitlist_capacity, waitlist_count FROM course_sections WHERE id = ?',
          [section_id]
        );

        if (section[0].waitlist_count >= section[0].waitlist_capacity) {
          return res.status(400).json({ success: false, message: 'Section is full and waitlist is also full.' });
        }

        // Check already on waitlist
        const [onWaitlist] = await connection.query(
          'SELECT id FROM enrollment_waitlist WHERE student_id = ? AND section_id = ?',
          [student_id, section_id]
        );
        if (onWaitlist.length > 0) {
          return res.status(400).json({ success: false, message: 'You are already on the waitlist for this section.' });
        }

        const [[{ max_pos }]] = await connection.query(
          'SELECT IFNULL(MAX(position), 0) as max_pos FROM enrollment_waitlist WHERE section_id = ?',
          [section_id]
        );

        await connection.query(
          'INSERT INTO enrollment_waitlist (student_id, section_id, semester_id, position) VALUES (?, ?, ?, ?)',
          [student_id, section_id, section[0].semester_id, max_pos + 1]
        );

        await connection.query(
          'UPDATE course_sections SET waitlist_count = waitlist_count + 1 WHERE id = ?',
          [section_id]
        );

        return res.status(200).json({
          success: true,
          waitlisted: true,
          position: max_pos + 1,
          message: `Section is full. You have been added to the waitlist at position ${max_pos + 1}.`
        });
      }

      return res.status(400).json({
        success: false,
        code: result,
        message: messages[result] || 'Enrollment not allowed: ' + result
      });
    }

    // Get section details for enrollment record
    const [section] = await connection.query(
      'SELECT course_id, semester_id FROM course_sections WHERE id = ?',
      [section_id]
    );
    if (section.length === 0) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const { course_id, semester_id } = section[0];

    await connection.beginTransaction();

    // Insert into enrollment_registrations
    await connection.query(
      `INSERT INTO enrollment_registrations 
        (student_id, section_id, semester_id, course_id, enrollment_type, status, registered_by)
       VALUES (?, ?, ?, ?, 'regular', 'enrolled', ?)`,
      [student_id, section_id, semester_id, course_id, req.user.id]
    );

    // Also insert into legacy enrollments table for backward compatibility
    const [existing] = await connection.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND semester = ?',
      [student_id, course_id, semester_id]
    );
    if (existing.length === 0) {
      await connection.query(
        'INSERT INTO enrollments (student_id, course_id, semester, status) VALUES (?, ?, ?, ?)',
        [student_id, course_id, semester_id, 'approved']
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully!'
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this section.' });
    }
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, message: 'Error processing enrollment: ' + error.message });
  } finally {
    connection.release();
  }
});

// =====================================================
// STUDENT: Drop a course
// PUT /api/enrollment/drop/:enrollmentId
// =====================================================
router.put('/drop/:enrollmentId', verifyToken, isStudent, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const student_id = req.user.student_id;
    const { enrollmentId } = req.params;
    const { reason } = req.body;

    // Verify this enrollment belongs to the student
    const [enrollment] = await connection.query(
      `SELECT er.*, s.status as semester_status, s.add_drop_deadline
       FROM enrollment_registrations er
       JOIN semesters s ON s.id = er.semester_id
       WHERE er.id = ? AND er.student_id = ? AND er.status = 'enrolled'`,
      [enrollmentId, student_id]
    );

    if (enrollment.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const { semester_status, add_drop_deadline } = enrollment[0];

    // Check if semester allows drops
    if (semester_status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot drop course from a completed semester.' });
    }

    // Check add/drop deadline
    if (add_drop_deadline && new Date() > new Date(add_drop_deadline)) {
      return res.status(400).json({
        success: false,
        message: `Add/Drop deadline has passed (${new Date(add_drop_deadline).toLocaleDateString()}).`
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE enrollment_registrations 
       SET status = 'dropped', dropped_at = NOW(), withdrawal_reason = ?
       WHERE id = ?`,
      [reason || null, enrollmentId]
    );

    // Promote from waitlist if any
    const [waitlist] = await connection.query(
      `SELECT * FROM enrollment_waitlist 
       WHERE section_id = ? ORDER BY position ASC LIMIT 1`,
      [enrollment[0].section_id]
    );

    if (waitlist.length > 0) {
      const nextStudent = waitlist[0];
      // Enroll the waitlist student
      await connection.query(
        `INSERT INTO enrollment_registrations 
          (student_id, section_id, semester_id, course_id, enrollment_type, status, registered_by)
         VALUES (?, ?, ?, ?, 'regular', 'enrolled', ?)`,
        [nextStudent.student_id, nextStudent.section_id, nextStudent.semester_id,
         enrollment[0].course_id, req.user.id]
      );

      // Remove from waitlist
      await connection.query('DELETE FROM enrollment_waitlist WHERE id = ?', [nextStudent.id]);

      // Reorder remaining waitlist
      await connection.query(
        'UPDATE enrollment_waitlist SET position = position - 1 WHERE section_id = ? AND position > ?',
        [nextStudent.section_id, nextStudent.position]
      );

      await connection.query(
        'UPDATE course_sections SET waitlist_count = GREATEST(0, waitlist_count - 1) WHERE id = ?',
        [nextStudent.section_id]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Course dropped successfully.' + (waitlist.length > 0 ? ' Waitlist student has been enrolled.' : '')
    });
  } catch (error) {
    await connection.rollback();
    console.error('Drop course error:', error);
    res.status(500).json({ success: false, message: 'Error dropping course: ' + error.message });
  } finally {
    connection.release();
  }
});

// =====================================================
// STUDENT: Get my current enrollments
// GET /api/enrollment/my-enrollments
// =====================================================
router.get('/my-enrollments', verifyToken, isStudent, async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const { semester_id } = req.query;

    let query = `
      SELECT 
        er.*,
        c.title as course_title, c.code as course_code, c.credit_hours, c.course_type,
        cs.section_label, cs.max_capacity, cs.current_enrolled,
        sem.name as semester_name,
        u.name as teacher_name,
        GROUP_CONCAT(
          CONCAT(ss.day_of_week, ' ', TIME_FORMAT(ss.start_time, '%h:%i %p'), '-', TIME_FORMAT(ss.end_time, '%h:%i %p'))
          SEPARATOR ' | '
        ) as schedule
      FROM enrollment_registrations er
      JOIN courses c ON c.id = er.course_id
      JOIN course_sections cs ON cs.id = er.section_id
      JOIN semesters sem ON sem.id = er.semester_id
      LEFT JOIN employees e ON e.id = cs.teacher_id
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN section_schedules ss ON ss.section_id = er.section_id
      WHERE er.student_id = ?
    `;
    const params = [student_id];

    if (semester_id) {
      query += ' AND er.semester_id = ?';
      params.push(semester_id);
    }

    query += ' GROUP BY er.id ORDER BY sem.start_date DESC, c.title';

    const [enrollments] = await pool.query(query, params);

    // Calculate total credit hours for active enrollments
    const activeEnrollments = enrollments.filter(e => e.status === 'enrolled');
    const totalCredits = activeEnrollments.reduce((sum, e) => sum + (e.credit_hours || 0), 0);

    res.json({
      success: true,
      enrollments,
      total_enrolled_credits: totalCredits
    });
  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// STUDENT: Get my waitlist entries
// GET /api/enrollment/my-waitlist
// =====================================================
router.get('/my-waitlist', verifyToken, isStudent, async (req, res) => {
  try {
    const student_id = req.user.student_id;

    const [waitlist] = await pool.query(
      `SELECT ew.*, 
        c.title as course_title, c.code as course_code, c.credit_hours,
        cs.section_label, cs.max_capacity, cs.current_enrolled,
        sem.name as semester_name,
        u.name as teacher_name
       FROM enrollment_waitlist ew
       JOIN course_sections cs ON cs.id = ew.section_id
       JOIN courses c ON c.id = cs.course_id
       JOIN semesters sem ON sem.id = ew.semester_id
       LEFT JOIN employees e ON e.id = cs.teacher_id
       LEFT JOIN users u ON u.id = e.user_id
       WHERE ew.student_id = ?
       ORDER BY ew.waitlisted_at DESC`,
      [student_id]
    );

    res.json({ success: true, waitlist });
  } catch (error) {
    console.error('Get waitlist error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// REGISTRAR: Get all enrollments for a section
// GET /api/enrollment/section/:sectionId
// =====================================================
router.get('/section/:sectionId', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { sectionId } = req.params;

    const [enrollments] = await pool.query(
      `SELECT er.*, 
        u.name as student_name, s.roll_number, u.email as student_email
       FROM enrollment_registrations er
       JOIN students s ON s.id = er.student_id
       JOIN users u ON u.id = s.user_id
       WHERE er.section_id = ?
       ORDER BY er.status, u.name`,
      [sectionId]
    );

    res.json({ success: true, enrollments });
  } catch (error) {
    console.error('Get section enrollments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// REGISTRAR: Get all enrollments for a semester
// GET /api/enrollment/semester/:semesterId
// =====================================================
router.get('/semester/:semesterId', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { semesterId } = req.params;
    const campus_id = req.user.campus_id;

    const [enrollments] = await pool.query(
      `SELECT er.*, 
        u.name as student_name, s.roll_number,
        c.title as course_title, c.code as course_code, c.credit_hours,
        cs.section_label
       FROM enrollment_registrations er
       JOIN students s ON s.id = er.student_id
       JOIN users u ON u.id = s.user_id
       JOIN courses c ON c.id = er.course_id
       JOIN course_sections cs ON cs.id = er.section_id
       WHERE er.semester_id = ? AND c.campus_id = ?
       ORDER BY c.title, cs.section_label, u.name`,
      [semesterId, campus_id]
    );

    // Summary stats
    const summary = {
      total: enrollments.length,
      enrolled: enrollments.filter(e => e.status === 'enrolled').length,
      waitlisted: enrollments.filter(e => e.status === 'waitlisted').length,
      dropped: enrollments.filter(e => e.status === 'dropped').length
    };

    res.json({ success: true, enrollments, summary });
  } catch (error) {
    console.error('Get semester enrollments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =====================================================
// REGISTRAR: Manually enroll student into section
// POST /api/enrollment/admin-enroll
// =====================================================
router.post('/admin-enroll', verifyToken, isRegistrar, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { student_id, section_id, enrollment_type, override_validation } = req.body;

    if (!student_id || !section_id) {
      return res.status(400).json({ success: false, message: 'student_id and section_id are required' });
    }

    const [section] = await connection.query(
      'SELECT course_id, semester_id, current_enrolled, max_capacity FROM course_sections WHERE id = ?',
      [section_id]
    );
    if (section.length === 0) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const { course_id, semester_id } = section[0];

    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO enrollment_registrations 
        (student_id, section_id, semester_id, course_id, enrollment_type, status, registered_by)
       VALUES (?, ?, ?, ?, ?, 'enrolled', ?)`,
      [student_id, section_id, semester_id, course_id, enrollment_type || 'regular', req.user.id]
    );

    // Legacy table
    const [existing] = await connection.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ? AND semester = ?',
      [student_id, course_id, semester_id]
    );
    if (existing.length === 0) {
      await connection.query(
        'INSERT INTO enrollments (student_id, course_id, semester, status) VALUES (?, ?, ?, ?)',
        [student_id, course_id, semester_id, 'approved']
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Student enrolled successfully by admin' });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Student is already enrolled in this section.' });
    }
    console.error('Admin enroll error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  } finally {
    connection.release();
  }
});

// =====================================================
// GET: Available sections for enrollment (Student browsing)
// GET /api/enrollment/available-sections?semester_id=X
// =====================================================
router.get('/available-sections', verifyToken, isStudent, async (req, res) => {
  try {
    const { semester_id } = req.query;
    const student_id = req.user.student_id;

    if (!semester_id) {
      return res.status(400).json({ success: false, message: 'semester_id is required' });
    }

    const [sections] = await pool.query(
      `SELECT 
        cs.id as section_id, cs.section_label, cs.max_capacity, cs.current_enrolled,
        cs.waitlist_count, cs.waitlist_capacity, cs.status,
        c.id as course_id, c.title as course_title, c.code as course_code, 
        c.credit_hours, c.course_type, c.description,
        dept.name as department_name,
        u.name as teacher_name,
        GROUP_CONCAT(
          CONCAT(ss.day_of_week, ' ', TIME_FORMAT(ss.start_time, '%h:%i %p'), '-', TIME_FORMAT(ss.end_time, '%h:%i %p'))
          SEPARATOR ' | '
        ) as schedule,
        -- Check if student already enrolled
        EXISTS(
          SELECT 1 FROM enrollment_registrations er 
          WHERE er.student_id = ? AND er.section_id = cs.id AND er.status = 'enrolled'
        ) as already_enrolled,
        -- Check if on waitlist
        EXISTS(
          SELECT 1 FROM enrollment_waitlist ew 
          WHERE ew.student_id = ? AND ew.section_id = cs.id
        ) as on_waitlist
       FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       LEFT JOIN departments dept ON dept.id = c.department_id
       LEFT JOIN employees e ON e.id = cs.teacher_id
       LEFT JOIN users u ON u.id = e.user_id
       LEFT JOIN section_schedules ss ON ss.section_id = cs.id
       WHERE cs.semester_id = ? AND cs.status IN ('open', 'waitlist')
       GROUP BY cs.id
       ORDER BY c.title, cs.section_label`,
      [student_id, student_id, semester_id]
    );

    res.json({ success: true, sections });
  } catch (error) {
    console.error('Get available sections error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
