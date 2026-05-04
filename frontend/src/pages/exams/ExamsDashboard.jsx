import React, { useState } from 'react';
import { 
  FileText, Calendar, ChartBar, SealCheck, Bell, 
  SignOut, List, Plus, MagnifyingGlass, ChartLineUp, UserCircle, 
  CheckCircle, Clock, BookOpen, IdentificationCard
} from '@phosphor-icons/react';
import { useToast } from '../../components/Toast';
import './exams.css';

const ExamsDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { showToast } = useToast();

  const [exams, setExams] = useState([
    { id: 1, title: 'Final Term Spring 2026', date: 'June 15, 2026', status: 'Pending' },
    { id: 2, title: 'Mid Term Spring 2026', date: 'April 05, 2026', status: 'Published' },
  ]);

  return (
    <div className="ex-container">
      {/* Sidebar */}
      <aside className="ex-sidebar">
        <div style={{ padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Lancers<span style={{ color: '#a5b4fc' }}>Tech</span></div>
          <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600, marginTop: 4 }}>EXAMINATION OFFICE</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 1rem' }}>
          <div onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'overview' ? 'white' : '#cbd5e1', background: activeTab === 'overview' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <ChartLineUp size={20} /> <span>Overview</span>
          </div>
          <div onClick={() => setActiveTab('results')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'results' ? 'white' : '#cbd5e1', background: activeTab === 'results' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <SealCheck size={20} /> <span>Results</span>
          </div>
          <div onClick={() => setActiveTab('scheduling')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'scheduling' ? 'white' : '#cbd5e1', background: activeTab === 'scheduling' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Calendar size={20} /> <span>Scheduling</span>
          </div>
        </nav>

        <div style={{ position: 'absolute', bottom: 30, width: '100%', padding: '0 1rem' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: 'none', background: 'transparent', color: '#fca5a5', cursor: 'pointer' }}>
            <SignOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ex-main">
        <header className="ex-header">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Examination Command Center</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Bell size={22} color="#64748b" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '8px 18px', borderRadius: 40, border: '1px solid #e2e8f0' }}>
              <UserCircle size={28} color="#4f46e5" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Controller of Exams'}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Academic Quality Head</span>
              </div>
            </div>
          </div>
        </header>

        <div className="ex-content">
          <div className="ex-metrics">
            <MetricCard icon={<ChartBar size={26} weight="duotone" />} value="94%" label="Overall Pass Rate" />
            <MetricCard icon={<IdentificationCard size={26} weight="duotone" />} value="8,420" label="Exam Registrations" />
            <MetricCard icon={<Clock size={26} weight="duotone" />} value="14" label="Days to Finals" />
            <MetricCard icon={<FileText size={26} weight="duotone" />} value="42" label="Pending Moderations" />
          </div>

          {activeTab === 'overview' && (
            <div className="ex-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Examination Timeline</h3>
                <button className="ex-btn-primary"><Plus size={18} weight="bold" /> Schedule Exam</button>
              </div>
              <table className="ex-table">
                <thead>
                  <tr><th>Exam Title</th><th>Commencement Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {exams.map(ex => (
                    <tr key={ex.id}>
                      <td style={{ fontWeight: 700 }}>{ex.title}</td>
                      <td>{ex.date}</td>
                      <td>
                        <span className={`ex-badge ${ex.status === 'Published' ? 'ex-badge-published' : 'ex-badge-pending'}`}>
                          {ex.status}
                        </span>
                      </td>
                      <td>
                        <button style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'results' || activeTab === 'scheduling') && (
            <div className="ex-card" style={{ textAlign: 'center', padding: '50px' }}>
              <BookOpen size={64} weight="duotone" color="#4f46e5" style={{ margin: '0 auto 20px' }} />
              <h3>Academic Processing</h3>
              <p style={{ color: '#64748b' }}>This module is currently processing departmental grade submissions.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, value, label }) => (
  <div className="ex-card">
    <div style={{ background: '#f5f3ff', width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#4f46e5' }}>{icon}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
  </div>
);

export default ExamsDashboard;
