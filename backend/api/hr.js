const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { verifyToken, isHRManager } = require('../middleware/auth');

router.use(verifyToken);

// Get My Leave Requests (Universal for all portal roles)
router.get('/my-leaves', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                leave_type AS type,
                CONCAT(DATE_FORMAT(start_date, '%b %d, %Y'), ' - ', DATE_FORMAT(end_date, '%b %d, %Y')) AS days,
                status,
                reason,
                created_at
            FROM hr_leave_requests
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;
        const [requests] = await db.query(query, [req.user.id]);
        res.json({ success: true, leaves: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching your leaves', error: error.message });
    }
});

// Submit New Leave Request (Universal for all portal roles)
router.post('/my-leaves', async (req, res) => {
    const { leave_type, start_date, end_date, reason } = req.body;
    try {
        await db.query(`
            INSERT INTO hr_leave_requests (user_id, leave_type, start_date, end_date, status, reason)
            VALUES (?, ?, ?, ?, 'pending', ?)
        `, [req.user.id, leave_type || 'Casual', start_date, end_date, reason || '']);
        
        res.json({ success: true, message: 'Leave request submitted successfully to HR' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error submitting leave request', error: error.message });
    }
});

router.use(isHRManager);

// Middleware is now applied globally to the router
router.get('/stats', async (req, res) => {
    try {
        const [totalRes] = await db.query('SELECT COUNT(*) as count FROM users WHERE client_id = ?', [req.user.client_id]);
        const total = totalRes[0].count;
        let leaveCount = 0;
        try {
            const [lc] = await db.query('SELECT COUNT(l.id) as count FROM hr_leave_requests l JOIN users u ON l.user_id = u.id WHERE l.status = "Pending" AND u.client_id = ?', [req.user.client_id]);
            leaveCount = lc[0].count;
        } catch (e) {
            console.warn(">>> [DEBUG] hr_leave_requests table might be missing:", e.message);
        }

        let jobCount = 0;
        try {
            const [jc] = await db.query('SELECT COUNT(*) as count FROM hr_job_postings WHERE status = "Active" AND client_id = ?', [req.user.client_id]);
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
                COALESCE(e.designation, 
                    CASE 
                        WHEN u.role = 'teacher' THEN 'Lecturer'
                        WHEN u.role = 'principal' THEN 'Head of Department'
                        WHEN u.role = 'hr_manager' THEN 'HR Manager'
                        WHEN u.role = 'finance_manager' THEN 'Finance Manager'
                        ELSE 'Staff'
                    END
                ) as designation, 
                COALESCE(d.name, 
                    CASE 
                        WHEN u.role = 'teacher' THEN 'Computer Science'
                        WHEN u.role = 'principal' THEN 'Computer Science'
                        WHEN u.role = 'hr_manager' THEN 'Human Resources'
                        WHEN u.role = 'finance_manager' THEN 'Finance & Accounts'
                        ELSE 'General Administration'
                    END
                ) as department
            FROM users u
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE u.role NOT IN ('student', 'super_admin') AND u.client_id = ?
            ORDER BY u.created_at DESC
        `;
        const [employees] = await db.query(query, [req.user.client_id]);
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
        const [result] = await db.query('INSERT INTO users (name, email, password, role, status, client_id) VALUES (?, ?, ?, ?, "active", ?)', 
            [name, email, password || '$2b$10$mn5nhILwVQ6jY2.KkmAIRe5NJbvrB5XT8x.87GUGsyndBbticTJde', role, req.user.client_id]);
        
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
            SELECT 
                lr.id,
                lr.user_id,
                lr.status,
                lr.reason,
                lr.leave_type AS type,
                CONCAT(DATE_FORMAT(lr.start_date, '%b %d, %Y'), ' - ', DATE_FORMAT(lr.end_date, '%b %d, %Y')) AS days,
                u.name 
            FROM hr_leave_requests lr
            JOIN users u ON lr.user_id = u.id
            WHERE u.client_id = ?
            ORDER BY lr.created_at DESC
        `;
        const [requests] = await db.query(query, [req.user.client_id]);
        res.json(requests);
    } catch (e) { res.json([]); }
});

// Update Leave Request Status
router.post('/leave-requests/:id/status', verifyToken, async (req, res) => {
    const { status } = req.body;
    try {
        await db.query('UPDATE hr_leave_requests SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: `Leave request status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating leave request status' });
    }
});

// --- RECRUITMENT ---

// Get Job Postings
router.get('/jobs', verifyToken, async (req, res) => {
    try {
        const [jobs] = await db.query('SELECT * FROM hr_job_postings WHERE client_id = ? ORDER BY created_at DESC', [req.user.client_id]);
        res.json(jobs);
    } catch (e) { res.json([]); }
});

// Add Job Posting
router.post('/jobs', verifyToken, async (req, res) => {
    const { title, description, department, status } = req.body;
    try {
        await db.query('INSERT INTO hr_job_postings (title, description, department, status, client_id) VALUES (?, ?, ?, ?, ?)', 
            [title, description, department, status || 'Active', req.user.client_id]);
        res.json({ success: true, message: 'Job vacancy posted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error posting job' });
    }
});

// Delete Job Posting
router.delete('/jobs/:id', verifyToken, async (req, res) => {
    try {
        await db.query('DELETE FROM hr_job_postings WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Job posting deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting job posting' });
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
