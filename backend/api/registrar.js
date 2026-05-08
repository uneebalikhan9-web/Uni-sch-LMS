const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_enrolled }]] = await pool.query(`
      SELECT COUNT(*) as total_enrolled 
      FROM students 
      WHERE academic_status IN ('regular', 'probation')
    `);

    const [[{ degrees_issued }]] = await pool.query(`
      SELECT COUNT(*) as degrees_issued 
      FROM registrar_degrees 
      WHERE status = 'Issued' AND YEAR(issue_date) = YEAR(CURDATE())
    `);

    const [[{ pending_verifications }]] = await pool.query(`
      SELECT COUNT(*) as pending_verifications 
      FROM registrar_degree_verifications 
      WHERE status = 'Pending'
    `);

    const [[{ transcript_requests }]] = await pool.query(`
      SELECT COUNT(*) as transcript_requests 
      FROM registrar_transcript_requests 
      WHERE status = 'Pending'
    `);

    res.json({
      success: true,
      stats: {
        totalEnrolled: total_enrolled,
        degreesIssued: degrees_issued,
        pendingVerifications: pending_verifications,
        transcriptRequests: transcript_requests
      }
    });
  } catch (error) {
    console.error('Error fetching registrar stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 2. STUDENT RECORDS
// ==========================================
router.get('/students', async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        s.roll_number as id,
        u.name,
        p.name as program,
        '3.50' as cgpa, 
        s.academic_status as status
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN programs p ON s.program_id = p.id
      ORDER BY s.id DESC
      LIMIT 100
    `);

    const mappedStudents = students.map(s => ({
      ...s,
      status: s.status === 'regular' ? 'Enrolled' : 
              s.status === 'graduated' ? 'Graduated' : 
              s.status === 'suspended' ? 'Suspended' : 'Warning'
    }));

    res.json({ success: true, students: mappedStudents });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 3. UPDATE STUDENT STATUS
// ==========================================
router.put('/students/:roll_number/status', async (req, res) => {
  try {
    const { roll_number } = req.params;
    const { status } = req.body;
    // Map frontend status to DB enum: 'Enrolled' -> 'regular', 'Graduated' -> 'graduated', 'Suspended' -> 'suspended'
    const dbStatus = status === 'Enrolled' ? 'regular' : status === 'Graduated' ? 'graduated' : 'suspended';
    
    await pool.execute(
      'UPDATE students SET academic_status = ? WHERE roll_number = ?',
      [dbStatus, roll_number]
    );
    res.json({ success: true, message: 'Student status updated successfully' });
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 4. PENDING DEGREE VERIFICATIONS
// ==========================================
router.get('/verifications/pending', async (req, res) => {
  try {
    const [verifications] = await pool.query(`
      SELECT 
        v.id as request_id,
        v.company_name as company,
        u.name as student,
        d.serial_number as degreeSerial,
        v.request_date as date,
        v.status
      FROM registrar_degree_verifications v
      JOIN registrar_degrees d ON v.degree_id = d.id
      JOIN users u ON d.student_id = u.id
      WHERE v.status = 'Pending'
      ORDER BY v.request_date DESC
    `);

    const mappedVerifications = verifications.map(v => ({
      ...v,
      id: `REQ-${v.request_id + 8000}`
    }));

    res.json({ success: true, verifications: mappedVerifications });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 4. ACTION: VERIFY / REJECT
// ==========================================
router.post('/verifications/action', async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const dbId = parseInt(requestId.replace('REQ-', '')) - 8000;
    const newStatus = action === 'verify' ? 'Verified' : 'Rejected';

    await pool.execute(
      'UPDATE registrar_degree_verifications SET status = ? WHERE id = ?',
      [newStatus, dbId]
    );

    res.json({ success: true, message: `Verification ${newStatus.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error updating verification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 5. TRANSCRIPT REQUESTS
// ==========================================
router.get('/transcripts', async (req, res) => {
  try {
    const [transcripts] = await pool.query(`
      SELECT 
        tr.id,
        u.name as student,
        p.name as program,
        tr.request_date as date,
        tr.status,
        tr.notes
      FROM registrar_transcript_requests tr
      JOIN users u ON tr.student_id = u.id
      JOIN students s ON s.user_id = u.id
      LEFT JOIN programs p ON s.program_id = p.id
      ORDER BY tr.request_date DESC
    `);

    res.json({ success: true, transcripts });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 6. ACTION: PROCESS TRANSCRIPT
// ==========================================
router.post('/transcripts/process', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.execute(
      'UPDATE registrar_transcript_requests SET status = "Completed" WHERE id = ?',
      [id]
    );
    res.json({ success: true, message: 'Transcript processed successfully' });
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 7. ALUMNI DIRECTORY
// ==========================================
router.get('/alumni', async (req, res) => {
  try {
    const [alumni] = await pool.query(`
      SELECT 
        s.roll_number as id,
        u.name,
        p.name as program,
        '2024' as graduation_year,
        '3.65' as cgpa
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN programs p ON s.program_id = p.id
      WHERE s.academic_status = 'graduated'
      ORDER BY u.name ASC
    `);

    res.json({ success: true, alumni });
  } catch (error) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
