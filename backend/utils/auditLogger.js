const { pool } = require('../config/database');

/**
 * Initialize audit_logs table if not exists
 */
const initAuditLogsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` bigint(20) NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) DEFAULT NULL,
        \`user_role\` varchar(50) DEFAULT NULL,
        \`action\` varchar(100) NOT NULL,
        \`target_entity\` varchar(100) NOT NULL,
        \`target_id\` varchar(100) DEFAULT NULL,
        \`client_id\` int(11) DEFAULT NULL,
        \`campus_id\` int(11) DEFAULT NULL,
        \`details\` text DEFAULT NULL,
        \`ip_address\` varchar(50) DEFAULT NULL,
        \`user_agent\` text DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`idx_user_action\` (\`user_id\`, \`action\`),
        KEY \`idx_client_campus\` (\`client_id\`, \`campus_id\`),
        KEY \`idx_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Audit logs table verified/initialized');
  } catch (err) {
    console.error('Audit logs table initialization error:', err.message);
  }
};

/**
 * Log an action to the audit trail
 * @param {Object} entry - Log entry parameters
 */
const logAudit = async ({
  req = null,
  userId = null,
  userRole = null,
  action,
  targetEntity,
  targetId = null,
  clientId = null,
  campusId = null,
  details = null
}) => {
  try {
    const effectiveUserId = userId || (req && req.user ? req.user.id : null);
    const effectiveRole = userRole || (req && req.user ? req.user.role : 'system');
    const effectiveClientId = clientId || (req && req.user ? req.user.client_id : null);
    const effectiveCampusId = campusId || (req && req.user ? req.user.campus_id : null);
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || null) : null;
    const userAgent = req ? (req.headers['user-agent'] || null) : null;

    const logData = {
      user_id: effectiveUserId,
      user_role: effectiveRole,
      action,
      target_entity: targetEntity,
      target_id: targetId ? String(targetId) : null,
      client_id: effectiveClientId,
      campus_id: effectiveCampusId,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      ip_address: ipAddress,
      user_agent: userAgent ? userAgent.substring(0, 255) : null
    };

    await pool.query('INSERT INTO audit_logs SET ?', [logData]);
  } catch (error) {
    // Non-blocking: write to fallback log file on DB issue
    console.error('[AUDIT LOG ERROR]', error.message);
    try {
      const fs = require('fs');
      fs.appendFileSync('audit_fallback.log', `${new Date().toISOString()} - Audit failed: ${error.message} - Action: ${action}\n`);
    } catch (fsErr) {}
  }
};

// Auto-initialize table on require
initAuditLogsTable();

module.exports = {
  logAudit,
  initAuditLogsTable
};
