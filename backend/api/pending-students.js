const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { generateRollNumber } = require('../utils/rollNumber');

const router = express.Router();

// Apply admin authentication to all routes
router.use(verifyToken);
router.use(isAdmin);

// Get All Pending Students
router.get('/', async (req, res) => {
  try {
    const { role, campus_id: adminCampusId } = req.user;
    let query = `SELECT u.id, u.name, u.email, u.created_at, u.semester, c.name as department_name, u.campus_id
       FROM users u
       LEFT JOIN campuses c ON u.campus_id = c.id
       WHERE u.role = 'student' AND u.is_approved = FALSE`;
    const params = [];

    if (role !== 'super_admin') {
      query += ` AND u.campus_id = ?`;
      params.push(adminCampusId);
    }

    query += ` ORDER BY u.created_at DESC`;
    const [students] = await pool.query(query, params);

    res.status(200).json({ 
      success: true, 
      students,
      count: students.length 
    });
  } catch (error) {
    console.error('Get pending students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pending students',
      error: error.message
    });
  }
});

// Approve Student
router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  console.log(`[PendingStudents] Approval attempt for ID: ${id}`);
  
  try {
    const { role, campus_id: adminCampusId } = req.user;

    // 1. Fetch student data first without strict filtering to diagnose
    const [studentCheck] = await pool.query(
      'SELECT id, name, email, campus_id, role, is_approved, semester FROM users WHERE id = ?', 
      [id]
    );

    if (studentCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Student record not found in database' });
    }

    const student = studentCheck[0];

    // 2. Validate student state
    if (student.role !== 'student') {
      return res.status(400).json({ success: false, message: `Invalid user role: ${student.role}` });
    }
    if (student.is_approved) {
      return res.status(400).json({ success: false, message: 'Student is already approved' });
    }

    // 3. Authorization check (Department scope)
    if (role !== 'super_admin') {
       // Using loose comparison for IDs (compensating for string vs number)
       if (String(student.campus_id) !== String(adminCampusId)) {
          console.warn(`[PendingStudents] Auth mismatch: student campus ${student.campus_id} vs admin campus ${adminCampusId}`);
          return res.status(403).json({ 
            success: false, 
            message: 'You are not authorized to approve students from other departments',
            debug: { student_campus: student.campus_id, your_campus: adminCampusId }
          });
       }
    }

    // 4. Generate Roll Number
    let rollNumber = null;
    try {
      rollNumber = await generateRollNumber(student.campus_id, student.semester);
    } catch (rollErr) {
      console.error('[PendingStudents] Roll generation failed:', rollErr);
    }

    // 5. Final Approval
    await pool.query(
      'UPDATE users SET is_approved = TRUE, roll_number = ? WHERE id = ?',
      [rollNumber, id]
    );

    console.log(`✅ Admin approved student: ${student.email} (ID: ${id})`);

    res.status(200).json({ 
      success: true, 
      message: `Student ${student.name} approved successfully`,
      student: { ...student, roll_number: rollNumber }
    });
  } catch (error) {
    console.error('Approve student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error approving student',
      error: error.message
    });
  }
});

// Reject/Delete Student
router.delete('/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
    const { role, campus_id: adminCampusId } = req.user;

    const [students] = await pool.query('SELECT id, campus_id FROM users WHERE id = ?', [id]);
    if (students.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });

    if (role !== 'super_admin' && String(students[0].campus_id) !== String(adminCampusId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'Student rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error rejecting student' });
  }
});

module.exports = router;
