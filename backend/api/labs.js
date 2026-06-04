const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Environment Mapping
const ENV_URLS = {
    'python': 'https://onecompiler.com/embed/python',
    'node.js': 'https://onecompiler.com/embed/nodejs',
    'mysql': 'https://onecompiler.com/embed/mysql',
    'react': 'https://onecompiler.com/embed/react'
};

// Log lab start
router.post('/log-start', verifyToken, async (req, res) => {
    try {
        const { labName } = req.body;
        const studentId = req.user.student_id;
        const now = new Date();
        const date = now.toISOString().split('T')[0];

        const [result] = await pool.query(
            'INSERT INTO lab_usage (student_id, lab_name, start_time, date) VALUES (?, ?, ?, ?)',
            [studentId, labName, now, date]
        );

        res.json({ success: true, logId: result.insertId });
    } catch (error) {
        console.error('Error logging lab start:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Log lab end and save submission
router.post('/log-end', verifyToken, async (req, res) => {
    try {
        const { logId, submission } = req.body;
        const now = new Date();

        // Get start time to calculate duration
        const [logs] = await pool.query('SELECT start_time FROM lab_usage WHERE id = ?', [logId]);
        
        if (logs.length === 0) {
            return res.status(404).json({ success: false, message: 'Log not found' });
        }

        const startTime = new Date(logs[0].start_time);
        const diffInMs = now - startTime;
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));

        await pool.query(
            'UPDATE lab_usage SET end_time = ?, time_spent = ?, submission_code = ? WHERE id = ?',
            [now, diffInMinutes, submission || '', logId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error logging lab end:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get usage for a specific student (Teacher/Admin view)
router.get('/usage/student/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const [usage] = await pool.query(
            'SELECT * FROM lab_usage WHERE student_id = ? ORDER BY date DESC, start_time DESC',
            [studentId]
        );
        res.json({ success: true, usage });
    } catch (error) {
        console.error('Error fetching student lab usage:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get global analytics (Admin/HOD view)
router.get('/usage/all', verifyToken, async (req, res) => {
    try {
        const { role, campus_id } = req.user;
        let query = `SELECT lu.*, u.name as student_name, s.roll_number 
                     FROM lab_usage lu 
                     JOIN students s ON lu.student_id = s.id
                     JOIN users u ON s.user_id = u.id`;
        const params = [];

        if (role !== 'super_admin') {
            query += ` WHERE u.campus_id = ?`;
            params.push(campus_id);
        }

        query += ` ORDER BY lu.date DESC, lu.start_time DESC`;
        
        const [usage] = await pool.query(query, params);
        res.json({ success: true, usage });
    } catch (error) {
        console.error('Error fetching all lab usage:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all active labs (Filtered by campus and class)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { role, id: userId, campus_id } = req.user;
        let query = 'SELECT * FROM labs';
        const params = [];
        let whereClauses = [];

        // Filter by campus if not super_admin
        if (role !== 'super_admin') {
            whereClauses.push('campus_id = ?');
            params.push(campus_id);
        }

        // If student, only show labs for their classes
        if (role === 'student') {
            const studentId = req.user.student_id;
            whereClauses.push('class_id IN (SELECT class_id FROM student_classes WHERE student_id = ?)');
            params.push(studentId);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY id DESC';
        const [labs] = await pool.query(query, params);
        res.json({ success: true, labs });
    } catch (error) {
        console.error('Error fetching labs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create a new lab (Principal/Admin)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, description, icon, environment, classId, url: customUrl } = req.body;
        const { id: hodId, campus_id: campusId } = req.user;
        
        let url = customUrl;
        
        // If environment is not 'Custom', map it to preset URLs
        if (environment && environment.toLowerCase() !== 'custom') {
            const envKey = environment.toLowerCase();
            url = ENV_URLS[envKey] || 'https://antigravity.codes/embed/python'; // fallback
        }
        
        await pool.query(
            'INSERT INTO labs (name, description, icon, url, environment, class_id, hod_id, campus_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, icon, url, environment, classId, hodId, campusId]
        );
        res.json({ success: true, message: 'Lab created successfully' });
    } catch (error) {
        console.error('Error creating lab:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update a lab
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { name, description, icon, environment, classId, url: customUrl } = req.body;
        const labId = req.params.id;
        
        let url = customUrl;
        if (environment && environment.toLowerCase() !== 'custom') {
            const envKey = environment.toLowerCase();
            url = ENV_URLS[envKey] || 'https://antigravity.codes/embed/python';
        }

        await pool.query(
            'UPDATE labs SET name = ?, description = ?, icon = ?, url = ?, environment = ?, class_id = ? WHERE id = ?',
            [name, description, icon, url, environment, classId, labId]
        );
        res.json({ success: true, message: 'Lab updated successfully' });
    } catch (error) {
        console.error('Error updating lab:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete a lab
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM labs WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Lab deleted' });
    } catch (error) {
        console.error('Error deleting lab:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete a lab usage report entry
router.delete('/usage/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM lab_usage WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Lab report deleted' });
    } catch (error) {
        console.error('Error deleting lab usage:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
