const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { uploadLogo, handleUploadError } = require('../middleware/upload');

// @route   POST /api/masteradmin/upload-logo
// @desc    Upload a tenant logo
router.post('/upload-logo', uploadLogo.single('logo'), handleUploadError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/logos/${req.file.filename}`;
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

    const { university_name, domain, admin_name, admin_email, password, package_type, monthly_fee, logo_url, primary_color, allowed_modules } = req.body;
    
    // Validate inputs
    if (!university_name || !domain || !admin_name || !admin_email || !password || !package_type || !monthly_fee) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    await connection.beginTransaction();

    const defaultModules = ["rector","principals","bd","hr","finance","registrar","admissions","exams","library","it"];
    const modulesToSave = JSON.stringify(allowed_modules !== undefined ? allowed_modules : defaultModules);

    // 1. Insert into lancers_clients
    const [clientResult] = await connection.query(
      `INSERT INTO lancers_clients (university_name, domain, admin_name, admin_email, package_type, monthly_fee, logo_url, primary_color, allowed_modules) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [university_name, domain, admin_name, admin_email, package_type, monthly_fee, logo_url, primary_color, modulesToSave]
    );

    const newClientId = clientResult.insertId;

    // 2. Create the VC (SuperAdmin for that university) in the users table
    const hashedPassword = await bcrypt.hash(password || 'Lancers123', 10);
    
    // Check if user already exists
    const [[existingUser]] = await connection.query('SELECT id FROM users WHERE email = ?', [admin_email]);
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    await connection.query(
      `INSERT INTO users (name, email, password, role, campus_id, client_id) VALUES (?, ?, ?, 'super_admin', 1, ?)`,
      [admin_name, admin_email, hashedPassword, newClientId]
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
  const { university_name, domain, package_type, monthly_fee, logo_url, primary_color, allowed_modules } = req.body;
  try {
    const modulesToSave = JSON.stringify(allowed_modules || []);
    await pool.query(
      `UPDATE lancers_clients 
       SET university_name = ?, domain = ?, package_type = ?, monthly_fee = ?, logo_url = ?, primary_color = ?, allowed_modules = ? 
       WHERE id = ?`,
      [university_name, domain, package_type, monthly_fee, logo_url, primary_color, modulesToSave, req.params.id]
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
  try {
    await pool.query('DELETE FROM lancers_clients WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Client deleted successfully.' });
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

module.exports = router;
