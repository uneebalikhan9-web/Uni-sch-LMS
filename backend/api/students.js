const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const { generateRollNumber } = require('../utils/rollNumber');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Helper to check if role is Principal or Teacher (authorized to manage students)
const canManageStudents = (req, res, next) => {
  if (req.user.role === 'principal' || req.user.role === 'teacher' || req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized to manage students' });
  }
};

// Apply authentication to all routes
router.use(verifyToken);
router.use(canManageStudents);

// Get All Students (Filtered by campus)
router.get('/', async (req, res) => {
  try {
    const { role, campus_id } = req.user;
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.status, u.profile_image,
             s.id as student_id, s.roll_number, s.semester, s.academic_status,
             p.name as program_name, c.name as campus_name
      FROM users u
      JOIN students s ON u.id = s.user_id
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role = 'student'
    `;
    const params = [];

    if (role !== 'super_admin') {
      query += ` AND u.campus_id = ?`;
      params.push(campus_id);
    }

    query += ` ORDER BY s.roll_number ASC`;
    const [students] = await pool.query(query, params);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Error fetching students' });
  }
});

// Add single student
router.post('/', async (req, res) => {
  try {
    const { name, email, password, semester, father_name, father_cnic, last_education, father_number, bform_number } = req.body;
    const campus_id = req.user.campus_id;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const semNum = semester || 1;
    const rollNumber = await generateRollNumber(campus_id, semNum);
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (
        name, email, password, role, campus_id, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, 'student', campus_id, true]
    );

    const userId = result.insertId;

    // Create student profile with all academic details
    const [studentResult] = await pool.query(
      `INSERT INTO students (
        user_id, roll_number, semester, admission_year,
        father_name, father_cnic, last_education, father_number, bform_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, rollNumber, semNum, new Date().getFullYear(),
        father_name || null, father_cnic || null, last_education || null, father_number || null, bform_number || null
      ]
    );
    const studentId = studentResult.insertId;

    // If class_id is provided, auto-assign student to class
    const { class_id } = req.body;
    if (class_id) {
      await pool.query(
        'INSERT INTO student_classes (student_id, class_id, status) VALUES (?, ?, ?)',
        [studentId, class_id, 'approved']
      );
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student_id: studentId,
      roll_number: rollNumber
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Error creating student' });
  }
});

// Bulk student upload (CSV)
router.post('/bulk', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const campus_id = req.user.campus_id;
  const students = [];
  const errors = [];
  let count = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      // row keys should match CSV headers: name, email, password, semester, father_name, father_cnic, last_education, father_number, bform_number
      students.push(row);
    })
    .on('end', async () => {
      // Delete temporary file
      fs.unlinkSync(req.file.path);

      for (const student of students) {
        try {
          const { name, email, password, semester, father_name, father_cnic, last_education, father_number, bform_number } = student;
          
          if (!name || !email) continue;

          // Check if exists
          const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
          if (existing.length > 0) {
            errors.push(`${email} already exists`);
            continue;
          }

          const semNum = semester || 1;
          const rollNumber = await generateRollNumber(campus_id, semNum);
          const hashedPassword = await bcrypt.hash(password || 'Password123', 10);

          const [result] = await pool.query(
            `INSERT INTO users (
              name, email, password, role, campus_id, is_approved
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, 'student', campus_id, true]
          );

          const userId = result.insertId;
          
          await pool.query(
            `INSERT INTO students (
              user_id, roll_number, semester, admission_year,
              father_name, father_cnic, last_education, father_number, bform_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId, rollNumber, semNum, new Date().getFullYear(),
              father_name || null, father_cnic || null, last_education || null, father_number || null, bform_number || null
            ]
          );
          count++;
        } catch (err) {
          console.error('Bulk row error:', err);
          errors.push(`Error adding ${student.email || 'unknown'}`);
        }
      }

      res.json({
        success: true,
        message: `Successfully processed ${count} students`,
        count,
        errors: errors.length > 0 ? errors : null
      });
    });
});

// Update student
router.put('/:id', async (req, res) => {
  try {
    const campusId = req.user.campus_id;
    const { id } = req.params;
    const { name, email, password, semester, father_name, father_cnic, last_education, father_number, bform_number } = req.body;

    const [students] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = ? AND campus_id = ?',
      [id, 'student', campusId]
    );
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found in your campus' });
    }

    let userQuery = `UPDATE users SET name = ?, email = ?`;
    let userParams = [name, email];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      userQuery += `, password = ? WHERE id = ?`;
      userParams.push(hashedPassword, id);
    } else {
      userQuery += ` WHERE id = ?`;
      userParams.push(id);
    }

    await pool.query(userQuery, userParams);

    // Update student profile with academic details
    await pool.query(
      `UPDATE students SET 
        semester = ?, father_name = ?, father_cnic = ?, 
        last_education = ?, father_number = ?, bform_number = ? 
      WHERE user_id = ?`,
      [semester, father_name, father_cnic, last_education, father_number, bform_number, id]
    );
    res.status(200).json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Error updating student' });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const campusId = req.user.campus_id;
    const { id } = req.params;

    const [students] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND role = ? AND campus_id = ?',
      [id, 'student', campusId]
    );
    if (students.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Student not found in your campus' });
    }

    await connection.beginTransaction();

    // Clean up all related records
    await connection.query('DELETE FROM marks WHERE submission_id IN (SELECT id FROM submissions WHERE student_id = ?)', [id]).catch(() => {});
    await connection.query('DELETE FROM submissions WHERE student_id = ?', [id]).catch(() => {});
    await connection.query('DELETE FROM enrollments WHERE student_id = ?', [id]).catch(() => {});
    await connection.query('DELETE FROM attendance WHERE student_id = ?', [id]).catch(() => {});
    await connection.query('DELETE FROM student_progress WHERE student_id = ?', [id]).catch(() => {});
    await connection.query('DELETE FROM challans WHERE student_id = ?', [id]).catch(() => {});
    await connection.query('DELETE FROM student_classes WHERE student_id = ?', [id]).catch(() => {});
    await connection.query('DELETE FROM users WHERE id = ?', [id]);

    await connection.commit();
    connection.release();
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Error deleting student' });
  }
});

module.exports = router;
