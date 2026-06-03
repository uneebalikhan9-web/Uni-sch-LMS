const { pool } = require('./backend/config/database');

async function fixMissingClientIds() {
  try {
    const [users] = await pool.query('SELECT u.id, u.campus_id FROM users u WHERE u.client_id IS NULL AND u.campus_id IS NOT NULL');
    
    let updated = 0;
    for (const user of users) {
      const [campuses] = await pool.query('SELECT client_id FROM campuses WHERE id = ?', [user.campus_id]);
      if (campuses.length > 0 && campuses[0].client_id) {
        await pool.query('UPDATE users SET client_id = ? WHERE id = ?', [campuses[0].client_id, user.id]);
        updated++;
      }
    }
    
    console.log(`Successfully fixed client_id for ${updated} users.`);
  } catch (error) {
    console.error('Error fixing client_ids:', error);
  } finally {
    process.exit();
  }
}

fixMissingClientIds();
