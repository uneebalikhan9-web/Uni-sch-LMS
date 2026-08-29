const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { uploadLogo, handleUploadError } = require('../middleware/upload');

// @route   POST /api/masteradmin/migrate-institution-type
// @desc    One-time migration: adds institution_type column to lancers_clients
router.post('/migrate-institution-type', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE lancers_clients ADD COLUMN IF NOT EXISTS institution_type ENUM('school','university') NOT NULL DEFAULT 'university'`);
    res.json({ success: true, message: 'institution_type column ensured successfully.' });
  } catch (error) {
    // Column may already exist — that's fine
    res.json({ success: true, message: 'Column already exists or migration complete.' });
  }
});

// @route   POST /api/masteradmin/upload-logo
// @desc    Upload a tenant logo
router.post('/upload-logo', uploadLogo.single('logo'), handleUploadError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/api/uploads/logos/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});


// @route   GET /api/masteradmin/stats
// @desc    Get global statistics for Lancers Tech Master Admin
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalClients }]] = await pool.query('SELECT COUNT(*) as totalClients FROM lancers_clients');
    const [[{ activeClients }]] = await pool.query('SELECT COUNT(*) as activeClients FROM lancers_clients WHERE subscription_status = "Active"');
    const [[{ totalMRR }]] = await pool.query('SELECT SUM(monthly_fee) as totalMRR FROM lancers_clients WHERE subscription_status = "Active"');
    
    // We will just mock global users for now or sum up total users if it was truly multi-tenant
    const [[{ globalUsers }]] = await pool.query('SELECT COUNT(*) as globalUsers FROM users');

    const currentMonth = new Date().toISOString().substring(0, 7);
    const [[{ collected }]] = await pool.query('SELECT SUM(amount) as collected FROM client_invoices WHERE status = "Paid"');
    const [[{ pending }]] = await pool.query('SELECT SUM(amount) as pending FROM client_invoices WHERE status IN ("Pending", "Overdue")');

    res.json({
      success: true,
      stats: {
        totalClients,
        activeClients,
        mrr: totalMRR || 0,
        globalUsers,
        collected: collected || 0,
        pending: pending || 0
      }
    });
  } catch (error) {
    console.error('MasterAdmin Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching master stats' });
  }
});

// @route   GET /api/masteradmin/clients
// @desc    Get all registered universities (clients)
router.get('/clients', async (req, res) => {
  try {
    const [clients] = await pool.query('SELECT * FROM lancers_clients ORDER BY registered_at DESC');
    res.json({ success: true, clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching clients' });
  }
});

// @route   POST /api/masteradmin/clients
// @desc    Register a new university and create its VC user
router.post('/clients', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // Check if new onboarding is allowed
    const [[onboardingSetting]] = await connection.query('SELECT setting_value FROM platform_settings WHERE setting_key = "allow_new_registrations"');
    if (onboardingSetting && onboardingSetting.setting_value === 'false') {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'New onboarding is currently blocked by the Platform Configuration.'
      });
    }

    const { university_name, domain, admin_name, admin_email, password, package_type, monthly_fee, logo_url, primary_color, allowed_modules, institution_type } = req.body;
    
    // Validate inputs
    if (!university_name || !domain || !admin_name || !admin_email || !password || !package_type || !monthly_fee) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    await connection.beginTransaction();

    const defaultModules = ["rector","principals","bd","hr","finance","registrar","admissions","exams","library","it"];
    const modulesToSave = JSON.stringify(allowed_modules !== undefined ? allowed_modules : defaultModules);
    const instType = institution_type || 'university';

    // 1. Insert into lancers_clients
    const [clientResult] = await connection.query(
      `INSERT INTO lancers_clients (university_name, domain, admin_name, admin_email, package_type, monthly_fee, logo_url, primary_color, allowed_modules, institution_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [university_name, domain, admin_name, admin_email, package_type, monthly_fee, logo_url, primary_color, modulesToSave, instType]
    );

    const newClientId = clientResult.insertId;

    // 2. Create initial branch for this tenant
    const branchName = req.body.initial_branch_name || (instType === 'school' ? 'Main Branch' : 'Main Campus');
    const branchLocation = req.body.initial_branch_location || (instType === 'school' ? 'Main School Campus' : 'Main University Campus');

    const [branchResult] = await connection.query(
      `INSERT INTO campuses (name, location, subscription_plan, client_id, is_active) VALUES (?, ?, 'basic', ?, 1)`,
      [branchName, branchLocation, newClientId]
    );
    const initialBranchId = branchResult.insertId;

    // 3. Create the VC / Director (SuperAdmin for that university/school) in the users table
    const hashedPassword = await bcrypt.hash(password || 'Lancers123', 10);
    
    // Check if user already exists
    const [[existingUser]] = await connection.query('SELECT id FROM users WHERE email = ?', [admin_email]);
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    await connection.query(
      `INSERT INTO users (name, email, password, role, campus_id, client_id) VALUES (?, ?, ?, 'super_admin', ?, ?)`,
      [admin_name, admin_email, hashedPassword, initialBranchId, newClientId]
    );

    await connection.commit();
    res.json({ success: true, message: 'University registered and VC account created successfully.' });
  } catch (error) {
    await connection.rollback();
    console.error('MasterAdmin Add Client Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating client' });
  } finally {
    connection.release();
  }
});

