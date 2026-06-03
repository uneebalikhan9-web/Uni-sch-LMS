const { pool } = require('./config/database');

async function checkData() {
  try {
    const [verifications] = await pool.query(`SELECT * FROM registrar_degree_verifications`);
    console.log('Verifications:', verifications);
    
    const [degrees] = await pool.query(`SELECT * FROM registrar_degrees`);
    console.log('Degrees:', degrees);
    
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

checkData();
