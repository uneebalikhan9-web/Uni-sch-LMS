const { pool } = require('../config/database');

async function run() {
  try {
    const [books] = await pool.query('SELECT COUNT(*) as count FROM books');
    const [issues] = await pool.query('SELECT COUNT(*) as count FROM book_issues');
    const [members] = await pool.query('SELECT COUNT(*) as count FROM library_members');
    console.log('DB Counts:');
    console.log('Books:', books[0].count);
    console.log('Issues:', issues[0].count);
    console.log('Members:', members[0].count);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
