const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: String(process.env.DB_PASSWORD || process.env.DB_PASS || ''),
  database: process.env.DB_NAME || 'university_lms'
});

async function main() {
  try {
    console.log('Connecting to database...');
    const conn = await pool.getConnection();
    console.log('Connected! Fetching users...');

    const [users] = await conn.query('SELECT id, name, role FROM users');
    console.log('Found users in DB:', users.map(u => `${u.id}: ${u.name} (${u.role})`).join('\n'));

    // Filter to find teacher, principal, or any staff user to request leaves for
    const staffUsers = users.filter(u => ['teacher', 'principal', 'hr_manager', 'finance_manager'].includes(u.role));
    
    if (staffUsers.length < 2) {
      console.error('Not enough staff users found to seed leave requests!');
      process.exit(1);
    }

    const user1 = staffUsers[0];
    const user2 = staffUsers[1];

    console.log(`Selected ${user1.name} (${user1.role}, ID: ${user1.id}) and ${user2.name} (${user2.role}, ID: ${user2.id}) for seeding leaves...`);

    // Clear existing to avoid duplicate demo data
    await conn.query('DELETE FROM hr_leave_requests');

    // Insert pending leave requests
    await conn.query(`
      INSERT INTO hr_leave_requests (user_id, leave_type, start_date, end_date, status, reason) VALUES
      (?, 'Sick Leave', '2026-05-20', '2026-05-22', 'pending', 'Suffering from severe flu and high temperature.'),
      (?, 'Casual Leave', '2026-05-25', '2026-05-26', 'pending', 'Family emergency event at home town.')
    `, [user1.id, user2.id]);

    console.log('✅ Leave requests seeded successfully!');
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed leave requests:', err);
    process.exit(1);
  }
}

main();
