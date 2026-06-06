const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'rector.js');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/sc\.created_at/g, 'sc.assigned_at');

fs.writeFileSync(filePath, code);
console.log('Fixed sc.created_at to sc.assigned_at');
