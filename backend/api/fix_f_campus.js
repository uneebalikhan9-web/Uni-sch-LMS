const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'rector.js');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(/f\.campus_id IN \(\?\)/g, 'd.campus_id IN (?)');
code = code.replace(/f\.campus_id/g, 'd.campus_id');

fs.writeFileSync(filePath, code);
console.log('Fixed f.campus_id to d.campus_id');
