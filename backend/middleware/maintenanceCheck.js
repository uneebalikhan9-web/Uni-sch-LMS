const { pool } = require('../config/database');

const maintenanceCheck = async (req, res, next) => {
  // Allow master admin routes to bypass maintenance mode completely
  if (req.path.startsWith('/api/masteradmin')) {
    return next();
  }

  // Allow auth routes to bypass middleware, we will handle strict checks inside auth.js
  if (req.path.startsWith('/api/signin') || req.path.startsWith('/api/signup') || req.path.startsWith('/api/verify-token')) {
    return next();
  }

  try {
    const [[setting]] = await pool.query('SELECT setting_value FROM platform_settings WHERE setting_key = "maintenance_mode"');
    
    if (setting && setting.setting_value === 'true') {
      return res.status(503).json({
        success: false,
        message: 'The system is currently undergoing scheduled maintenance. Please check back later.'
      });
    }

    next();
  } catch (error) {
    console.error('Maintenance Check Error:', error);
    next();
  }
};

module.exports = maintenanceCheck;
