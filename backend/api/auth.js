const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { pool } = require('../config/database');

const router = express.Router();

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

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
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
      [name, email, hashedPassword, 'student', false, req.body.campus_id || null]
    );

    const userId = result.insertId;

    // Create student profile
    // Note: Generating a temporary roll number for now
    const tempRollNumber = `LUK-${Date.now().toString().slice(-5)}`;
    await pool.query(
      'INSERT INTO students (user_id, roll_number, semester, admission_year) VALUES (?, ?, ?, ?)',
      [userId, tempRollNumber, req.body.semester || 1, new Date().getFullYear()]
    );

    // Return success message without token (account pending admin approval)
    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Please wait for admin approval before signing in.',
      pending: true,
      user: {
        id: userId,
        name: name,
        email: email,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Signin API
router.post('/signin', async (req, res) => {
  try {
    const { email, password, resend_only } = req.body;
    console.log('Login attempt for:', email, resend_only ? '(Resend OTP)' : '');

    // Validate input
    if (!email || (!password && !resend_only)) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const [users] = await pool.query(
      `SELECT u.*, c.name as department_name, s.roll_number, s.semester, e.employee_code, e.designation, s.id as student_id, e.id as employee_id
       FROM users u 
       LEFT JOIN campuses c ON u.campus_id = c.id 
       LEFT JOIN students s ON u.id = s.user_id
       LEFT JOIN employees e ON u.id = e.user_id
       WHERE u.email = ?`,
      [email]
    );

    console.log('User found in DB:', users.length > 0);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // If it's just a resend request, we don't need to check password again 
    // (assuming the user is already at the OTP screen)
    if (resend_only) {
       // Allow resend for all roles (2FA is now for everyone)
    } else {
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
      console.log('Password valid:', isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    }

    // --- 2-STEP VERIFICATION (OTP) - TEMPORARILY DISABLED ---
    // Uncomment the block below when ready to re-enable OTP verification
    /*
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

    try {
      // Delete old OTPs for this email (to keep table clean)
      await pool.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

      // Save new OTP in database
      await pool.query(
        'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
        [email, otp, expiresAt]
      );

      // Send OTP to the user's OWN registered email
      const mailOptions = {
        from: `"Lancers Tech LMS" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Lancers Tech LMS Login Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Lancers Tech LMS</h1>
              <p style="color: #64748b; margin: 4px 0 0;">University Learning Management System</p>
            </div>
            <h2 style="color: #1e293b; text-align: center;">Login Verification Code</h2>
            <p style="color: #475569;">Hello <strong>${user.name}</strong>,</p>
            <p style="color: #475569;">Use the code below to complete your login. This code will expire in <strong>5 minutes</strong>.</p>
            <div style="background: #f8fafc; padding: 24px; text-align: center; font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #4f46e5; border-radius: 12px; border: 2px solid #e2e8f0; margin: 24px 0;">
              ${otp}
            </div>
            <p style="color: #64748b; font-size: 13px;">If you did not try to login, please ignore this email. Your account is safe.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 Lancers Tech LMS. All rights reserved.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${user.role}: ${email}`);

      return res.status(200).json({
        success: true,
        otp_required: true,
        message: 'OTP sent to your email. Please verify to continue.',
        email: email
      });
    } catch (err) {
      console.error('OTP Error:', err);
      let errorMsg = 'Error sending verification code. Please try again.';
      if (err.code === 'EAUTH') {
         errorMsg = 'Email authentication failed. Please check EMAIL_PASS in your .env file (Gmail App Password is required).';
      }
      return res.status(500).json({ success: false, message: errorMsg });
    }
    */

    // --- DIRECT LOGIN (2FA disabled) ---
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        campus_id: user.campus_id,
        student_id: user.student_id || null,
        employee_id: user.employee_id || null
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }  // ✅ 24h expiry — reduced from 7d for security
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
        semester: user.semester
      },
      token: token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Teacher Signup API
router.post('/teacher/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert teacher into database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'teacher']
    );

    const userId = result.insertId;

    // Create employee profile for teacher
    const tempEmpCode = `EMP-${Date.now().toString().slice(-5)}`;
    await pool.query(
      'INSERT INTO employees (user_id, employee_code, designation, joining_date) VALUES (?, ?, ?, ?)',
      [userId, tempEmpCode, 'Lecturer', new Date()]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email: email, role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }  // ✅ 24h expiry
    );

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully',
      user: {
        id: result.insertId,
        name: name,
        email: email,
        role: 'teacher'
      },
      token: token
    });

  } catch (error) {
    console.error('Teacher signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
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
        employee_id: user.employee_id || null
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
      `SELECT u.*, c.name as department_name, s.roll_number, s.semester, e.employee_code, e.designation, s.id as student_id, e.id as employee_id
       FROM users u 
       LEFT JOIN campuses c ON u.campus_id = c.id 
       LEFT JOIN students s ON u.id = s.user_id
       LEFT JOIN employees e ON u.id = e.user_id
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
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, message: 'Error verifying token' });
  }
});

module.exports = router;
