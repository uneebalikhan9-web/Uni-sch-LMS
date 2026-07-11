const xss = require('xss');

/**
 * Middleware to sanitize incoming request bodies against Cross-Site Scripting (XSS).
 * It recursively goes through the req.body and escapes/removes malicious HTML tags.
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.query) {
    sanitizeObject(req.query);
  }
  if (req.params) {
    sanitizeObject(req.params);
  }
  next();
};

const sanitizeObject = (obj) => {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        // xss() will strip out <script> and other malicious HTML tags
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Recursively sanitize nested objects/arrays
        sanitizeObject(obj[key]);
      }
    }
  }
};

module.exports = sanitizeInput;
