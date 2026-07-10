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

// FIX (LOW-09): Corrected role names — 'super_admin' (with underscore), removed non-existent roles 'hod' and 'dean'.
const canManageStudents = (req, res, next) => {
  const allowedRoles = ['principal', 'teacher', 'super_admin', 'admin', 'rector'];
  if (allowedRoles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized to manage students' });
  }
};

const { logAudit } = require('../utils/logger');

// Apply authentication to all routes
router.use(verifyToken);
router.use(canManageStudents);

// Get All Students (Filtered by campus with Pagination)
router.get('/', async (req, res) => {
  try {
    const { role, campus_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = `
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

    // 1. Get total count for pagination metadata
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total ${query}`, params);

    // 2. Get paginated data
    const selectFields = `
      SELECT u.id, u.name, u.email, u.phone, u.status, u.profile_image,
             s.id as student_id, s.roll_number, s.semester, s.academic_status,
             p.name as program_name, c.name as campus_name
    `;
    const [students] = await pool.query(
      `${selectFields} ${query} ORDER BY s.roll_number ASC LIMIT ? OFFSET ?`, 
      [...params, limit, offset]
    );

    res.json({ 
      success: true, 
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users (
        name, email, password, role, campus_id, is_approved, client_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, 'student', campus_id, true, req.user.client_id || null]
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

    // Audit Log
    logAudit({
      userId: req.user.id,
      action: 'CREATE_STUDENT',
      targetId: studentId,
      targetTable: 'students',
      newValue: { name, email, rollNumber },
      ip: req.ip
    });

  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'Error creating student' });
  }
});

// Bulk student upload (CSV)
// FIX (HIGH-09): Wrapped in a database transaction to prevent partial imports.
router.post('/bulk', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const campus_id = req.user.campus_id;
  const students = [];
  const errors = [];
  let count = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv({
      mapHeaders: ({ header }) => header ? header.trim().toLowerCase().replace(/^\uFEFF/, '') : ''
    }))
    .on('data', (row) => { students.push(row); })
    .on('end', async () => {
      // Delete temporary uploaded file immediately
      try { fs.unlinkSync(req.file.path); } catch (e) {}

      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        for (const student of students) {
          try {
            const { name, email, password, semester, father_name, father_cnic, last_education, father_number, bform_number } = student;

            if (!name || !email) continue;

            const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
              errors.push(`${email} already exists`);
              continue;
            }

            const semNum = parseInt(semester) || 1;
            const rollNumber = await generateRollNumber(campus_id, semNum);
            const hashedPassword = await bcrypt.hash(password || 'Password@123', 10);

            const [result] = await connection.query(
              'INSERT INTO users (name, email, password, role, campus_id, is_approved, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [name, email, hashedPassword, 'student', campus_id, true, req.user.client_id || null]
            );

            await connection.query(
              `INSERT INTO students (
                user_id, roll_number, semester, admission_year,
                father_name, father_cnic, last_education, father_number, bform_number
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                result.insertId, rollNumber, semNum, new Date().getFullYear(),
                father_name || null, father_cnic || null, last_education || null,
                father_number || null, bform_number || null
              ]
            );
            count++;
          } catch (err) {
            console.error('Bulk row error:', err);
            errors.push(`Error adding ${student.email || 'unknown'}: ${err.message}`);
          }
        }

        await connection.commit();
      } catch (err) {
        await connection.rollback();
        console.error('Bulk import transaction error:', err);
        return res.status(500).json({ success: false, message: 'Bulk import failed. No records were saved.' });
      } finally {
        connection.release();
      }

      res.json({
        success: true,
        message: `Successfully processed ${count} students`,
        count,
        errors: errors.length > 0 ? errors : null
      });
    });
});

// Bulk student upload (JSON Array from Data Sheet)
router.post('/bulk-json', express.json(), async (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'Invalid data format' });
  }

  const campus_id = req.user.campus_id;
  const errors = [];
  let count = 0;

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
      console.error('Bulk JSON row error:', err);
      errors.push(`Error adding ${student.email || 'unknown'}`);
    }
  }

  res.json({
    success: true,
    message: `Successfully added ${count} students`,
    count,
    errors: errors.length > 0 ? errors : null
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
      const hashedPassword = await bcrypt.hash(password, 12);
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
// FIX (CRIT-07): Now correctly fetches student.id (students table PK) before
// deleting related records. Previously used user.id which caused wrong deletions.
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const campusId = req.user.campus_id;
    const { id } = req.params; // This is the users.id

    // Verify user exists in this campus
    const [userRecord] = await connection.query(
      'SELECT id FROM users WHERE id = ? AND role = ? AND campus_id = ?',
      [id, 'student', campusId]
    );
    if (userRecord.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Student not found in your campus' });
    }

    // Get the actual students.id (different from users.id)
    const [[studentRecord]] = await connection.query(
      'SELECT id FROM students WHERE user_id = ?',
      [id]
    );
    if (!studentRecord) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    const studentId = studentRecord.id;

    await connection.beginTransaction();

    // Delete related records using correct studentId (students.id)
    await connection.query('DELETE FROM marks WHERE submission_id IN (SELECT id FROM submissions WHERE student_id = ?)', [studentId]);
    await connection.query('DELETE FROM submissions WHERE student_id = ?', [studentId]);
    await connection.query('DELETE FROM enrollments WHERE student_id = ?', [studentId]);
    await connection.query('DELETE FROM attendance WHERE student_id = ?', [studentId]);
    await connection.query('DELETE FROM student_progress WHERE student_id = ?', [studentId]).catch(() => {});
    await connection.query('DELETE FROM challans WHERE student_id = ?', [studentId]).catch(() => {});
    await connection.query('DELETE FROM student_classes WHERE student_id = ?', [studentId]);
    await connection.query('DELETE FROM students WHERE id = ?', [studentId]);
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
// Create and link Parent Account
router.post('/:id/parent', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const campusId = req.user.campus_id;
    const { id } = req.params; // users.id of the student
    const { parent_name, parent_email, parent_phone, password, relationship } = req.body;

    if (!parent_name || !parent_email || !password) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Parent name, email, and password are required' });
    }

    // Verify student exists
    const [[studentUser]] = await connection.query(
      'SELECT s.id as student_id FROM users u JOIN students s ON u.id = s.user_id WHERE u.id = ? AND u.role = ? AND u.campus_id = ?',
      [id, 'student', campusId]
    );
    if (!studentUser) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await connection.beginTransaction();

    let parentUserId;
    // Check if parent user already exists
    const [[existingUser]] = await connection.query('SELECT id, role FROM users WHERE email = ?', [parent_email]);
    
    if (existingUser) {
      if (existingUser.role !== 'parent') {
        throw new Error('Email is already in use by a non-parent account');
      }
      parentUserId = existingUser.id;
    } else {
      // Create new parent user
      const hashedPassword = await bcrypt.hash(password, 12);
      const [result] = await connection.query(
        'INSERT INTO users (name, email, phone, password, role, campus_id, is_approved, client_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [parent_name, parent_email, parent_phone || null, hashedPassword, 'parent', campusId, true, req.user.client_id || null]
      );
      parentUserId = result.insertId;
    }

    // Link parent to student
    await connection.query(
      'INSERT IGNORE INTO student_parents (parent_user_id, student_id, relationship) VALUES (?, ?, ?)',
      [parentUserId, studentUser.student_id, relationship || 'Parent']
    );

    await connection.commit();
    res.json({ success: true, message: 'Parent account linked successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating parent account:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating parent account' });
  } finally {
    connection.release();
  }
});

module.exports = router;
