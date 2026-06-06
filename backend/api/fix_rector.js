const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'rector.js');
let code = fs.readFileSync(filePath, 'utf8');

// Replace getRectorCampusId
code = code.replace(
  /async function getRectorCampusId\(userId\) \{[\s\S]*?return rows\.length > 0 \? rows\[0\]\.campus_id : null;\s*\}/,
  `async function getRectorCampusIds(user) {
  if (user.role === 'super_admin') {
    const [rows] = await pool.query('SELECT id FROM campuses');
    return rows.length > 0 ? rows.map(r => r.id) : [0];
  }
  if (user.client_id) {
    const [rows] = await pool.query('SELECT id FROM campuses WHERE client_id = ?', [user.client_id]);
    return rows.length > 0 ? rows.map(r => r.id) : [user.campus_id || 0];
  }
  return [user.campus_id || 0];
}`
);

// Replace campusId definitions
code = code.replace(
  /const campusId = req\.user\.campus_id \|\| await getRectorCampusId\(req\.user\.id\);/g,
  'const campusIds = await getRectorCampusIds(req.user);'
);

// Replace query parts
code = code.replace(/cl\.campus_id = \?/g, 'cl.campus_id IN (?)');
code = code.replace(/u\.campus_id = \?/g, 'u.campus_id IN (?)');
code = code.replace(/f\.campus_id = \?/g, 'f.campus_id IN (?)');
code = code.replace(/campus_id = \?/g, 'campus_id IN (?)');
code = code.replace(/fc\.campus_id = \?/g, 'fc.campus_id IN (?)'); // if any
code = code.replace(/fe\.campus_id = \?/g, 'fe.campus_id IN (?)'); // if any

// Note: regex replace campus_id = ? handles most cases. Let's make it robust.
// We can just globally replace campus_id = ? with campus_id IN (?)
// We've already done that with `/campus_id = \?/g`.
// Let's verify there are no "id = ?" meant for campusId.
// Yes, line 43 is: "SELECT COUNT(*) as totalClasses FROM classes WHERE campus_id = ?", which matches.

// Replace all [campusId] with [campusIds]
code = code.replace(/\[campusId\]/g, '[campusIds]');
code = code.replace(/\[campusId, /g, '[campusIds, ');
code = code.replace(/campusId, campusId/g, 'campusIds, campusIds');

fs.writeFileSync(filePath, code);
console.log('Done');
