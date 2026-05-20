const { pool } = require('./config/database');
async function checkTables() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log("Existing Tables:");
    console.log(JSON.stringify(tables, null, 2));
    
    const requiredTables = [
      'institutional_kpis',
      'research_projects',
      'attendance',
      'exam_results',
      'departments',
      'programs',
      'students',
      'employees'
    ];
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkTables();
