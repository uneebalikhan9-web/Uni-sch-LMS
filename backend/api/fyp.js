const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Initialize FYP tables if not exist
const initFYPTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`fyp_projects\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`title\` varchar(255) NOT NULL,
        \`domain\` varchar(100) DEFAULT 'Artificial Intelligence / Web',
        \`abstract\` text DEFAULT NULL,
        \`program_id\` int(11) DEFAULT NULL,
        \`supervisor_id\` int(11) DEFAULT NULL,
        \`co_supervisor_id\` int(11) DEFAULT NULL,
        \`batch_year\` int(11) DEFAULT 2026,
        \`status\` enum('proposed','approved','in_progress','mid_defense','final_defense','completed') DEFAULT 'proposed',
        \`grade\` varchar(5) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`idx_supervisor\` (\`supervisor_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`fyp_group_members\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`fyp_id\` int(11) NOT NULL,
        \`student_id\` int(11) NOT NULL,
        \`role\` enum('leader','member') DEFAULT 'member',
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uniq_fyp_student\` (\`fyp_id\`, \`student_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`fyp_milestones\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`fyp_id\` int(11) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`due_date\` date DEFAULT NULL,
        \`status\` enum('pending','submitted','approved','needs_revision') DEFAULT 'pending',
        \`submission_url\` text DEFAULT NULL,
        \`supervisor_comments\` text DEFAULT NULL,
        \`marks\` decimal(5,2) DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ FYP (Final Year Projects) tables initialized');
  } catch (err) {
    console.error('FYP tables init error:', err.message);
  }
};

initFYPTables();

// @route   GET /api/fyp
// @desc    Get all FYP projects
router.get('/', verifyToken, async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT f.*, u.name as supervisor_name, p.name as program_name,
        (SELECT COUNT(*) FROM fyp_group_members WHERE fyp_id = f.id) as total_members
      FROM fyp_projects f
      LEFT JOIN employees e ON f.supervisor_id = e.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN programs p ON f.program_id = p.id
      ORDER BY f.created_at DESC
    `);
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/fyp
// @desc    Create new FYP project
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, domain, abstract, program_id, supervisor_id, batch_year } = req.body;
    const [result] = await pool.query(
      'INSERT INTO fyp_projects (title, domain, abstract, program_id, supervisor_id, batch_year) VALUES (?, ?, ?, ?, ?, ?)',
      [title, domain || 'Software Engineering', abstract, program_id, supervisor_id, batch_year || 2026]
    );
    res.json({ success: true, id: result.insertId, message: 'FYP Project registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/fyp/:id/status
// @desc    Update project status / grade
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, grade } = req.body;
    await pool.query('UPDATE fyp_projects SET status = ?, grade = ? WHERE id = ?', [status, grade, req.params.id]);
    res.json({ success: true, message: 'Project status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/fyp/:id/members
// @desc    Get members of an FYP
router.get('/:id/members', verifyToken, async (req, res) => {
  try {
    const [members] = await pool.query(`
      SELECT gm.*, s.roll_number, u.name, u.email, u.phone
      FROM fyp_group_members gm
      JOIN students s ON gm.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE gm.fyp_id = ?
    `, [req.params.id]);
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/fyp/:id/members
// @desc    Add member to FYP
router.post('/:id/members', verifyToken, async (req, res) => {
  try {
    const { student_id, role } = req.body;
    await pool.query(
      'INSERT INTO fyp_group_members (fyp_id, student_id, role) VALUES (?, ?, ?)',
      [req.params.id, student_id, role || 'member']
    );
    res.json({ success: true, message: 'Member added to FYP group' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
