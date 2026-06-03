const fs = require('fs');
const path = require('path');

function patchDashboard(folder, fileName, searchStr, replaceStr) {
  const filePath = path.join(__dirname, 'frontend', 'src', 'pages', folder, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${fileName}`);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf-8');
  if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync(filePath, code, 'utf-8');
    console.log(`Patched logo in ${fileName}`);
  } else {
    console.log(`Could not find search string in ${fileName}`);
  }
}

// 1. AdmissionsDashboard.jsx
patchDashboard('admissions', 'AdmissionsDashboard.jsx',
`            <div className="adm-brand">
              <span className="adm-brand-lancers">LANCERS</span>
              <span className="adm-brand-tech">TECH</span>
            </div>`,
`            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <div className="adm-brand">
                <span className="adm-brand-lancers">LANCERS</span>
                <span className="adm-brand-tech">TECH</span>
              </div>
            )}`);

// 2. ExamsDashboard.jsx
patchDashboard('exams', 'ExamsDashboard.jsx',
`          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Lancers<span style={{ color: '#a5b4fc' }}>Tech</span></div>`,
`          {user?.logo_url ? (
            <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Lancers<span style={{ color: '#a5b4fc' }}>Tech</span></div>
          )}`);

// 3. HRDashboard.jsx
patchDashboard('hr', 'HRDashboard.jsx',
`          <div className="hr-logo">
            <div className="hr-logo-icon">
              <Users size={24} weight="fill" />
            </div>
            <div className="hr-logo-text">Lancers<span className="hr-logo-accent">Tech</span></div>
          </div>`,
`          {user?.logo_url ? (
            <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          ) : (
            <div className="hr-logo">
              <div className="hr-logo-icon">
                <Users size={24} weight="fill" />
              </div>
              <div className="hr-logo-text">Lancers<span className="hr-logo-accent">Tech</span></div>
            </div>
          )}`);

// 4. LabAssistantDashboard.jsx
patchDashboard('lab', 'LabAssistantDashboard.jsx',
`          <div className="brand-logo">
            <Flask size={32} weight="duotone" className="brand-icon" />
            <span className="brand">Lancers Tech</span>
          </div>`,
`          {user?.logo_url ? (
            <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          ) : (
            <div className="brand-logo">
              <Flask size={32} weight="duotone" className="brand-icon" />
              <span className="brand">Lancers Tech</span>
            </div>
          )}`);

// 5. LibraryDashboard.jsx
patchDashboard('library', 'LibraryDashboard.jsx',
`            <div className="brand-logo">
              <span className="brand-lancers">LANCERS</span>
              <span className="brand-tech">TECH</span>
            </div>`,
`            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <div className="brand-logo">
                <span className="brand-lancers">LANCERS</span>
                <span className="brand-tech">TECH</span>
              </div>
            )}`);

// 6. RegistrarDashboard.jsx
patchDashboard('registrar', 'RegistrarDashboard.jsx',
`          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '32px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bank size={24} weight="fill" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
              Lancers<span style={{ color: '#818cf8' }}>Tech</span>
            </span>
          </div>`,
`          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '32px' }}>
            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Bank size={24} weight="fill" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
                  Lancers<span style={{ color: '#818cf8' }}>Tech</span>
                </span>
              </>
            )}
          </div>`);

// 7. ITDashboard.jsx
patchDashboard('it', 'ITDashboard.jsx',
`          <div style={{ padding: '0 12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Desktop size={24} weight="duotone" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Lancers<span style={{ color: '#38bdf8' }}>Tech</span></div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>IT Administration</div>
            </div>
          </div>`,
`          <div style={{ padding: '0 12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Desktop size={24} weight="duotone" />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Lancers<span style={{ color: '#38bdf8' }}>Tech</span></div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>IT Administration</div>
                </div>
              </>
            )}
          </div>`);
