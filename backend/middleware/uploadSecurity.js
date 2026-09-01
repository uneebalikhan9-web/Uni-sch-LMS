const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Secure disk storage with sanitized, random UUID-prefixed filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename to prevent directory traversal
    const safeExt = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const cleanBase = path.basename(file.originalname, safeExt).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${cleanBase}_${uniqueSuffix}${safeExt}`);
  }
});

// Image upload filter (Photos / Face Attendance / Avatars)
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP image files are allowed.'), false);
  }
};

// Document / Assignment upload filter
const docFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.zip', '.txt', '.jpg', '.jpeg', '.png'];

  const ext = path.extname(file.originalname).toLowerCase();

  // Explicit dangerous extension rejection
  const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.php', '.py', '.html', '.htm', '.jsp', '.vbs'];
  if (dangerousExts.includes(ext)) {
    return cb(new Error('Security alert: Executable or script files are strictly prohibited.'), false);
  }

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Allowed formats: PDF, DOC, DOCX, ZIP, TXT, JPG, PNG.'), false);
  }
};

// Configured multer instances
const uploadPhoto = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB max
  fileFilter: imageFileFilter
});

const uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
  fileFilter: docFileFilter
});

module.exports = {
  uploadPhoto,
  uploadDocument
};
