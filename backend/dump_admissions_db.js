const { pool } = require('./config/database');

async function dumpAdmissionsDB() {
  try {
    const [apps] = await pool.query(`SELECT * FROM admission_applications`);
    console.log('Apps:', apps);
    
    const [logs] = await pool.query(`SELECT * FROM admission_logs`);
    console.log('Logs:', logs);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

dumpAdmissionsDB();
