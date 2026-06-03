const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const router = express.Router();

// ─── Validation Helpers ─────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateAuthInputs = (name, email, password) => {
  if (name !== undefined && (!name || name.trim().length < 2 || name.length > 100)) {
    return 'Name must be between 2 and 100 characters.';
  }
  if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
    return 'A valid email address is required.';
  }
  if (password !== undefined && (!password || password.length < 8 || password.length > 128)) {
    return 'Password must be between 8 and 128 characters.';
  }
  return null;
};


// Email Transporter for OTP — TEMPORARILY DISABLED
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// Get public campuses list for signup
router.get('/campuses', async (req, res) => {
  try {
    const [campuses] = await pool.query('SELECT id, name FROM campuses WHERE is_active = TRUE');
    res.json({ success: true, campuses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
});

// Signup API
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input with backend checks (not just frontend)
    const validationError = validateAuthInputs(name, email, password);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user into database with pending approval status
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, 'student', false, req.body.campus_id || null]
    );

    const userId = result.insertId;

    // Generate a unique roll number prefix using timestamp
    const tempRollNumber = `LUK-${Date.now().toString().slice(-5)}`;
    await pool.query(
      'INSERT INTO students (user_id, roll_number, semester, admission_year) VALUES (?, ?, ?, ?)',
      [userId, tempRollNumber, req.body.semester || 1, new Date().getFullYear()]
    );

    // Return success without token — account pending admin approval
    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Please wait for admin approval before signing in.',
      pending: true,
      user: { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: 'student' }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Signin API
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input — resend_only bypass removed (CRIT-04 fix)
    const validationError = validateAuthInputs(undefined, email, password);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Check if user exists
    const [users] = await pool.query(
      `SELECT u.*, c.name as department_name, s.roll_number, s.semester, e.employee_code, e.designation, s.id as student_id, e.id as employee_id, lc.logo_url, lc.primary_color, lc.allowed_modules
       FROM users u 
       LEFT JOIN campuses c ON u.campus_id = c.id 
       LEFT JOIN students s ON u.id = s.user_id
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN lancers_clients lc ON u.client_id = lc.id
       WHERE u.email = ?`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check Maintenance Mode (bypass only for master_admin)
    if (user.role !== 'master_admin') {
      const [[maintenanceSetting]] = await pool.query('SELECT setting_value FROM platform_settings WHERE setting_key = "maintenance_mode"');
      if (maintenanceSetting && maintenanceSetting.setting_value === 'true') {
        return res.status(503).json({
          success: false,
          message: 'The system is currently undergoing scheduled maintenance. Please check back later.'
        });
      }
    }

    // Check if student account is approved
    if (user.role === 'student' && !user.is_approved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please wait before signing in.',
        pending: true
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if client (university) is suspended
    if (user.client_id && user.role !== 'master_admin') {
      const [clients] = await pool.query('SELECT subscription_status FROM lancers_clients WHERE id = ?', [user.client_id]);
      if (clients.length > 0 && clients[0].subscription_status === 'Suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your University portal has been suspended by LancersTech. Please contact support.'
        });
      }
    }

    // Issue JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        campus_id: user.campus_id,
        student_id: user.student_id || null,
        employee_id: user.employee_id || null,
        client_id: user.client_id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus_id: user.campus_id,
        department_name: user.department_name,
        roll_number: user.roll_number,
        semester: user.semester,
        client_id: user.client_id,
        logo_url: user.logo_url,
        primary_color: user.primary_color,
        allowed_modules: user.allowed_modules
          ? (typeof user.allowed_modules === 'string' ? JSON.parse(user.allowed_modules) : user.allowed_modules)
          : null
      },
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Teacher Signup API
// FIX (CRIT-05): Teacher signup now requires admin approval — no token issued on self-registration.
router.post('/teacher/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input with backend checks
    const validationError = validateAuthInputs(name, email, password);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert teacher with is_approved = false (requires admin approval)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, 'teacher', false]
    );

    const userId = result.insertId;

    // Create employee profile for teacher
    const tempEmpCode = `EMP-${Date.now().toString().slice(-5)}`;
    await pool.query(
      'INSERT INTO employees (user_id, employee_code, designation, joining_date) VALUES (?, ?, ?, ?)',
      [userId, tempEmpCode, 'Lecturer', new Date()]
    );

    // Return pending status — no token issued until admin approves
    res.status(201).json({
      success: true,
      pending: true,
      message: 'Teacher account submitted for approval. Please wait for admin review before signing in.',
      user: { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: 'teacher' }
    });

  } catch (error) {
    console.error('Teacher signup error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Teacher Signin API
router.post('/teacher/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if teacher exists
    const [users] = await pool.query(
      `SELECT u.*, c.name as department_name, e.employee_code, e.designation, e.id as employee_id
       FROM users u 
       LEFT JOIN campuses c ON u.campus_id = c.id 
       LEFT JOIN employees e ON u.id = e.user_id
       WHERE u.email = ? AND u.role = ?`,
      [email, 'teacher']
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or not a teacher account'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token with campus_id
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        campus_id: user.campus_id,
        employee_id: user.employee_id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }  // ✅ 24h expiry
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus_id: user.campus_id,
        department_name: user.department_name
      },
      token: token
    });

  } catch (error) {
    console.error('Teacher signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Verify OTP and issue token
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const MAX_ATTEMPTS = 3;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    // 1. Get the current OTP record
    const [records] = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email]
    );

    if (records.length === 0) {
      return res.status(401).json({ success: false, message: 'No active OTP found. Please request a new one.' });
    }

    const record = records[0];

    // 2. Check if the code matches
    if (record.otp !== otp) {
      const newAttempts = (record.attempts || 0) + 1;
      
      if (newAttempts >= MAX_ATTEMPTS) {
        // Lockout: Delete the OTP if too many failed attempts
        await pool.query('DELETE FROM otp_verifications WHERE id = ?', [record.id]);
        return res.status(403).json({ 
          success: false, 
          message: 'Too many failed attempts. This verification code is now invalid. Please request a new one.' 
        });
      }

      // Increment attempts
      await pool.query('UPDATE otp_verifications SET attempts = ? WHERE id = ?', [newAttempts, record.id]);
      
      return res.status(401).json({ 
        success: false, 
        message: `Invalid code. ${MAX_ATTEMPTS - newAttempts} attempts remaining.` 
      });
    }

    // 3. OTP is valid! Now get the user and issue the token
    const [users] = await pool.query(
      `SELECT u.*, c.name as department_name, s.roll_number, s.semester, e.employee_code, e.designation, s.id as student_id, e.id as employee_id
       FROM users u 
       LEFT JOIN campuses c ON u.campus_id = c.id 
       LEFT JOIN students s ON u.id = s.user_id
       LEFT JOIN employees e ON u.id = e.user_id
       WHERE u.email = ?`,
      [email]
    );
    const user = users[0];

    // Delete used OTP
    await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        campus_id: user.campus_id,
        student_id: user.student_id || null,
        employee_id: user.employee_id || null,
        client_id: user.client_id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }  // ✅ 24h expiry
    );

    res.status(200).json({
      success: true,
      message: 'Verification successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus_id: user.campus_id,
        department_name: user.department_name,
        roll_number: user.roll_number,
        semester: user.semester
      },
      token: token
    });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during verification' });
  }
});

// Verify Token API
router.get('/verify-token', require('../middleware/auth').verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.*, c.name as department_name, s.roll_number, s.semester, e.employee_code, e.designation, s.id as student_id, e.id as employee_id, lc.logo_url, lc.primary_color, lc.allowed_modules
       FROM users u 
       LEFT JOIN campuses c ON u.campus_id = c.id 
       LEFT JOIN students s ON u.id = s.user_id
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN lancers_clients lc ON u.client_id = lc.id
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User no longer exists. Please login again.' });
    }
    const user = users[0];
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus_id: user.campus_id,
        department_name: user.department_name,
        roll_number: user.roll_number,
        semester: user.semester,
        client_id: user.client_id,
        logo_url: user.logo_url,
        primary_color: user.primary_color,
        allowed_modules: user.allowed_modules ? (typeof user.allowed_modules === 'string' ? JSON.parse(user.allowed_modules) : user.allowed_modules) : null
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, message: 'Error verifying token' });
  }
});

module.exports = router;
