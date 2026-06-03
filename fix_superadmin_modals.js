const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'frontend', 'src', 'pages', 'superadmin', 'sections');
const files = fs.readdirSync(sectionsDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(sectionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace direct h3 with modalHeader
  // Specifically looking for:
  // <h3 style={S.modalTitle}>{editingItem ? 'Edit BD User' : 'Add New BD User'}</h3>
  // or similar.
  const regex = /(<h3 style=\{S\.modalTitle\}>.*?<\/h3>)/g;
  
  // But wait, what if it's already inside a modalHeader?
  // Let's check if the previous line contains modalHeader
  
  let lines = content.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<h3 style={S.modalTitle}>')) {
      if (!lines[i-1].includes('modalHeader')) {
        // Find the modal state name to close
        let closeMatch = content.match(/setShowAddModal\(false\)/) ? 'setShowAddModal' : 'setShowModal';
        
        // Wrap it!
        let indent = lines[i].match(/^\s*/)[0];
        lines[i] = `${indent}<div style={S.modalHeader}>\n${lines[i]}\n${indent}  <button onClick={() => { ${closeMatch}(false); setEditingItem(null); }} style={S.modalClose}>×</button>\n${indent}</div>`;
        changed = true;
      }
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Fixed ${file}`);
  }
});
