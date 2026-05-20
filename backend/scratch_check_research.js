const { pool } = require('./config/database');
async function checkResearch() {
  try {
    const [rows] = await pool.query('SELECT * FROM research_projects');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkResearch();
