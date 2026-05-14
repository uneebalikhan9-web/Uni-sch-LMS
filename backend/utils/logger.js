const { pool } = require('../config/database');

/**
 * LMS AUDIT TRAIL SYSTEM
 * Logs sensitive actions to the database for institutional accountability.
 */
const logAudit = async ({ userId, action, targetId, targetTable, oldValue, newValue, ip }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, target_id, target_table, old_value, new_value, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        action, 
        targetId || null, 
        targetTable || null, 
        oldValue ? JSON.stringify(oldValue) : null, 
        newValue ? JSON.stringify(newValue) : null, 
        ip || null
      ]
    );
    console.log(`[AUDIT] ${action} by User ${userId} on ${targetTable || 'N/A'}`);
  } catch (error) {
    console.error('[AUDIT ERROR] Failed to save audit log:', error.message);
  }
};

module.exports = { logAudit };