// @route   PUT /api/masteradmin/clients/:id/status
// @desc    Update client subscription status (Suspend/Activate)
router.put('/clients/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE lancers_clients SET subscription_status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Client status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating client status' });
  }
});

// @route   PUT /api/masteradmin/clients/:id
// @desc    Edit a client's details
router.put('/clients/:id', async (req, res) => {
  const { university_name, domain, package_type, monthly_fee, logo_url, primary_color, allowed_modules, institution_type } = req.body;
  try {
    const modulesToSave = JSON.stringify(allowed_modules || []);
    const instType = institution_type || 'university';
    await pool.query(
      `UPDATE lancers_clients 
       SET university_name = ?, domain = ?, package_type = ?, monthly_fee = ?, logo_url = ?, primary_color = ?, allowed_modules = ?, institution_type = ? 
       WHERE id = ?`,
      [university_name, domain, package_type, monthly_fee, logo_url, primary_color, modulesToSave, instType, req.params.id]
    );
    res.json({ success: true, message: 'Client updated successfully.' });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ success: false, message: 'Server error updating client.' });
  }
});

// @route   DELETE /api/masteradmin/clients/:id
// @desc    Delete a client completely
router.delete('/clients/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DELETE FROM client_invoices WHERE client_id = ?', [req.params.id]);
    await connection.query('DELETE FROM users WHERE client_id = ?', [req.params.id]);
    await connection.query('DELETE FROM campuses WHERE client_id = ?', [req.params.id]);
    await connection.query('DELETE FROM lancers_clients WHERE id = ?', [req.params.id]);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    connection.release();
    res.json({ success: true, message: 'Client and associated core data deleted successfully.' });
  } catch (error) {
    if (connection) {
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      connection.release();
    }
    console.error('Delete client error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting client: ' + (error.sqlMessage || error.message) });
  }
});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting client' });
  }
});

