const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/apply', upload.single('photo'), async (req, res) => {
  try {
    const photo_url = req.file ? '/api/uploads/' + req.file.filename : null;
    const q = 'INSERT INTO admission_requests SET ?';
    const data = { ...req.body, photo_url };
    await pool.query(q, [data]);
    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/pending', async (req, res) => {
  try {
    // Principal fetches pending admission requests for their campus
    const campusId = req.user.campus_id;
    let query = 'SELECT * FROM admission_requests WHERE status = "pending"';
    let params = [];
    if (campusId && req.user.role !== 'super_admin' && req.user.role !== 'master_admin') {
      query += ' AND campus_id = ?';
      params.push(campusId);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/approve', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('UPDATE admission_requests SET status = "approved", reviewed_by = ? WHERE id = ?', [req.user.id, id]);
    
    // Logic to move this user to pending-students or users table
    // For now, they are marked approved. 
    res.json({ success: true, message: 'Admission approved!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/reject', async (req, res) => {
  try {
    const { id, reason } = req.body;
    await pool.query('UPDATE admission_requests SET status = "rejected", review_note = ?, reviewed_by = ? WHERE id = ?', [reason, req.user.id, id]);
    res.json({ success: true, message: 'Admission rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
