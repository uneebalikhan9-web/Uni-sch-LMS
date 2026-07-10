const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isRegistrar } = require('../middleware/auth');

const router = express.Router();

// ==========================================
// TEACHER WORKLOAD CONFIG APIs (Registrar/Admin)
// ==========================================

// GET all workload configs for campus
router.get('/workload-config', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const [configs] = await pool.query(
      'SELECT * FROM teacher_workload_config WHERE campus_id = ? ORDER BY employment_type',
      [campus_id]
    );
    res.json({ success: true, configs });
  } catch (error) {
    console.error('Error fetching workload configs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// UPDATE workload config
router.put('/workload-config/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const { max_credit_hours_per_semester, max_sections_per_course, effective_from } = req.body;
    const campus_id = req.user.campus_id;

    const [existing] = await pool.query(
      'SELECT id FROM teacher_workload_config WHERE id = ? AND campus_id = ?',
      [id, campus_id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Config not found' });
    }

    await pool.query(
      `UPDATE teacher_workload_config SET 
        max_credit_hours_per_semester = ?, max_sections_per_course = ?, effective_from = ?
       WHERE id = ?`,
      [max_credit_hours_per_semester, max_sections_per_course, effective_from || null, id]
    );

    res.json({ success: true, message: 'Workload config updated successfully' });
  } catch (error) {
    console.error('Error updating workload config:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET teacher workload summary for a semester
router.get('/workload-summary', verifyToken, async (req, res) => {
  try {
    const campus_id = req.user.campus_id;
    const { semester_id } = req.query;

    let query = `
      SELECT 
        e.id as teacher_id,
        u.name as teacher_name,
        u.email,
        e.employment_type,
        COUNT(DISTINCT tsa.section_id) as sections_assigned,
        IFNULL(SUM(c.credit_hours), 0) as total_credit_hours,
        twc.max_credit_hours_per_semester as max_allowed,
        CASE 
          WHEN IFNULL(SUM(c.credit_hours), 0) > twc.max_credit_hours_per_semester 
          THEN 'OVERLOADED' 
          ELSE 'OK' 
        END as workload_status
      FROM employees e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN teacher_section_assignments tsa ON tsa.teacher_id = e.id
      LEFT JOIN course_sections cs ON cs.id = tsa.section_id
      LEFT JOIN courses c ON c.id = cs.course_id
      LEFT JOIN teacher_workload_config twc ON twc.campus_id = u.campus_id 
        AND twc.employment_type = e.employment_type
      WHERE u.role = 'teacher' AND u.campus_id = ?
    `;
    const params = [campus_id];

    if (semester_id) {
      query += ' AND (cs.semester_id = ? OR cs.semester_id IS NULL)';
      params.push(semester_id);
    }

    query += ' GROUP BY e.id, u.name, u.email, e.employment_type, twc.max_credit_hours_per_semester ORDER BY u.name';

    const [workload] = await pool.query(query, params);
    res.json({ success: true, workload });
  } catch (error) {
    console.error('Error fetching workload summary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// TEACHER SECTION ASSIGNMENTS APIs
// ==========================================

// Assign teacher to section
router.post('/section-assignments', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { teacher_id, section_id, role } = req.body;
    const campus_id = req.user.campus_id;

    if (!teacher_id || !section_id) {
      return res.status(400).json({ success: false, message: 'teacher_id and section_id are required' });
    }

    // Get section details to check semester and course credit hours
    const [sectionData] = await pool.query(
      `SELECT cs.*, c.credit_hours, s.id as sem_id
       FROM course_sections cs
       JOIN courses c ON c.id = cs.course_id
       JOIN semesters s ON s.id = cs.semester_id
       WHERE cs.id = ?`,
      [section_id]
    );
    if (sectionData.length === 0) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const { credit_hours, sem_id } = sectionData[0];

    // Get teacher employment type & workload config
    const [teacherData] = await pool.query(
      `SELECT e.employment_type, u.campus_id 
       FROM employees e JOIN users u ON u.id = e.user_id 
       WHERE e.id = ?`,
      [teacher_id]
    );
    if (teacherData.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const [workloadConfig] = await pool.query(
      'SELECT max_credit_hours_per_semester FROM teacher_workload_config WHERE campus_id = ? AND employment_type = ?',
      [campus_id, teacherData[0].employment_type]
    );
    const maxAllowed = workloadConfig.length > 0 ? workloadConfig[0].max_credit_hours_per_semester : 12;

    // Check current workload for this semester
    const [[{ current_load }]] = await pool.query(
      `SELECT IFNULL(SUM(c.credit_hours), 0) as current_load
       FROM teacher_section_assignments tsa
       JOIN course_sections cs ON cs.id = tsa.section_id
       JOIN courses c ON c.id = cs.course_id
       WHERE tsa.teacher_id = ? AND cs.semester_id = ?`,
      [teacher_id, sem_id]
    );

    if (current_load + credit_hours > maxAllowed) {
      return res.status(400).json({
        success: false,
        message: `Workload limit exceeded! Teacher already has ${current_load} CH, max allowed is ${maxAllowed} CH per semester.`
      });
    }

    // Check teacher timetable conflict with section schedules
    const [conflict] = await pool.query(
      `SELECT ss1.id 
       FROM section_schedules ss1
       JOIN section_schedules ss2 ON ss1.day_of_week = ss2.day_of_week
         AND (
           (ss1.start_time >= ss2.start_time AND ss1.start_time < ss2.end_time) OR
           (ss1.end_time > ss2.start_time AND ss1.end_time <= ss2.end_time) OR
           (ss1.start_time <= ss2.start_time AND ss1.end_time >= ss2.end_time)
         )
       WHERE ss1.section_id = ?
         AND ss2.section_id IN (
           SELECT tsa.section_id FROM teacher_section_assignments tsa
           JOIN course_sections cs ON cs.id = tsa.section_id
           WHERE tsa.teacher_id = ? AND cs.semester_id = ?
         )
         AND ss2.section_id != ?`,
      [section_id, teacher_id, sem_id, section_id]
    );

    if (conflict.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Timetable conflict! Teacher is already assigned to another section at this time.'
      });
    }

    // Insert assignment
    await pool.query(
      'INSERT INTO teacher_section_assignments (teacher_id, section_id, role) VALUES (?, ?, ?)',
      [teacher_id, section_id, role || 'primary']
    );

    // Also update course_sections.teacher_id if primary
    if (!role || role === 'primary') {
      await pool.query('UPDATE course_sections SET teacher_id = ? WHERE id = ?', [teacher_id, section_id]);
    }

    res.status(201).json({ success: true, message: 'Teacher assigned to section successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Teacher is already assigned to this section' });
    }
    console.error('Error assigning teacher to section:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Get assignments for a section
router.get('/section-assignments/:sectionId', verifyToken, async (req, res) => {
  try {
    const { sectionId } = req.params;
    const [assignments] = await pool.query(
      `SELECT tsa.*, u.name as teacher_name, e.employment_type, e.designation
       FROM teacher_section_assignments tsa
       JOIN employees e ON e.id = tsa.teacher_id
       JOIN users u ON u.id = e.user_id
       WHERE tsa.section_id = ?`,
      [sectionId]
    );
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Error fetching section assignments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove assignment
router.delete('/section-assignments/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM teacher_section_assignments WHERE id = ?', [id]);
    res.json({ success: true, message: 'Assignment removed successfully' });
  } catch (error) {
    console.error('Error removing assignment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// TEACHER AVAILABILITY APIs
// ==========================================

// Get teacher's availability for a semester
router.get('/availability/:teacherId', verifyToken, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { semester_id } = req.query;
    
    let query = 'SELECT * FROM teacher_availability WHERE teacher_id = ?';
    const params = [teacherId];
    if (semester_id) {
      query += ' AND semester_id = ?';
      params.push(semester_id);
    }
    query += ' ORDER BY FIELD(day_of_week, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"), available_from';
    
    const [availability] = await pool.query(query, params);
    res.json({ success: true, availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Set/Update teacher availability
router.post('/availability', verifyToken, async (req, res) => {
  try {
    const { teacher_id, semester_id, slots } = req.body;
    // slots = [{ day_of_week, available_from, available_to }]
    if (!teacher_id || !semester_id || !Array.isArray(slots)) {
      return res.status(400).json({ success: false, message: 'teacher_id, semester_id and slots[] are required' });
    }

    // Delete existing availability for this teacher/semester
    await pool.query('DELETE FROM teacher_availability WHERE teacher_id = ? AND semester_id = ?', [teacher_id, semester_id]);

    // Insert new slots
    for (const slot of slots) {
      const { day_of_week, available_from, available_to } = slot;
      if (!day_of_week || !available_from || !available_to) continue;
      await pool.query(
        'INSERT INTO teacher_availability (teacher_id, semester_id, day_of_week, available_from, available_to) VALUES (?, ?, ?, ?, ?)',
        [teacher_id, semester_id, day_of_week, available_from, available_to]
      );
    }

    res.json({ success: true, message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;
