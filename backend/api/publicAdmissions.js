const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { uploadPhoto } = require('../middleware/uploadSecurity');
const { verifyToken } = require('../middleware/auth');

// Multer wrapper for clean error responses
const handlePhotoUpload = (req, res, next) => {
  uploadPhoto.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error processing uploaded photo.'
      });
    }
    next();
  });
};

// @route   POST /api/public-admissions/apply
// @desc    Submit public student admission form with validation & secure upload
router.post('/apply', handlePhotoUpload, async (req, res) => {
  try {
    const photo_url = req.file ? '/api/uploads/' + req.file.filename : null;
    const body = req.body;

    // Strict input validation
    if (!body.full_name || !body.full_name.trim()) {
      return res.status(400).json({ success: false, message: 'Full Name is required.' });
    }
    if (!body.father_name || !body.father_name.trim()) {
      return res.status(400).json({ success: false, message: 'Father Name is required.' });
    }
    if (!body.phone || !body.phone.trim()) {
      return res.status(400).json({ success: false, message: 'Contact Phone Number is required.' });
    }
    if (!body.email || !body.email.trim()) {
      return res.status(400).json({ success: false, message: 'Valid Email Address is required.' });
    }

    const targetClass = (body.program || body.target_class || 'BS Computer Science (BSCS)').trim();
    const feeAmount = body.admission_fee ? parseFloat(body.admission_fee) : 5000.00;
    const cleanCnic = (body.cnic || body.bform_number || '').trim();

    const data = {
      full_name: body.full_name.trim(),
      father_name: body.father_name.trim(),
      dob: body.dob || null,
      gender: body.gender || 'Male',
      bform_number: cleanCnic || null,
      cnic: cleanCnic || null,
      father_cnic: body.father_cnic ? body.father_cnic.trim() : null,
      phone: body.phone.trim(),
      father_phone: body.father_phone ? body.father_phone.trim() : body.phone.trim(),
      email: body.email.trim().toLowerCase(),
      address: body.address ? body.address.trim() : null,
      city: body.city ? body.city.trim() : 'Lahore',
      target_class: targetClass,
      program: targetClass,
      preferred_shift: body.preferred_shift || 'Morning',
      last_qualification: body.last_qualification ? body.last_qualification.trim() : null,
      board_university: body.board_university ? body.board_university.trim() : null,
      marks_gpa: body.marks_gpa ? body.marks_gpa.trim() : null,
      medical_condition: body.medical_condition ? body.medical_condition.trim() : null,
      notes: body.notes ? body.notes.trim() : null,
      campus_id: body.campus_id ? parseInt(body.campus_id, 10) : 1,
      admission_fee: feeAmount,
      fee_status: 'pending',
      status: 'pending_fee',
      photo_url
    };

    const [result] = await pool.query('INSERT INTO admission_requests SET ?', [data]);
    
    res.status(201).json({
      success: true,
      message: 'Admission application submitted successfully! Reference ID: #' + result.insertId,
      applicationId: result.insertId
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting application: ' + (error.sqlMessage || error.message) });
  }
});

// @route   GET /api/public-admissions/pending
// @desc    Get pending admission inquiries with pagination & tenant filtering
router.get('/pending', verifyToken, async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM admission_requests WHERE (status = "fee_verified" OR status = "pending" OR status = "pending_fee") AND status != "admitted" AND status != "approved" AND status != "rejected"';
    let countQuery = 'SELECT COUNT(*) as total FROM admission_requests WHERE (status = "fee_verified" OR status = "pending" OR status = "pending_fee") AND status != "admitted" AND status != "approved" AND status != "rejected"';
    let params = [];
    let countParams = [];

    if (campusId && req.user.role !== 'super_admin' && req.user.role !== 'master_admin') {
      query += ' AND campus_id = ?';
      countQuery += ' AND campus_id = ?';
      params.push(campusId);
      countParams.push(campusId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [[{ total }]] = await pool.query(countQuery, countParams);
    const [rows] = await pool.query(query, params);

    res.json({ 
      success: true, 
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admissions pending fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + (error.sqlMessage || error.message) });
  }
});

module.exports = router;
