const fs = require('fs');
const path = require('path');

const filesToFix = [
  'bd/BDDashboard.jsx',
  'principal/PrincipalDashboard.jsx',
  'rector/RectorDashboard.jsx',
  'student/StudentDashboard.jsx',
  'superadmin/SuperAdminDashboard.jsx',
  'teacher/TeacherDashboard.jsx',
  'masteradmin/MasterAdminDashboard.jsx'
];

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, 'frontend', 'src', 'pages', relPath);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('<Globe') && !content.match(/Globe.*from\s*['"]@phosphor-icons\/react['"]/)) {
    // Find the phosphor icons import and add Globe
    content = content.replace(/(import\s*\{[^}]*)(\}\s*from\s*['"]@phosphor-icons\/react['"])/, (match, p1, p2) => {
      if (!p1.includes('Globe')) {
        return p1 + ', Globe ' + p2;
      }
      return match;
    });
    fs.writeFileSync(filePath, content);
    console.log('Fixed ' + relPath);
  }
});
