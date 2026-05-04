import React, { useState } from 'react';
import { 
  UserPlus, Checks, Users, Funnel, List, Bell, 
  SignOut, Plus, MagnifyingGlass, ChartLineUp, UserCircle, 
  ChartLineUp as TrendUp, ArrowRight, IdentificationCard, FolderUser
} from '@phosphor-icons/react';
import { useToast } from '../../components/Toast';
import './admissions.css';

const AdmissionsDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { showToast } = useToast();

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [leads, setLeads] = useState([
    { id: 1, name: 'Hassan Ali', program: 'Computer Science', stage: 'Applied' },
    { id: 2, name: 'Zoya Fatima', program: 'BBA', stage: 'Shortlisted' },
    { id: 3, name: 'M. Ibrahim', program: 'Software Eng', stage: 'Interview' },
    { id: 4, name: 'Esha Jamil', program: 'Digital Arts', stage: 'Admitted' },
  ]);

  const stages = ['Applied', 'Shortlisted', 'Interview', 'Admitted'];

  return (
    <div className="portal-container">
      {/* Sidebar */}
      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Lancers<span style={{ color: '#a5b4fc' }}>Tech</span></div>
          <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600, marginTop: 4 }}>ADMISSIONS OFFICE</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 1rem' }}>
          <div onClick={() => { setActiveTab('pipeline'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'pipeline' ? 'white' : '#cbd5e1', background: activeTab === 'pipeline' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Funnel size={20} /> <span>Pipeline</span>
          </div>
          <div onClick={() => { setActiveTab('applicants'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'applicants' ? 'white' : '#cbd5e1', background: activeTab === 'applicants' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Users size={20} /> <span>All Applicants</span>
          </div>
          <div onClick={ () => { setActiveTab('verification'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'verification' ? 'white' : '#cbd5e1', background: activeTab === 'verification' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Checks size={20} /> <span>Verification</span>
          </div>
        </nav>

        <div style={{ position: 'absolute', bottom: 30, width: '100%', padding: '0 1rem' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: 'none', background: 'transparent', color: '#fca5a5', cursor: 'pointer' }}>
            <SignOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="adm-main">
        <header className="adm-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            {isMobile && <List size={24} weight="bold" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }} />}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Admissions Command Center</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Bell size={22} color="#64748b" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '8px 18px', borderRadius: 40, border: '1px solid #e2e8f0' }}>
              <UserCircle size={28} color="#4f46e5" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Admission Officer'}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Operations Head</span>
              </div>
            </div>
          </div>
        </header>

        <div className="adm-content">
          <div className="stats-grid">
            <MetricCard icon={<IdentificationCard size={26} weight="duotone" />} value="1,240" label="Total Applications" />
            <MetricCard icon={<TrendUp size={26} weight="duotone" />} value="85%" label="Conversion Rate" />
            <MetricCard icon={<Users size={26} weight="duotone" />} value="450" label="Interviews Pending" />
            <MetricCard icon={<Plus size={26} weight="duotone" />} value="120" label="Admitted Today" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <div className="adm-card">
              <h3 style={{ fontWeight: 800, marginBottom: 24 }}>Admissions Conversion Funnel</h3>
              {[
                { label: 'Website Leads', count: 5200, percent: 100 },
                { label: 'Applications Submitted', count: 1240, percent: 24 },
                { label: 'Shortlisted for Interview', count: 850, percent: 16 },
                { label: 'Final Admissions', count: 320, percent: 6 }
              ].map((item, i) => (
                <div key={i} className="adm-funnel-item">
                  <div style={{ width: 180, fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>{item.label}</div>
                  <div className="adm-funnel-bar-container">
                    <div className="adm-funnel-bar-fill" style={{ width: `${item.percent}%`, opacity: 1 - (i * 0.15) }}></div>
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontWeight: 800, color: '#1e293b' }}>{item.count}</div>
                </div>
              ))}
            </div>

            <div className="adm-card">
              <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Scheduled Interviews (Today)</h3>
              {[
                { name: 'John Smith', time: '10:30 AM', program: 'CS', room: 'Lab 4' },
                { name: 'Sarah Wilson', time: '11:45 AM', program: 'BBA', room: 'Office 2' },
                { name: 'Mike Johnson', time: '02:15 PM', program: 'Law', room: 'Zoom Link' }
              ].map((int, i) => (
                <div key={i} className="adm-interview-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{int.name}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>{int.time}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{int.program} • {int.room}</div>
                </div>
              ))}
              <button className="adm-btn-primary" style={{ width: '100%', marginTop: 15, padding: '10px' }}>View Full Calendar</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="adm-card">
              <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Recent Document Verifications</h3>
              {[
                { name: 'Alice Wong', doc: 'Transcript.pdf', status: 'Verified' },
                { name: 'Bob Carter', doc: 'CNIC_Front.jpg', status: 'Pending' },
                { name: 'Zoya Khan', doc: 'O-Level_Equivalence.pdf', status: 'Flagged' }
              ].map((v, i) => (
                <div key={i} className="adm-verification-item">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{v.doc}</div>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: 10, 
                    fontSize: '0.7rem', 
                    fontWeight: 700,
                    background: v.status === 'Verified' ? '#dcfce7' : v.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                    color: v.status === 'Verified' ? '#15803d' : v.status === 'Pending' ? '#b45309' : '#b91c1c'
                  }}>{v.status}</span>
                </div>
              ))}
            </div>

            <div className="adm-card">
              <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Quick Actions & Tools</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 15, borderRadius: 20, background: '#f5f3ff', border: '1px solid #ddd6fe', cursor: 'pointer' }}>
                  <UserPlus size={24} color="#4f46e5" weight="duotone" />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 10 }}>Generate Merit List</div>
                </div>
                <div style={{ padding: 15, borderRadius: 20, background: '#eff6ff', border: '1px solid #bfdbfe', cursor: 'pointer' }}>
                  <Plus size={24} color="#2563eb" weight="duotone" />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 10 }}>Issue Fee Voucher</div>
                </div>
                <div style={{ padding: 15, borderRadius: 20, background: '#f0fdf4', border: '1px solid #bbf7d0', cursor: 'pointer' }}>
                  <Checks size={24} color="#16a34a" weight="duotone" />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 10 }}>Mass Verification</div>
                </div>
                <div style={{ padding: 15, borderRadius: 20, background: '#fffbeb', border: '1px solid #fef3c7', cursor: 'pointer' }}>
                  <Bell size={24} color="#d97706" weight="duotone" />
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: 10 }}>Notify Applicants</div>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'applicants' && (
            <div className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Applicant Database</h3>
                <button className="adm-btn-primary"><UserPlus size={18} weight="bold" /> New Application</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '1rem' }}>Name</th>
                    <th style={{ padding: '1rem' }}>Program</th>
                    <th style={{ padding: '1rem' }}>Current Stage</th>
                    <th style={{ padding: '1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{lead.name}</td>
                      <td style={{ padding: '1rem' }}>{lead.program}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: 40, fontSize: '0.8rem', fontWeight: 600 }}>
                          {lead.stage}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="adm-card" style={{ textAlign: 'center', padding: '50px' }}>
              <FolderUser size={64} weight="duotone" color="#4f46e5" style={{ margin: '0 auto 20px' }} />
              <h3>Document Verification Queue</h3>
              <p style={{ color: '#64748b' }}>Verification systems are syncing with the National Education Database.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, value, label }) => (
  <div className="adm-card">
    <div style={{ background: '#f5f3ff', width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#4f46e5' }}>{icon}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
  </div>
);

export default AdmissionsDashboard;
