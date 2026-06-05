const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Upload Directories ───────────────────────────────────────────────────────
const uploadsDir    = path.join(__dirname, '../uploads');
const assignmentsDir = path.join(uploadsDir, 'assignments');
const submissionsDir = path.join(uploadsDir, 'submissions');
const logosDir       = path.join(uploadsDir, 'logos');

[uploadsDir, assignmentsDir, submissionsDir, logosDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Strict MIME-Type + Extension Allowlist ───────────────────────────────────
// Both the extension AND the real MIME-type must match exactly.
// This prevents: evil.php renamed to evil.pdf, double extensions like file.pdf.php, etc.
const ALLOWED_FILES = {
  '.pdf':  ['application/pdf'],
  '.doc':  ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.txt':  ['text/plain'],
  '.zip':  ['application/zip', 'application/x-zip-compressed'],
  '.rar':  ['application/x-rar-compressed', 'application/vnd.rar'],
  '.jpg':  ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png':  ['image/png'],
};

const strictFileFilter = (req, file, cb) => {
  // 1. Prevent path traversal — reject filenames with slashes or dots tricks
  const safeName = path.basename(file.originalname);
  if (safeName !== file.originalname || file.originalname.includes('..')) {
    return cb(new Error('Invalid filename. Path traversal detected.'));
  }

  // 2. Get extension — must be a single, known extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = ALLOWED_FILES[ext];

  if (!allowedMimes) {
    return cb(new Error(
      `File type "${ext || '(none)'}" is not allowed. ` +
      `Allowed: ${Object.keys(ALLOWED_FILES).join(', ')}`
    ));
  }

  // 3. Check real MIME-type matches the extension
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error(
      `File content does not match its extension. ` +
      `Expected MIME for ${ext}: ${allowedMimes.join(' or ')}, got: ${file.mimetype}`
    ));
  }

  cb(null, true);
};

// ─── Safe Filename Generator ───────────────────────────────────────────────────
// IMPORTANT: We keep the extension but strip the original name entirely.
// Files are stored as: assignment-<timestamp>-<random>.<ext>
// This prevents script execution even if the web server misconfigures execution.
const makeSafeFilename = (prefix, originalname) => {
  const ext = path.extname(originalname).toLowerCase(); // e.g. ".pdf"
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${prefix}-${uniqueSuffix}${ext}`;
};

// ─── Storage Configs ──────────────────────────────────────────────────────────
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, assignmentsDir),
  filename:    (req, file, cb) => cb(null, makeSafeFilename('asgn', file.originalname)),
});

const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, submissionsDir),
  filename:    (req, file, cb) => cb(null, makeSafeFilename('sub', file.originalname)),
});

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logosDir),
  filename:    (req, file, cb) => cb(null, makeSafeFilename('logo', file.originalname)),
});

// ─── Multer Instances ─────────────────────────────────────────────────────────
const uploadAssignment = multer({
  storage:    assignmentStorage,
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: strictFileFilter,
});

const uploadSubmission = multer({
  storage:    submissionStorage,
  limits:     { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: strictFileFilter,
});

const uploadLogo = multer({
  storage:    logoStorage,
  limits:     { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: strictFileFilter,
});

// ─── Multer Error Handler ─────────────────────────────────────────────────────
// Use this in routes: uploadX.single('file'), handleUploadError, async (req, res) => ...
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

module.exports = {
  uploadAssignment,
  uploadSubmission,
  uploadLogo,
  handleUploadError,
};
