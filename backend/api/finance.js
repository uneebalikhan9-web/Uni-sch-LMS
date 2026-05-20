const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isFinanceManager } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

// ==================== STUDENT CHALLANS ====================
router.get('/my-challans', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[student]] = await pool.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }
    
    try {
      await pool.query(`ALTER TABLE finance_challans ADD COLUMN reminder_count INT DEFAULT 0`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE finance_challans ADD COLUMN last_reminder_at DATETIME NULL`);
    } catch (e) {}

    const [challans] = await pool.query(
      `SELECT fc.*, u.name as student_name, s.roll_number
       FROM finance_challans fc
       JOIN students s ON fc.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE fc.student_id = ?
       ORDER BY fc.created_at DESC`,
      [student.id]
    );
    res.json({ success: true, challans });
  } catch (error) {
    console.error('Error fetching student challans:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== EMPLOYEE PAYROLL ====================
router.get('/my-payroll', async (req, res) => {
  try {
    const userId = req.user.id;
    const [[employee]] = await pool.query('SELECT id, employee_code, designation FROM employees WHERE user_id = ?', [userId]);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    const [payroll] = await pool.query(
      `SELECT fp.*, u.name as employee_name, e.employee_code, e.designation
       FROM finance_payroll fp
       JOIN employees e ON fp.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       WHERE fp.employee_id = ?
       ORDER BY fp.year DESC, fp.month DESC`,
      [employee.id]
    );
    res.json({ success: true, payroll });
  } catch (error) {
    console.error('Error fetching employee payroll:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== CAMPUS EXPENSES (Read-only for all employees) ====================
router.get('/expenses', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';

    const [expenses] = await pool.query(
      `SELECT fe.*, u.name as added_by_name 
       FROM finance_expenses fe 
       LEFT JOIN users u ON fe.added_by = u.id
       ${!isSuperAdmin ? 'WHERE fe.campus_id = ?' : ''}
       ORDER BY fe.created_at DESC`,
      isSuperAdmin ? [] : [campusId]
    );
    res.json({ success: true, expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching expenses' });
  }
});

router.use(isFinanceManager);

// ==================== OVERVIEW ====================

router.get('/overview', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';
    const filter = isSuperAdmin ? '' : 'WHERE campus_id = ?';
    const params = isSuperAdmin ? [] : [campusId];

    const challanFilter = isSuperAdmin ? '' : 'WHERE fc.campus_id = ?';

    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) as totalRevenue FROM finance_challans ${!isSuperAdmin ? 'WHERE campus_id = ? AND status = \'paid\'' : 'WHERE status = \'paid\''}`,
      params
    );

    const [[{ pendingFees }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) as pendingFees FROM finance_challans WHERE status IN ('pending','overdue') ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );

    const [[{ overdueCount }]] = await pool.query(
      `SELECT COUNT(*) as overdueCount FROM finance_challans WHERE status = 'overdue' ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );

    const [[{ payrollDisbursed }]] = await pool.query(
      `SELECT COALESCE(SUM(net_payable),0) as payrollDisbursed FROM finance_payroll WHERE status = 'disbursed' ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );

    const [[{ totalExpenses }]] = await pool.query(
      `SELECT COALESCE(SUM(amount),0) as totalExpenses FROM finance_expenses ${!isSuperAdmin ? 'WHERE campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );

    const operatingMargin = totalRevenue > 0
      ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      stats: {
        totalRevenue, pendingFees, overdueCount,
        payrollDisbursed, totalExpenses, operatingMargin
      }
    });
  } catch (error) {
    console.error('Finance overview error:', error);
    res.status(500).json({ success: false, message: 'Error fetching finance overview' });
  }
});

// ==================== FEE CHALLANS ====================

router.get('/challans', async (req, res) => {
  try {
    const { status, search } = req.query;
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';

    let query = `
      SELECT fc.*, 
             u.name as student_name, 
             u.email as student_email,
             s.roll_number
      FROM finance_challans fc
      LEFT JOIN students s ON fc.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (!isSuperAdmin) {
      query += ' AND fc.campus_id = ?';
      params.push(campusId);
    }
    if (status && status !== 'all') {
      query += ' AND fc.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (u.name LIKE ? OR s.roll_number LIKE ? OR fc.challan_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY fc.created_at DESC';
    const [challans] = await pool.query(query, params);
    res.json({ success: true, challans });
  } catch (error) {
    console.error('Get challans error:', error);
    res.status(500).json({ success: false, message: 'Error fetching challans' });
  }
});

