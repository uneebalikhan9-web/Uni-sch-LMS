const { pool } = require('./config/database');

async function run() {
  try {
    const [cCols] = await pool.query('DESCRIBE finance_challans');
    console.log("finance_challans columns:", cCols.map(c => c.Field));

    const [pCols] = await pool.query('DESCRIBE finance_payroll');
    console.log("finance_payroll columns:", pCols.map(c => c.Field));

    const [eCols] = await pool.query('DESCRIBE finance_expenses');
    console.log("finance_expenses columns:", eCols.map(c => c.Field));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
