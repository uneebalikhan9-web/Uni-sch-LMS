const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Helper for multi-tenancy
const getCampusFilter = (req) => {
  const isSuperAdmin = req.user.role === 'super_admin';
  return {
    filter: isSuperAdmin ? '' : 'AND campus_id = ?',
    params: isSuperAdmin ? [] : [req.user.campus_id]
  };
};

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const { filter, params } = getCampusFilter(req);
    
    // Cumulative funnel logic
    const [[{ totalLeads }]] = await pool.query(`SELECT COUNT(*) as totalLeads FROM admission_applications WHERE 1=1 ${filter}`, params);
    const [[{ newApps }]] = await pool.query(`SELECT COUNT(*) as newApps FROM admission_applications WHERE stage IN ('Applied', 'Interview', 'Merit List', 'Admitted') ${filter}`, params);
    const [[{ interviewed }]] = await pool.query(`SELECT COUNT(*) as interviewed FROM admission_applications WHERE stage IN ('Interview', 'Merit List', 'Admitted') ${filter}`, params);
    const [[{ admitted }]] = await pool.query(`SELECT COUNT(*) as admitted FROM admission_applications WHERE stage = 'Admitted' ${filter}`, params);

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
    const { filter, params } = getCampusFilter(req);
    // Use alias a.campus_id in case programs also has campus_id later
    const aliasFilter = filter.replace('campus_id', 'a.campus_id');

    const [rows] = await pool.query(`
      SELECT a.*, p.name as program 
      FROM admission_applications a
      LEFT JOIN programs p ON a.program_id = p.id
      WHERE 1=1 ${aliasFilter}
      ORDER BY a.created_at DESC
    `, params);

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
          email: row.email,
          phone: row.phone || '',
          program_id: row.program_id,
          program: row.program || 'N/A',
          rawScore: row.score || '',
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

// Helper to auto-create verification document tasks when a candidate applies or transitions past 'Lead' stage
const createPendingDocuments = async (applicationId, campusId) => {
  try {
    const [existing] = await pool.query('SELECT id FROM admission_documents WHERE application_id = ?', [applicationId]);
    if (existing.length === 0) {
      await pool.query(`
        INSERT INTO admission_documents (application_id, document_type, status, notes, campus_id)
        VALUES 
        (?, 'Intermediate Transcript', 'pending', 'Awaiting academic transcript verification', ?),
        (?, 'Matric Certificate', 'pending', 'Awaiting secondary school certificate verification', ?)
      `, [applicationId, campusId, applicationId, campusId]);
      
      await pool.query(
        'INSERT INTO admission_logs (action_type, action_text, campus_id) VALUES (?, ?, ?)',
        ['verification', 'Generated Matric and Intermediate certificate verification tasks.', campusId]
      );
    }
  } catch (err) {
    console.error('Error auto-creating verification documents:', err);
  }
};