router.post('/challans', async (req, res) => {
  try {
    const { student_id, tuition_fee, lab_fee, library_fee, other_fee, due_date, semester, academic_year, notes } = req.body;
    const campusId = req.user.campus_id;

    if (!student_id) return res.status(400).json({ success: false, message: 'Student ID is required' });

    const total_amount = (parseFloat(tuition_fee) || 0) + (parseFloat(lab_fee) || 0) +
                         (parseFloat(library_fee) || 0) + (parseFloat(other_fee) || 0);

    // Generate unique challan number
    const challan_no = `LT-FEE-${Date.now()}`;

    const [result] = await pool.query(
      `INSERT INTO finance_challans 
       (student_id, challan_no, tuition_fee, lab_fee, library_fee, other_fee, total_amount, due_date, semester, academic_year, notes, campus_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [student_id, challan_no, tuition_fee || 0, lab_fee || 0, library_fee || 0, other_fee || 0,
       total_amount, due_date || null, semester, academic_year, notes, campusId]
    );

    res.status(201).json({ success: true, message: 'Challan created successfully', id: result.insertId, challan_no });
  } catch (error) {
    console.error('Create challan error:', error);
    res.status(500).json({ success: false, message: 'Error creating challan' });
  }
});

router.put('/challans/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'overdue', 'waived'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const paidDate = status === 'paid' ? new Date().toISOString().split('T')[0] : null;
    await pool.query('UPDATE finance_challans SET status = ?, paid_date = ? WHERE id = ?', [status, paidDate, id]);
    res.json({ success: true, message: `Challan marked as ${status}` });
  } catch (error) {
    console.error('Update challan error:', error);
    res.status(500).json({ success: false, message: 'Error updating challan' });
  }
});

router.delete('/challans/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM finance_challans WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Challan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting challan' });
  }
});

router.post('/challans/:id/remind', async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      await pool.query(`ALTER TABLE finance_challans ADD COLUMN reminder_count INT DEFAULT 0`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE finance_challans ADD COLUMN last_reminder_at DATETIME NULL`);
    } catch (e) {}

    await pool.query(
      `UPDATE finance_challans 
       SET reminder_count = reminder_count + 1, last_reminder_at = NOW() 
       WHERE id = ?`,
      [id]
    );

    const [[challan]] = await pool.query(
      `SELECT fc.*, u.name as student_name, u.email as student_email 
       FROM finance_challans fc
       LEFT JOIN students s ON fc.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE fc.id = ?`,
      [id]
    );
    if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' });
    
    console.log(`[Fee Reminder] Dispatched email reminder to ${challan.student_email} for Challan #${challan.challan_no}`);
    res.json({ 
      success: true, 
      message: `Reminder successfully dispatched to ${challan.student_name} (${challan.student_email})!` 
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ success: false, message: 'Error sending reminder' });
  }
});

