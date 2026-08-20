const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 

    // Inject specialized IDs based on role
    const { pool } = require('../config/database');
    
    // Check if client is suspended (for SaaS Multi-Tenancy)
    if (decoded.client_id && decoded.role !== 'master_admin') {
      const [clients] = await pool.query('SELECT subscription_status FROM lancers_clients WHERE id = ?', [decoded.client_id]);
      if (clients.length > 0 && clients[0].subscription_status === 'Suspended') {
        return res.status(403).json({
          success: false,
          message: 'Your University portal has been suspended by LancersTech. Please contact support.'
        });
      }
    }

    if (decoded.role === 'student') {
      const [student] = await pool.query('SELECT id FROM students WHERE user_id = ?', [decoded.id]);
      if (student.length > 0) req.user.student_id = student[0].id;
    } else if (['teacher', 'principal', 'admin', 'bd_agent', 'rector'].includes(decoded.role)) {
      const [employee] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [decoded.id]);
      if (employee.length > 0) req.user.employee_id = employee[0].id;
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    try {
      const fs = require('fs');
      fs.appendFileSync('auth_error.log', `${new Date().toISOString()} - Token Error: ${error.message}\nToken: ${req.headers.authorization}\nStack: ${error.stack}\n`);
    } catch (logErr) {
       console.error('Failed to write to auth_error.log:', logErr);
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
  const allowed = ['teacher', 'principal', 'admin', 'super_admin', 'superadmin'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teachers/Admins only.'
    });
  }
  next();
};

// Middleware to check if user is an admin (legacy - kept for backward compat)
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'principal' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins only.'
    });
  }
  next();
};

// Middleware to check if user is an HOD (campus-level admin)
const isPrincipal = (req, res, next) => {
  if (req.user.role !== 'principal') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. HODs only.'
    });
  }
  next();
};

// Middleware to check if user is a Super Admin (platform-level)
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admins only.'
    });
  }
  next();
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Students only.'
    });
  }
  next();
};

// Middleware to check if user is a BD Agent
const isBDAgent = (req, res, next) => {
  if (!['bd_agent', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. BD Agents only.'
    });
  }
  next();
};

// Chat: HOD, Admin, Teacher, Student, and Institutional Masters can use chat. Super Admin cannot.
const isChatUser = (req, res, next) => {
  const allowed = [
    'admin', 'principal', 'teacher', 'student', 'bd_agent', 'rector', 
    'hr_manager', 'finance_manager', 'registrar', 'admission_officer', 
    'library_manager', 'librarian', 'exam_controller', 'it_admin', 'lab_assistant', 'master_admin'
  ];

  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Chat is not available for this role.'
    });
  }
  next();
};

// Middleware to check if user is a Finance Manager
const isFinanceManager = (req, res, next) => {
  if (!['finance_manager', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Finance Managers only.' });
  }
  next();
};

// Middleware to check if user is an HR Manager
const isHRManager = (req, res, next) => {
  if (!['hr_manager', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. HR Managers only.' });
  }
  next();
};

// Middleware to check if user is a Registrar
const isRegistrar = (req, res, next) => {
  if (!['registrar', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Registrar only.' });
  }
  next();
};

// Middleware to check if user is an Admission Officer
const isAdmissionOfficer = (req, res, next) => {
  if (!['admission_officer', 'super_admin', 'master_admin', 'principal'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Admission Officers only.' });
  }
  next();
};

// Middleware to check if user is a Librarian
const isLibrarian = (req, res, next) => {
  if (!['library_manager', 'librarian', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Librarians only.' });
  }
  next();
};

// Middleware to check if user is a Rector
const isRector = (req, res, next) => {
  if (req.user.role !== 'rector' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Rector only.'
    });
  }
  next();
};

// Middleware to check if user is a Master Admin (Lancers Tech System Owner)
const isMasterAdmin = (req, res, next) => {
  if (req.user.role !== 'master_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Master Admin (Lancers Tech) only.'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  isTeacher,
  isAdmin,
  isPrincipal,
  isSuperAdmin,
  isMasterAdmin,
  isStudent,
  isBDAgent,
  isChatUser,
  isFinanceManager,
  isHRManager,
  isRegistrar,
  isAdmissionOfficer,
  isLibrarian,
  isRector
};
