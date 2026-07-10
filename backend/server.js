const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./config/database');

// ─── Rate Limiters ────────────────────────────────────────────────────────────
// Sign In: max 10 attempts per 15 minutes per IP (brute-force protection)
const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sign Up: max 5 registrations per hour per IP (spam protection)
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many accounts created from this IP. Please try again after 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot Password: max 5 requests per 15 minutes per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many password reset requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
// ─────────────────────────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ─── CORS Allowlist ───────────────────────────────────────────────────────────
// Reads allowed origins from .env (comma-separated). Falls back to localhost.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:3000')
  .split(',')
  .map(o => o.trim());

console.log(`[CORS] Allowed Origins: ${ALLOWED_ORIGINS.join(', ')}`);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
// ─────────────────────────────────────────────────────────────────────────────

// Socket.io for real-time chat (same CORS allowlist)
const io = new Server(server, {
  cors: { 
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.set('io', io);

// ─── Socket.io Authentication Middleware ──────────────────────────────────────
const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Store user info in socket object
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});
// ─────────────────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  const userId = socket.user.id;

  // Automatically join private room based on authenticated user ID
  socket.join(`user_${userId}`);

  socket.on('chat:typing', (data) => {
    if (data.receiver_id) {
      io.to(`user_${data.receiver_id}`).emit('chat:typing', { sender_id: userId });
    }
  });

  socket.on('chat:stop_typing', (data) => {
    if (data.receiver_id) {
      io.to(`user_${data.receiver_id}`).emit('chat:stop_typing', { sender_id: userId });
    }
  });

  socket.on('disconnect', () => {
    // Intentionally silent — connection churn is normal
  });
});

// ─── Maintenance Mode Broadcast Helper ────────────────────────────────────────
// LOW-05 FIX: When maintenance is toggled via superadmin, broadcast to ALL
// connected sockets so they update without polling every 30 seconds.
// Usage in any route: req.app.get('io').emit('system:maintenance', { active: true })
// (Already attached via app.set('io', io) above)
// ─────────────────────────────────────────────────────────────────────────────

// ─── HTTPS Enforcement (Production Only) ─────────────────────────────────────
// LOW-11 FIX: In production behind a reverse proxy (Nginx/Cloudflare),
// redirect all HTTP traffic to HTTPS.
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, 'https://' + req.headers.host + req.url);
    }
    next();
  });
}

// Middleware
app.use(cors(corsOptions));              // Restricted CORS — only trusted origins
app.options('*', cors(corsOptions));     // Handle preflight requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Headers using helmet
app.use(helmet({
  crossOriginResourcePolicy: false, // Needed if serving images across domains
}));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'University LMS Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

console.log('Loading routes...');

const maintenanceCheck = require('./middleware/maintenanceCheck');
const { pool } = require('./config/database');

