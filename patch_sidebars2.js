const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const folders = fs.readdirSync(pagesDir).filter(f => fs.statSync(path.join(pagesDir, f)).isDirectory());

folders.forEach(folder => {
  if (folder === 'masteradmin') return; 
  const folderPath = path.join(pagesDir, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('Dashboard.jsx'));
  
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Look for <div className="something-logo-wrapper">
    const regex = /<div className="[\w-]+logo-wrapper">[\s\S]*?<\/div>\s*<\/div>/;
    
    if (regex.test(content)) {
      const match = content.match(/<div className="([\w-]+)logo-wrapper">/)[1];
      const replacement = `<div className="${match}logo-wrapper">
          {user?.logo_url ? (
            <img src={user.logo_url} alt="Tenant Logo" style={{ height: '40px', objectFit: 'contain', maxWidth: '100%' }} />
          ) : (
            <>
              <div className="${match}logo-icon"><Buildings size={24} weight="fill" /></div>
              <span className="${match}logo-text">LANCERS <span className="${match}logo-accent">TECH</span></span>
            </>
          )}
        </div>`;
      
      content = content.replace(/<div className="[\w-]+logo-wrapper">[\s\S]*?<\/div>/, replacement);
      fs.writeFileSync(filePath, content);
      console.log(`Patched ${file}`);
    }
  });
});
