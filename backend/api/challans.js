const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isStudent } = require('../middleware/auth');
const { logAudit } = require('../utils/auditLogger');

const router = express.Router();

// Middleware to check if user has admin/finance privileges
const isAdminOrFinance = (req, res, next) => {
  const allowed = ['admin', 'principal', 'super_admin', 'master_admin', 'finance_manager'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Admin / Finance access required' });
  }
  next();
};

// Admin: Create Challan
router.post('/', verifyToken, isAdminOrFinance, async (req, res) => {
  try {
    const { student_id, title, amount, due_date, semester, academic_year, description } = req.body;
    const created_by = req.user.id;

    if (!student_id || !title || !amount || !due_date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Generate unique challan number
    const challan_number = `CH${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.query(
      `INSERT INTO challans (student_id, challan_number, title, amount, due_date, semester, academic_year, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, challan_number, title, amount, due_date, semester, academic_year, description, created_by]
    );

    // Audit log
    await logAudit({
      req,
      action: 'CHALLAN_CREATED',
      targetEntity: 'challans',
      targetId: result.insertId,
      details: { student_id, challan_number, amount }
    });

    res.status(201).json({
      success: true,
      message: 'Challan created successfully',
      challan: {
        id: result.insertId,
        challan_number
      }
    });
  } catch (error) {
    console.error('Create challan error:', error);
    res.status(500).json({ success: false, message: 'Error creating challan' });
  }
});

// Admin/Teacher: Get Student Challans
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Only admin or the student themselves can view
    if (!['admin', 'principal', 'super_admin', 'master_admin', 'finance_manager'].includes(req.user.role) && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [challans] = await pool.query(
      `SELECT ch.*, u.name as student_name
       FROM challans ch
       JOIN users u ON ch.student_id = u.id
       WHERE ch.student_id = ?
       ORDER BY ch.due_date DESC`,
      [studentId]
    );

    res.status(200).json({ success: true, challans });
  } catch (error) {
    console.error('Get student challans error:', error);
    res.status(500).json({ success: false, message: 'Error fetching challans' });
  }
});

// Student: Get My Challans
router.get('/my-challans', verifyToken, isStudent, async (req, res) => {
  try {
    const student_id = req.user.id;

    const [challans] = await pool.query(
      `SELECT * FROM challans
       WHERE student_id = ?
       ORDER BY due_date DESC`,
      [student_id]
    );

    res.status(200).json({ success: true, challans });
  } catch (error) {
    console.error('Get my challans error:', error);
    res.status(500).json({ success: false, message: 'Error fetching challans' });
  }
});

// Admin: Update Challan Payment Status
router.put('/:id/status', verifyToken, isAdminOrFinance, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method } = req.body;

    if (!payment_status) {
      return res.status(400).json({ success: false, message: 'Payment status required' });
    }

    const payment_date = payment_status === 'paid' ? new Date() : null;

    await pool.query(
      `UPDATE challans 
       SET payment_status = ?, payment_date = ?, payment_method = ?
       WHERE id = ?`,
      [payment_status, payment_date, payment_method, id]
    );

    // Audit log
    await logAudit({
      req,
      action: 'CHALLAN_STATUS_UPDATED',
      targetEntity: 'challans',
      targetId: id,
      details: { payment_status, payment_method }
    });

    res.status(200).json({ success: true, message: 'Challan status updated successfully' });
  } catch (error) {
    console.error('Update challan status error:', error);
    res.status(500).json({ success: false, message: 'Error updating challan status' });
  }
});

// Admin/Finance: Get All Challans with Pagination
router.get('/', verifyToken, isAdminOrFinance, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM challans');

    const [challans] = await pool.query(
      `SELECT ch.*, u.name as student_name, u.email as student_email
       FROM challans ch
       JOIN users u ON ch.student_id = u.id
       ORDER BY ch.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.status(200).json({ 
      success: true, 
      challans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all challans error:', error);
    res.status(500).json({ success: false, message: 'Error fetching challans' });
  }
});

module.exports = router;
