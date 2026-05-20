const { pool } = require('../config/database');

async function run() {
  try {
    const [books] = await pool.query('DESCRIBE library_books');
    const [members] = await pool.query('DESCRIBE library_members');
    const [transactions] = await pool.query('DESCRIBE library_transactions');
    console.log('library_books columns:');
    console.log(books.map(c => `${c.Field} (${c.Type})` + (c.Null === 'NO' ? ' NOT NULL' : '')));
    console.log('\nlibrary_members columns:');
    console.log(members.map(c => `${c.Field} (${c.Type})` + (c.Null === 'NO' ? ' NOT NULL' : '')));
    console.log('\nlibrary_transactions columns:');
    console.log(transactions.map(c => `${c.Field} (${c.Type})` + (c.Null === 'NO' ? ' NOT NULL' : '')));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
