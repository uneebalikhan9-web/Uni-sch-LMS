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
    let originalLength = content.length;
    
    // Fix variation 1: LANCERS TECH
    content = content.replace(/<\/div>\s*<span style=\{S\.logoText\}>LANCERS\s*<span style=\{S\.logoAccent\}>TECH<\/span><\/span>\s*<\/div>/g, '</div>\n');
    
    // Fix variation 2: LancersTech
    content = content.replace(/<\/div>\s*<span style=\{S\.logoText\}>Lancers<span style=\{S\.logoAccent\}>Tech<\/span><\/span>\s*<\/div>/g, '</div>\n');

    // Fix variation 3: Finance Dashboard
    content = content.replace(/<\/div>\s*<span className="fin-logo-text">LANCERS\s*<span className="fin-logo-accent">TECH<\/span><\/span>\s*<\/div>/g, '</div>\n');
    
    if (content.length !== originalLength) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed ${file}`);
    }
  });
});