// ==========================================
// 3. VERIFICATIONS
// ==========================================
router.get('/verifications', async (req, res) => {
  try {
    const { filter, params } = getCampusFilter(req);
    const aliasFilter = filter.replace('campus_id', 'v.campus_id');

    const [rows] = await pool.query(`
      SELECT v.id, v.application_id, v.document_type as type, v.status, v.notes, 
             DATE_FORMAT(v.created_at, '%b %d, %Y') as date, a.name 
      FROM admission_documents v
      JOIN admission_applications a ON v.application_id = a.id
      WHERE 1=1 ${aliasFilter}
      ORDER BY v.created_at DESC
    `, params);
    res.json({ success: true, documents: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verifications/action', async (req, res) => {
  try {
    const { id, action } = req.body; // action: 'verified' or 'rejected'
    const campus_id = req.user.campus_id;

    await pool.query('UPDATE admission_documents SET status = ? WHERE id = ?', [action, id]);

    // Log the verification action
    const [[doc]] = await pool.query(`
      SELECT v.document_type, a.name 
      FROM admission_documents v 
      JOIN admission_applications a ON v.application_id = a.id 
      WHERE v.id = ?
    `, [id]);

    if (doc) {
      await pool.query(
        'INSERT INTO admission_logs (action_type, action_text, campus_id) VALUES (?, ?, ?)',
        ['verification', `Document "${doc.document_type}" for ${doc.name} was marked as ${action}.`, campus_id]
      );
    }

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
    const { filter, params } = getCampusFilter(req);
    const aliasFilter = filter.replace('campus_id', 'i.campus_id');

    const [rows] = await pool.query(`
      SELECT i.*, a.name, p.name as program
      FROM admission_interviews i
      JOIN admission_applications a ON i.application_id = a.id
      LEFT JOIN programs p ON a.program_id = p.id
      WHERE 1=1 ${aliasFilter}
      ORDER BY i.interview_date ASC, i.interview_time ASC
    `, params);
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
    const { filter, params } = getCampusFilter(req);
    const aliasFilter = filter.replace('campus_id', 'a.campus_id');

    const [rows] = await pool.query(`
      SELECT a.*, p.name as program 
      FROM admission_applications a
      LEFT JOIN programs p ON a.program_id = p.id
      WHERE a.stage IN ('Merit List', 'Admitted') ${aliasFilter}
      ORDER BY a.score DESC
    `, params);
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
    const { filter, params } = getCampusFilter(req);
    const [rows] = await pool.query(`SELECT * FROM admission_logs WHERE 1=1 ${filter} ORDER BY created_at DESC LIMIT 10`, params);
    res.json({ success: true, activities: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 7. GET PROGRAMS (for dropdowns)
// ==========================================
router.get('/programs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, code FROM programs ORDER BY name ASC');
    res.json({ success: true, programs: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 8. ADD NEW CANDIDATE
// ==========================================
router.post('/applications', async (req, res) => {
  try {
    const { name, email, phone, program_id, stage, score } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required' });
    }

    const campus_id = req.user.campus_id;
    
    // Insert application
    const [result] = await pool.query(
      'INSERT INTO admission_applications (name, email, phone, program_id, stage, score, campus_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, program_id || null, stage || 'Lead', score || null, campus_id]
    );

    // Log action
    await pool.query(
      'INSERT INTO admission_logs (action_type, action_text, campus_id) VALUES (?, ?, ?)',
      ['application', `Added candidate ${name} in stage ${stage || 'Lead'}`, campus_id]
    );

    // Auto-create document verification tasks if the candidate starts past "Lead" stage
    if (stage && stage !== 'Lead') {
      await createPendingDocuments(result.insertId, campus_id);
    }

    res.status(201).json({ success: true, message: 'Candidate added successfully', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 9. UPDATE CANDIDATE STAGE
// ==========================================
router.put('/applications/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const campus_id = req.user.campus_id;

    if (!stage) {
      return res.status(400).json({ success: false, message: 'Stage is required' });
    }

    const validStages = ['Lead', 'Applied', 'Shortlisted', 'Interview', 'Merit List', 'Admitted'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ success: false, message: 'Invalid stage value' });
    }

    // Fetch candidate info for log before updating
    const [candidates] = await pool.query('SELECT name FROM admission_applications WHERE id = ?', [id]);
    if (candidates.length === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    const name = candidates[0].name;

    // Update query with campus-isolation checks
    const filterClause = req.user.role === 'super_admin' ? '' : 'AND campus_id = ?';
    const filterParams = req.user.role === 'super_admin' ? [stage, id] : [stage, id, campus_id];

    const [result] = await pool.query(
      `UPDATE admission_applications SET stage = ? WHERE id = ? ${filterClause}`,
      filterParams
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ success: false, message: 'Access denied or candidate not found' });
    }

    // Log action
    await pool.query(
      'INSERT INTO admission_logs (action_type, action_text, campus_id) VALUES (?, ?, ?)',
      ['application', `Moved ${name} to ${stage}`, campus_id]
    );

    // Auto-create document verification tasks when candidate transitions beyond 'Lead' stage
    if (stage !== 'Lead') {
      await createPendingDocuments(id, campus_id);
    }

    res.json({ success: true, message: 'Stage updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 10. DELETE CANDIDATE
// ==========================================
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campus_id = req.user.campus_id;

    // Check ownership/campus if not super_admin
    const filterClause = req.user.role === 'super_admin' ? '' : 'AND campus_id = ?';
    const filterParams = req.user.role === 'super_admin' ? [id] : [id, campus_id];

    // Fetch candidate info for log before deleting
    const [candidates] = await pool.query('SELECT name FROM admission_applications WHERE id = ?', [id]);
    if (candidates.length === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    const name = candidates[0].name;

    const [result] = await pool.query(
      `DELETE FROM admission_applications WHERE id = ? ${filterClause}`,
      filterParams
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ success: false, message: 'Access denied or candidate not found' });
    }

    // Log action
    await pool.query(
      'INSERT INTO admission_logs (action_type, action_text, campus_id) VALUES (?, ?, ?)',
      ['application', `Deleted candidate ${name}`, campus_id]
    );

    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 11. EDIT/UPDATE CANDIDATE DETAILS
// ==========================================
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, program_id, stage, score } = req.body;
    const campus_id = req.user.campus_id;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required' });
    }

    // Check ownership/campus if not super_admin
    const filterClause = req.user.role === 'super_admin' ? '' : 'AND campus_id = ?';
    const filterParams = req.user.role === 'super_admin' 
      ? [name, email, phone || null, program_id || null, stage || 'Lead', score || null, id] 
      : [name, email, phone || null, program_id || null, stage || 'Lead', score || null, id, campus_id];

    const [result] = await pool.query(
      `UPDATE admission_applications 
       SET name = ?, email = ?, phone = ?, program_id = ?, stage = ?, score = ? 
       WHERE id = ? ${filterClause}`,
      filterParams
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ success: false, message: 'Access denied or candidate not found' });
    }

    // Log action
    await pool.query(
      'INSERT INTO admission_logs (action_type, action_text, campus_id) VALUES (?, ?, ?)',
      ['application', `Updated candidate details for ${name}`, campus_id]
    );

    res.json({ success: true, message: 'Candidate updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
