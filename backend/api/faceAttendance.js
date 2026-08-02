const express = require('express');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

const syncPastFaceAttendance = async () => {
  try {
    console.log('[SYNC] Checking and syncing past campus face attendance to courses...');
    const [scans] = await pool.query('SELECT student_id, DATE_FORMAT(date, "%Y-%m-%d") as date FROM campus_attendance');
    let syncCount = 0;
    for (const scan of scans) {
      const { student_id, date } = scan;
      const [studentClasses] = await pool.query(
        'SELECT class_id FROM student_classes WHERE student_id = ?',
        [student_id]
      );
      if (studentClasses.length > 0) {
        const classIds = studentClasses.map(sc => sc.class_id);
        const [courses] = await pool.query(
          'SELECT id, class_id, teacher_id FROM courses WHERE class_id IN (?) AND status = "active"',
          [classIds]
        );
        for (const course of courses) {
          const [[exists]] = await pool.query(
            'SELECT id FROM attendance WHERE student_id = ? AND date = ? AND course_id = ?',
            [student_id, date, course.id]
          );
          if (!exists) {
            await pool.query(
              `INSERT INTO attendance 
               (class_id, course_id, student_id, teacher_id, status, date, method) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [course.class_id, course.id, student_id, course.teacher_id || 0, 'present', date, 'Face AI']
            );
            syncCount++;
          }
        }
      }
    }
    if (syncCount > 0) {
      console.log(`[SYNC] Successfully synced ${syncCount} past face attendance records to course sheets!`);
    } else {
      console.log('[SYNC] All past face attendance records are already in sync.');
    }
  } catch (e) {
    console.error('[SYNC] Error syncing past face attendance:', e);
  }
};

const ensureTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS face_descriptors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      label VARCHAR(255) NOT NULL,
      descriptor LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student (student_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS campus_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_daily (student_id, date),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);
  await syncPastFaceAttendance();
};
ensureTables().catch(e => console.error('Face attendance table setup error:', e));

// ── GET all face descriptors (filtered by tenant) ──────────────────────────
router.get('/descriptors', async (req, res) => {
  try {
    const clientId = req.user.client_id;
    const campusId = req.user.campus_id;
    let query = `
      SELECT fd.student_id, fd.label, fd.descriptor, u.name as student_name, s.roll_number
      FROM face_descriptors fd
      JOIN students s ON fd.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (clientId && req.user.role !== 'master_admin') {
      query += ` AND u.client_id = ?`;
      params.push(clientId);
    }
    if (campusId && ['principal', 'admin'].includes(req.user.role)) {
      query += ` AND s.campus_id = ?`;
      params.push(campusId);
    }

    const [rows] = await pool.query(query, params);
    const descriptors = rows.map(r => ({
      student_id: r.student_id,
      label: r.label,
      student_name: r.student_name,
      roll_number: r.roll_number,
      descriptor: JSON.parse(r.descriptor)
    }));
    res.json({ success: true, descriptors });
  } catch (error) {
    console.error('Get descriptors error:', error);
    res.status(500).json({ success: false, message: 'Error fetching face descriptors' });
  }
});

// ── POST save face descriptor for a student ─────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { student_id, label, descriptor } = req.body;
    if (!student_id || !label || !descriptor) {
      return res.status(400).json({ success: false, message: 'student_id, label, and descriptor are required' });
    }
    // Verify student exists and belongs to the user's client
    const [[student]] = await pool.query(
      'SELECT s.id, u.client_id FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [student_id]
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    if (req.user.role !== 'master_admin' && req.user.client_id && student.client_id !== req.user.client_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Student belongs to another institution.' });
    }

    await pool.query(
      `INSERT INTO face_descriptors (student_id, label, descriptor) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE label = VALUES(label), descriptor = VALUES(descriptor)`,
      [student_id, label, JSON.stringify(descriptor)]
    );
    res.json({ success: true, message: `Face registered for student ID ${student_id}` });
  } catch (error) {
    console.error('Register face error:', error);
    res.status(500).json({ success: false, message: 'Error saving face descriptor' });
  }
});

// ── POST mark campus attendance ─────────────────────────────────────────────
router.post('/mark', async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ success: false, message: 'student_id is required' });

    // Verify student exists and belongs to user's client
    const [[studentInfo]] = await pool.query(
      `SELECT u.name, u.client_id, s.roll_number FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
      [student_id]
    );
    if (!studentInfo) return res.status(404).json({ success: false, message: 'Student not found' });

    if (req.user.role !== 'master_admin' && req.user.client_id && studentInfo.client_id !== req.user.client_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized. Student belongs to another institution.' });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0];

    // Check if already marked today
    const [[existing]] = await pool.query(
      'SELECT id FROM campus_attendance WHERE student_id = ? AND date = ?',
      [student_id, today]
    );

    if (existing) {
      return res.json({ success: true, status: 'already_marked', message: 'Attendance already marked today' });
    }

    await pool.query(
      'INSERT INTO campus_attendance (student_id, date, time) VALUES (?, ?, ?)',
      [student_id, today, now]
    );

    // Auto-mark present in course attendance for all active courses this student belongs to
    try {
      const [studentClasses] = await pool.query(
        'SELECT class_id FROM student_classes WHERE student_id = ?',
        [student_id]
      );
      if (studentClasses.length > 0) {
        const classIds = studentClasses.map(sc => sc.class_id);
        const [courses] = await pool.query(
          'SELECT id, class_id, teacher_id FROM courses WHERE class_id IN (?) AND status = "active"',
          [classIds]
        );
        for (const course of courses) {
          await pool.query(
            'DELETE FROM attendance WHERE student_id = ? AND date = ? AND course_id = ?',
            [student_id, today, course.id]
          );
          await pool.query(
            `INSERT INTO attendance 
             (class_id, course_id, student_id, teacher_id, status, date, method) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [course.class_id, course.id, student_id, course.teacher_id || 0, 'present', today, 'Face AI']
          );
        }
      }
    } catch (e) {
      console.error('Error auto-syncing face attendance to courses:', e);
    }

    res.json({
      success: true,
      status: 'marked',
      message: `Attendance marked for ${studentInfo?.name}`,
      student: studentInfo
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, message: 'Error marking attendance' });
  }
});

