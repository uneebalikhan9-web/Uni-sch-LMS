const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isRegistrar, isStudent } = require('../middleware/auth');

const router = express.Router();

// =====================================================
// REGISTRAR: Get graduation requirements for a program
// GET /api/graduation/requirements/:program_id
// =====================================================
router.get('/requirements/:program_id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { program_id } = req.params;
    const [requirements] = await pool.query(
      'SELECT * FROM program_graduation_policies WHERE program_id = ?',
      [program_id]
    );
    res.json({ success: true, requirements: requirements[0] || null });
  } catch (error) {
    console.error('Error fetching graduation requirements:', error);
    res.status(500).json({ success: false, message: 'Server error fetching requirements' });
  }
});

// =====================================================
// REGISTRAR: Set graduation requirements for a program
// POST /api/graduation/requirements
// =====================================================
router.post('/requirements', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { program_id, required_credits, minimum_cgpa, mandatory_courses, graduation_fee } = req.body;
    
    // Check if exists
    const [existing] = await pool.query('SELECT id FROM program_graduation_policies WHERE program_id = ?', [program_id]);
    
    if (existing.length > 0) {
      await pool.query(
        `UPDATE program_graduation_policies 
         SET required_credits = ?, minimum_cgpa = ?, mandatory_courses = ?, graduation_fee = ?
         WHERE program_id = ?`,
        [required_credits, minimum_cgpa, mandatory_courses, graduation_fee, program_id]
      );
    } else {
      await pool.query(
        `INSERT INTO program_graduation_policies (program_id, required_credits, minimum_cgpa, mandatory_courses, graduation_fee)
         VALUES (?, ?, ?, ?, ?)`,
        [program_id, required_credits, minimum_cgpa, mandatory_courses, graduation_fee]
      );
    }
    res.json({ success: true, message: 'Graduation requirements saved successfully' });
  } catch (error) {
    console.error('Error saving graduation requirements:', error);
    res.status(500).json({ success: false, message: 'Server error saving requirements' });
  }
});

// =====================================================
// STUDENT: Apply for graduation
// POST /api/graduation/apply
// =====================================================
router.post('/apply', verifyToken, isStudent, async (req, res) => {
  try {
    const student_id = req.user.student_id;
    
    // Check if already applied
    const [existing] = await pool.query('SELECT id, status FROM graduation_applications WHERE student_id = ?', [student_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: `Application already exists with status: ${existing[0].status}` });
    }
    
    // Get active semester
    const [sems] = await pool.query(`SELECT id FROM semesters WHERE status = 'active' ORDER BY start_date DESC LIMIT 1`);
    const semester_id = sems.length > 0 ? sems[0].id : null;

    if (!semester_id) {
      return res.status(400).json({ success: false, message: 'No active semester found. Cannot apply for graduation at this time.' });
    }
    
    await pool.query(
      `INSERT INTO graduation_applications (student_id, semester_id, status) VALUES (?, ?, 'applied')`,
      [student_id, semester_id]
    );
    
    res.json({ success: true, message: 'Graduation application submitted successfully' });
  } catch (error) {
    console.error('Error applying for graduation:', error);
    res.status(500).json({ success: false, message: 'Server error applying for graduation' });
  }
});

// =====================================================
// STUDENT: Get my graduation application status
// GET /api/graduation/my-application
// =====================================================
router.get('/my-application', verifyToken, isStudent, async (req, res) => {
  try {
    const student_id = req.user.student_id;
    const [existing] = await pool.query('SELECT status FROM graduation_applications WHERE student_id = ?', [student_id]);
    res.json({ success: true, application: existing[0] || null });
  } catch (error) {
    console.error('Error fetching my application:', error);
    res.status(500).json({ success: false, message: 'Server error fetching my application' });
  }
});

// =====================================================
// REGISTRAR: Get all graduation applications
// GET /api/graduation/applications
// =====================================================
router.get('/applications', verifyToken, isRegistrar, async (req, res) => {
  try {
    const [applications] = await pool.query(
      `SELECT ga.*, s.roll_number, u.name AS student_name, p.name AS program_name, s.current_gpa
       FROM graduation_applications ga
       JOIN students s ON ga.student_id = s.id
       JOIN users u ON s.user_id = u.id
       JOIN programs p ON s.program_id = p.id
       ORDER BY ga.created_at DESC`
    );
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching graduation applications:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
});

// =====================================================
// REGISTRAR: Run Graduation Audit
// POST /api/graduation/audit/:student_id
// =====================================================
router.post('/audit/:student_id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Call the stored procedure
    const [results] = await pool.query('CALL sp_graduation_audit(?)', [student_id]);
    
    if (results && results.length > 0 && results[0].length > 0) {
      const auditResult = results[0][0];
      res.json({ success: true, audit: auditResult });
    } else {
      res.status(404).json({ success: false, message: 'Audit failed or student not found' });
    }
  } catch (error) {
    console.error('Error running graduation audit:', error);
    res.status(500).json({ success: false, message: 'Server error running audit' });
  }
});

