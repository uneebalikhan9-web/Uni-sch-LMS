const { pool } = require('./config/database');

async function checkAdmissionsDB() {
  try {
    const [apps] = await pool.query(`DESCRIBE admission_applications`);
    console.log('admission_applications columns:', apps.map(c => c.Field));
    
    const [logs] = await pool.query(`DESCRIBE admission_logs`);
    console.log('admission_logs columns:', logs.map(c => c.Field));
    
    const [docs] = await pool.query(`DESCRIBE admission_documents`);
    console.log('admission_documents columns:', docs.map(c => c.Field));
    
    const [ints] = await pool.query(`DESCRIBE admission_interviews`);
    console.log('admission_interviews columns:', ints.map(c => c.Field));

  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkAdmissionsDB();
