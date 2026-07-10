const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// Helper: Get all teachers for campus
router.get('/teachers', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [teachers] = await pool.query(
      `SELECT e.id as id, u.name as name, e.employee_code, e.designation
       FROM employees e
       JOIN users u ON e.user_id = u.id
       WHERE u.role = 'teacher' AND u.campus_id = ?
       ORDER BY u.name`,
      [campus_id]
    );
    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Error fetching teachers helper:', error);
    res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
});

// Get all course sections for campus
router.get('/', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [sections] = await pool.query(
      `SELECT cs.*, c.title as course_title, c.code as course_code, c.credit_hours,
              s.name as semester_name, u.name as teacher_name, r.room_number, r.building
       FROM course_sections cs
       JOIN courses c ON cs.course_id = c.id
       JOIN semesters s ON cs.semester_id = s.id
       LEFT JOIN employees e ON cs.teacher_id = e.id
       LEFT JOIN users u ON e.user_id = u.id
       LEFT JOIN rooms r ON cs.room_id = r.id
       WHERE c.campus_id = ?
       ORDER BY s.start_date DESC, c.title, cs.section_label`,
      [campus_id]
    );
    res.json({ success: true, courseSections: sections });
  } catch (error) {
    console.error('Error fetching course sections:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching course sections' });
  }
});

// Get a single section's schedules
router.get('/:id/schedules', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [schedules] = await pool.query(
      `SELECT ss.*, r.room_number, r.building
       FROM section_schedules ss
       LEFT JOIN rooms r ON ss.room_id = r.id
       WHERE ss.section_id = ?
       ORDER BY FIELD(ss.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), ss.start_time`,
      [id]
    );
    res.json({ success: true, schedules });
  } catch (error) {
    console.error('Error fetching section schedules:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching schedules' });
  }
});

// Create new course section
router.post('/', verifyToken, isRegistrar, async (req, res) => {
  try {
    const {
      course_id,
      semester_id,
      section_label,
      teacher_id,
      room_id,
      max_capacity,
      status
    } = req.body;

    if (!course_id || !semester_id || !section_label) {
      return res.status(400).json({ success: false, message: 'Course ID, Semester ID and Section label are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO course_sections (
        course_id, semester_id, section_label, teacher_id, room_id, max_capacity, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id, semester_id, section_label,
        teacher_id || null, room_id || null, max_capacity || 30, status || 'open'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Course section created successfully!',
      sectionId: result.insertId
    });
  } catch (error) {
    console.error('Error creating course section:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Update course section
router.put('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teacher_id,
      room_id,
      max_capacity,
      status
    } = req.body;

    await pool.query(
      `UPDATE course_sections SET 
        teacher_id = ?, room_id = ?, max_capacity = ?, status = ?
      WHERE id = ?`,
      [
        teacher_id || null, room_id || null, max_capacity, status, id
      ]
    );

    res.json({ success: true, message: 'Course section updated successfully!' });
  } catch (error) {
    console.error('Error updating course section:', error);
    res.status(500).json({ success: false, message: 'Server error while updating section' });
  }
});

// Add schedule slot to section
router.post('/:id/schedules', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time, room_id, schedule_type } = req.body;

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Day of week, start time and end time are required.' });
    }

    // Get semester ID of this section
    const [section] = await pool.query('SELECT semester_id FROM course_sections WHERE id = ?', [id]);
    if (section.length === 0) {
      return res.status(404).json({ success: false, message: 'Course section not found' });
    }
    const semester_id = section[0].semester_id;

    // Check for room conflict in this time slot and semester
    if (room_id) {
      const [roomConflict] = await pool.query(
        `SELECT ss.id, c.title, cs.section_label
         FROM section_schedules ss
         JOIN course_sections cs ON ss.section_id = cs.id
         JOIN courses c ON cs.course_id = c.id
         WHERE ss.room_id = ? 
           AND ss.day_of_week = ? 
           AND ss.semester_id = ?
           AND (
             (ss.start_time >= ? AND ss.start_time < ?) OR
             (ss.end_time > ? AND ss.end_time <= ?) OR
             (ss.start_time <= ? AND ss.end_time >= ?)
           )`,
        [room_id, day_of_week, semester_id, start_time, end_time, start_time, end_time, start_time, end_time]
      );

      if (roomConflict.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Room conflict! This room is already scheduled for ${roomConflict[0].title} (Sec ${roomConflict[0].section_label}) at this time.`
        });
      }
    }

    // Check for section timetable overlap
    const [sectionConflict] = await pool.query(
      `SELECT ss.id
       FROM section_schedules ss
       WHERE ss.section_id = ? 
         AND ss.day_of_week = ?
         AND (
           (ss.start_time >= ? AND ss.start_time < ?) OR
           (ss.end_time > ? AND ss.end_time <= ?) OR
           (ss.start_time <= ? AND ss.end_time >= ?)
         )`,
      [id, day_of_week, start_time, end_time, start_time, end_time, start_time, end_time]
    );

    if (sectionConflict.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Timetable conflict! This section has an overlapping class scheduled at this time.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO section_schedules (
        section_id, semester_id, day_of_week, start_time, end_time, room_id, schedule_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id, semester_id, day_of_week, start_time, end_time,
        room_id || null, schedule_type || 'lecture'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Schedule slot added successfully!',
      scheduleId: result.insertId
    });
  } catch (error) {
    console.error('Error adding schedule slot:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Delete schedule slot
router.delete('/:id/schedules/:scheduleId', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { scheduleId } = req.params;
    await pool.query('DELETE FROM section_schedules WHERE id = ?', [scheduleId]);
    res.json({ success: true, message: 'Schedule slot deleted successfully!' });
  } catch (error) {
    console.error('Error deleting schedule slot:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting schedule slot' });
  }
});

// Delete course section
router.delete('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM course_sections WHERE id = ?', [id]);
    res.json({ success: true, message: 'Course section deleted successfully!' });
  } catch (error) {
    console.error('Error deleting course section:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting course section' });
  }
});

module.exports = router;
