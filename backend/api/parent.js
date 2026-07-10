const express = require('express');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Middleware to ensure user is a parent
const isParent = (req, res, next) => {
  if (req.user.role === 'parent') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized. Parent access only.' });
  }
};

router.use(verifyToken);
router.use(isParent);

// Get all children linked to this parent
router.get('/children', async (req, res) => {
  try {
    const parentUserId = req.user.id;
    const [children] = await pool.query(`
      SELECT s.id as student_id, s.roll_number, s.semester, p.name as program_name, u.name as student_name, u.email, u.profile_image
      FROM student_parents sp
      JOIN students s ON sp.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN programs p ON s.program_id = p.id
      WHERE sp.parent_user_id = ?
    `, [parentUserId]);
    
    res.json({ success: true, children });
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ success: false, message: 'Error fetching linked students' });
  }
});

// Helper to verify if the parent is actually linked to the requested student
const verifyLink = async (parentUserId, studentId) => {
  const [[link]] = await pool.query(
    'SELECT id FROM student_parents WHERE parent_user_id = ? AND student_id = ?',
    [parentUserId, studentId]
  );
  return !!link;
};

// Get attendance for a specific child
router.get('/attendance/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!(await verifyLink(req.user.id, studentId))) return res.status(403).json({ success: false, message: 'Unauthorized access to this student' });

    const [attendance] = await pool.query(`
      SELECT a.*, c.title as course_title, c.code as course_code
      FROM attendance a
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.date DESC
    `, [studentId]);
    
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance' });
  }
});

// Get fee challans for a specific child
router.get('/fees/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!(await verifyLink(req.user.id, studentId))) return res.status(403).json({ success: false, message: 'Unauthorized access to this student' });

    const [challans] = await pool.query(`
      SELECT id, challan_no as title, total_amount as amount, due_date, status, created_at, paid_date
      FROM finance_student_challans
      WHERE student_id = ?
      ORDER BY due_date DESC
    `, [studentId]);
    
    res.json({ success: true, challans });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ success: false, message: 'Error fetching fee challans' });
  }
});

// Get digital diary / assignments for a specific child
router.get('/diary/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!(await verifyLink(req.user.id, studentId))) return res.status(403).json({ success: false, message: 'Unauthorized access to this student' });

    // Fetch assignments for sections the student is enrolled in
    const [assignments] = await pool.query(`
      SELECT a.id, a.title, a.description, a.due_date, a.max_marks as total_marks, c.title as course_title, c.code as course_code
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      WHERE e.student_id = ? AND e.status = 'approved'
      ORDER BY a.due_date DESC
    `, [studentId]);
    
    res.json({ success: true, diary: assignments });
  } catch (error) {
    console.error('Error fetching diary:', error);
    res.status(500).json({ success: false, message: 'Error fetching digital diary' });
  }
});

module.exports = router;
