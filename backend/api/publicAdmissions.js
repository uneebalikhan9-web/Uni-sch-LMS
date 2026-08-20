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
    const body = req.body;

    const targetClass = body.target_class || body.program || 'Class 1';
    const feeAmount = body.admission_fee ? parseFloat(body.admission_fee) : 5000.00;

    const data = {
      full_name: body.full_name,
      father_name: body.father_name,
      dob: body.dob || null,
      gender: body.gender || 'Male',
      bform_number: body.bform_number || body.cnic || null,
      cnic: body.cnic || body.bform_number || null,
      father_cnic: body.father_cnic || null,
      phone: body.phone || body.father_phone || null,
      father_phone: body.father_phone || body.phone || null,
      email: body.email || null,
      address: body.address || null,
      city: body.city || 'Lahore',
      target_class: targetClass,
      program: targetClass,
      preferred_shift: body.preferred_shift || 'Morning',
      last_qualification: body.last_qualification || null,
      board_university: body.board_university || null,
      marks_gpa: body.marks_gpa || null,
      medical_condition: body.medical_condition || null,
      notes: body.notes || null,
      campus_id: body.campus_id || 1,
      admission_fee: feeAmount,
      fee_status: 'pending',
      status: 'pending_fee',
      photo_url
    };

    const [result] = await pool.query('INSERT INTO admission_requests SET ?', [data]);
    res.json({
      success: true,
      message: 'School admission application submitted successfully! Please proceed with fee payment.',
      applicationId: result.insertId
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting application' });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    let query = 'SELECT * FROM admission_requests WHERE (status = "fee_verified" OR status = "pending" OR status = "pending_fee") AND status != "admitted" AND status != "approved" AND status != "rejected"';
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

module.exports = router;
