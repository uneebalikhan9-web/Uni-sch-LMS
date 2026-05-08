const { pool } = require('../config/database');

async function check() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables in DB:', tables);
    
    // Check if registrar_degree_verifications exists (it should)
    const [ver] = await pool.query('SHOW TABLES LIKE "registrar_degree_verifications"');
    console.log('Registrar Verifications exists:', ver.length > 0);

    // Check if admissions related tables exist
    const [adm] = await pool.query('SHOW TABLES LIKE "admissions_leads"');
    console.log('Admissions leads exists:', adm.length > 0);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
