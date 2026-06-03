const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const folders = fs.readdirSync(pagesDir).filter(f => fs.statSync(path.join(pagesDir, f)).isDirectory());

const replacement = `          <div style={S.logoWrapper}>
            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ height: '40px', objectFit: 'contain', maxWidth: '100%' }} />
            ) : (
              <>
                <div style={S.logoIcon}><Globe size={24} weight="fill" /></div>
                <span style={S.logoText}>Lancers<span style={S.logoAccent}>Tech</span></span>
              </>
            )}
          </div>`;

folders.forEach(folder => {
  if (folder === 'masteradmin') return; // skip master admin
  const folderPath = path.join(pagesDir, folder);
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('Dashboard.jsx'));
  
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Simple regex to replace the logo wrapper
    const regex = /<div style=\{S\.logoWrapper\}>[\s\S]*?<\/div>/;
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      fs.writeFileSync(filePath, content);
      console.log(`Patched ${file}`);
    }
  });
});
