const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// Initialize OBE tables if not exist
const initOBETables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`obe_plos\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`program_id\` int(11) NOT NULL,
        \`plo_code\` varchar(20) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`idx_prog\` (\`program_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`obe_clos\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`course_id\` int(11) NOT NULL,
        \`clo_code\` varchar(20) NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`bloom_level\` varchar(50) DEFAULT 'Cognitive-C3',
        \`description\` text DEFAULT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        KEY \`idx_course\` (\`course_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`obe_clo_plo_mappings\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`clo_id\` int(11) NOT NULL,
        \`plo_id\` int(11) NOT NULL,
        \`weightage\` decimal(5,2) DEFAULT 100.00,
        \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uniq_clo_plo\` (\`clo_id\`, \`plo_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ OBE (CLO-PLO) tables initialized');
  } catch (err) {
    console.error('OBE tables init error:', err.message);
  }
};

initOBETables();

// @route   GET /api/obe/plos/:programId
router.get('/plos/:programId', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM obe_plos WHERE program_id = ? ORDER BY plo_code', [req.params.programId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/obe/plos
router.post('/plos', verifyToken, async (req, res) => {
  try {
    const { program_id, plo_code, title, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO obe_plos (program_id, plo_code, title, description) VALUES (?, ?, ?, ?)',
      [program_id, plo_code, title, description]
    );
    res.json({ success: true, id: result.insertId, message: 'PLO created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/obe/clos/:courseId
router.get('/clos/:courseId', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM obe_clos WHERE course_id = ? ORDER BY clo_code', [req.params.courseId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/obe/clos
router.post('/clos', verifyToken, async (req, res) => {
  try {
    const { course_id, clo_code, title, bloom_level, description } = req.body;
    const [result] = await pool.query(
      'INSERT INTO obe_clos (course_id, clo_code, title, bloom_level, description) VALUES (?, ?, ?, ?, ?)',
      [course_id, clo_code, title, bloom_level || 'Cognitive-C3', description]
    );
    res.json({ success: true, id: result.insertId, message: 'CLO created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/obe/mappings/:courseId
router.get('/mappings/:courseId', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.*, c.clo_code, c.title as clo_title, p.plo_code, p.title as plo_title
      FROM obe_clo_plo_mappings m
      JOIN obe_clos c ON m.clo_id = c.id
      JOIN obe_plos p ON m.plo_id = p.id
      WHERE c.course_id = ?
    `, [req.params.courseId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/obe/mappings
router.post('/mappings', verifyToken, async (req, res) => {
  try {
    const { clo_id, plo_id, weightage } = req.body;
    await pool.query(
      'INSERT INTO obe_clo_plo_mappings (clo_id, plo_id, weightage) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE weightage = ?',
      [clo_id, plo_id, weightage || 100.00, weightage || 100.00]
    );
    res.json({ success: true, message: 'CLO-PLO mapped successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
