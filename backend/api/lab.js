const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// ==========================================
// 1. LAB STATS AND ROOT (Labs List)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM lab_inventory WHERE category = "Lab Node" AND client_id = ?', [req.user.client_id]);
        res.json({ success: true, labs: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/usage/all', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, u.name as student_name, 'Unknown' as roll_number, s.experiment_title as lab_name, 120 as time_spent, s.schedule_date as date
            FROM lab_schedules s 
            JOIN users u ON s.client_id = u.client_id
            WHERE s.client_id = ? 
            LIMIT 10`, [req.user.client_id]);
        res.json({ success: true, usage: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const [[{ activeExperiments }]] = await pool.query('SELECT COUNT(*) as activeExperiments FROM lab_schedules WHERE status = "Scheduled" AND client_id = ?', [req.user.client_id]);
        const [[{ lowStockItems }]] = await pool.query('SELECT COUNT(*) as lowStockItems FROM lab_inventory WHERE status IN ("Low Stock", "Depleted") AND client_id = ?', [req.user.client_id]);
        const [[{ maintenanceAlerts }]] = await pool.query('SELECT COUNT(*) as maintenanceAlerts FROM lab_inventory WHERE status = "Maintenance" AND client_id = ?', [req.user.client_id]);
        
        res.json({
            success: true,
            stats: {
                activeExperiments: activeExperiments || 0,
                lowStockItems: lowStockItems || 0,
                maintenanceAlerts: maintenanceAlerts || 0,
                safetyScore: 100 // System default until an incident is reported
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 2. INVENTORY
// ==========================================
router.get('/inventory', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM lab_inventory WHERE client_id = ? ORDER BY created_at DESC', [req.user.client_id]);
        res.json({ success: true, inventory: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 3. SCHEDULES
// ==========================================
router.get('/schedules', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM lab_schedules WHERE client_id = ? ORDER BY schedule_date ASC, start_time ASC', [req.user.client_id]);
        res.json({ success: true, schedules: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 4. SAFETY LOGS
// ==========================================
router.get('/safety-logs', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, u.name as reporter_name 
            FROM lab_safety_logs s 
            JOIN users u ON s.reported_by = u.id 
            WHERE s.client_id = ? 
            ORDER BY s.created_at DESC`, [req.user.client_id]);
        res.json({ success: true, logs: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
