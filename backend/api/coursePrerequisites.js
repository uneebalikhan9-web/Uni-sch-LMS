const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// Get all course prerequisites scoped to campus
router.get('/', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [prereqs] = await pool.query(
      `SELECT cp.*, c1.title as course_title, c1.code as course_code,
              c2.title as prereq_title, c2.code as prereq_code
       FROM course_prerequisites cp
       JOIN courses c1 ON cp.course_id = c1.id
       JOIN courses c2 ON cp.prerequisite_course_id = c2.id
       WHERE c1.campus_id = ?
       ORDER BY c1.title`,
      [campus_id]
    );
    res.json({ success: true, prerequisites: prereqs });
  } catch (error) {
    console.error('Error fetching course prerequisites:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching prerequisites' });
  }
});

// Create new prerequisite
router.post('/', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { course_id, prerequisite_course_id, min_grade, prerequisite_type } = req.body;

    if (!course_id || !prerequisite_course_id) {
      return res.status(400).json({ success: false, message: 'Course ID and Prerequisite Course ID are required.' });
    }

    if (course_id === prerequisite_course_id) {
      return res.status(400).json({ success: false, message: 'A course cannot be a prerequisite of itself!' });
    }

    const [result] = await pool.query(
      `INSERT INTO course_prerequisites (
        course_id, prerequisite_course_id, min_grade, prerequisite_type
      ) VALUES (?, ?, ?, ?)`,
      [course_id, prerequisite_course_id, min_grade || 'D', prerequisite_type || 'hard']
    );

    res.status(201).json({
      success: true,
      message: 'Prerequisite created successfully!',
      prerequisiteId: result.insertId
    });
  } catch (error) {
    console.error('Error creating prerequisite:', error);
    res.status(500).json({ success: false, message: 'Server error while creating prerequisite' });
  }
});

// Delete prerequisite
router.delete('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM course_prerequisites WHERE id = ?', [id]);
    res.json({ success: true, message: 'Prerequisite link deleted successfully!' });
  } catch (error) {
    console.error('Error deleting prerequisite:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting prerequisite' });
  }
});

module.exports = router;
