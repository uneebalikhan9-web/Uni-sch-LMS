import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, ChartBar, SealCheck, Bell, 
  CheckCircle, Clock, BookOpen, IdentificationCard, IdentificationBadge,
  ChatCircle, ChartLineUp, SignOut, UserCircle, Plus, List
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { useToast } from '../../../components/Toast';
import { ScheduleExamModal, ProcessResultsModal } from './ExamsModals';
import ExamsSeating from './sections/ExamsSeating';
import ExamsMalpractice from './sections/ExamsMalpractice';
import ExamsResults from './sections/ExamsResults';
import ExamsTimeline from './sections/ExamsTimeline';
import './exams.css';

const ExamsDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalExams: 0, pendingResults: 0, avgPassRate: 0, daysToFinals: 0 });
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  const [showSchedule, setShowSchedule] = useState(false);
  const [showGrading, setShowGrading] = useState(false);

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setLeftSidebarOpen(false);
      } else {
        setLeftSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, examsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/exams/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/exams/list`, { headers })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (examsRes.data.success) setExams(examsRes.data.exams);
    } catch (err) {
      console.error('Error fetching exam data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleExam = async (formData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/exams/create`, formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.data.success) {
        showToast('Exam scheduled successfully!', 'success');
        setShowSchedule(false);
        fetchAllData();
      }
    } catch (err) { showToast('Error scheduling exam', 'error'); }
  };

  const handlePublishResults = async (results) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/exams/results`, {
        exam_id: selectedExam.id,
        results
      }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.data.success) {
        showToast('Results published successfully!', 'success');
        setShowGrading(false);
        fetchAllData();
      }
    } catch (err) { showToast('Error publishing results', 'error'); }
  };

  return (
    <div className="ex-container" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', position: 'relative', overflowX: 'hidden', width: '100%' }}>
      {/* Mobile Sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      {/* Open sidebar toggle arrow */}
      {!leftSidebarOpen && !isMobile && (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1001,
            background: 'var(--ex-primary, var(--primary-color, #4f46e5))',
            color: '#fff',
            border: 'none',
            borderRadius: '0 10px 10px 0',
            width: '18px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 0 16px rgba(var(--primary-rgb, 79, 70, 229),0.35)',
            fontSize: '18px',
            fontWeight: '800',
            lineHeight: 1,
          }}
          title="Open sidebar"
        >
          ›
        </button>
      )}

      {/* Sidebar */}
      <aside 
        className={`ex-sidebar ${leftSidebarOpen ? '' : 'collapsed'}`}
        style={{
          width: '280px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#cbd5e1',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : (leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'),
          boxShadow: '20px 0 40px -20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Close sidebar toggle arrow */}
        {!isMobile && (
          <button
            onClick={() => setLeftSidebarOpen(false)}
            style={{
              position: 'absolute',
              right: '-18px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              background: 'var(--ex-primary, var(--primary-color, #4f46e5))',
              color: '#fff',
              border: 'none',
              borderRadius: '0 10px 10px 0',
              width: '18px',
              height: '60px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 0 14px rgba(var(--primary-rgb, 79, 70, 229),0.35)',
              fontSize: '18px',
              fontWeight: '800',
              lineHeight: 1,
            }}
            title="Close sidebar"
          >
            ‹
          </button>
        )}

        <div style={{ padding: '2.5rem 1.5rem' }}>
          {user?.logo_url ? (
            <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Lancers<span style={{ color: '#a5b4fc' }}>Tech</span></div>
          )}
          <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600, marginTop: 4 }}>EXAMINATION OFFICE</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 1rem' }}>
          <div onClick={() => { navigate('/chat'); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: '#cbd5e1', background: 'transparent', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
            <ChatCircle size={20} weight="bold" /> <span>Chat</span>
          </div>
          <div onClick={() => { setActiveTab('overview'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'overview' ? 'white' : '#cbd5e1', background: activeTab === 'overview' ? 'rgba(var(--primary-rgb, 79, 70, 229), 0.4)' : 'transparent', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
            <ChartLineUp size={20} weight="bold" /> <span>Overview</span>
          </div>
          <div onClick={() => { setActiveTab('results'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'results' ? 'white' : '#cbd5e1', background: activeTab === 'results' ? 'rgba(var(--primary-rgb, 79, 70, 229), 0.4)' : 'transparent', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
            <SealCheck size={20} weight="bold" /> <span>Results</span>
          </div>
          <div onClick={() => { setActiveTab('scheduling'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'scheduling' ? 'white' : '#cbd5e1', background: activeTab === 'scheduling' ? 'rgba(var(--primary-rgb, 79, 70, 229), 0.4)' : 'transparent', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
            <Calendar size={20} weight="bold" /> <span>Exams Timeline</span>
          </div>
          <div onClick={() => { setActiveTab('seating'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'seating' ? 'white' : '#cbd5e1', background: activeTab === 'seating' ? 'rgba(var(--primary-rgb, 79, 70, 229), 0.4)' : 'transparent', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
            <IdentificationCard size={20} weight="bold" /> <span>Seating Plans</span>
          </div>
          <div onClick={() => { setActiveTab('discipline'); if (isMobile) setSidebarOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'discipline' ? 'white' : '#cbd5e1', background: activeTab === 'discipline' ? 'rgba(var(--primary-rgb, 79, 70, 229), 0.4)' : 'transparent', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
            <IdentificationBadge size={20} weight="bold" /> <span>Malpractice Logs</span>
          </div>
        </nav>

        <div style={{ padding: '20px 16px', marginTop: 'auto' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: 'none', background: 'transparent', color: '#fca5a5', cursor: 'pointer', fontWeight: 700 }}>
            <SignOut size={20} weight="bold" /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className="ex-main"
        style={{
          marginLeft: isMobile ? '0px' : (leftSidebarOpen ? '280px' : '24px'),
          transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          flex: 1,
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        <header className="ex-header" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', padding: '1.2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <button 
                onClick={() => setSidebarOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--ex-primary, var(--primary-color, #4f46e5))',
                  border: 'none',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <List size={22} weight="bold" />
              </button>
            )}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Examination Command Center</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Bell size={22} color="#64748b" weight="bold" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '8px 18px', borderRadius: 40, border: '1px solid #e2e8f0' }}>
              <UserCircle size={28} color="var(--primary-color, #4f46e5)" weight="bold" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Controller of Exams'}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Academic Quality Head</span>
              </div>
            </div>
          </div>
        </header>

        <div className="ex-content">
          <div className="ex-metrics">
            <MetricCard icon={<ChartBar size={26} weight="duotone" />} value={`${stats.avgPassRate}%`} label="Overall Pass Rate" />
            <MetricCard icon={<IdentificationCard size={26} weight="duotone" />} value={stats.totalExams} label="Total Exams" />
            <MetricCard icon={<Clock size={26} weight="duotone" />} value={stats.daysToFinals} label="Days to Finals" />
            <MetricCard icon={<FileText size={26} weight="duotone" />} value={stats.pendingResults} label="Pending Results" />
          </div>

          {activeTab === 'overview' && (
            <div className="ex-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 800 }}>Examination Timeline</h3>
                <button className="ex-btn-primary" onClick={() => setShowSchedule(true)}><Plus size={18} weight="bold" /> Schedule Exam</button>
              </div>
              <div className="ex-table-container">
                <table className="ex-table">
                  <thead>
                    <tr><th>Course Name</th><th>Exam Title</th><th>Exam Date</th><th>Room</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No examinations scheduled yet.</td></tr>
                    ) : (
                        exams.map(ex => (
                            <tr key={ex.id}>
                                <td>{ex.course_name}</td>
                                <td style={{ fontWeight: 700 }}>{ex.name}</td>
                                <td>{new Date(ex.exam_date).toLocaleDateString()}</td>
                                <td>{ex.room_number || 'N/A'}</td>
                                <td>
                                    <button 
                                        onClick={() => { setSelectedExam(ex); setShowGrading(true); }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--primary-color, #4f46e5)', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Manage Results
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'seating' && <ExamsSeating />}
          {activeTab === 'discipline' && <ExamsMalpractice />}

          {activeTab === 'results' && <ExamsResults exams={exams} />}
          {activeTab === 'scheduling' && <ExamsTimeline exams={exams} onScheduleNew={() => setShowSchedule(true)} />}
        </div>
      </div>

      {/* Modals */}
      {showSchedule && <ScheduleExamModal onClose={() => setShowSchedule(false)} onSave={handleScheduleExam} />}
      {showGrading && <ProcessResultsModal exam={selectedExam} onClose={() => setShowGrading(false)} onSave={handlePublishResults} />}
    </div>
  );
};

const MetricCard = ({ icon, value, label }) => (
  <div className="ex-card">
    <div style={{ background: '#f5f3ff', width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--primary-color, #4f46e5)' }}>{icon}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
  </div>
);

export default ExamsDashboard;