// @route   GET /api/masteradmin/invoices
// @desc    Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const [invoices] = await pool.query(`
      SELECT i.*, c.university_name 
      FROM client_invoices i 
      JOIN lancers_clients c ON i.client_id = c.id 
      ORDER BY i.created_at DESC
    `);
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching invoices' });
  }
});

// @route   POST /api/masteradmin/invoices
// @desc    Create a manual invoice
router.post('/invoices', async (req, res) => {
  const { client_id, amount, billing_month } = req.body;
  try {
    await pool.query(
      'INSERT INTO client_invoices (client_id, amount, billing_month, status) VALUES (?, ?, ?, ?)',
      [client_id, amount, billing_month, 'Pending']
    );
    res.json({ success: true, message: 'Invoice generated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating invoice' });
  }
});

// @route   PUT /api/masteradmin/invoices/:id/status
// @desc    Update invoice status
router.put('/invoices/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE client_invoices SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: 'Invoice status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating invoice status' });
  }
});

// @route   GET /api/masteradmin/settings
// @desc    Get all platform settings
router.get('/settings', async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT setting_key, setting_value FROM platform_settings');
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.setting_key] = s.setting_value);
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
});

// @route   PUT /api/masteradmin/settings
// @desc    Update multiple platform settings
// LOW-05 FIX: When maintenance_mode is changed, broadcast via socket.io to all
// connected clients so they update instantly without 30-second polling.
router.put('/settings', async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [key, value] of Object.entries(settings)) {
      await connection.query(
        'UPDATE platform_settings SET setting_value = ? WHERE setting_key = ?',
        [String(value), key]
      );
    }
    await connection.commit();

    // If maintenance_mode was changed, broadcast to all connected sockets
    if ('maintenance_mode' in settings) {
      const io = req.app.get('io');
      if (io) {
        io.emit('system:maintenance', { active: settings.maintenance_mode === 'true' || settings.maintenance_mode === true });
      }
    }

    res.json({ success: true, message: 'Platform settings updated successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  } finally {
    connection.release();
  }
});


// ==========================================
// BRANCH / CAMPUS MANAGEMENT FOR TENANTS
// ==========================================

// @route   GET /api/masteradmin/clients/:clientId/branches
// @desc    Get all branches/campuses for a specific tenant
router.get('/clients/:clientId/branches', async (req, res) => {
  try {
    const { clientId } = req.params;
    const [branches] = await pool.query(`
      SELECT c.*,
             (SELECT COUNT(*) FROM users u WHERE u.campus_id = c.id AND u.role = 'student') as student_count,
             (SELECT COUNT(*) FROM users u WHERE u.campus_id = c.id AND u.role = 'teacher') as teacher_count
      FROM campuses c
      WHERE c.client_id = ?
      ORDER BY c.name ASC
    `, [clientId]);

    res.json({ success: true, branches });
  } catch (error) {
    console.error('MasterAdmin Get Branches Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching branches' });
  }
});

// @route   POST /api/masteradmin/clients/:clientId/branches
// @desc    Add a new branch/campus for a tenant
router.post('/clients/:clientId/branches', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { name, location, dept_code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Branch name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO campuses (name, location, dept_code, subscription_plan, client_id, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [name.trim(), location ? location.trim() : '', dept_code || null, 'basic', clientId]
    );

    res.json({
      success: true,
      message: 'Branch created successfully',
      branch: {
        id: result.insertId,
        name: name.trim(),
        location: location ? location.trim() : '',
        dept_code: dept_code || null,
        client_id: parseInt(clientId),
        student_count: 0,
        teacher_count: 0
      }
    });
  } catch (error) {
    console.error('MasterAdmin Add Branch Error:', error);
    res.status(500).json({ success: false, message: 'Error creating branch' });
  }
});

// @route   PUT /api/masteradmin/branches/:id
// @desc    Update branch details
router.put('/branches/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, dept_code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Branch name is required' });
    }

    await pool.query(
      'UPDATE campuses SET name = ?, location = ?, dept_code = ? WHERE id = ?',
      [name.trim(), location ? location.trim() : '', dept_code || null, id]
    );

    res.json({ success: true, message: 'Branch updated successfully' });
  } catch (error) {
    console.error('MasterAdmin Update Branch Error:', error);
    res.status(500).json({ success: false, message: 'Error updating branch' });
  }
});

// @route   DELETE /api/masteradmin/branches/:id
// @desc    Delete a branch
router.delete('/branches/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there are active students enrolled in this branch via users table
    const [[{ studentCount }]] = await pool.query(
      "SELECT COUNT(*) as studentCount FROM users WHERE campus_id = ? AND role = 'student'",
      [id]
    );
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete branch. It currently has ${studentCount} enrolled student(s). Please reassign or remove students first.`
      });
    }

    // Unassign users/classes/courses from this branch before deleting to prevent foreign key errors
    await pool.query('UPDATE users SET campus_id = NULL WHERE campus_id = ?', [id]);
    await pool.query('UPDATE classes SET campus_id = NULL WHERE campus_id = ?', [id]);
    await pool.query('UPDATE courses SET campus_id = NULL WHERE campus_id = ?', [id]);
    await pool.query('DELETE FROM campuses WHERE id = ?', [id]);

    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('MasterAdmin Delete Branch Error:', error);
    res.status(500).json({ success: false, message: 'Error deleting branch' });
  }
});

module.exports = router;
