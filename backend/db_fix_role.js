const { pool } = require('./config/database');

async function fixRole() {
  try {
    const [result] = await pool.query("UPDATE users SET role = 'super_admin' WHERE role = 'superadmin'");
    console.log(`Updated ${result.affectedRows} users with incorrect role.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixRole();
