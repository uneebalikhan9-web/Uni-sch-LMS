const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and super admin check to all routes
router.use(verifyToken);
router.use(isSuperAdmin);

// ==================== GLOBAL OVERVIEW ====================

router.get('/overview', async (req, res) => {
  try {
    const [[{ totalCampuses }]] = await pool.query('SELECT COUNT(*) as totalCampuses FROM campuses');
    const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'");
    const [[{ totalTeachers }]] = await pool.query("SELECT COUNT(*) as totalTeachers FROM users WHERE role = 'teacher'");
    const [[{ totalPrincipals }]] = await pool.query("SELECT COUNT(*) as totalPrincipals FROM users WHERE role = 'principal'");
    const [[{ totalBds }]] = await pool.query("SELECT COUNT(*) as totalBds FROM users WHERE role IN ('bd', 'bd_agent')");
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) as totalCourses FROM courses');

    // Per-campus breakdown
    const [campusStats] = await pool.query(`
      SELECT 
        c.id,
        c.name as campus_name,
        c.is_active,
        COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.id END) as students,
        COUNT(DISTINCT CASE WHEN u.role = 'teacher' THEN u.id END) as teachers,
        COUNT(DISTINCT CASE WHEN u.role = 'principal' THEN u.id END) as principals
      FROM campuses c
      LEFT JOIN users u ON u.campus_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      overview: { totalCampuses, totalStudents, totalTeachers, totalPrincipals, totalBds, totalCourses },
      campusStats
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ success: false, message: 'Error fetching overview' });
  }
});

// ==================== CAMPUSES CRUD ====================

// Get all campuses
router.get('/campuses', async (req, res) => {
  try {
    const [campuses] = await pool.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.id END) as student_count,
        COUNT(DISTINCT CASE WHEN u.role = 'teacher' THEN u.id END) as teacher_count,
        COUNT(DISTINCT CASE WHEN u.role = 'principal' THEN u.id END) as principal_count
      FROM campuses c
      LEFT JOIN users u ON u.campus_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, campuses });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
});

// Create campus
router.post('/campuses', async (req, res) => {
  try {
    const { name, location, subscription_plan, dept_code } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO campuses (name, location, subscription_plan, dept_code) VALUES (?, ?, ?, ?)',
      [name, location || '', subscription_plan || 'basic', dept_code || null]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: { id: result.insertId, name, location }
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ success: false, message: 'Error creating department' });
  }
});

// Update department
router.put('/campuses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, subscription_plan, is_active, dept_code } = req.body;

    const [existing] = await pool.query('SELECT id FROM campuses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await pool.query(
      'UPDATE campuses SET name = ?, location = ?, is_active = ?, dept_code = ? WHERE id = ?',
      [name, location, is_active !== undefined ? is_active : true, dept_code || null, id]
    );

    res.json({ success: true, message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, message: 'Error updating department' });
  }
});

// Delete department
router.delete('/campuses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM campuses WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Unassign users from this department before deleting
    await pool.query('UPDATE users SET campus_id = NULL WHERE campus_id = ?', [id]);
    await pool.query('DELETE FROM campuses WHERE id = ?', [id]);

    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ success: false, message: 'Error deleting department' });
  }
});

// ==================== HOD MANAGEMENT ====================

// Get all HODs
router.get('/principals', async (req, res) => {
  try {
    const [principals] = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role = 'principal'
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, principals });
  } catch (error) {
    console.error('Get HODs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching HODs' });
  }
});

// Create a new HOD and assign to department
router.post('/principals', async (req, res) => {
  try {
    const { name, email, password, campus_id } = req.body;

    if (!name || !email || !password || !campus_id) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and department_id are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const [campus] = await pool.query('SELECT id FROM campuses WHERE id = ?', [campus_id]);
    if (campus.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, campus_id, is_approved) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'principal', campus_id, true]
    );

    res.status(201).json({
      success: true,
      message: 'HOD created successfully',
      principal: { id: result.insertId, name, email, role: 'principal', campus_id }
    });
  } catch (error) {
    console.error('Create HOD error:', error);
    res.status(500).json({ success: false, message: 'Error creating HOD' });
  }
});

// Delete HOD
router.delete('/principals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [principals] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'principal'", [id]);
    if (principals.length === 0) {
      return res.status(404).json({ success: false, message: 'HOD not found' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'HOD deleted successfully' });
  } catch (error) {
    console.error('Delete HOD error:', error);
    res.status(500).json({ success: false, message: 'Error deleting HOD' });
  }
});

// Get HOD detailed stats
router.get('/principals/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    // Get HOD info and department
    const [hodData] = await pool.query(`
      SELECT 
        u.id, u.name, u.email, u.created_at, u.campus_id, 
        c.name as campus_name, c.location as campus_location, 
        c.is_active as campus_status
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.id = ? AND u.role = 'principal'
    `, [id]);

    if (hodData.length === 0) {
      return res.status(404).json({ success: false, message: 'HOD not found' });
    }

    const hod = hodData[0];
    const campusId = hod.campus_id;

    // Get Counts
    const [[{ students }]] = await pool.query("SELECT COUNT(*) as students FROM users WHERE role = 'student' AND campus_id = ?", [campusId]);
    const [[{ teachers }]] = await pool.query("SELECT COUNT(*) as teachers FROM users WHERE role = 'teacher' AND campus_id = ?", [campusId]);
    const [[{ classes }]] = await pool.query("SELECT COUNT(*) as classes FROM classes WHERE campus_id = ?", [campusId]);
    const [[{ courses }]] = await pool.query("SELECT COUNT(*) as courses FROM courses WHERE campus_id = ?", [campusId]);
    const [[{ labs }]] = await pool.query("SELECT COUNT(*) as labs FROM labs WHERE hod_id = ?", [id]);

    res.json({
      success: true,
      details: {
        ...hod,
        stats: { students, teachers, classes, courses, labs }
      }
    });
  } catch (error) {
    console.error('Get HOD details error:', error);
    res.status(500).json({ success: false, message: 'Error fetching HOD details' });
  }
});

// ==================== BD MANAGEMENT ====================

// Get all BD Users
router.get('/bds', async (req, res) => {
  try {
    const [bds] = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at, u.is_approved, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role IN ('bd', 'bd_agent')
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, bds });
  } catch (error) {
    console.error('Get BDs error:', error);
    res.status(500).json({ success: false, message: 'Error fetching BD users' });
  }
});

// Create a new BD User
router.post('/bds', async (req, res) => {
  try {
    const { name, email, password, campus_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'bd_agent', true, campus_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'BD user created successfully',
      bd: { id: result.insertId, name, email, role: 'bd_agent', campus_id: campus_id || null }
    });
  } catch (error) {
    console.error('Create BD error:', error);
    res.status(500).json({ success: false, message: 'Error creating BD user' });
  }
});

// Update BD User details
router.put('/bds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, campus_id } = req.body;

    const [existing] = await pool.query("SELECT id FROM users WHERE id = ? AND role IN ('bd', 'bd_agent')", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'BD user not found' });
    }

    let query = 'UPDATE users SET name = ?, email = ?, campus_id = ?';
    let params = [name, email, campus_id || null];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    res.json({ success: true, message: 'BD user updated successfully' });
  } catch (error) {
    console.error('Update BD error:', error);
    res.status(500).json({ success: false, message: 'Error updating BD user' });
  }
});

// Delete BD User
router.delete('/bds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [bds] = await pool.query("SELECT id FROM users WHERE id = ? AND role IN ('bd', 'bd_agent')", [id]);
    if (bds.length === 0) {
      return res.status(404).json({ success: false, message: 'BD user not found' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'BD user deleted successfully' });
  } catch (error) {
    console.error('Delete BD error:', error);
    res.status(500).json({ success: false, message: 'Error deleting BD user' });
  }
});

// Get BD detailed stats
router.get('/bds/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    // Get BD info
    const [bdData] = await pool.query(`
      SELECT u.id, u.name, u.email, u.created_at, u.role, u.is_approved, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.id = ? AND u.role IN ('bd', 'bd_agent')
    `, [id]);

    if (bdData.length === 0) {
      return res.status(404).json({ success: false, message: 'BD user not found' });
    }

    const bd = bdData[0];

    // Get BD-specific counts
    const [[{ totalLeads }]] = await pool.query("SELECT COUNT(*) as totalLeads FROM bd_campus_leads WHERE assigned_to = ?", [id]);
    const [[{ closedLeads }]] = await pool.query("SELECT COUNT(*) as closedLeads FROM bd_campus_leads WHERE assigned_to = ? AND status = 'closed_won'", [id]);
    const [[{ activePostings }]] = await pool.query("SELECT COUNT(*) as activePostings FROM bd_job_postings WHERE status = 'open'"); // Not directly linked to BD ID in current schema, but relevant overview
    const [[{ totalApplicants }]] = await pool.query("SELECT COUNT(*) as totalApplicants FROM bd_applicants");
    const [[{ shortlistedApplicants }]] = await pool.query("SELECT COUNT(*) as shortlistedApplicants FROM bd_applicants WHERE status = 'shortlisted'");

    res.json({
      success: true,
      details: {
        ...bd,
        stats: { totalLeads, closedLeads, activePostings, totalApplicants, shortlistedApplicants }
      }
    });
  } catch (error) {
    console.error('Get BD details error:', error);
    res.status(500).json({ success: false, message: 'Error fetching BD details', error: error.message });
  }
});

module.exports = router;
