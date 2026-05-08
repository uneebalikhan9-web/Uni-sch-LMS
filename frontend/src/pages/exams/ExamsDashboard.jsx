import React, { useState, useEffect } from 'react';
import { 
  FileText, Calendar, ChartBar, SealCheck, Bell, 
  CheckCircle, Clock, BookOpen, IdentificationCard, IdentificationBadge,
  ChatCircle
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useToast } from '../../components/Toast';
import { ScheduleExamModal, ProcessResultsModal } from './ExamsModals';
import ExamsSeating from './sections/ExamsSeating';
import ExamsMalpractice from './sections/ExamsMalpractice';
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
    <div className="ex-container">
      {/* Sidebar */}
      <aside className="ex-sidebar">
        <div style={{ padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Lancers<span style={{ color: '#a5b4fc' }}>Tech</span></div>
          <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600, marginTop: 4 }}>EXAMINATION OFFICE</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 1rem' }}>
          <div onClick={() => { navigate('/chat'); }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: '#cbd5e1', background: 'transparent', cursor: 'pointer' }}>
            <ChatCircle size={20} weight="bold" /> <span>Chat</span>
          </div>
          <div onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'overview' ? 'white' : '#cbd5e1', background: activeTab === 'overview' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <ChartLineUp size={20} weight="bold" /> <span>Overview</span>
          </div>
          <div onClick={() => setActiveTab('results')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'results' ? 'white' : '#cbd5e1', background: activeTab === 'results' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <SealCheck size={20} weight="bold" /> <span>Results</span>
          </div>
          <div onClick={() => setActiveTab('scheduling')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'scheduling' ? 'white' : '#cbd5e1', background: activeTab === 'scheduling' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Calendar size={20} weight="bold" /> <span>Exams Timeline</span>
          </div>
          <div onClick={() => setActiveTab('seating')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'seating' ? 'white' : '#cbd5e1', background: activeTab === 'seating' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <IdentificationCard size={20} weight="bold" /> <span>Seating Plans</span>
          </div>
          <div onClick={() => setActiveTab('discipline')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'discipline' ? 'white' : '#cbd5e1', background: activeTab === 'discipline' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <IdentificationBadge size={20} weight="bold" /> <span>Malpractice Logs</span>
          </div>
        </nav>

        <div style={{ position: 'absolute', bottom: 30, width: '100%', padding: '0 1rem' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: 'none', background: 'transparent', color: '#fca5a5', cursor: 'pointer' }}>
            <SignOut size={20} weight="bold" /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ex-main">
        <header className="ex-header">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Examination Command Center</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Bell size={22} color="#64748b" weight="bold" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '8px 18px', borderRadius: 40, border: '1px solid #e2e8f0' }}>
              <UserCircle size={28} color="#4f46e5" weight="bold" />
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
                                        style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}
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

          {(activeTab === 'results' || activeTab === 'scheduling') && (
            <div className="ex-card" style={{ textAlign: 'center', padding: '100px 40px' }}>
              <BookOpen size={64} weight="duotone" color="#4f46e5" style={{ margin: '0 auto 20px' }} />
              <h2 style={{ fontWeight: 800 }}>Academic Processing</h2>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '12px auto' }}>This module is currently processing departmental grade submissions and cross-faculty schedules.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showSchedule && <ScheduleExamModal onClose={() => setShowSchedule(false)} onSave={handleScheduleExam} />}
      {showGrading && <ProcessResultsModal exam={selectedExam} onClose={() => setShowGrading(false)} onSave={handlePublishResults} />}
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
