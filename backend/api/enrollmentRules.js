const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// GET enrollment rules for campus
router.get('/', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [rules] = await pool.query(
      'SELECT * FROM enrollment_rules WHERE campus_id = ? ORDER BY program_level, semester_type',
      [campus_id]
    );
    res.json({ success: true, rules });
  } catch (error) {
    console.error('Error fetching enrollment rules:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE enrollment rule
router.put('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const campus_id = req.user.campus_id;
    const {
      min_credit_hours,
      max_credit_hours,
      max_credit_hours_good_standing,
      min_cgpa_for_overload,
      probation_cgpa_threshold,
      dismissal_cgpa_threshold,
      summer_max_credit_hours,
      effective_from
    } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM enrollment_rules WHERE id = ? AND campus_id = ?',
      [id, campus_id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    await pool.query(
      `UPDATE enrollment_rules SET
        min_credit_hours = ?, max_credit_hours = ?,
        max_credit_hours_good_standing = ?, min_cgpa_for_overload = ?,
        probation_cgpa_threshold = ?, dismissal_cgpa_threshold = ?,
        summer_max_credit_hours = ?, effective_from = ?
       WHERE id = ?`,
      [
        min_credit_hours, max_credit_hours,
        max_credit_hours_good_standing, min_cgpa_for_overload,
        probation_cgpa_threshold, dismissal_cgpa_threshold,
        summer_max_credit_hours, effective_from || null,
        id
      ]
    );

    res.json({ success: true, message: 'Enrollment rules updated successfully' });
  } catch (error) {
    console.error('Error updating enrollment rules:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET enrollment rules for a specific program level (used in validation)
router.get('/for-validation', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const { program_level, semester_type } = req.query;

    const [rules] = await pool.query(
      `SELECT * FROM enrollment_rules 
       WHERE campus_id = ? 
         AND program_level = ? 
         AND semester_type = ?
       LIMIT 1`,
      [campus_id, program_level || 'Undergraduate', semester_type || 'regular']
    );

    if (rules.length === 0) {
      // Return HEC defaults if not configured
      return res.json({
        success: true,
        rules: {
          min_credit_hours: 9,
          max_credit_hours: 21,
          max_credit_hours_good_standing: 24,
          min_cgpa_for_overload: 3.50,
          probation_cgpa_threshold: 2.00,
          dismissal_cgpa_threshold: 1.50,
          summer_max_credit_hours: 9
        }
      });
    }

    res.json({ success: true, rules: rules[0] });
  } catch (error) {
    console.error('Error fetching enrollment rules for validation:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
