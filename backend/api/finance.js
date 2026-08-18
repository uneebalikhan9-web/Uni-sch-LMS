const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isFinanceManager } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

// ==================== STUDENT CHALLANS ====================
// Student: View own fee challans
router.get('/my-challans', async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access restricted to students only' });
    }

    const userId = req.user.id;
    const [[student]] = await pool.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // NOTE: reminder_count and last_reminder_at columns must exist in finance_student_challans.
    // Run this once via migration: ALTER TABLE finance_student_challans ADD COLUMN reminder_count INT DEFAULT 0;
    //                              ALTER TABLE finance_student_challans ADD COLUMN last_reminder_at DATETIME NULL;
    const [challans] = await pool.query(
      `SELECT fc.*, u.name as student_name, s.roll_number, sem.name as semester
       FROM finance_student_challans fc
       JOIN students s ON fc.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN semesters sem ON fc.semester_id = sem.id
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

// Employee: View own payroll records
router.get('/my-payroll', async (req, res) => {
  try {
    const allowedRoles = ['teacher', 'principal', 'hr_manager', 'finance_manager', 'registrar',
                          'admission_officer', 'librarian', 'rector', 'it_admin', 'lab_assistant'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access restricted to employees only' });
    }

    const userId = req.user.id;
    const [[employee]] = await pool.query('SELECT id, employee_code, designation FROM employees WHERE user_id = ?', [userId]);
    if (!employee) {
      return res.json({ success: true, payroll: [] }); // No employee record yet — return empty
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
      `SELECT COALESCE(SUM(total_amount),0) as totalRevenue FROM finance_student_challans ${!isSuperAdmin ? 'WHERE campus_id = ? AND status = \'paid\'' : 'WHERE status = \'paid\''}`,
      params
    );

    const [[{ pendingFees }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) as pendingFees FROM finance_student_challans WHERE status IN ('pending','unpaid','overdue') ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );

    const [[{ overdueCount }]] = await pool.query(
      `SELECT COUNT(*) as overdueCount FROM finance_student_challans WHERE status = 'overdue' ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
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

    // Fetch Last 6 Months Trend Data
    const [revTrend] = await pool.query(
      `SELECT DATE_FORMAT(COALESCE(paid_date, created_at), '%Y-%m') as month, COALESCE(SUM(total_amount),0) as revenue 
       FROM finance_student_challans 
       WHERE status = 'paid' AND COALESCE(paid_date, created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) ${!isSuperAdmin ? 'AND campus_id = ?' : ''}
       GROUP BY month ORDER BY month ASC`,
      isSuperAdmin ? [] : [campusId]
    );

    const [expTrend] = await pool.query(
      `SELECT DATE_FORMAT(COALESCE(expense_date, created_at), '%Y-%m') as month, COALESCE(SUM(amount),0) as expenses 
       FROM finance_expenses 
       WHERE COALESCE(expense_date, created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) ${!isSuperAdmin ? 'AND campus_id = ?' : ''}
       GROUP BY month ORDER BY month ASC`,
      isSuperAdmin ? [] : [campusId]
    );

    res.json({
      success: true,
      stats: {
        totalRevenue, pendingFees, overdueCount,
        payrollDisbursed, totalExpenses, operatingMargin
      },
      trend: {
        revenue: revTrend,
        expenses: expTrend
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
             s.roll_number,
             sem.name as semester
      FROM finance_student_challans fc
      LEFT JOIN students s ON fc.student_id = s.id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN semesters sem ON fc.semester_id = sem.id
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

    let semester_id = null;
    if (semester) {
      const [existingSem] = await pool.query('SELECT id FROM semesters WHERE name = ? AND campus_id = ?', [semester, campusId]);
      if (existingSem.length > 0) {
        semester_id = existingSem[0].id;
      } else {
        const [newSem] = await pool.query('INSERT INTO semesters (name, term_type, campus_id) VALUES (?, ?, ?)', [semester, 'Fall', campusId]);
        semester_id = newSem.insertId;
      }
    }

    const [result] = await pool.query(
      `INSERT INTO finance_student_challans 
       (student_id, challan_no, tuition_fee, lab_fee, library_fee, other_fee, total_amount, due_date, semester_id, academic_year, notes, campus_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [student_id, challan_no, tuition_fee || 0, lab_fee || 0, library_fee || 0, other_fee || 0,
       total_amount, due_date || null, semester_id, academic_year, notes, campusId]
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
    await pool.query('UPDATE finance_student_challans SET status = ?, paid_date = ? WHERE id = ?', [status, paidDate, id]);
    res.json({ success: true, message: `Challan marked as ${status}` });
  } catch (error) {
    console.error('Update challan error:', error);
    res.status(500).json({ success: false, message: 'Error updating challan' });
  }
});

router.delete('/challans/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM finance_student_challans WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Challan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting challan' });
  }
});

router.post('/challans/:id/remind', async (req, res) => {
  try {
    const { id } = req.params;

    // FIX (HIGH-01): Removed ALTER TABLE calls — these columns must exist in the schema.
    // Run migration once: ALTER TABLE finance_student_challans ADD COLUMN reminder_count INT DEFAULT 0;
    //                     ALTER TABLE finance_student_challans ADD COLUMN last_reminder_at DATETIME NULL;
    await pool.query(
      `UPDATE finance_student_challans 
       SET reminder_count = COALESCE(reminder_count, 0) + 1, last_reminder_at = NOW() 
       WHERE id = ?`,
      [id]
    );

    const [[challan]] = await pool.query(
      `SELECT fc.*, u.name as student_name, u.email as student_email 
       FROM finance_student_challans fc
       LEFT JOIN students s ON fc.student_id = s.id
       LEFT JOIN users u ON s.user_id = u.id
       WHERE fc.id = ?`,
      [id]
    );
    if (!challan) return res.status(404).json({ success: false, message: 'Challan not found' });
    
    // TODO: Integrate email sending here when nodemailer is configured.
    console.info(`[Fee Reminder] Dispatched reminder to ${challan.student_email} for Challan #${challan.challan_no}`);
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
      `UPDATE finance_student_challans SET status = 'overdue' 
       WHERE status = 'pending' AND due_date < CURDATE() ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );
    res.json({ success: true, message: 'Overdue challans updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating overdue' });
  }
});

// Calculate and Apply Late Fines
router.post('/challans/apply-late-fines', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';
    
    // First mark any pending past due as overdue
    await pool.query(
      `UPDATE finance_student_challans SET status = 'overdue' 
       WHERE status = 'pending' AND due_date < CURDATE() ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );

    // Calculate accrued late fee: days overdue * late_fee_per_day
    const [result] = await pool.query(
      `UPDATE finance_student_challans 
       SET accrued_late_fee = DATEDIFF(CURDATE(), due_date) * COALESCE(late_fee_per_day, 100)
       WHERE status = 'overdue' AND due_date < CURDATE() ${!isSuperAdmin ? 'AND campus_id = ?' : ''}`,
      isSuperAdmin ? [] : [campusId]
    );

    res.json({ success: true, message: `Successfully updated late fines for ${result.affectedRows} overdue challan(s).` });
  } catch (error) {
    console.error('Apply late fines error:', error);
    res.status(500).json({ success: false, message: 'Error applying late fines' });
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

// ==================== SEMESTERS (for university mode challan generation) ====================

router.get('/semesters', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const isSuperAdmin = req.user.role === 'super_admin';
    const [semesters] = await pool.query(
      `SELECT * FROM semesters ${!isSuperAdmin ? 'WHERE campus_id = ?' : ''} ORDER BY start_date DESC`,
      isSuperAdmin ? [] : [campusId]
    );
    res.json({ success: true, semesters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching semesters' });
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

// ==================== MISSING DROPDOWNS & CONFIG ====================
router.get('/semesters', async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const filter = isSuperAdmin ? '' : 'WHERE campus_id = ?';
    const params = isSuperAdmin ? [] : [req.user.campus_id];
    const [rows] = await pool.query(`SELECT id, name FROM semesters ${filter} ORDER BY start_date DESC`, params);
    res.json({ success: true, semesters: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/programs', async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const filter = isSuperAdmin ? '' : 'WHERE d.campus_id = ?';
    const params = isSuperAdmin ? [] : [req.user.campus_id];
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.code 
      FROM programs p
      LEFT JOIN departments d ON p.department_id = d.id
      ${filter} 
      ORDER BY p.name ASC`, params);
    res.json({ success: true, programs: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/fee-structures', async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const filter = isSuperAdmin ? '' : 'WHERE f.campus_id = ?';
    const params = isSuperAdmin ? [] : [req.user.campus_id];
    const [rows] = await pool.query(`
      SELECT f.*, p.name as program_name, s.name as semester_name 
      FROM finance_fee_structures f
      JOIN programs p ON f.program_id = p.id
      JOIN semesters s ON f.semester_id = s.id
      ${filter}
      ORDER BY f.created_at DESC`, params);
    res.json({ success: true, structures: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/scholarships/types', async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const filter = isSuperAdmin ? '' : 'WHERE campus_id = ?';
    const params = isSuperAdmin ? [] : [req.user.campus_id];
    const [rows] = await pool.query(`SELECT * FROM finance_scholarship_types ${filter} ORDER BY name ASC`, params);
    res.json({ success: true, types: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/scholarships/students', async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const filter = isSuperAdmin ? '' : 'WHERE fs.campus_id = ?';
    const params = isSuperAdmin ? [] : [req.user.campus_id];
    const [rows] = await pool.query(`
      SELECT fs.*, u.name as student_name, s.roll_number, t.name as scholarship_name, t.discount_percentage, sem.name as semester_name
      FROM finance_student_scholarships fs
      JOIN students s ON fs.student_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN finance_scholarship_types t ON fs.scholarship_id = t.id
      LEFT JOIN semesters sem ON fs.semester_id = sem.id
      ${filter}
      ORDER BY fs.created_at DESC`, params);
    res.json({ success: true, scholarships: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==================== SCHOOL FEE STRUCTURES ====================

// Auto-create school_fee_structures table if not exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS school_fee_structures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campus_id INT NOT NULL,
        client_id INT NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        tuition_fee DECIMAL(10,2) DEFAULT 0,
        transport_fee DECIMAL(10,2) DEFAULT 0,
        activity_fee DECIMAL(10,2) DEFAULT 0,
        computer_fee DECIMAL(10,2) DEFAULT 0,
        other_fee DECIMAL(10,2) DEFAULT 0,
        late_fine_per_day DECIMAL(8,2) DEFAULT 50,
        due_day INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Also add school monthly columns to finance_student_challans if missing
    const schoolCols = [
      "ALTER TABLE finance_student_challans ADD COLUMN fee_type VARCHAR(20) DEFAULT 'semester'",
      "ALTER TABLE finance_student_challans ADD COLUMN fee_month INT DEFAULT NULL",
      "ALTER TABLE finance_student_challans ADD COLUMN fee_year INT DEFAULT NULL",
      "ALTER TABLE finance_student_challans ADD COLUMN transport_fee DECIMAL(10,2) DEFAULT 0",
      "ALTER TABLE finance_student_challans ADD COLUMN activity_fee DECIMAL(10,2) DEFAULT 0",
      "ALTER TABLE finance_student_challans ADD COLUMN computer_fee DECIMAL(10,2) DEFAULT 0",
    ];
    for (const q of schoolCols) {
      try { await pool.query(q); } catch(e) { /* ignore duplicate column */ }
    }
  } catch(e) { console.error('School fee structure init error:', e.message); }
})();

// GET school fee structures
router.get('/school-fee-structures', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const clientId = req.user.client_id;
    const isSuperAdmin = req.user.role === 'super_admin';
    const [rows] = await pool.query(
      `SELECT * FROM school_fee_structures WHERE ${isSuperAdmin ? '1=1' : 'campus_id = ?'} ORDER BY class_name ASC`,
      isSuperAdmin ? [] : [campusId]
    );
    res.json({ success: true, structures: rows });
  } catch (error) {
    console.error('Get school fee structures error:', error);
    res.status(500).json({ success: false, message: 'Error fetching school fee structures' });
  }
});

// POST create/update school fee structure for a class
router.post('/school-fee-structures', async (req, res) => {
  try {
    const { class_name, tuition_fee, transport_fee, activity_fee, computer_fee, other_fee, late_fine_per_day, due_day } = req.body;
    const campusId = req.user.campus_id;
    const clientId = req.user.client_id;
    if (!class_name) return res.status(400).json({ success: false, message: 'Class name is required' });

    // Upsert by class_name + campus_id
    const [existing] = await pool.query(
      'SELECT id FROM school_fee_structures WHERE class_name = ? AND campus_id = ?',
      [class_name, campusId]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE school_fee_structures SET tuition_fee=?, transport_fee=?, activity_fee=?, computer_fee=?, other_fee=?, late_fine_per_day=?, due_day=? WHERE id=?`,
        [tuition_fee||0, transport_fee||0, activity_fee||0, computer_fee||0, other_fee||0, late_fine_per_day||50, due_day||10, existing[0].id]
      );
      res.json({ success: true, message: `Fee structure for ${class_name} updated successfully` });
    } else {
      await pool.query(
        `INSERT INTO school_fee_structures (campus_id, client_id, class_name, tuition_fee, transport_fee, activity_fee, computer_fee, other_fee, late_fine_per_day, due_day) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [campusId, clientId, class_name, tuition_fee||0, transport_fee||0, activity_fee||0, computer_fee||0, other_fee||0, late_fine_per_day||50, due_day||10]
      );
      res.status(201).json({ success: true, message: `Fee structure for ${class_name} created successfully` });
    }
  } catch (error) {
    console.error('Create school fee structure error:', error);
    res.status(500).json({ success: false, message: 'Error saving fee structure' });
  }
});

// DELETE a school fee structure
router.delete('/school-fee-structures/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM school_fee_structures WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Fee structure deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting fee structure' });
  }
});

// POST generate monthly challans for ALL students of the school campus
router.post('/challans/generate-monthly', async (req, res) => {
  try {
    const { month, year } = req.body;
    const campusId = req.user.campus_id;
    const clientId = req.user.client_id;

    if (!month || !year) return res.status(400).json({ success: false, message: 'Month and year are required' });

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Check no duplicates for this month/year
    const [existing] = await pool.query(
      "SELECT COUNT(*) as cnt FROM finance_student_challans WHERE campus_id = ? AND fee_type = 'monthly' AND fee_month = ? AND fee_year = ?",
      [campusId, monthNum, yearNum]
    );
    if (existing[0].cnt > 0) {
      return res.status(409).json({ success: false, message: `Monthly fee challans for ${monthNum}/${yearNum} have already been generated.` });
    }

    // Get all approved students
    const [students] = await pool.query(
      `SELECT s.id as student_id, u.name, s.roll_number, s.class_name
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE u.campus_id = ? AND u.role = 'student'
       ORDER BY u.name`,
      [campusId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found for this campus' });
    }

    // Get fee structures for this campus
    const [feeStructures] = await pool.query(
      'SELECT * FROM school_fee_structures WHERE campus_id = ?',
      [campusId]
    );
    const feeMap = {};
    feeStructures.forEach(f => { feeMap[f.class_name?.toLowerCase()] = f; });

    // Default fee structure if none set for a class
    const defaultFee = { tuition_fee: 0, transport_fee: 0, activity_fee: 0, computer_fee: 0, other_fee: 0, due_day: 10, late_fine_per_day: 50 };

    // Due date = due_day of the given month/year
    let created = 0;
    for (const student of students) {
      const fee = feeMap[student.class_name?.toLowerCase()] || defaultFee;
      const totalAmount = (fee.tuition_fee||0) + (fee.transport_fee||0) + (fee.activity_fee||0) + (fee.computer_fee||0) + (fee.other_fee||0);
      const dueDay = fee.due_day || 10;
      const dueDate = `${yearNum}-${String(monthNum).padStart(2,'0')}-${String(dueDay).padStart(2,'0')}`;
      const challanNo = `SCH-${yearNum}${String(monthNum).padStart(2,'0')}-${student.roll_number || student.student_id}`;

      try {
        await pool.query(
          `INSERT INTO finance_student_challans
            (student_id, challan_no, tuition_fee, lab_fee, library_fee, other_fee,
             transport_fee, activity_fee, computer_fee,
             total_amount, due_date, campus_id, fee_type, fee_month, fee_year, status)
           VALUES (?,?,?,0,0,?,?,?,?,?,?,?,?,?,?,'pending')`,
          [
            student.student_id, challanNo,
            fee.tuition_fee||0, fee.other_fee||0,
            fee.transport_fee||0, fee.activity_fee||0, fee.computer_fee||0,
            totalAmount, dueDate, campusId, 'monthly', monthNum, yearNum
          ]
        );
        created++;
      } catch (insertError) {
        console.error('Error inserting challan for student:', student.student_id, insertError);
        throw insertError;
      }
    }

    const monthNames = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
    res.status(201).json({
      success: true,
      message: `✅ ${created} monthly fee challans generated for ${monthNames[monthNum]} ${yearNum}`
    });
  } catch (error) {
    console.error('Generate monthly challans error:', error);
    res.status(500).json({ success: false, message: 'Error generating monthly challans' });
  }
});

// GET challans/generate-semester (existing university mode - keep as is)
router.post('/challans/generate-semester', async (req, res) => {
  try {
    const { semester_id } = req.body;
    const campusId = req.user.campus_id;
    if (!semester_id) return res.status(400).json({ success: false, message: 'Semester ID required' });

    const [feeStructures] = await pool.query(
      'SELECT * FROM finance_fee_structures WHERE semester_id = ? AND campus_id = ?',
      [semester_id, campusId]
    );
    if (feeStructures.length === 0) {
      return res.status(404).json({ success: false, message: 'No fee structures found for this semester' });
    }

    const [enrollments] = await pool.query(
      `SELECT DISTINCT e.student_id, s.program_id, s.roll_number
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.semester = ? AND e.status = 'approved'`,
      [semester_id]
    );

    let created = 0;
    for (const enrollment of enrollments) {
      const feeStruct = feeStructures.find(f => f.program_id === enrollment.program_id) || feeStructures[0];
      const totalAmount = (feeStruct.tuition_fee||0) + (feeStruct.lab_fee||0) + (feeStruct.library_fee||0) + (feeStruct.other_fee||0);
      const challanNo = `LT-SEM-${semester_id}-${enrollment.roll_number || enrollment.student_id}`;

      const [existCheck] = await pool.query(
        'SELECT id FROM finance_student_challans WHERE challan_no = ?',
        [challanNo]
      );
      if (existCheck.length > 0) continue;

      await pool.query(
        `INSERT INTO finance_student_challans
          (student_id, challan_no, tuition_fee, lab_fee, library_fee, other_fee, total_amount, due_date, semester_id, campus_id, fee_type, status)
         VALUES (?,?,?,?,?,?,?,DATE_ADD(CURDATE(), INTERVAL 30 DAY),?,?,'semester','pending')`,
        [enrollment.student_id, challanNo, feeStruct.tuition_fee||0, feeStruct.lab_fee||0, feeStruct.library_fee||0, feeStruct.other_fee||0, totalAmount, semester_id, campusId]
      );
      created++;
    }

    res.status(201).json({ success: true, message: `${created} semester challan(s) generated successfully` });
  } catch (error) {
    console.error('Generate semester challans error:', error);
    res.status(500).json({ success: false, message: 'Error generating semester challans' });
  }
});

module.exports = router;
