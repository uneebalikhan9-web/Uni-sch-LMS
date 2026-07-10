const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// Get all semesters for current campus
router.get('/', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [semesters] = await pool.query(
      'SELECT * FROM semesters WHERE campus_id = ? ORDER BY start_date DESC',
      [campus_id]
    );
    res.json({ success: true, semesters });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching semesters' });
  }
});

// Create new semester
router.post('/', verifyToken, isRegistrar, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const {
      name,
      term_type,
      start_date,
      end_date,
      registration_open,
      registration_close,
      add_drop_deadline,
      withdrawal_deadline,
      midterm_start,
      midterm_end,
      final_start,
      final_end,
      result_publish_date,
      status,
      is_summer
    } = req.body;

    if (!name || !term_type) {
      return res.status(400).json({ success: false, message: 'Name and Term Type are required fields.' });
    }

    const [result] = await pool.query(
      `INSERT INTO semesters (
        campus_id, name, term_type, start_date, end_date, 
        registration_open, registration_close, add_drop_deadline, withdrawal_deadline,
        midterm_start, midterm_end, final_start, final_end, result_publish_date,
        status, is_summer, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        campus_id, name, term_type, start_date || null, end_date || null,
        registration_open || null, registration_close || null, add_drop_deadline || null, withdrawal_deadline || null,
        midterm_start || null, midterm_end || null, final_start || null, final_end || null, result_publish_date || null,
        status || 'upcoming', is_summer ? 1 : 0, req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Semester created successfully!',
      semesterId: result.insertId
    });
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(500).json({ success: false, message: 'Server error while creating semester: ' + error.message });
  }
});

// Update semester
router.put('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const campus_id = req.user.campus_id;
    const {
      name,
      term_type,
      start_date,
      end_date,
      registration_open,
      registration_close,
      add_drop_deadline,
      withdrawal_deadline,
      midterm_start,
      midterm_end,
      final_start,
      final_end,
      result_publish_date,
      status,
      is_summer
    } = req.body;

    // Verify ownership/campus
    const [existing] = await pool.query('SELECT id FROM semesters WHERE id = ? AND campus_id = ?', [id, campus_id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Semester not found on this campus' });
    }

    await pool.query(
      `UPDATE semesters SET 
        name = ?, term_type = ?, start_date = ?, end_date = ?, 
        registration_open = ?, registration_close = ?, add_drop_deadline = ?, withdrawal_deadline = ?,
        midterm_start = ?, midterm_end = ?, final_start = ?, final_end = ?, result_publish_date = ?,
        status = ?, is_summer = ?
      WHERE id = ?`,
      [
        name, term_type, start_date || null, end_date || null,
        registration_open || null, registration_close || null, add_drop_deadline || null, withdrawal_deadline || null,
        midterm_start || null, midterm_end || null, final_start || null, final_end || null, result_publish_date || null,
        status, is_summer ? 1 : 0, id
      ]
    );

    res.json({ success: true, message: 'Semester updated successfully!' });
  } catch (error) {
    console.error('Error updating semester:', error);
    res.status(500).json({ success: false, message: 'Server error while updating semester' });
  }
});

// Delete semester
router.delete('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const campus_id = req.user.campus_id;

    // Verify ownership
    const [existing] = await pool.query('SELECT id FROM semesters WHERE id = ? AND campus_id = ?', [id, campus_id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Semester not found on this campus' });
    }

    await pool.query('DELETE FROM semesters WHERE id = ?', [id]);
    res.json({ success: true, message: 'Semester deleted successfully!' });
  } catch (error) {
    console.error('Error deleting semester:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting semester' });
  }
});

module.exports = router;
