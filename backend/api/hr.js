const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { verifyToken, isHRManager } = require('../middleware/auth');

router.use(verifyToken);
router.use(isHRManager);

// Middleware is now applied globally to the router
router.get('/stats', async (req, res) => {
    try {
        const [totalRes] = await db.query('SELECT COUNT(*) as count FROM users');
        const total = totalRes[0].count;
        let leaveCount = 0;
        try {
            const [lc] = await db.query('SELECT COUNT(*) as count FROM hr_leave_requests WHERE status = "Pending"');
            leaveCount = lc[0].count;
        } catch (e) {
            console.warn(">>> [DEBUG] hr_leave_requests table might be missing:", e.message);
        }

        let jobCount = 0;
        try {
            const [jc] = await db.query('SELECT COUNT(*) as count FROM hr_job_postings WHERE status = "Active"');
            jobCount = jc[0].count;
        } catch (e) {
            console.warn(">>> [DEBUG] hr_job_postings table might be missing:", e.message);
        }

        res.json({
            totalStaff: total,
            activePresent: Math.floor(total * 0.95),
            leaveRequests: leaveCount,
            openVacancies: jobCount
        });
    } catch (error) {
        console.error("HR Stats Error:", error);
        res.status(500).json({ success: false, message: 'Internal Database Error' });
    }
});

// --- EMPLOYEE MANAGEMENT ---

// Get All Employees (Joining users with employees and departments)
router.get('/employees', verifyToken, async (req, res) => {
    console.log(">>> [DEBUG] Fetching all HR employees...");
    try {
        const query = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role as system_role, 
                u.status, 
                u.created_at, 
                e.designation as designation, 
                d.name as department
            FROM users u
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN departments d ON e.department_id = d.id
            ORDER BY u.created_at DESC
        `;
        const [employees] = await db.query(query);
        console.log(`>>> [DEBUG] Fetched ${employees.length} employees successfully`);
        res.json(employees);
    } catch (error) {
        console.error("!!! [CRITICAL ERROR] HR Employees API Failed:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching employees',
            error: error.message 
        });
    }
});

// Add Employee
router.post('/employees', verifyToken, async (req, res) => {
    const { name, email, password, role, dept_id, designation } = req.body;
    try {
        const [result] = await db.query('INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, "active")', 
            [name, email, password || '$2b$10$mn5nhILwVQ6jY2.KkmAIRe5NJbvrB5XT8x.87GUGsyndBbticTJde', role]);
        
        const userId = result.insertId;
        
        // Also create employee record
        await db.query('INSERT INTO employees (user_id, department_id, employee_code, designation, joining_date) VALUES (?, ?, ?, ?, CURDATE())',
            [userId, dept_id || 1, `EMP-${Date.now()}`, designation || 'Staff']);

        res.json({ success: true, message: 'Employee added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding employee' });
    }
});

// Update Employee
router.put('/employees/:id', verifyToken, async (req, res) => {
    const { name, role, status, designation, dept_id } = req.body;
    try {
        await db.query('UPDATE users SET name = ?, role = ?, status = ? WHERE id = ?', 
            [name, role, status, req.params.id]);
        
        await db.query('UPDATE employees SET designation = ?, department_id = ? WHERE user_id = ?',
            [designation, dept_id, req.params.id]);

        res.json({ success: true, message: 'Employee updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating employee' });
    }
});

// Delete Employee
router.delete('/employees/:id', verifyToken, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting employee' });
    }
});

// --- ATTENDANCE & LEAVE ---

// Get Leave Requests
router.get('/leave-requests', verifyToken, async (req, res) => {
    try {
        const query = `
            SELECT lr.*, u.name 
            FROM hr_leave_requests lr
            JOIN users u ON lr.user_id = u.id
            ORDER BY lr.created_at DESC
        `;
        const [requests] = await db.query(query);
        res.json(requests);
    } catch (e) { res.json([]); }
});

// --- RECRUITMENT ---

// Get Job Postings
router.get('/jobs', verifyToken, async (req, res) => {
    try {
        const [jobs] = await db.query('SELECT * FROM hr_job_postings ORDER BY created_at DESC');
        res.json(jobs);
    } catch (e) { res.json([]); }
});

// Add Job Posting
router.post('/jobs', verifyToken, async (req, res) => {
    const { title, description, department, status } = req.body;
    try {
        await db.query('INSERT INTO hr_job_postings (title, description, department, status) VALUES (?, ?, ?, ?)', 
            [title, description, department, status || 'Active']);
        res.json({ success: true, message: 'Job vacancy posted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error posting job' });
    }
});

// Announcements
router.get('/announcements', verifyToken, async (req, res) => {
    res.json([
        { id: 1, title: 'New HR Policy 2026', msg: 'The updated leave and appraisal policy is now live.', type: 'policy', date: 'Today' },
        { id: 2, title: 'Spring Training Workshop', msg: 'Mandatory training starts next Monday.', type: 'training', date: '2 Days Left' }
    ]);
});

router.get('/attendance-trend', verifyToken, async (req, res) => {
    res.json([92, 88, 94, 89, 96, 93]);
});

module.exports = router;
