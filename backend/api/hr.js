const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { verifyToken, isHRManager } = require('../middleware/auth');

// Get HR Dashboard Stats
router.get('/stats', verifyToken, async (req, res) => {
    console.log(">>> [DEBUG] HR Stats Request Received");
    try {
        console.log(">>> [DEBUG] Querying Total Staff...");
        const [totalRes] = await db.query('SELECT COUNT(*) as count FROM users');
        const total = totalRes[0].count;
        console.log(">>> [DEBUG] Total Staff:", total);

        // For now, let's keep it simple to avoid any complex role/status issues
        res.json({
            totalStaff: total,
            activePresent: total,
            leaveRequests: 0,
            openVacancies: 0
        });
        console.log(">>> [DEBUG] HR Stats Sent Successfully");
    } catch (error) {
        console.error('>>> [DEBUG] CRITICAL HR Stats Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Database Error', 
            error: error.message 
        });
    }
});

// Get Recent Employees
router.get('/employees', verifyToken, async (req, res) => {
    console.log(">>> [DEBUG] HR Employees Request Received");
    try {
        const [employees] = await db.query('SELECT id, name, role as dept, status FROM users LIMIT 10');
        console.log(">>> [DEBUG] Employees Fetched:", employees.length);
        res.json(employees);
    } catch (error) {
        console.error('>>> [DEBUG] HR Employees Error:', error);
        res.status(500).json({ message: 'Error fetching employees', error: error.message });
    }
});

// Get Announcements
router.get('/announcements', verifyToken, async (req, res) => {
    // For now, returning dummy but via API (can be expanded to DB later)
    res.json([
        { id: 1, title: 'New HR Policy 2026', msg: 'The updated leave and appraisal policy is now live.', type: 'policy', date: 'Today' },
        { id: 2, title: 'Spring Training Workshop', msg: 'Mandatory security and ethics training starts next Monday.', type: 'training', date: '2 Days Left' }
    ]);
});

// Get Attendance Trend
router.get('/attendance-trend', verifyToken, async (req, res) => {
    // This can be a complex SQL query for real attendance, for now returning consistent array
    res.json([92, 88, 94, 89, 96, 93]);
});

module.exports = router;