// =====================================================
// REGISTRAR: Approve/Reject/Hold Application
// PUT /api/graduation/applications/:id
// =====================================================
router.put('/applications/:id', verifyToken, isRegistrar, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, audit_data } = req.body;
    
    await pool.query(
      `UPDATE graduation_applications 
       SET status = ?, remarks = ?, audit_data = ?
       WHERE id = ?`,
      [status, remarks, JSON.stringify(audit_data), id]
    );
    
    // If approved, update student's academic_status to 'graduated'
    if (status === 'approved') {
      const [app] = await pool.query('SELECT student_id FROM graduation_applications WHERE id = ?', [id]);
      if (app.length > 0) {
        await pool.query(`UPDATE students SET academic_status = 'graduated' WHERE id = ?`, [app[0].student_id]);
      }
    }
    
    res.json({ success: true, message: `Application marked as ${status}` });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Server error updating application' });
  }
});

// =====================================================
// SHARED: Get Student Transcript
// GET /api/graduation/transcript/:student_id
// =====================================================
router.get('/transcript/:student_id', verifyToken, async (req, res) => {
  try {
    // --- AUTO-FIX SCHEMA INJECTION START ---
    try {
      await pool.query(`
        CREATE OR REPLACE VIEW \`vw_student_transcript\` AS
        SELECT 
            s.id AS student_id, s.roll_number, u.name AS student_name, s.father_name, s.cnic, s.bform_number,
            p.name AS program_name, p.code AS program_code, c.title AS course_title, c.code AS course_code,
            c.credit_hours, e.semester AS enrollment_semester, er.marks_obtained, er.grade, er.gpa
        FROM students s
        JOIN users u ON s.user_id = u.id
        JOIN programs p ON s.program_id = p.id
        JOIN enrollments e ON e.student_id = s.id
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN exam_results er ON er.enrollment_id = e.id;
      `);
    } catch (autoFixErr) {
      console.error('Auto fix transcript view error:', autoFixErr);
    }
    // --- AUTO-FIX SCHEMA INJECTION END ---

    let { student_id } = req.params;
    
    // If frontend sends 'undefined' or 'my', use the logged-in student's ID
    if (student_id === 'undefined' || student_id === 'my') {
      if (req.user.role === 'student') {
        student_id = req.user.student_id;
      } else {
        return res.status(400).json({ success: false, message: 'Valid student_id is required.' });
      }
    }
    
    // If student, check if they are requesting their own transcript
    if (req.user.role === 'student' && req.user.student_id != student_id) {
      return res.status(403).json({ success: false, message: 'Access denied to other transcripts.' });
    }

    if (!student_id) {
      return res.status(400).json({ success: false, message: 'Student ID not found for this account. Please ensure your student profile is completely set up.' });
    }

    const [transcriptRows] = await pool.query(
      `SELECT * FROM vw_student_transcript WHERE student_id = ? ORDER BY enrollment_semester ASC`,
      [student_id]
    );
    
    // Calculate total credits passed
    let total_credits_passed = 0;
    transcriptRows.forEach(row => {
        if (row.grade && row.grade !== 'F') {
            total_credits_passed += row.credit_hours;
        }
    });
    
    res.json({ success: true, transcript: transcriptRows, total_credits_passed });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ success: false, message: 'Server error fetching transcript' });
  }
});

// =====================================================
// REGISTRAR: HEC Compliance Export
// GET /api/graduation/hec-export
// =====================================================
router.get('/hec-export', verifyToken, isRegistrar, async (req, res) => {
  try {
    // Get all approved graduated students
    const [graduates] = await pool.query(
      `SELECT s.roll_number AS 'Registration Number', u.name AS 'Student Name', s.father_name AS 'Father Name',
              s.cnic AS 'CNIC', s.bform_number AS 'B-Form', p.name AS 'Program', 
              s.admission_year AS 'Admission Year', s.current_gpa AS 'CGPA',
              ga.created_at AS 'Graduation Date'
       FROM students s
       JOIN users u ON s.user_id = u.id
       JOIN programs p ON s.program_id = p.id
       JOIN graduation_applications ga ON ga.student_id = s.id
       WHERE ga.status = 'approved' AND s.academic_status = 'graduated'`
    );
    
    res.json({ success: true, export_data: graduates });
  } catch (error) {
    console.error('Error generating HEC export:', error);
    res.status(500).json({ success: false, message: 'Server error generating HEC export' });
  }
});

module.exports = router;
