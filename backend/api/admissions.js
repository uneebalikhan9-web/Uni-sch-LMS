const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalLeads }]] = await pool.query('SELECT COUNT(*) as totalLeads FROM admission_applications WHERE stage = "Lead"');
    const [[{ newApps }]] = await pool.query('SELECT COUNT(*) as newApps FROM admission_applications WHERE stage = "Applied"');
    const [[{ interviewed }]] = await pool.query('SELECT COUNT(*) as interviewed FROM admission_applications WHERE stage = "Interview"');
    const [[{ admitted }]] = await pool.query('SELECT COUNT(*) as admitted FROM admission_applications WHERE stage = "Admitted"');

    res.json({
      success: true,
      stats: { totalLeads, newApps, interviewed, admitted }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. PIPELINE DATA
// ==========================================
router.get('/pipeline', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, p.name as program 
      FROM admission_applications a
      LEFT JOIN programs p ON a.program_id = p.id
      ORDER BY a.created_at DESC
    `);

    // Group by stage
    const pipeline = {
      Lead: [],
      Applied: [],
      Interview: [],
      'Merit List': [],
      Admitted: []
    };

    rows.forEach(row => {
      if (pipeline[row.stage]) {
        pipeline[row.stage].push({
          id: row.id,
          name: row.name,
          program: row.program || 'N/A',
          score: row.score ? `${parseFloat(row.score).toFixed(2)}%` : 'N/A',
          date: row.created_at ? new Date(row.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'
        });
      }
    });


    res.json({ success: true, pipeline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. VERIFICATIONS
// ==========================================
router.get('/verifications', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, a.name 
      FROM admission_documents v
      JOIN admission_applications a ON v.application_id = a.id
      ORDER BY v.created_at DESC
    `);
    res.json({ success: true, documents: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verifications/action', async (req, res) => {
  try {
    const { id, action } = req.body; // action: 'verified' or 'rejected'
    await pool.query('UPDATE admission_documents SET status = ? WHERE id = ?', [action, id]);
    res.json({ success: true, message: `Document ${action}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 4. INTERVIEWS
// ==========================================
router.get('/interviews', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, a.name, p.name as program
      FROM admission_interviews i
      JOIN admission_applications a ON i.application_id = a.id
      LEFT JOIN programs p ON a.program_id = p.id
      ORDER BY i.interview_date ASC, i.interview_time ASC
    `);
    res.json({ success: true, interviews: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. MERIT LIST
// ==========================================
router.get('/merit-list', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, p.name as program 
      FROM admission_applications a
      LEFT JOIN programs p ON a.program_id = p.id
      WHERE a.stage IN ('Merit List', 'Admitted')
      ORDER BY a.score DESC
    `);
    res.json({ success: true, meritList: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 6. ACTIVITIES (LOGS)
// ==========================================
router.get('/activities', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM admission_logs ORDER BY created_at DESC LIMIT 10');
    res.json({ success: true, activities: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