// Mark overdue automatically (run on fetch)
router.post('/challans/mark-overdue', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';
    await pool.query(
      `UPDATE finance_challans SET status = 'overdue' 
       WHERE status = 'pending' AND due_date < CURDATE() ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );
    res.json({ success: true, message: 'Overdue challans updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating overdue' });
  }
});

// ==================== PAYROLL ====================

router.get('/payroll', async (req, res) => {
  try {
    const { month, year } = req.query;
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';

    let query = `
      SELECT fp.*, 
             u.name as employee_name, 
             u.email as employee_email,
             e.designation,
             e.employee_code
      FROM finance_payroll fp
      LEFT JOIN employees e ON fp.employee_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (!isSuperAdmin) { query += ' AND fp.campus_id = ?'; params.push(campusId); }
    if (month) { query += ' AND fp.month = ?'; params.push(month); }
    if (year) { query += ' AND fp.year = ?'; params.push(year); }

    query += ' ORDER BY fp.created_at DESC';
    const [payroll] = await pool.query(query, params);
    res.json({ success: true, payroll });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({ success: false, message: 'Error fetching payroll' });
  }
});

router.post('/payroll', async (req, res) => {
  try {
    const { employee_id, month, year, basic_salary, bonus, deductions } = req.body;
    const campusId = req.user.campus_id;
    if (!employee_id || !month || !year) return res.status(400).json({ success: false, message: 'Employee, month, and year are required' });

    const net_payable = (parseFloat(basic_salary) || 0) + (parseFloat(bonus) || 0) - (parseFloat(deductions) || 0);

    const [result] = await pool.query(
      'INSERT INTO finance_payroll (employee_id, month, year, basic_salary, bonus, deductions, net_payable, campus_id) VALUES (?,?,?,?,?,?,?,?)',
      [employee_id, month, year, basic_salary || 0, bonus || 0, deductions || 0, net_payable, campusId]
    );
    res.status(201).json({ success: true, message: 'Payroll record created', id: result.insertId });
  } catch (error) {
    console.error('Create payroll error:', error);
    res.status(500).json({ success: false, message: 'Error creating payroll' });
  }
});

router.post('/payroll/:id/disburse', async (req, res) => {
  try {
    await pool.query(
      "UPDATE finance_payroll SET status = 'disbursed', disbursed_at = NOW() WHERE id = ?",
      [req.params.id]
    );
    res.json({ success: true, message: 'Salary disbursed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error disbursing salary' });
  }
});

router.post('/payroll/disburse-all', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';
    await pool.query(
      `UPDATE finance_payroll SET status = 'disbursed', disbursed_at = NOW() WHERE status = 'pending' ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );
    res.json({ success: true, message: 'All pending salaries disbursed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error disbursing salaries' });
  }
});

// ==================== EXPENSES ====================

router.post('/expenses', async (req, res) => {
  try {
    const { title, category, amount, expense_date, description } = req.body;
    const campusId = req.user.campus_id;
    if (!title || !amount) return res.status(400).json({ success: false, message: 'Title and amount required' });

    const [result] = await pool.query(
      'INSERT INTO finance_expenses (title, category, amount, expense_date, description, campus_id, added_by) VALUES (?,?,?,?,?,?,?)',
      [title, category || 'other', amount, expense_date || null, description, campusId, req.user.id]
    );
    res.status(201).json({ success: true, message: 'Expense recorded', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error recording expense' });
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM finance_expenses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting expense' });
  }
});

// ==================== STUDENTS LIST (for challan creation) ====================

router.get('/students-list', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';

    const [students] = await pool.query(
      `SELECT s.id, u.name, u.email, s.roll_number
       FROM students s
       JOIN users u ON s.user_id = u.id
       ${!isSuperAdmin ? 'WHERE u.campus_id = ?' : ''}
       ORDER BY u.name`,
      isSuperAdmin ? [] : [campusId]
    );
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// ==================== EMPLOYEES LIST (for payroll creation) ====================

router.get('/employees-list', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';

    const [employees] = await pool.query(
      `SELECT e.id, u.name, u.email, e.designation, e.employee_code
       FROM employees e
       JOIN users u ON e.user_id = u.id
       ${!isSuperAdmin ? 'WHERE u.campus_id = ?' : ''}
       ORDER BY u.name`,
      isSuperAdmin ? [] : [campusId]
    );
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching employees' });
  }
});

module.exports = router;