// ── GET today's campus attendance log (filtered by tenant) ──────────────────
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const date = req.query.date || today;
    const clientId = req.user.client_id;
    const campusId = req.user.campus_id;

    let query = `
      SELECT ca.id, ca.date, ca.time, ca.marked_at, ca.student_id,
             u.name as student_name, s.roll_number
      FROM campus_attendance ca
      JOIN students s ON ca.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE ca.date = ?
    `;
    const params = [date];

    if (clientId && req.user.role !== 'master_admin') {
      query += ` AND u.client_id = ?`;
      params.push(clientId);
    }
    if (campusId && ['principal', 'admin'].includes(req.user.role)) {
      query += ` AND s.campus_id = ?`;
      params.push(campusId);
    }

    query += ` ORDER BY ca.time ASC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, date: date, attendance: rows });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ success: false, message: 'Error fetching attendance' });
  }
});

// ── GET student's full face attendance history ──────────────────────────────
router.get('/my-history', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT ca.id, ca.date, ca.time, ca.marked_at, ca.student_id,
             u.name as student_name, s.roll_number
      FROM campus_attendance ca
      JOIN students s ON ca.student_id = s.id
      JOIN users u ON s.user_id = u.id
      WHERE u.id = ?
      ORDER BY ca.date DESC, ca.time DESC
    `, [userId]);
    res.json({ success: true, attendance: rows });
  } catch (error) {
    console.error('Get my-history error:', error);
    res.status(500).json({ success: false, message: 'Error fetching history' });
  }
});

// ── GET students list for registration (filtered by tenant) ─────────────────
router.get('/students', async (req, res) => {
  try {
    const clientId = req.user.client_id;
    const campusId = req.user.campus_id;

    let query = `
      SELECT s.id as student_id, u.name, s.roll_number,
             (SELECT COUNT(*) FROM face_descriptors fd WHERE fd.student_id = s.id) as is_registered
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (clientId && req.user.role !== 'master_admin') {
      query += ` AND u.client_id = ?`;
      params.push(clientId);
    }
    if (campusId && ['principal', 'admin'].includes(req.user.role)) {
      query += ` AND s.campus_id = ?`;
      params.push(campusId);
    }

    query += ` ORDER BY u.name ASC`;

    const [students] = await pool.query(query, params);
    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// ── DELETE face descriptor ───────────────────────────────────────────────────
router.delete('/descriptor/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    // Verify student belongs to user's client
    const [[student]] = await pool.query(
      'SELECT s.id, u.client_id FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [studentId]
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (req.user.role !== 'master_admin' && req.user.client_id && student.client_id !== req.user.client_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM face_descriptors WHERE student_id = ?', [studentId]);
    res.json({ success: true, message: 'Face data removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing face data' });
  }
});

module.exports = router;
