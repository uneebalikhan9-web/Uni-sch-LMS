import React, { useState, useEffect } from 'react';
import { 
  House, Funnel, Users, Checks, Scroll, Calendar, Bell, 
  UserCircle, List, X, SignOut, ChatCircle, GraduationCap, ShieldCheck
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './admissions.css';

// Modular Sections
import AdmissionsOverview from './sections/AdmissionsOverview';
import AdmissionsPipeline from './sections/AdmissionsPipeline';
import AdmissionsVerification from './sections/AdmissionsVerification';
import AdmissionsMeritList from './sections/AdmissionsMeritList';
import AdmissionsInterviews from './sections/AdmissionsInterviews';

const AdmissionsDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('overview');
  const { showToast } = useToast();
  
  const [stats, setStats] = useState({ totalLeads: 0, newApps: 0, interviewed: 0, admitted: 0 });
  const [pipeline, setPipeline] = useState({ Lead: [], Applied: [], Interview: [], 'Merit List': [], Admitted: [] });
  const [verifications, setVerifications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [meritList, setMeritList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, pipeRes, verRes, intRes, meritRes, actRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admissions/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/pipeline`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/verifications`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/interviews`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/merit-list`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/activities`, { headers })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pipeRes.data.success) setPipeline(pipeRes.data.pipeline);
      if (verRes.data.success) setVerifications(verRes.data.documents);
      if (intRes.data.success) setInterviews(intRes.data.interviews);
      if (meritRes.data.success) setMeritList(meritRes.data.meritList);
      if (actRes.data.success) setActivities(actRes.data.activities);

    } catch (error) {
      console.error('Error fetching admissions data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleVerificationAction = async (id, action) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admissions/verifications/action`, 
        { id, action }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Document ${action} successfully`, 'success');
      fetchAllData();
    } catch (err) { 
      showToast('Action failed', 'error'); 
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: House },
    { id: 'pipeline', label: 'Admission Pipeline', icon: Funnel },
    { id: 'applicants', label: 'All Applicants', icon: Users },
    { id: 'verification', label: 'Document Verification', icon: Checks },
    { id: 'merit', label: 'Merit List', icon: Scroll },
    { id: 'interviews', label: 'Interview Schedule', icon: Calendar },
  ];

  if (loading && stats.totalLeads === 0) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Syncing Lancers Nexus...</p>
    </div>
  );

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-brand">
            <div className="logo-icon">
              <GraduationCap size={24} weight="fill" color="white" />
            </div>
            <div className="brand-text">
              <span className="brand-lancers">LANCERS</span>
              <span className="brand-tech">TECH</span>
            </div>
          </div>
          
          <div className="portal-pill">
            <div className="portal-pill-content">
              <ShieldCheck size={18} weight="bold" />
              <span>Dean of Lancers Tech Main Campus</span>
            </div>
            <div className="status-dot"></div>
          </div>
        </div>

        <nav className="nav-links">
          <button className="nav-item" onClick={() => navigate('/chat')}>
            <ChatCircle size={22} weight="duotone" />
            <span>Chat</span>
          </button>

          {navItems.map((item) => (
            <button 
              key={item.id} 
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
            >
              <item.icon size={22} weight={activeNav === item.id ? 'fill' : 'regular'} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={onLogout} className="logout-btn">
            <SignOut size={22} weight="bold" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div>
            <h1 className="header-title">{navItems.find(n => n.id === activeNav)?.label || 'Institutional Admissions'}</h1>
            <p className="header-subtitle">Command Center • Management Portal</p>
          </div>
          
          <div className="user-pill">
            <UserCircle size={24} color="#4f46e5" weight="duotone" />
            <span className="user-name">{user?.name || 'Admission Officer'}</span>
            <div style={{ marginLeft: 10, position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="#64748b" weight="bold" />
              <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
            </div>
          </div>
        </header>

        <div className="animate-fadeIn">
          {activeNav === 'overview' && <AdmissionsOverview stats={stats} activities={activities} />}
          {activeNav === 'pipeline' && <AdmissionsPipeline stages={pipeline} />}
          {activeNav === 'applicants' && <AdmissionsPipeline stages={pipeline} />}
          {activeNav === 'verification' && <AdmissionsVerification documents={verifications} onAction={handleVerificationAction} />}
          {activeNav === 'merit' && <AdmissionsMeritList meritList={meritList} />}
          {activeNav === 'interviews' && <AdmissionsInterviews interviews={interviews} />}
        </div>
      </main>
    </div>
  );
};

export default AdmissionsDashboard;
