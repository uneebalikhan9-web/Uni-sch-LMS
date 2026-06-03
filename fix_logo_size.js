const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const folders = fs.readdirSync(pagesDir).filter(f => fs.statSync(path.join(pagesDir, f)).isDirectory());

folders.forEach(folder => {
  const folderPath = path.join(pagesDir, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('Dashboard.jsx'));
  
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let original = content;
    content = content.replace(/style=\{\{ height: '40px', objectFit: 'contain', maxWidth: '100%' \}\}/g, "style={{ maxHeight: '55px', maxWidth: '180px', width: 'auto', height: 'auto', objectFit: 'contain' }}");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed logo size in ${file}`);
    }
  });
});
