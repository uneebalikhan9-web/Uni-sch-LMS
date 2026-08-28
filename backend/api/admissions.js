const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

// Multi-tenant helper for admission requests (uses alias ar. to prevent SQL ambiguity)
const getAdmissionFilter = (req) => {
  const isSuperAdmin = req.user && (req.user.role === 'super_admin' || req.user.role === 'master_admin');
  let filter = '';
  let params = [];

  if (req.user && req.user.client_id) {
    filter += ' AND (ar.campus_id IN (SELECT id FROM campuses WHERE client_id = ?) OR ar.campus_id IS NULL)';
    params.push(req.user.client_id);
  }

  if (!isSuperAdmin && req.user && req.user.campus_id) {
    filter += ' AND ar.campus_id = ?';
    params.push(req.user.campus_id);
  }

  return { filter, params };
};

// ==========================================
// 1. SCHOOL ADMISSION DASHBOARD STATS
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const { filter, params } = getAdmissionFilter(req);

    const [[{ totalInquiries }]] = await pool.query(
      `SELECT COUNT(*) as totalInquiries FROM admission_requests ar WHERE 1=1 ${filter}`,
      params
    );

    const [[{ pendingFee }]] = await pool.query(
      `SELECT COUNT(*) as pendingFee FROM admission_requests ar WHERE (ar.status = 'pending_fee' OR ar.status = 'pending' OR ar.fee_status = 'pending') AND ar.status != 'admitted' AND ar.status != 'approved' AND ar.status != 'rejected' ${filter}`,
      params
    );

    const [[{ feeVerified }]] = await pool.query(
      `SELECT COUNT(*) as feeVerified FROM admission_requests ar WHERE (ar.status = 'fee_verified' OR ar.fee_status = 'paid') AND ar.status != 'admitted' AND ar.status != 'approved' AND ar.status != 'rejected' ${filter}`,
      params
    );

    const [[{ admitted }]] = await pool.query(
      `SELECT COUNT(*) as admitted FROM admission_requests ar WHERE (ar.status = 'admitted' OR ar.status = 'approved') ${filter}`,
      params
    );

    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(ar.admission_fee), 0) as totalRevenue FROM admission_requests ar WHERE ar.fee_status = 'paid' ${filter}`,
      params
    );

    res.json({
      success: true,
      stats: {
        totalInquiries: totalInquiries || 0,
        pendingFee: pendingFee || 0,
        feeVerified: feeVerified || 0,
        admitted: admitted || 0,
        totalRevenue: parseFloat(totalRevenue || 0)
      }
    });
  } catch (error) {
    console.error('Admissions Stats Error:', error);
    res.status(500).json({ success: false, message: 'DB Error: ' + (error.sqlMessage || error.message) });
  }
});

// ==========================================
// 2. SCHOOL ADMISSION PIPELINE (3-STAGES)
// ==========================================
router.get('/pipeline', async (req, res) => {
  try {
    const { filter, params } = getAdmissionFilter(req);

    const [rows] = await pool.query(`
      SELECT ar.*, c.name as campus_name
      FROM admission_requests ar
      LEFT JOIN campuses c ON ar.campus_id = c.id
      WHERE 1=1 ${filter}
      ORDER BY ar.created_at DESC
    `, params);

    const pipeline = {
      pending_fee: [],
      fee_verified: [],
      admitted: [],
      rejected: []
    };

    rows.forEach(r => {
      const item = {
        id: r.id,
        full_name: r.full_name,
        father_name: r.father_name || '',
        phone: r.phone || r.father_phone || '',
        email: r.email || '',
        bform_number: r.bform_number || r.cnic || '',
        target_class: r.target_class || r.program || 'General',
        admission_fee: r.admission_fee || 5000,
        fee_status: r.fee_status || 'pending',
        fee_paid_at: r.fee_paid_at,
        payment_method: r.payment_method,
        assigned_section: r.assigned_section,
        assigned_roll_number: r.assigned_roll_number,
        campus_id: r.campus_id,
        campus_name: r.campus_name || 'Main Campus',
        created_at: r.created_at,
        status: r.status
      };

      if (r.status === 'admitted' || r.status === 'approved') {
        pipeline.admitted.push(item);
      } else if (r.status === 'fee_verified' || r.fee_status === 'paid') {
        pipeline.fee_verified.push(item);
      } else if (r.status === 'rejected') {
        pipeline.rejected.push(item);
      } else {
        pipeline.pending_fee.push(item);
      }
    });

    res.json({
      success: true,
      pipeline
    });
  } catch (error) {
    console.error('Admissions Pipeline Error:', error);
    res.status(500).json({ success: false, message: 'DB Error: ' + (error.sqlMessage || error.message) });
  }
});

// ==========================================
// 3. ALL APPLICANTS DIRECTORY
// ==========================================
router.get('/applicants', async (req, res) => {
  try {
    const { filter, params } = getAdmissionFilter(req);
    const { search, grade, status } = req.query;

    let query = `
      SELECT ar.*, c.name as campus_name, cl.name as class_name
      FROM admission_requests ar
      LEFT JOIN campuses c ON ar.campus_id = c.id
      LEFT JOIN classes cl ON ar.assigned_class_id = cl.id
      WHERE 1=1 ${filter}
    `;

    const queryParams = [...params];

    if (search) {
      query += ' AND (ar.full_name LIKE ? OR ar.father_name LIKE ? OR ar.phone LIKE ? OR ar.bform_number LIKE ? OR ar.cnic LIKE ?)';
      const s = `%${search}%`;
      queryParams.push(s, s, s, s, s);
    }

    if (grade && grade !== 'All' && grade !== 'all') {
      query += ' AND (ar.target_class = ? OR ar.program = ?)';
      queryParams.push(grade, grade);
    }

    if (status && status !== 'All' && status !== 'all') {
      if (status === 'pending_fee') {
        query += ' AND (ar.status = "pending_fee" OR ar.status = "pending" OR ar.fee_status = "pending") AND ar.status != "admitted" AND ar.status != "approved"';
      } else if (status === 'fee_verified') {
        query += ' AND (ar.status = "fee_verified" OR ar.fee_status = "paid") AND ar.status != "admitted" AND ar.status != "approved"';
      } else if (status === 'admitted') {
        query += ' AND (ar.status = "admitted" OR ar.status = "approved")';
      } else if (status === 'rejected') {
        query += ' AND ar.status = "rejected"';
      }
    }

    query += ' ORDER BY ar.created_at DESC LIMIT 100';

    const [applicants] = await pool.query(query, queryParams);
    res.json({ success: true, applicants });
  } catch (error) {
    console.error('Admissions Applicants Error:', error);
    res.status(500).json({ success: false, message: 'DB Error: ' + (error.sqlMessage || error.message) });
  }
});

// ==========================================
// 4. REGISTER NEW WALK-IN ADMISSION INQUIRY
// ==========================================
router.post('/inquiry', async (req, res) => {
  try {
    const {
      full_name, father_name, dob, gender, bform_number, father_cnic,
      phone, father_phone, email, address, city, target_class,
      campus_id, admission_fee, last_qualification, notes
    } = req.body;

    if (!full_name || !father_name || !target_class) {
      return res.status(400).json({
        success: false,
        message: 'Student Name, Father Name, and Target Grade/Class are required.'
      });
    }

    const assignedCampusId = campus_id || req.user?.campus_id || 1;
    const feeAmount = admission_fee ? parseFloat(admission_fee) : 5000.00;

    const [result] = await pool.query(`
      INSERT INTO admission_requests (
        full_name, father_name, dob, gender, bform_number, cnic,
        father_cnic, phone, father_phone, email, address, city,
        target_class, program, campus_id, admission_fee, fee_status,
        status, last_qualification, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending_fee', ?, ?)
    `, [
      full_name.trim(),
      father_name.trim(),
      dob || null,
      gender || 'Male',
      bform_number || '',
      bform_number || '',
      father_cnic || '',
      phone || father_phone || '',
      father_phone || phone || '',
      email || '',
      address || '',
      city || 'Lahore',
      target_class,
      target_class,
      assignedCampusId,
      feeAmount,
      last_qualification || '',
      notes || ''
    ]);

    res.status(201).json({
      success: true,
      message: 'Admission registered successfully. Challan ready for fee payment.',
      inquiryId: result.insertId
    });
  } catch (error) {
    console.error('Create Admission Inquiry Error:', error);
    res.status(500).json({ success: false, message: 'DB Error: ' + (error.sqlMessage || error.message) });
  }
});

// ==========================================
// 5. FINANCE FEE CLEARANCE & VERIFICATION
// ==========================================
router.put('/:id/fee-clearance', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;
    const verifiedBy = req.user ? req.user.id : null;

    const [result] = await pool.query(`
      UPDATE admission_requests
      SET fee_status = 'paid',
          fee_paid_at = NOW(),
          fee_verified_by = ?,
          payment_method = ?,
          status = 'fee_verified'
      WHERE id = ?
    `, [verifiedBy, payment_method || 'Cash Counter', id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    res.json({
      success: true,
      message: 'Admission fee verified and cleared successfully. Forwarded to Principal for Section & Roll No allotment!'
    });
  } catch (error) {
    console.error('Fee Clearance Error:', error);
    res.status(500).json({ success: false, message: 'DB Error: ' + (error.sqlMessage || error.message) });
  }
});

// ==========================================
// 6. PRINCIPAL FINAL APPROVAL & ENROLLMENT
// ==========================================
router.put('/:id/principal-admit', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { class_id, section, roll_number, review_note } = req.body;

    const [[applicant]] = await connection.query(
      'SELECT * FROM admission_requests WHERE id = ?',
      [id]
    );

    if (!applicant) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    const assignedRollNo = roll_number || `STU-${Date.now().toString().slice(-4)}`;
    const assignedSection = section || 'Section A';

    // 1. Update admission_requests status to admitted
    await connection.query(`
      UPDATE admission_requests
      SET status = 'admitted',
          assigned_class_id = ?,
          assigned_section = ?,
          assigned_roll_number = ?,
          reviewed_by = ?,
          review_note = ?
      WHERE id = ?
    `, [class_id || null, assignedSection, assignedRollNo, req.user?.id || null, review_note || 'Approved by Principal', id]);

    // 2. Create User account for student if not exists
    const studentEmail = applicant.email || `student.${applicant.id}@school.edu`;
    const hashedPassword = await bcrypt.hash('Student123', 10);

    const [userRes] = await connection.query(`
      INSERT INTO users (name, email, password, role, campus_id, is_approved, client_id)
      VALUES (?, ?, ?, 'student', ?, 1, (SELECT client_id FROM campuses WHERE id = ? LIMIT 1))
      ON DUPLICATE KEY UPDATE campus_id = VALUES(campus_id)
    `, [applicant.full_name, studentEmail, hashedPassword, applicant.campus_id || 1, applicant.campus_id || 1]);

    const studentUserId = userRes.insertId || userRes.id;

    // 3. Create Student record
    if (studentUserId) {
      await connection.query(`
        INSERT INTO students (user_id, roll_number, academic_status, father_name, father_cnic, father_number, bform_number)
        VALUES (?, ?, 'regular', ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE roll_number = VALUES(roll_number)
      `, [
        studentUserId,
        assignedRollNo,
        applicant.father_name || '',
        applicant.father_cnic || '',
        applicant.father_phone || applicant.phone || '',
        applicant.bform_number || applicant.cnic || ''
      ]);

      // 4. Enroll in class if class_id provided
      if (class_id) {
        const [[studentRec]] = await connection.query('SELECT id FROM students WHERE user_id = ?', [studentUserId]);
        if (studentRec) {
          await connection.query(`
            INSERT INTO student_classes (student_id, class_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE class_id = VALUES(class_id)
          `, [studentRec.id, class_id]);
        }
      }
    }

    await connection.commit();
    res.json({
      success: true,
      message: `Student ${applicant.full_name} officially admitted and enrolled in ${assignedSection} with Roll No: ${assignedRollNo}!`
    });
  } catch (error) {
    await connection.rollback();
    console.error('Principal Admit Error:', error);
    res.status(500).json({ success: false, message: 'DB Error: ' + (error.sqlMessage || error.message) });
  } finally {
    connection.release();
  }
});

// ==========================================
// 7. GET AVAILABLE CLASSES FOR A CAMPUS
// ==========================================
router.get('/classes/:campusId', async (req, res) => {
  try {
    const { campusId } = req.params;
    const [classes] = await pool.query(`
      SELECT cl.id, cl.name, cl.section, cl.academic_year, r.room_number
      FROM classes cl
      LEFT JOIN rooms r ON cl.room_id = r.id
      WHERE cl.campus_id = ?
      ORDER BY cl.name ASC
    `, [campusId]);

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'DB Error: ' + (error.sqlMessage || error.message) });
  }
});

// ==========================================
// 8. GET CAMPUSES / BRANCHES FOR DROPDOWN
// ==========================================
router.get('/campuses', async (req, res) => {
  try {
    const clientId = req.user?.client_id;
    let query = 'SELECT id, name, location FROM campuses WHERE 1=1';
    let params = [];
    if (clientId && req.user.role !== 'master_admin') {
      query += ' AND client_id = ?';
      params.push(clientId);
    }
    query += ' ORDER BY name ASC';
    const [campuses] = await pool.query(query, params);

    // Fallback if tenant has no campus yet
    if (!campuses || campuses.length === 0) {
      const [allCampuses] = await pool.query('SELECT id, name, location FROM campuses ORDER BY id ASC LIMIT 5');
      return res.json({ success: true, campuses: allCampuses });
    }

    res.json({ success: true, campuses });
  } catch (error) {
    console.error('Admissions campuses error:', error);
    res.status(500).json({ success: false, message: 'DB Error: ' + (error.sqlMessage || error.message) });
  }
});

module.exports = router;
