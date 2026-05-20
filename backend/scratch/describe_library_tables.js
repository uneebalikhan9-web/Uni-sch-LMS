const { pool } = require('../config/database');

async function run() {
  try {
    const [books] = await pool.query('DESCRIBE books');
    const [issues] = await pool.query('DESCRIBE book_issues');
    const [members] = await pool.query('DESCRIBE library_members');
    console.log('Books table columns:');
    console.log(books.map(c => `${c.Field} (${c.Type})` + (c.Null === 'NO' ? ' NOT NULL' : '')));
    console.log('\nBook Issues table columns:');
    console.log(issues.map(c => `${c.Field} (${c.Type})` + (c.Null === 'NO' ? ' NOT NULL' : '')));
    console.log('\nLibrary Members table columns:');
    console.log(members.map(c => `${c.Field} (${c.Type})` + (c.Null === 'NO' ? ' NOT NULL' : '')));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
