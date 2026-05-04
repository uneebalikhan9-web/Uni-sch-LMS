import React, { useState, useEffect } from 'react';
import { 
  Users, IdentificationCard, GraduationCap, FileText, 
  List, Bell, SignOut, Plus, MagnifyingGlass, CheckCircle, 
  Calendar, Certificate, ChartLineUp, BookOpen, UserCircle, ListNumbers
} from '@phosphor-icons/react';
import { useToast } from '../../components/Toast';
import './registrar.css';

const RegistrarDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { showToast } = useToast();

  const [students, setStudents] = useState([
    { id: 'ST-001', name: 'Zeeshan Ahmed', program: 'CS', semester: '6th', status: 'Enrolled' },
    { id: 'ST-002', name: 'Sara Khan', program: 'BBA', semester: '4th', status: 'Enrolled' },
    { id: 'ST-003', name: 'Bilal Malik', program: 'SE', semester: '8th', status: 'Graduating' },
  ]);

  const [degrees, setDegrees] = useState([
    { id: 1, name: 'Zeeshan Ahmed', degree: 'BS Computer Science', status: 'In Review' },
    { id: 2, name: 'Ali Raza', degree: 'MBA', status: 'Issued' },
  ]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <ChartLineUp size={20} /> },
    { id: 'students', label: 'Student Records', icon: <Users size={20} /> },
    { id: 'degrees', label: 'Degree Issuance', icon: <Certificate size={20} /> },
    { id: 'enrollment', label: 'Enrollments', icon: <IdentificationCard size={20} /> },
    { id: 'catalog', label: 'Course Catalog', icon: <BookOpen size={20} /> }
  ];

  return (
    <div className="portal-container">
      {/* Sidebar */}
      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="reg-logo-section">
          <div className="reg-logo-text">Lancers<span className="reg-logo-accent">Tech</span></div>
          <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600, marginTop: 4 }}>REGISTRAR OFFICE</div>
        </div>
        
        <nav className="reg-nav">
          {navItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }} 
              className={`reg-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon} <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ position: 'absolute', bottom: 30, width: '100%', padding: '0 1rem' }}>
          <button onClick={onLogout} className="reg-nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: '#fca5a5' }}>
            <SignOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="reg-main">
        <header className="reg-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isMobile && <List size={24} weight="bold" onClick={() => setSidebarOpen(!sidebarOpen)} />}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{navItems.find(i => i.id === activeTab)?.label}</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Bell size={22} color="#64748b" />
            <div className="reg-user-pill">
              <UserCircle size={28} color="#4f46e5" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Registrar'}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>University Registrar</span>
              </div>
            </div>
          </div>
        </header>

        <div className="reg-content">
          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                <MetricCard icon={<Users size={26} weight="duotone" />} value="4,250" label="Active Students" />
                <MetricCard icon={<GraduationCap size={26} weight="duotone" />} value="320" label="Graduating This Year" />
                <MetricCard icon={<IdentificationCard size={26} weight="duotone" />} value="850" label="New Enrollments" />
                <MetricCard icon={<FileText size={26} weight="duotone" />} value="12" label="Pending Reports" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="reg-card">
                  <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Graduation Eligibility Tracker</h3>
                  {[
                    { program: 'BS Computer Science', total: 120, eligible: 95 },
                    { program: 'BBA Honors', total: 85, eligible: 70 },
                    { program: 'MS Software Engineering', total: 45, eligible: 40 }
                  ].map((prog, i) => (
                    <div key={i} className="reg-progress-container">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                        <span>{prog.program}</span>
                        <span>{prog.eligible}/{prog.total} Students</span>
                      </div>
                      <div className="reg-progress-bar">
                        <div className="reg-progress-fill" style={{ width: `${(prog.eligible/prog.total) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="reg-card">
                  <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Quick Services</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    <button className="reg-btn-primary" onClick={() => showToast('Redirecting to Student Registration...', 'success')}>
                      <Plus size={18} weight="bold" /> Register New Student
                    </button>
                    <button className="reg-btn-primary" style={{ background: '#4338ca' }} onClick={() => showToast('Opening Transcript Portal...', 'success')}>
                      <FileText size={18} weight="bold" /> Issue Transcript
                    </button>
                    <button className="reg-btn-primary" style={{ background: '#3730a3' }} onClick={() => showToast('Opening Degree Clearance...', 'success')}>
                      <Certificate size={18} weight="bold" /> Verify Graduation
                    </button>
                    <button className="reg-btn-primary" style={{ background: '#1e1b4b' }} onClick={() => showToast('Opening Course Scheduler...', 'success')}>
                      <BookOpen size={18} weight="bold" /> Course Catalog
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                <div className="reg-card">
                  <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Recent Transcript Requests</h3>
                  {[
                    { name: 'Ali Raza', id: 'FA21-BCS-042', status: 'Processing' },
                    { name: 'Sana Khan', id: 'SP22-BBA-015', status: 'Ready' },
                    { name: 'Hamza Malik', id: 'FA20-BSE-001', status: 'Verification' }
                  ].map((req, i) => (
                    <div key={i} className="reg-request-item">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{req.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.id}</div>
                      </div>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: 10, 
                        fontSize: '0.7rem', 
                        fontWeight: 700,
                        background: req.status === 'Ready' ? '#dcfce7' : req.status === 'Processing' ? '#fef3c7' : '#eef2ff',
                        color: req.status === 'Ready' ? '#15803d' : req.status === 'Processing' ? '#b45309' : '#4f46e5'
                      }}>{req.status}</span>
                    </div>
                  ))}
                </div>

                <div className="reg-card">
                  <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Institutional Record Stats</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ background: '#f8fafc', padding: 15, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>DEGREE ISSUANCE ACCURACY</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>100%</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: 15, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>AVG. TRANSCRIPT TAT</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' }}>48 Hours</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <div className="reg-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Master Student Directory</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <MagnifyingGlass size={18} style={{ position: 'absolute', left: 12, top: 10, color: '#64748b' }} />
                    <input placeholder="Search Student ID/Name" style={{ padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid #e2e8f0', outline: 'none' }} />
                  </div>
                </div>
              </div>
              <table className="reg-table">
                <thead>
                  <tr><th>Student ID</th><th>Name</th><th>Program</th><th>Semester</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{s.id}</td>
                      <td>{s.name}</td>
                      <td>{s.program}</td>
                      <td>{s.semester}</td>
                      <td><button className="reg-btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>View Profile</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'degrees' && (
            <div className="reg-card">
              <h3 style={{ marginBottom: 20 }}>Degree Issuance & Verification</h3>
              <table className="reg-table">
                <thead>
                  <tr><th>Student Name</th><th>Degree Title</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {degrees.map(d => (
                    <tr key={d.id}>
                      <td>{d.name}</td>
                      <td>{d.degree}</td>
                      <td><span className={`reg-badge ${d.status === 'Issued' ? 'reg-badge-success' : 'reg-badge-warning'}`}>{d.status}</span></td>
                      <td>
                        {d.status === 'In Review' ? (
                          <button className="reg-btn-primary" onClick={() => showToast('Degree Approved!', 'success')}>Approve & Issue</button>
                        ) : (
                          <button className="reg-btn-primary" style={{ background: '#64748b' }}>Download Copy</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'enrollment' || activeTab === 'catalog') && (
            <div className="reg-card" style={{ textAlign: 'center', padding: '50px' }}>
              <ListNumbers size={64} weight="duotone" color="#4f46e5" style={{ margin: '0 auto 20px' }} />
              <h3>Coming Soon</h3>
              <p style={{ color: '#64748b' }}>This module is currently being synchronized with departmental course schedules.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, value, label }) => (
  <div className="reg-card">
    <div className="reg-metric-icon-box">{icon}</div>
    <div className="reg-metric-value">{value}</div>
    <div className="reg-metric-label">{label}</div>
  </div>
);

export default RegistrarDashboard;
