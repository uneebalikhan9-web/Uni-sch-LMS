const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isTeacher, isStudent, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin/HOD: Create Timetable Entry
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is principal or admin
    if (req.user.role !== 'principal' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only HODs or Admins can create timetable entries.' });
    }

    console.log('[DEBUG] Creating timetable entry with data:', req.body);
    const { course_id, class_id, teacher_id, day_of_week, start_time, end_time, room_number, academic_year, semester } = req.body;
    const campus_id = req.user.campus_id;
    
    const [result] = await pool.query(
      `INSERT INTO timetables (course_id, class_id, teacher_id, day_of_week, start_time, end_time, room_number, academic_year, semester, campus_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [course_id, class_id, teacher_id, day_of_week, start_time, end_time, room_number, academic_year, semester, campus_id]
    );

    res.status(201).json({
      success: true,
      message: 'Timetable entry created successfully',
      timetable_id: result.insertId
    });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({ success: false, message: 'Error creating timetable entry: ' + error.message, sqlMessage: error.sqlMessage });
  }
});

// Teacher: Get My Timetable
router.get('/my-timetable', verifyToken, isTeacher, async (req, res) => {
  try {
    const teacher_id = req.user.id;

    const [timetable] = await pool.query(
      `SELECT t.*, c.title as course_title, cl.name as class_name, cl.section
       FROM timetables t
       JOIN courses c ON t.course_id = c.id
       LEFT JOIN classes cl ON t.class_id = cl.id
       WHERE t.teacher_id = ?
       ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), t.start_time`,
      [teacher_id]
    );

    res.status(200).json({ success: true, timetable });
  } catch (error) {
    console.error('Get teacher timetable error:', error);
    res.status(500).json({ success: false, message: 'Error fetching timetable' });
  }
});

// Student: Get My Timetable
router.get('/student-timetable', verifyToken, isStudent, async (req, res) => {
  try {
    const student_id = req.user.id;

    // Get student's enrolled courses
    const [timetable] = await pool.query(
      `SELECT t.*, c.title as course_title, u.name as teacher_name, cl.name as class_name, cl.section
       FROM timetables t
       JOIN courses c ON t.course_id = c.id
       JOIN users u ON t.teacher_id = u.id
       LEFT JOIN classes cl ON t.class_id = cl.id
       WHERE t.course_id IN (
         SELECT course_id FROM enrollments WHERE student_id = ?
       )
       ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), t.start_time`,
      [student_id]
    );

    res.status(200).json({ success: true, timetable });
  } catch (error) {
    console.error('Get student timetable error:', error);
    res.status(500).json({ success: false, message: 'Error fetching timetable' });
  }
});

// Admin: Get All Timetables (Filtered by campus if not super_admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role, campus_id } = req.user;
    let query = `SELECT t.*, c.title as course_title, u.name as teacher_name, cl.name as class_name, cl.section
                 FROM timetables t
                 JOIN courses c ON t.course_id = c.id
                 JOIN users u ON t.teacher_id = u.id
                 LEFT JOIN classes cl ON t.class_id = cl.id`;
    const params = [];

    if (role !== 'super_admin') {
      query += ` WHERE t.campus_id = ?`;
      params.push(campus_id);
    }

    query += ` ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), t.start_time`;
    
    const [timetables] = await pool.query(query, params);
    res.status(200).json({ success: true, timetables });
  } catch (error) {
    console.error('Get all timetables error:', error);
    res.status(500).json({ success: false, message: 'Error fetching timetables' });
  }
});

// Admin/HOD: Update Timetable Entry
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time, room_number } = req.body;

    // Verify role
    if (req.user.role !== 'principal' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only HODs or Admins can update timetable entries.' });
    }

    await pool.query(
      `UPDATE timetables 
       SET day_of_week = ?, start_time = ?, end_time = ?, room_number = ?
       WHERE id = ?`,
      [day_of_week, start_time, end_time, room_number, id]
    );

    res.status(200).json({ success: true, message: 'Timetable updated successfully' });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ success: false, message: 'Error updating timetable' });
  }
});

// Admin/HOD: Delete Timetable Entry
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify role
    if (req.user.role !== 'principal' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only HODs or Admins can delete timetable entries.' });
    }

    await pool.query('DELETE FROM timetables WHERE id = ?', [id]);

    res.status(200).json({ success: true, message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ success: false, message: 'Error deleting timetable entry' });
  }
});

// Get Timetable by Class ID
router.get('/class/:classId', verifyToken, async (req, res) => {
  try {
    const { classId } = req.params;

    const [timetable] = await pool.query(
      `SELECT t.*, c.title as course_title, u.name as teacher_name
       FROM timetables t
       JOIN courses c ON t.course_id = c.id
       JOIN users u ON t.teacher_id = u.id
       WHERE t.class_id = ?
       ORDER BY FIELD(t.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), t.start_time`,
      [classId]
    );

    res.status(200).json({ success: true, timetable });
  } catch (error) {
    console.error('Get class timetable error:', error);
    res.status(500).json({ success: false, message: 'Error fetching class timetable' });
  }
});

// Admin/HOD: Get History of Classes Held (based on attendance records)
router.get('/history', verifyToken, isAdmin, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const role = req.user.role;

    let query = `
      SELECT DISTINCT a.date, a.class_id, a.course_id, a.teacher_id,
             c.title as course_title, cl.name as class_name, cl.section,
             u.name as teacher_name,
             (SELECT COUNT(*) FROM attendance WHERE date = a.date AND class_id = a.class_id AND course_id = a.course_id) as student_count
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      JOIN classes cl ON a.class_id = cl.id
      JOIN users u ON a.teacher_id = u.id
    `;
    const params = [];

    if (role !== 'super_admin') {
      query += ` WHERE cl.campus_id = ?`;
      params.push(campus_id);
    }

    query += ` ORDER BY a.date DESC LIMIT 50`;

    const [history] = await pool.query(query, params);
    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('Get timetable history error:', error);
    res.status(500).json({ success: false, message: 'Error fetching class history' });
  }
});

module.exports = router;
