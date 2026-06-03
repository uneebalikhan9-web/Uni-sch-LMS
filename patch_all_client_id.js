const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'frontend', '..', 'backend', 'api'); // Just pointing to backend/api

// Function to patch a specific file
function patchFile(fileName, searches) {
  const filePath = path.join(__dirname, 'backend', 'api', fileName);
  if (!fs.existsSync(filePath)) return;
  
  let code = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  
  searches.forEach(search => {
    if (code.includes(search.find)) {
      code = code.replace(search.find, search.replace);
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, code, 'utf-8');
    console.log(`Patched ${fileName}`);
  }
}

// 1. students.js - Add client_id
patchFile('students.js', [
  {
    find: `        name, email, password, role, campus_id, is_approved
      ) VALUES (?, ?, ?, ?, ?, ?)`,
    replace: `        name, email, password, role, campus_id, is_approved, client_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  },
  {
    find: `[name, email, hashedPassword, 'student', campus_id, true]`,
    replace: `[name, email, hashedPassword, 'student', campus_id, true, req.user.client_id || null]`
  }
]);

// 2. teachers.js - Add client_id
patchFile('teachers.js', [
  {
    find: `'INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?)',`,
    replace: `'INSERT INTO users (name, email, password, role, is_approved, campus_id, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',`
  },
  {
    find: `[name, email, hashedPassword, 'student', true, campus_id]`,
    replace: `[name, email, hashedPassword, 'student', true, campus_id, req.user.client_id || null]`
  }
]);

// 3. principal.js - Add client_id
patchFile('principal.js', [
  {
    find: `'INSERT INTO users (name, email, password, role, campus_id, is_approved) VALUES (?, ?, ?, ?, ?, ?)',`,
    replace: `'INSERT INTO users (name, email, password, role, campus_id, is_approved, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',`
  },
  {
    find: `[name, email, hashedPassword, role, campusId, true]`,
    replace: `[name, email, hashedPassword, role, campusId, true, req.user.client_id || null]`
  },
  {
    find: `[name, email, hashedPassword, role, campus_id, true]`,
    replace: `[name, email, hashedPassword, role, campus_id, true, req.user.client_id || null]`
  }
]);

// 4. hr.js - Add client_id
patchFile('hr.js', [
  {
    find: `'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, "active")'`,
    replace: `'INSERT INTO users (name, email, password, role, status, client_id) VALUES (?, ?, ?, ?, "active", ?)'`
  },
  {
    find: `[name, email, hashedPassword, role]`,
    replace: `[name, email, hashedPassword, role, req.user.client_id || null]`
  }
]);

// 5. admin.js - Add client_id
patchFile('admin.js', [
  {
    find: `'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',`,
    replace: `'INSERT INTO users (name, email, password, role, client_id) VALUES (?, ?, ?, ?, ?)',`
  },
  {
    find: `[name, email, hashedPassword, role]`,
    replace: `[name, email, hashedPassword, role, req.user.client_id || null]`
  },
  {
    find: `'INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?)',`,
    replace: `'INSERT INTO users (name, email, password, role, is_approved, campus_id, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',`
  },
  {
    find: `[name, email, hashedPassword, 'student', true, campus_id]`,
    replace: `[name, email, hashedPassword, 'student', true, campus_id, req.user.client_id || null]`
  }
]);
