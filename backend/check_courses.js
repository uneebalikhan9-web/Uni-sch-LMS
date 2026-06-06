const { pool } = require('./config/database'); 
async function run() {
  const [courses] = await pool.query('SELECT teacher_id FROM courses LIMIT 5');
  console.log(courses);
  process.exit(0);
}
run();
