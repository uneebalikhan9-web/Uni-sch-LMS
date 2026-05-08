const { pool } = require('../backend/config/database');
async function test() {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    console.log('Total Users:', totalUsers);
    
    const [[{ activeTickets }]] = await pool.query('SELECT COUNT(*) as activeTickets FROM it_tickets WHERE status != "Closed"');
    console.log('Active Tickets:', activeTickets);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
test();
