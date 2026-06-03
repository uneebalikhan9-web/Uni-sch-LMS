const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { verifyToken, isPrincipal } = require('../middleware/auth');
const { generateRollNumber } = require('../utils/rollNumber');

const router = express.Router();

// Apply authentication and principal check to all routes
router.use(verifyToken);
router.use(isPrincipal);

// Helper: get campus_id from the logged-in HOD
const getCampusId = (req) => req.user.campus_id;

// Get engagement stats for the last 7 days
router.get('/engagement-stats', async (req, res) => {
  try {
    const campusId = getCampusId(req);
    
    // Query last 7 days of activity from system_logs
    const [stats] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM system_logs
      WHERE campus_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [campusId]);

    // Generate the last 7 days including today
    const data = [];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const stat = stats.find(s => {
        // Handle both Date objects and strings depending on MySQL driver config
        const sDate = s.date instanceof Date ? s.date.toISOString().split('T')[0] : s.date;
        return sDate === dateStr;
      });
      
      data.push(stat ? stat.count : 0);
      labels.push(dayLabel);
    }

    res.status(200).json({ success: true, data, labels });
  } catch (error) {
    console.error('Get engagement stats error:', error);
    res.status(200).json({ success: true, data: [0, 0, 0, 0, 0, 0, 0], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
  }
});

// ==================== TEACHERS (Campus-Scoped) ====================

// Get all teachers in this campus
router.get('/teachers', async (req, res) => {
  try {
    const campusId = getCampusId(req);
    const [teachers] = await pool.query(`
      SELECT 
        u.id,
        u.id as user_id,
        e.id as employee_id,
        u.name,
        u.email,
        u.created_at,
        e.employee_code,
        e.designation,
        COUNT(DISTINCT c.id) as total_courses
      FROM users u
      JOIN employees e ON u.id = e.user_id
      LEFT JOIN courses c ON e.id = c.teacher_id
      WHERE u.role = 'teacher' AND u.campus_id = ?
      GROUP BY u.id, e.id
      ORDER BY u.created_at DESC
    `, [campusId]);

    for (let teacher of teachers) {
      const [courses] = await pool.query(
        'SELECT id, title FROM courses WHERE teacher_id = ? AND campus_id = ?',
        [teacher.employee_id, campusId]
      );
      teacher.courses = courses;
    }

    res.status(200).json({ success: true, teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
});

// Add new teacher (assigned to HOD's department)
router.post('/teachers', async (req, res) => {
  try {
    const campusId = getCampusId(req);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, campus_id, is_approved, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'teacher', campusId, true, req.user.client_id]
    );

    const userId = result.insertId;

    // Create employee profile
    const tempEmpCode = `EMP-${Date.now().toString().slice(-5)}`;
    await pool.query(
      'INSERT INTO employees (user_id, employee_code, designation, joining_date) VALUES (?, ?, ?, ?)',
      [userId, tempEmpCode, req.body.designation || 'Lecturer', new Date()]
    );

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher: { id: result.insertId, name, email, role: 'teacher', campus_id: campusId }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: 'Error creating teacher' });
  }
});

// Update teacher
router.put('/teachers/:id', async (req, res) => {
  try {
    const campusId = getCampusId(req);
    const { id } = req.params;
    const { name, email, password } = req.body;

    const [teachers] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = ? AND campus_id = ?',
      [id, 'teacher', campusId]
    );
    if (teachers.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found in your campus' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await pool.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, hashedPassword, id]);
    } else {
      await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    }

    res.status(200).json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'Error updating teacher' });
  }
});

// Delete teacher
router.delete('/teachers/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const campusId = getCampusId(req);
    const { id } = req.params;

    const [teachers] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND role = ? AND campus_id = ?',
      [id, 'teacher', campusId]
    );
    if (teachers.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Teacher not found in your campus' });
    }

    await connection.beginTransaction();

    // Clean up all related records to avoid foreign key constraint errors
    // 1. Remove marks graded by this teacher
    await connection.query('UPDATE marks SET graded_by = NULL WHERE graded_by = ?', [id]);
    // 2. Remove timetable entries for this teacher
    await connection.query('DELETE FROM timetables WHERE teacher_id = ?', [id]).catch(() => {});
    // 3. Remove attendance records created by this teacher
    await connection.query('DELETE FROM attendance WHERE teacher_id = ?', [id]).catch(() => {});
    // 4. Remove progress records for this teacher
    await connection.query('DELETE FROM student_progress WHERE teacher_id = ?', [id]).catch(() => {});
    // 5. Set courses teacher to NULL
    await connection.query('UPDATE courses SET teacher_id = NULL WHERE teacher_id = ?', [id]);
    // 6. Update classes that reference this teacher
    await connection.query('UPDATE classes SET teacher_id = NULL WHERE teacher_id = ?', [id]).catch(() => {});
    // 7. Finally delete the user
    await connection.query('DELETE FROM users WHERE id = ?', [id]);

    await connection.commit();
    connection.release();
    res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: 'Error deleting teacher: ' + error.message });
  }
});

