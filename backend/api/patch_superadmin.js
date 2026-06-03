const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'superadmin.js');
let code = fs.readFileSync(filePath, 'utf-8');

// Helper to replace precisely
function patch(searchStr, replaceStr) {
  if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
  } else {
    console.log("Could not find:", searchStr);
  }
}

// Get all HODs
patch(`    const [principals] = await pool.query(\`
      SELECT u.id, u.name, u.email, u.created_at, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role = 'principal'
      ORDER BY u.created_at DESC
    \`);`, `    const clientId = req.user.client_id;
    const [principals] = await pool.query(\`
      SELECT u.id, u.name, u.email, u.created_at, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role = 'principal' AND u.client_id = ?
      ORDER BY u.created_at DESC
    \`, [clientId]);`);

// Create HOD
patch(`    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);`, `    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);`);
// Wait, email is unique globally in users, so we can leave email check as is.
patch(`      'INSERT INTO users (name, email, password, role, campus_id, is_approved) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'principal', campus_id, true]`, `      'INSERT INTO users (name, email, password, role, campus_id, is_approved, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'principal', campus_id, true, req.user.client_id]`);

// Update HOD
patch(`    const [existing] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'principal'", [id]);`, `    const clientId = req.user.client_id;
    const [existing] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'principal' AND client_id = ?", [id, clientId]);`);

// Delete HOD
patch(`    const [principals] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'principal'", [id]);`, `    const clientId = req.user.client_id;
    const [principals] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'principal' AND client_id = ?", [id, clientId]);`);

// HOD Details
patch(`    // Get HOD info and department
    const [hodData] = await pool.query(\`
      SELECT 
        u.id, u.name, u.email, u.created_at, u.campus_id, 
        c.name as campus_name, c.location as campus_location, 
        c.is_active as campus_status
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.id = ? AND u.role = 'principal'
    \`, [id]);`, `    // Get HOD info and department
    const clientId = req.user.client_id;
    const [hodData] = await pool.query(\`
      SELECT 
        u.id, u.name, u.email, u.created_at, u.campus_id, 
        c.name as campus_name, c.location as campus_location, 
        c.is_active as campus_status
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.id = ? AND u.role = 'principal' AND u.client_id = ?
    \`, [id, clientId]);`);

// Get all BD Users
patch(`    const [bds] = await pool.query(\`
      SELECT u.id, u.name, u.email, u.created_at, u.is_approved, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role IN ('bd', 'bd_agent')
      ORDER BY u.created_at DESC
    \`);`, `    const clientId = req.user.client_id;
    const [bds] = await pool.query(\`
      SELECT u.id, u.name, u.email, u.created_at, u.is_approved, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role IN ('bd', 'bd_agent') AND u.client_id = ?
      ORDER BY u.created_at DESC
    \`, [clientId]);`);

// Create BD User
patch(`      'INSERT INTO users (name, email, password, role, is_approved, campus_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'bd_agent', true, campus_id || null]`, `      'INSERT INTO users (name, email, password, role, is_approved, campus_id, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'bd_agent', true, campus_id || null, req.user.client_id]`);

// Update BD User details
patch(`    const [existing] = await pool.query("SELECT id FROM users WHERE id = ? AND role IN ('bd', 'bd_agent')", [id]);`, `    const clientId = req.user.client_id;
    const [existing] = await pool.query("SELECT id FROM users WHERE id = ? AND role IN ('bd', 'bd_agent') AND client_id = ?", [id, clientId]);`);

// Delete BD User
patch(`    const [bds] = await pool.query("SELECT id FROM users WHERE id = ? AND role IN ('bd', 'bd_agent')", [id]);`, `    const clientId = req.user.client_id;
    const [bds] = await pool.query("SELECT id FROM users WHERE id = ? AND role IN ('bd', 'bd_agent') AND client_id = ?", [id, clientId]);`);

// BD details
patch(`    // Get BD info
    const [bdData] = await pool.query(\`
      SELECT u.id, u.name, u.email, u.created_at, u.role, u.is_approved, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.id = ? AND u.role IN ('bd', 'bd_agent')
    \`, [id]);`, `    // Get BD info
    const clientId = req.user.client_id;
    const [bdData] = await pool.query(\`
      SELECT u.id, u.name, u.email, u.created_at, u.role, u.is_approved, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.id = ? AND u.role IN ('bd', 'bd_agent') AND u.client_id = ?
    \`, [id, clientId]);`);

// Get staff by role
patch(`    const [staff] = await pool.query(\`
      SELECT u.id, u.name, u.email, u.created_at, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role = ?
      ORDER BY u.created_at DESC
    \`, [role]);`, `    const clientId = req.user.client_id;
    const [staff] = await pool.query(\`
      SELECT u.id, u.name, u.email, u.created_at, u.campus_id, c.name as campus_name
      FROM users u
      LEFT JOIN campuses c ON u.campus_id = c.id
      WHERE u.role = ? AND u.client_id = ?
      ORDER BY u.created_at DESC
    \`, [role, clientId]);`);

// Create generic staff
patch(`      'INSERT INTO users (name, email, password, role, campus_id, is_approved) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, campus_id, true]`, `      'INSERT INTO users (name, email, password, role, campus_id, is_approved, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, campus_id, true, req.user.client_id]`);

// Update generic staff
patch(`    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);`, `    const clientId = req.user.client_id;
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ? AND client_id = ?', [id, clientId]);`);

// Delete generic staff
patch(`    await pool.query("DELETE FROM users WHERE id = ?", [id]);`, `    const clientId = req.user.client_id;
    await pool.query("DELETE FROM users WHERE id = ? AND client_id = ?", [id, clientId]);`);

fs.writeFileSync(filePath, code, 'utf-8');
console.log("superadmin.js patched successfully.");
