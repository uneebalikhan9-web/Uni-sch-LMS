const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ activeTickets }]] = await pool.query('SELECT COUNT(*) as activeTickets FROM it_tickets WHERE status != "Closed"');
    const [{ systemHealth }] = [{ systemHealth: 98 }]; // Mocking for now, could be real logic
    
    res.json({
      success: true,
      stats: { totalUsers, activeTickets, systemHealth, serverUptime: '14 days' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. IT TICKETS
// ==========================================
router.get('/tickets', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM it_tickets ORDER BY created_at DESC');
    res.json({ success: true, tickets: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/tickets', async (req, res) => {
  const { subject, description, priority, category, user_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO it_tickets (subject, description, priority, category, user_id, status) VALUES (?, ?, ?, ?, ?, "Open")',
      [subject, description, priority, category, user_id]
    );
    res.json({ success: true, message: 'Ticket created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE it_tickets SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Ticket updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. SYSTEM CONFIG
// ==========================================
router.get('/config', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM it_system_config');
    const config = rows.reduce((acc, row) => ({ ...acc, [row.config_key]: row.config_value }), {});
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    await pool.query('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?', [name, email, role, id]);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/users/bulk', async (req, res) => {
  const { users } = req.body; // Array of { name, email, role, password }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const bcrypt = require('bcrypt');
    
    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.password || '123456', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role]
      );
    }

    await connection.commit();
    res.json({ success: true, message: `${users.length} users imported successfully` });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

router.post('/config', async (req, res) => {
  const { config } = req.body; // { key: value, ... }
  try {
    for (let [key, value] of Object.entries(config)) {
      await pool.query(
        'INSERT INTO it_system_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?',
        [key, value, value]
      );
    }
    res.json({ success: true, message: 'Configuration saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. AUDIT LOGS
// ==========================================
router.get('/logs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM it_audit_logs ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, logs: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
