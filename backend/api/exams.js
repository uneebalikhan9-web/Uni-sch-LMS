const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const [[{ totalExams }]] = await pool.query('SELECT COUNT(*) as totalExams FROM exams');
        const [[{ pendingResults }]] = await pool.query('SELECT COUNT(*) as pendingResults FROM exams WHERE id NOT IN (SELECT DISTINCT exam_id FROM exam_results)');
        const [[{ avgPassRate }]] = await pool.query(`
            SELECT ROUND(AVG(pass_count * 100.0 / total_count), 1) as avgPassRate 
            FROM (
                SELECT exam_id, 
                COUNT(*) as total_count, 
                SUM(CASE WHEN marks_obtained >= 50 THEN 1 ELSE 0 END) as pass_count
                FROM exam_results
                GROUP BY exam_id
            ) as exam_stats
        `);

        res.json({
            success: true,
            stats: {
                totalExams,
                pendingResults,
                avgPassRate: avgPassRate || 0,
                daysToFinals: 14 // Mocked or calculated from next major exam
            }
        });
    } catch (error) {
        console.error('Error fetching exam stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 2. EXAM MANAGEMENT
// ==========================================
router.get('/list', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.*, c.title as course_name 
            FROM exams e 
            JOIN courses c ON e.course_id = c.id 
            ORDER BY e.exam_date DESC
        `);
        res.json({ success: true, exams: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/create', verifyToken, async (req, res) => {
    const { course_id, name, exam_date, max_marks, room_number } = req.body;
    try {
        await pool.query(
            'INSERT INTO exams (course_id, name, exam_date, max_marks, room_number) VALUES (?, ?, ?, ?, ?)',
            [course_id, name, exam_date, max_marks || 100, room_number]
        );
        res.json({ success: true, message: 'Exam scheduled successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get enrolled students for a specific exam
router.get('/:examId/students', verifyToken, async (req, res) => {
    try {
        const { examId } = req.params;
        const [rows] = await pool.query(`
            SELECT u.id, u.name, u.email, s.roll_number 
            FROM exams e
            JOIN enrollments en ON e.course_id = en.course_id
            JOIN students s ON en.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE e.id = ? AND en.status = 'approved'
            ORDER BY u.name ASC
        `, [examId]);
        res.json({ success: true, students: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 3. RESULTS MANAGEMENT
// ==========================================
router.get('/results/:examId', verifyToken, async (req, res) => {
    try {
        const { examId } = req.params;
        const [rows] = await pool.query(`
            SELECT er.*, u.name as student_name, s.roll_number 
            FROM exam_results er
            JOIN exams e ON er.exam_id = e.id
            JOIN enrollments en ON er.student_id = en.student_id AND e.course_id = en.course_id
            JOIN students s ON er.student_id = s.id
            JOIN users u ON s.user_id = u.id
            WHERE er.exam_id = ? AND en.status = 'approved'
        `, [examId]);
        res.json({ success: true, results: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/results', verifyToken, async (req, res) => {
    const { exam_id, results } = req.body; // results: [{ student_id, marks_obtained, remarks }]
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (let res of results) {
            const gpa = (res.marks_obtained / 100) * 4; // Simple GPA calc
            let grade = 'F';
            if (res.marks_obtained >= 85) grade = 'A';
            else if (res.marks_obtained >= 70) grade = 'B';
            else if (res.marks_obtained >= 50) grade = 'C';

            await connection.query(
                'INSERT INTO exam_results (exam_id, student_id, marks_obtained, grade, gpa, remarks) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE marks_obtained = ?, grade = ?, gpa = ?, remarks = ?',
                [exam_id, res.student_id, res.marks_obtained, grade, gpa, res.remarks, res.marks_obtained, grade, gpa, res.remarks]
            );
        }

        await connection.commit();
        res.json({ success: true, message: 'Results processed successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

// Get My Exam Schedule (Student Role)
router.get('/student-schedule', verifyToken, async (req, res) => {
    try {
        const studentId = req.user.student_id;
        const [rows] = await pool.query(`
            SELECT e.*, c.title as course_name 
            FROM exams e
            JOIN courses c ON e.course_id = c.id
            JOIN enrollments en ON c.id = en.course_id
            WHERE en.student_id = ? AND en.status = 'approved'
            ORDER BY e.exam_date ASC
        `, [studentId]);
        res.json({ success: true, exams: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 4. ROOMS AND SEATING PLANS
// ==========================================
router.get('/rooms', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM exam_rooms ORDER BY name ASC');
        res.json({ success: true, rooms: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// 5. MALPRACTICE LOGS
// ==========================================
router.get('/malpractice', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT m.*, u.name as student_name, s.roll_number, e.name as exam_name
            FROM exam_malpractice_logs m
            JOIN users u ON m.student_id = u.id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN exams e ON m.exam_id = e.id
            ORDER BY m.incident_date DESC
        `);
        res.json({ success: true, logs: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/malpractice', verifyToken, async (req, res) => {
    const { student_id, exam_id, incident_description, severity, status, incident_date } = req.body;
    try {
        await pool.query(`
            INSERT INTO exam_malpractice_logs 
            (student_id, exam_id, incident_description, severity, status, incident_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [student_id, exam_id || null, incident_description, severity, status || 'Pending', incident_date || new Date()]);
        res.json({ success: true, message: 'Incident logged successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/malpractice/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM exam_malpractice_logs WHERE id = ?', [id]);
        res.json({ success: true, message: 'Incident record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
