const { pool } = require('./config/database');

async function seed() {
  try {
    await pool.query(`
      INSERT INTO institutional_kpis (metric_name, metric_value) 
      VALUES 
        ('overall_gpa', 3.42), 
        ('retention_rate', 94.5), 
        ('research_grants', 1200000), 
        ('employment_rate', 88.0)
    `);
    console.log('KPIs inserted');
  } catch(e) {
    console.log('KPIs insert error (might exist):', e.message);
  }

  try {
    await pool.query("UPDATE programs SET accreditation_status = 'HEC Approved' LIMIT 5");
    console.log('Programs updated');
  } catch(e) {
    console.log(e);
  }

  process.exit(0);
}

seed();
