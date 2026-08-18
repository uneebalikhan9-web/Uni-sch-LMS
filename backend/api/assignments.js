const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isTeacher, isStudent } = require('../middleware/auth');

const router = express.Router();

// Teacher: Create Assignment
router.post('/', verifyToken, isTeacher, async (req, res) => {
  try {
    const { title, description, course_id, due_date, max_marks, status, assignment_type, academic_period, external_link } = req.body;
    const [result] = await pool.query(
      'INSERT INTO assignments (title, description, course_id, teacher_id, due_date, max_marks, status, assignment_type, academic_period, external_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, course_id, req.user.employee_id, due_date, max_marks || 100, status || 'published', assignment_type || 'Homework', academic_period || '2026-2027', external_link || null]
    );

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    try {
      const fs = require('fs');
      const logMessage = `${new Date().toISOString()} - Create assignment error: ${error.message}\n` +
                         `User: ${req.user ? req.user.id : 'unknown'}\n` +
                         `Body: ${JSON.stringify(req.body)}\n` +
                         `Stack: ${error.stack}\n\n`;
      fs.appendFileSync('backend_error.log', logMessage);
    } catch (logErr) {
      console.error('Failed to write to backend_error.log:', logErr);
    }
    res.status(500).json({ success: false, message: 'Error creating assignment' });
  }
});

// Teacher: Get My Assignments
router.get('/my-assignments', verifyToken, isTeacher, async (req, res) => {
  try {
    const [assignments] = await pool.query(`
      SELECT a.*, c.title as course_title 
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      WHERE a.teacher_id = ?
      ORDER BY a.created_at DESC
    `, [req.user.employee_id]);

    res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching assignments' });
  }
});

// Student/Public: Get Assignments for a Course
router.get('/course/:courseId', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const [assignments] = await pool.query(
      'SELECT * FROM assignments WHERE course_id = ? ORDER BY due_date ASC',
      [courseId]
    );

    res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error('Get course assignments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching assignments' });
  }
});

// Teacher: Update Assignment
router.put('/:id', verifyToken, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, max_marks, status, assignment_type, academic_period, external_link } = req.body;
    const [result] = await pool.query(
      'UPDATE assignments SET title = ?, description = ?, due_date = ?, max_marks = ?, status = ?, assignment_type = ?, academic_period = ?, external_link = ? WHERE id = ? AND teacher_id = ?',
      [title, description, due_date, max_marks, status, assignment_type, academic_period, external_link || null, id, req.user.employee_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ success: false, message: 'Error updating assignment' });
  }
});

// Teacher: Delete Assignment
router.delete('/:id', verifyToken, isTeacher, async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership
    const [check] = await pool.query(
      'SELECT id FROM assignments WHERE id = ? AND teacher_id = ?',
      [id, req.user.employee_id]
    );

    if (check.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found or unauthorized' });
    }

    // Clean up related submissions first
    try {
      await pool.query('DELETE FROM submissions WHERE assignment_id = ?', [id]);
    } catch (e) {
      console.warn('Submissions cleanup note:', e.message);
    }

    const [result] = await pool.query(
      'DELETE FROM assignments WHERE id = ? AND teacher_id = ?',
      [id, req.user.employee_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: 'Error deleting assignment' });
  }
});

module.exports = router;