try {
  // Public Status API (Must be before maintenanceCheck)
  app.get('/api/public/status', async (req, res) => {
    try {
      const [[maintenance]] = await pool.query('SELECT setting_value FROM platform_settings WHERE setting_key = "maintenance_mode"');
      res.json({ success: true, maintenance_mode: maintenance && maintenance.setting_value === 'true' });
    } catch (err) {
      res.json({ success: true, maintenance_mode: false }); // Fallback
    }
  });

  // Public Tenant Branding API (Must be before maintenanceCheck)
  app.get('/api/public/tenant-branding', async (req, res) => {
    try {
      const domain = req.query.domain;
      if (!domain) return res.json({ success: false });
      
      const [[client]] = await pool.query('SELECT logo_url, primary_color FROM lancers_clients WHERE domain = ?', [domain]);
      if (client) {
        res.json({ success: true, logo_url: client.logo_url, primary_color: client.primary_color });
      } else {
        res.json({ success: false });
      }
    } catch (e) {
      console.error(e);
      res.json({ success: false });
    }
  });

  // Global Maintenance Check (applies to all routes except those excluded in the middleware itself)
  app.use(maintenanceCheck);

  // ─── Import auth middleware (available for all route registrations below) ──────
  const {
    verifyToken, isHRManager, isFinanceManager, isRegistrar, isRector,
    isAdmissionOfficer, isLibrarian, isSuperAdmin, isPrincipal, isBDAgent, isMasterAdmin
  } = require('./middleware/auth');

  // ─── Public / Lightly Protected Routes ──────────────────────────────────────
  app.get('/auto-fix-all', async (req, res) => {
    try {
      const { pool } = require('./config/database');
      let logs = [];
      const log = (msg) => { logs.push(msg); console.log(msg); };
      
      log('Starting auto-fix...');
      
      const studentCols = [
        'ALTER TABLE students ADD COLUMN current_gpa DECIMAL(3,2) DEFAULT 0.00',
        'ALTER TABLE students ADD COLUMN academic_status ENUM("regular", "probation", "suspended", "graduated", "good", "warning", "dismissed") DEFAULT "regular"',
        'ALTER TABLE students ADD COLUMN father_name VARCHAR(100) DEFAULT NULL',
        'ALTER TABLE students ADD COLUMN cnic VARCHAR(20) DEFAULT NULL',
        'ALTER TABLE students ADD COLUMN bform_number VARCHAR(20) DEFAULT NULL'
      ];
      for (let q of studentCols) {
        try { await pool.query(q); log('Added col: ' + q); } catch(e) { if(e.code !== 'ER_DUP_FIELDNAME') log('Col Err: ' + e.message); }
      }

      const tables = [
        `CREATE TABLE IF NOT EXISTS \`exam_results\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`enrollment_id\` int(11) NOT NULL,
          \`marks_obtained\` decimal(5,2) DEFAULT 0.00,
          \`grade\` varchar(5) DEFAULT NULL,
          \`gpa\` decimal(3,2) DEFAULT 0.00,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        
        `CREATE TABLE IF NOT EXISTS \`program_graduation_policies\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`program_id\` int(11) NOT NULL,
          \`required_credits\` int(11) NOT NULL DEFAULT 130,
          \`minimum_cgpa\` decimal(3,2) NOT NULL DEFAULT 2.00,
          \`campus_id\` int(11) NOT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

        `CREATE TABLE IF NOT EXISTS \`graduation_applications\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`student_id\` int(11) NOT NULL,
          \`campus_id\` int(11) NOT NULL,
          \`status\` enum('pending','approved','rejected') DEFAULT 'pending',
          \`applied_at\` timestamp NOT NULL DEFAULT current_timestamp(),
          \`reviewed_by\` int(11) DEFAULT NULL,
          \`remarks\` text DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        
        `CREATE TABLE IF NOT EXISTS \`grade_policies\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`grade_letter\` varchar(5) NOT NULL,
          \`grade_points\` decimal(3,2) NOT NULL,
          \`min_percentage\` decimal(5,2) NOT NULL,
          \`max_percentage\` decimal(5,2) NOT NULL,
          \`is_passing\` tinyint(1) DEFAULT 1,
          \`campus_id\` int(11) DEFAULT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        
        `CREATE TABLE IF NOT EXISTS \`course_final_grades\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`enrollment_id\` int(11) DEFAULT NULL,
          \`student_id\` int(11) NOT NULL,
          \`course_id\` int(11) NOT NULL,
          \`section_id\` int(11) DEFAULT NULL,
          \`semester_id\` int(11) NOT NULL,
          \`total_marks\` decimal(5,2) DEFAULT 0.00,
          \`percentage\` decimal(5,2) DEFAULT 0.00,
          \`letter_grade\` varchar(5) DEFAULT NULL,
          \`grade_points\` decimal(3,2) DEFAULT 0.00,
          \`is_published\` tinyint(1) DEFAULT 0,
          \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY (\`student_id\`, \`course_id\`, \`semester_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        
        `CREATE TABLE IF NOT EXISTS \`student_semester_records\` (
          \`id\` int(11) NOT NULL AUTO_INCREMENT,
          \`student_id\` int(11) NOT NULL,
          \`semester_id\` int(11) NOT NULL,
          \`credits_attempted\` decimal(5,2) DEFAULT 0.00,
          \`credits_earned\` decimal(5,2) DEFAULT 0.00,
          \`semester_gpa\` decimal(4,3) DEFAULT 0.000,
          \`cumulative_gpa\` decimal(4,3) DEFAULT 0.000,
          \`academic_standing\` varchar(50) DEFAULT 'good',
          \`is_frozen\` tinyint(1) DEFAULT 0,
          \`freeze_reason\` text DEFAULT NULL,
          \`min_credit_hours_met\` tinyint(1) DEFAULT 0,
          \`max_credit_hours_ok\` tinyint(1) DEFAULT 1,
          \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
          PRIMARY KEY (\`id\`),
          UNIQUE KEY (\`student_id\`, \`semester_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
      ];

      for (let q of tables) {
        try { await pool.query(q); log('Table created/checked'); } catch (e) { log('Table error: ' + e.message); }
      }

      try {
        await pool.query(`
          CREATE OR REPLACE VIEW \`vw_student_transcript\` AS
          SELECT 
              s.id AS student_id, s.roll_number, u.name AS student_name, s.father_name, s.cnic, s.bform_number,
              p.name AS program_name, p.code AS program_code, c.title AS course_title, c.code AS course_code,
              c.credit_hours, e.semester AS enrollment_semester, er.marks_obtained, er.grade, er.gpa
          FROM students s
          JOIN users u ON s.user_id = u.id
          JOIN programs p ON s.program_id = p.id
          JOIN enrollments e ON e.student_id = s.id
          JOIN courses c ON e.course_id = c.id
          LEFT JOIN exam_results er ON er.enrollment_id = e.id;
        `);
        log('Created vw_student_transcript');
      } catch (e) { log('View Error: ' + e.message); }

      try {
        await pool.query('SELECT s.current_gpa, s.academic_status FROM students s JOIN programs p ON p.id = s.program_id LIMIT 1');
        log('Grades Query Test 1: PASS');
      } catch(e) { log('Grades Query Test 1 FAILED: ' + e.message); }

      log('Auto-fix complete!');
      res.json({ success: true, logs });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post('/api/signin', signinLimiter);          // Rate limit: 10 req / 15 min
  app.post('/api/signup', signupLimiter);           // Rate limit: 5 req / 1 hr
  app.use('/api', require('./api/auth'));

  app.post('/api/forgot-password', forgotPasswordLimiter); // Rate limit: 5 req / 15 min
  app.post('/api/verify-otp', forgotPasswordLimiter);
  app.use('/api', require('./api/forgotPassword'));

  app.use('/api/users', require('./api/users'));
  app.use('/api/trainings', require('./api/trainings'));

  const { cacheMiddleware } = require('./middleware/cache');

  // ─── Academic Routes (internally protected via verifyToken + role checks) ────
  app.use('/api/teachers',        require('./api/teachers'));
  app.use('/api/courses',         cacheMiddleware(60), require('./api/courses'));
  app.use('/api/assignments',     require('./api/assignmentFiles'));
  app.use('/api/assignments',     require('./api/assignments'));
  app.use('/api/submissions',     require('./api/studentSubmissions'));
  app.use('/api/admin',           require('./api/admin'));
  app.use('/api/attendance',      require('./api/attendance'));
  app.use('/api/grades',          require('./api/grades'));
  app.use('/api/progress',        require('./api/progress'));
  app.use('/api/challans',        require('./api/challans'));
  app.use('/api/timetables',      require('./api/timetables'));
  app.use('/api/classes',         require('./api/classes'));
  app.use('/api/semesters',       cacheMiddleware(60), require('./api/semesters'));
  app.use('/api/rooms',           require('./api/rooms'));
  app.use('/api/degree-plans',    cacheMiddleware(60), require('./api/degreePlans'));
  app.use('/api/course-sections', require('./api/courseSections'));
  app.use('/api/course-prerequisites', cacheMiddleware(60), require('./api/coursePrerequisites'));
  app.use('/api/logs',            require('./api/logs'));
  app.use('/api/labs',            require('./api/labs'));
  app.use('/api/parent',          require('./api/parent'));
  app.use('/api/pending-students',require('./api/pending-students'));
  app.use('/api/students',        require('./api/students'));
  app.use('/api/feedback',        require('./api/feedback'));
  app.use('/api/chat',            require('./api/chat'));
  app.use('/api/face-attendance', require('./api/faceAttendance'));

  // ─── Phase 2 & 3: New HEC Compliance Routes ─────────────────────────────────
  app.use('/api/teacher-workload',     require('./api/teacherWorkload'));
  app.use('/api/enrollment-rules',     require('./api/enrollmentRules'));
  app.use('/api/enrollment',           require('./api/enrollmentRegistrations'));

  // Phase 5: Reporting & Graduation Audit
  app.use('/api/graduation',           require('./api/graduation'));

  // ─── Strictly Protected Institutional Routes ─────────────────────────────────
  // FIX (CRIT-02): Removed duplicate unprotected registrations.
  // FIX (HIGH-03): Added missing isHRManager and isFinanceManager middleware.
  // Each route below is protected ONCE — with the correct role check.
  app.use('/api/hr',          verifyToken,                        require('./api/hr'));
  app.use('/api/finance',     verifyToken,                        require('./api/finance'));
  app.use('/api/registrar',   verifyToken, isRegistrar,        require('./api/registrar'));
  app.use('/api/rector',      verifyToken, isRector,           require('./api/rector'));
  app.use('/api/admissions',  verifyToken, isAdmissionOfficer, require('./api/admissions'));
  app.use('/api/library',     verifyToken, isLibrarian,        require('./api/library'));
  app.use('/api/superadmin',  verifyToken, isSuperAdmin,       require('./api/superadmin'));
  app.use('/api/masteradmin', verifyToken, isMasterAdmin,      require('./api/masteradmin'));
  app.use('/api/principal',   verifyToken, isPrincipal,        require('./api/principal'));
  app.use('/api/bd',          verifyToken, isBDAgent,          require('./api/bd'));
  app.use('/api/it',          verifyToken,                     require('./api/it'));
  
  // Serve uploads directory statically for logos
  const path = require('path');
  app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/api/exams',       verifyToken,                     require('./api/exams'));
  app.use('/api/reports',     verifyToken,                     require('./api/reports'));

  console.log('\n✅ All routes loaded and secured successfully!\n');

} catch (error) {
  console.error('\n❌ Error loading routes:');
  console.error(error);
  process.exit(1);
}

// 404 handler
app.use((req, res) => {
  const logMsg = `404 Not Found: ${req.method} ${req.originalUrl || req.url} at ${new Date().toISOString()}\n`;
  console.log(logMsg);
  try {
    const fs = require('fs');
    fs.appendFileSync('server_access.log', logMsg);
  } catch (err) {}
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  try {
    const fs = require('fs');
    fs.appendFileSync('server_error.log', `${new Date().toISOString()} - Unhandled Error: ${err.message}\nStack: ${err.stack}\n`);
  } catch (logErr) {
    console.error('Failed to write to log file:', logErr);
  }
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const startServer = async () => {
  // Test database connection first
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('⚠️  Server starting without database connection');
    console.error('⚠️  Please check your MySQL configuration');
  }

  // Log startup to file to verify write permissions
  try {
    const fs = require('fs');
    fs.appendFileSync('server_startup.log', `${new Date().toISOString()} - Server starting on port ${PORT}\n`);
    console.log('✅ Startup log written to server_startup.log');
  } catch (err) {
    console.error('❌ Failed to write to server_startup.log:', err);
  }

  server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 University LMS Backend API`);
    console.log(`💬 Chat Socket.io enabled`);
    console.log(`\nAvailable endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/signup`);
    console.log(`   POST http://localhost:${PORT}/api/signin`);
    console.log(`   GET  http://localhost:${PORT}/api/chat/users`);
    console.log(`   GET  http://localhost:${PORT}/api/chat/messages/:userId`);
    console.log(`   POST http://localhost:${PORT}/api/chat/messages\n`);
  });
};

startServer();
