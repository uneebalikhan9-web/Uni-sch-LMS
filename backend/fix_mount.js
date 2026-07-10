const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace("app.use('/api/lab', require('./api/lab'));", "app.use('/api/labs', require('./api/lab'));");
fs.writeFileSync('server.js', code);
console.log('Fixed server.js mount path');