// ==================== STUDENTS (Campus-Scoped) ====================

// Get all students in this campus
router.get('/students', async (req, res) => {
  try {
    const campusId = getCampusId(req);
    const [students] = await pool.query(`
      SELECT 
        u.id,
        u.id as user_id,
        s.id as student_id,
        u.name,
        u.email,
        s.roll_number,
        s.semester,
        s.father_name,
        s.father_cnic,
        s.last_education,
        s.father_number,
        s.bform_number,
        u.created_at,
        COUNT(DISTINCT e.id) as total_enrollments
      FROM users u
      JOIN students s ON u.id = s.user_id
      LEFT JOIN enrollments e ON s.id = e.student_id
      WHERE u.role = 'student' AND u.campus_id = ?
      GROUP BY u.id, s.id
      ORDER BY u.created_at DESC
    `, [campusId]);

    for (let student of students) {
      const [enrollments] = await pool.query(`
        SELECT c.id, c.title 
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = ? AND c.campus_id = ?
      `, [student.student_id, campusId]);
      student.enrollments = enrollments;
    }

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// Add new student (assigned to HOD's department)
router.post('/students', async (req, res) => {
  try {
    const campusId = getCampusId(req);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const semNum = req.body.semester || 1;
    const rollNumber = await generateRollNumber(campusId, semNum);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, campus_id, is_approved, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'student', campusId, true, req.user.client_id]
    );

    const userId = result.insertId;

    // Create student profile with academic details
    await pool.query(
      `INSERT INTO students (
        user_id, roll_number, semester, admission_year,
        father_name, father_cnic, last_education, father_number, bform_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, rollNumber, semNum, new Date().getFullYear(),
        req.body.father_name || null, req.body.father_cnic || null, 
        req.body.last_education || null, req.body.father_number || null, req.body.bform_number || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: { id: result.insertId, name, email, role: 'student', campus_id: campusId }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Error creating student' });
  }
});

// Update student
router.put('/students/:id', async (req, res) => {
  try {
    const campusId = getCampusId(req);
    const { id } = req.params;
    const { name, email, password } = req.body;

    const [students] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = ? AND campus_id = ?',
      [id, 'student', campusId]
    );
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found in your campus' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await pool.query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [name, email, hashedPassword, id]);
    } else {
      await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    }

    const [[existingStudentRow]] = await pool.query('SELECT roll_number FROM students WHERE user_id = ?', [id]);
    const finalRollNumber = req.body.roll_number || (existingStudentRow ? existingStudentRow.roll_number : null);

    // Update student profile with academic details
    await pool.query(
      `UPDATE students SET 
        semester = ?, father_name = ?, father_cnic = ?, 
        last_education = ?, father_number = ?, bform_number = ?, roll_number = ? 
      WHERE user_id = ?`,
      [
        req.body.semester || 1, req.body.father_name || null, req.body.father_cnic || null, 
        req.body.last_education || null, req.body.father_number || null, req.body.bform_number || null, 
        finalRollNumber,
        id
      ]
    );

    res.status(200).json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Error updating student' });
  }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const campusId = getCampusId(req);
    const { id } = req.params;

    const [students] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND role = ? AND campus_id = ?',
      [id, 'student', campusId]
    );
    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Student not found in your campus' });
    }

    // Get the real student record ID
    const [[studentRow]] = await connection.query(
      'SELECT id FROM students WHERE user_id = ?',
      [id]
    );
    const studentRealId = studentRow ? studentRow.id : null;

    await connection.beginTransaction();

    if (studentRealId) {
      // Clean up all related records to avoid foreign key constraint errors
      // 1. Delete marks for this student's submissions
      await connection.query(`
        DELETE m FROM marks m 
        INNER JOIN submissions s ON m.submission_id = s.id 
        WHERE s.student_id = ?
      `, [studentRealId]).catch(() => {});
      // 2. Delete submissions
      await connection.query('DELETE FROM submissions WHERE student_id = ?', [studentRealId]).catch(() => {});
      // 3. Delete enrollments
      await connection.query('DELETE FROM enrollments WHERE student_id = ?', [studentRealId]).catch(() => {});
      // 4. Delete attendance records
      await connection.query('DELETE FROM attendance WHERE student_id = ?', [studentRealId]).catch(() => {});
      // 5. Delete progress records
      await connection.query('DELETE FROM student_progress WHERE student_id = ?', [studentRealId]).catch(() => {});
      // 6. Delete challans
      await connection.query('DELETE FROM finance_challans WHERE student_id = ?', [studentRealId]).catch(() => {});
      // 7. Delete student_classes associations
      await connection.query('DELETE FROM student_classes WHERE student_id = ?', [studentRealId]).catch(() => {});
      // 8. Delete student profile
      await connection.query('DELETE FROM students WHERE id = ?', [studentRealId]).catch(() => {});
    }

    // 9. Finally delete the user
    await connection.query('DELETE FROM users WHERE id = ?', [id]);

    await connection.commit();
    connection.release();
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Error deleting student: ' + error.message });
  }
});

module.exports = router;

