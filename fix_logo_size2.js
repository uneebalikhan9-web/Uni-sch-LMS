const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'frontend', 'src', 'pages');

const replaceInFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    content = content.replace(/maxHeight: '55px', maxWidth: '180px'/g, "maxHeight: '80px', maxWidth: '200px'");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated logo size in ${path.basename(filePath)}`);
    }
  }
};

// Check SignIn and SignUp
replaceInFile(path.join(baseDir, 'SignIn.jsx'));
replaceInFile(path.join(baseDir, 'SignUp.jsx'));

// Check dashboards
const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

folders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('Dashboard.jsx'));
  
  files.forEach(file => {
    replaceInFile(path.join(folderPath, file));
  });
});
