const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Security Gate: Prevent accidental data wipe in production
if (process.env.NODE_ENV === 'production') {
  console.error('\n❌ [CRITICAL] Seed scripts are DISABLED in production environment to prevent data loss.');
  process.exit(1);
}
require('dotenv').config({ path: './backend/.env' });

async function seedSuperAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'LancersNexus_MasterCore'
  });

  try {
    const email = 'superadmin@lms.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('🚀 Seeding Super Admin...');

    // First, ensure a default campus exists
    const [campusResult] = await connection.query(
      'INSERT IGNORE INTO campuses (id, name, location, is_active) VALUES (1, "Main Campus", "Headquarters", 1)'
    );

    // Check if user exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      await connection.query('UPDATE users SET password = ?, role = "super_admin", is_approved = 1 WHERE email = ?', [hashedPassword, email]);
      console.log('✅ Super Admin password updated!');
    } else {
      await connection.query(
        'INSERT INTO users (name, email, password, role, is_approved, campus_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['System Super Admin', email, hashedPassword, 'super_admin', 1, 1, 'active']
      );
      console.log('✅ Super Admin created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedSuperAdmin();
