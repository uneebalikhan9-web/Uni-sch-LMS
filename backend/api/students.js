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
        name, email, password, role, campus_id, is_approved, semester, roll_number,
        father_name, father_cnic, last_education, father_number, bform_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, hashedPassword, 'student', campus_id, true, semNum, rollNumber,
        father_name || null, father_cnic || null, last_education || null, father_number || null, bform_number || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student_id: result.insertId,
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

          await pool.query(
            `INSERT INTO users (
              name, email, password, role, campus_id, is_approved, semester, roll_number,
              father_name, father_cnic, last_education, father_number, bform_number
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              name, email, hashedPassword, 'student', campus_id, true, semNum, rollNumber,
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

    let query = `UPDATE users SET 
      name = ?, email = ?, semester = ?, 
      father_name = ?, father_cnic = ?, last_education = ?, 
      father_number = ?, bform_number = ?`;
    let params = [name, email, semester, father_name, father_cnic, last_education, father_number, bform_number];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ? WHERE id = ?`;
      params.push(hashedPassword, id);
    } else {
      query += ` WHERE id = ?`;
      params.push(id);
    }

    await pool.query(query, params);
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
