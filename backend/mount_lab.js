const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
if (!code.includes('/api/lab')) {
    const updated = code.replace("app.use('/api/hr', require('./api/hr'));", "app.use('/api/hr', require('./api/hr'));\napp.use('/api/lab', require('./api/lab'));");
    fs.writeFileSync('server.js', updated);
    console.log('Mounted /api/lab');
} else {
    console.log('Already mounted');
}
