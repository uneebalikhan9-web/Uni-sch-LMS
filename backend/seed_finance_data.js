const { pool } = require('./config/database');

async function run() {
  try {
    console.log("Seeding Finance Data...");

    // Clean existing dummy / zero values to start fresh if needed
    await pool.query('DELETE FROM finance_challans WHERE campus_id = 1');
    await pool.query('DELETE FROM finance_payroll WHERE campus_id = 1');
    await pool.query('DELETE FROM finance_expenses WHERE campus_id = 1');

    // 1. Seed Challans
    const challans = [
      {
        student_id: 104,
        challan_no: 'LT-FEE-20260501-01',
        tuition_fee: 45000,
        lab_fee: 5000,
        library_fee: 2000,
        other_fee: 1000,
        total_amount: 53000,
        due_date: '2026-05-15',
        paid_date: '2026-05-12',
        status: 'paid',
        semester: 'Spring 2026',
        academic_year: '2026',
        notes: 'Paid via Bank Transfer'
      },
      {
        student_id: 105,
        challan_no: 'LT-FEE-20260501-02',
        tuition_fee: 42000,
        lab_fee: 4000,
        library_fee: 2000,
        other_fee: 1000,
        total_amount: 49000,
        due_date: '2026-05-15',
        paid_date: '2026-05-14',
        status: 'paid',
        semester: 'Spring 2026',
        academic_year: '2026',
        notes: 'Paid via EasyPaisa'
      },
      {
        student_id: 106,
        challan_no: 'LT-FEE-20260501-03',
        tuition_fee: 55000,
        lab_fee: 6000,
        library_fee: 3000,
        other_fee: 1000,
        total_amount: 65000,
        due_date: '2026-06-15',
        paid_date: null,
        status: 'pending',
        semester: 'Spring 2026',
        academic_year: '2026',
        notes: 'Pending fee submission'
      }
    ];

    for (const c of challans) {
      await pool.query(
        `INSERT INTO finance_challans 
        (student_id, challan_no, tuition_fee, lab_fee, library_fee, other_fee, total_amount, due_date, paid_date, status, semester, academic_year, notes, campus_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [c.student_id, c.challan_no, c.tuition_fee, c.lab_fee, c.library_fee, c.other_fee, c.total_amount, c.due_date, c.paid_date, c.status, c.semester, c.academic_year, c.notes]
      );
    }
    console.log("Successfully seeded 3 Challans!");

    // 2. Seed Expenses
    const expenses = [
      { title: 'Electricity Bill - Block A', category: 'utilities', amount: 18500, expense_date: '2026-05-10', description: 'Monthly commercial utility bill' },
      { title: 'High-Speed Fiber Internet', category: 'utilities', amount: 12000, expense_date: '2026-05-12', description: 'Campus main line internet subscription' },
      { title: 'Science Lab Glassware & Supplies', category: 'maintenance', amount: 24500, expense_date: '2026-05-14', description: 'Chemical reagents and lab upgrade glassware' }
    ];

    for (const e of expenses) {
      await pool.query(
        `INSERT INTO finance_expenses 
        (title, category, amount, expense_date, description, campus_id, added_by) 
        VALUES (?, ?, ?, ?, ?, 1, 3)`,
        [e.title, e.category, e.amount, e.expense_date, e.description]
      );
    }
    console.log("Successfully seeded 3 Expenses!");

    // 3. Seed Payroll
    const payroll = [
      { employee_id: 1, month: 'May', year: 2026, basic_salary: 120000, bonus: 10000, deductions: 5000, net_payable: 125000, status: 'disbursed', disbursed_at: '2026-05-01 10:00:00' },
      { employee_id: 3, month: 'May', year: 2026, basic_salary: 80000, bonus: 5000, deductions: 3000, net_payable: 82000, status: 'disbursed', disbursed_at: '2026-05-01 11:30:00' },
      { employee_id: 4, month: 'May', year: 2026, basic_salary: 75000, bonus: 0, deductions: 2000, net_payable: 73000, status: 'pending', disbursed_at: null }
    ];

    for (const p of payroll) {
      await pool.query(
        `INSERT INTO finance_payroll 
        (employee_id, month, year, basic_salary, bonus, deductions, net_payable, status, disbursed_at, campus_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [p.employee_id, p.month, p.year, p.basic_salary, p.bonus, p.deductions, p.net_payable, p.status, p.disbursed_at]
      );
    }
    console.log("Successfully seeded 3 Payroll records!");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}
run();
