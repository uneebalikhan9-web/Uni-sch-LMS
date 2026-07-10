const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// Helper: Get all programs for campus
router.get('/programs', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [programs] = await pool.query(
      `SELECT p.id, p.name, p.code, p.level
       FROM programs p
       JOIN departments d ON p.department_id = d.id
       JOIN faculties f ON d.faculty_id = f.id
       WHERE d.campus_id = ?
       ORDER BY p.name`,
      [campus_id]
    );
    res.json({ success: true, programs });
  } catch (error) {
    console.error('Error fetching programs helper:', error);
    res.status(500).json({ success: false, message: 'Error fetching programs' });
  }
});

// Helper: Get all courses for campus
router.get('/courses', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [courses] = await pool.query(
      `SELECT id, title, code, credit_hours FROM courses WHERE campus_id = ? ORDER BY title`,
      [campus_id]
    );
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses helper:', error);
    res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

// Get all degree plans scoped to campus
router.get('/', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [plans] = await pool.query(
      `SELECT dp.*, p.name as program_name, p.code as program_code, p.level as program_level
       FROM degree_plans dp
       JOIN programs p ON dp.program_id = p.id
       JOIN departments d ON p.department_id = d.id
       JOIN faculties f ON d.faculty_id = f.id
       WHERE d.campus_id = ?
       ORDER BY p.name, dp.version`,
      [campus_id]
    );
    res.json({ success: true, degreePlans: plans });
  } catch (error) {
    console.error('Error fetching degree plans:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching degree plans' });
  }
});

// Get a single degree plan's course curriculum mapping
router.get('/:id/courses', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [courses] = await pool.query(
      `SELECT dpc.*, c.title as course_title, c.code as course_code, c.credit_hours
       FROM degree_plan_courses dpc
       JOIN courses c ON dpc.course_id = c.id
       WHERE dpc.degree_plan_id = ?
       ORDER BY dpc.semester_number, c.title`,
      [id]
    );
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching degree plan courses:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching degree plan courses' });
  }
});

// Create a new degree plan
router.post('/', verifyToken, isRegistrar, async (req, res) => {
  try {
    const {
      program_id,
      version,
      effective_from,
      min_credit_hours,
      max_credit_hours,
      core_credit_hours,
      elective_credit_hours,
      general_education_hours,
      is_active,
      approved_by_hec
    } = req.body;

    if (!program_id || !version) {
      return res.status(400).json({ success: false, message: 'Program ID and version are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO degree_plans (
        program_id, version, effective_from, min_credit_hours, max_credit_hours,
        core_credit_hours, elective_credit_hours, general_education_hours,
        is_active, approved_by_hec
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        program_id, version, effective_from || null, min_credit_hours || 130, max_credit_hours || 140,
        core_credit_hours || null, elective_credit_hours || null, general_education_hours || null,
        is_active ? 1 : 0, approved_by_hec ? 1 : 0
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Degree plan created successfully!',
      degreePlanId: result.insertId
    });
  } catch (error) {
    console.error('Error creating degree plan:', error);
    res.status(500).json({ success: false, message: 'Server error while creating degree plan' });
  }
});

// Update degree plan
router.put('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      version,
      effective_from,
      min_credit_hours,
      max_credit_hours,
      core_credit_hours,
      elective_credit_hours,
      general_education_hours,
      is_active,
      approved_by_hec
    } = req.body;

    await pool.query(
      `UPDATE degree_plans SET 
        version = ?, effective_from = ?, min_credit_hours = ?, max_credit_hours = ?,
        core_credit_hours = ?, elective_credit_hours = ?, general_education_hours = ?,
        is_active = ?, approved_by_hec = ?
      WHERE id = ?`,
      [
        version, effective_from || null, min_credit_hours, max_credit_hours,
        core_credit_hours || null, elective_credit_hours || null, general_education_hours || null,
        is_active ? 1 : 0, approved_by_hec ? 1 : 0, id
      ]
    );

    res.json({ success: true, message: 'Degree plan updated successfully!' });
  } catch (error) {
    console.error('Error updating degree plan:', error);
    res.status(500).json({ success: false, message: 'Server error while updating degree plan' });
  }
});

// Add course to degree plan curriculum mapping
router.post('/:id/courses', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, semester_number, is_core, is_optional, category } = req.body;

    if (!course_id || !semester_number) {
      return res.status(400).json({ success: false, message: 'Course ID and Semester number are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO degree_plan_courses (
        degree_plan_id, course_id, semester_number, is_core, is_optional, category
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id, course_id, semester_number,
        is_core ? 1 : 0, is_optional ? 1 : 0, category || 'core'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Course added to degree plan curriculum mapping!',
      mappingId: result.insertId
    });
  } catch (error) {
    console.error('Error adding course to degree plan:', error);
    res.status(500).json({ success: false, message: 'Server error while mapping course: ' + error.message });
  }
});

// Remove course from degree plan curriculum mapping
router.delete('/:id/courses/:mappingId', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { mappingId } = req.params;
    await pool.query('DELETE FROM degree_plan_courses WHERE id = ?', [mappingId]);
    res.json({ success: true, message: 'Course removed from curriculum mapping successfully!' });
  } catch (error) {
    console.error('Error deleting curriculum course:', error);
    res.status(500).json({ success: false, message: 'Server error while removing course mapping' });
  }
});

// Delete degree plan
router.delete('/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM degree_plans WHERE id = ?', [id]);
    res.json({ success: true, message: 'Degree plan deleted successfully!' });
  } catch (error) {
    console.error('Error deleting degree plan:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting degree plan' });
  }
});

module.exports = router;
