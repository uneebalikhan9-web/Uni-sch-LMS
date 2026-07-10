const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, isSuperAdmin, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all trainings (Public)
router.get('/', async (req, res) => {
    try {
        const [trainings] = await pool.query('SELECT * FROM trainings ORDER BY created_at DESC');
        res.status(200).json({ success: true, trainings });
    } catch (error) {
        console.error('Get trainings error:', error);
        res.status(500).json({ success: false, message: 'Error fetching trainings' });
    }
});

// Create new training (Admin/SuperAdmin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        // Checking if user is super_admin or admin
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
             return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { title, description, instructor, start_date, end_date, status, image_url } = req.body;

        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }

        const [result] = await pool.query(
            'INSERT INTO trainings (title, description, instructor, start_date, end_date, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, instructor, start_date, end_date, status || 'upcoming', image_url]
        );

        res.status(201).json({ success: true, message: 'Training created successfully', id: result.insertId });
    } catch (error) {
        console.error('Create training error:', error);
        res.status(500).json({ success: false, message: 'Error creating training' });
    }
});

// Update training
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
             return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { id } = req.params;
        const { title, description, instructor, start_date, end_date, status, image_url } = req.body;

        await pool.query(
            'UPDATE trainings SET title=?, description=?, instructor=?, start_date=?, end_date=?, status=?, image_url=? WHERE id=?',
            [title, description, instructor, start_date, end_date, status, image_url, id]
        );

        res.status(200).json({ success: true, message: 'Training updated successfully' });
    } catch (error) {
        console.error('Update training error:', error);
        res.status(500).json({ success: false, message: 'Error updating training' });
    }
});

// Delete training
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
             return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { id } = req.params;
        await pool.query('DELETE FROM trainings WHERE id = ?', [id]);

        res.status(200).json({ success: true, message: 'Training deleted successfully' });
    } catch (error) {
        console.error('Delete training error:', error);
        res.status(500).json({ success: false, message: 'Error deleting training' });
    }
});

module.exports = router;
