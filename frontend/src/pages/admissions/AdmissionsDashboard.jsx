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
  
  // Navigation & UI States
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar drawer
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true); // Desktop toggle slide
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeNav, setActiveNav] = useState('overview');
  const { showToast } = useToast();
  
  // Data States
  const [stats, setStats] = useState({ totalLeads: 0, newApps: 0, interviewed: 0, admitted: 0 });
  const [pipeline, setPipeline] = useState({ Lead: [], Applied: [], Interview: [], 'Merit List': [], Admitted: [] });
  const [verifications, setVerifications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [meritList, setMeritList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="adm-dashboard-container">
      
      {/* Floating open button for LEFT sidebar — only visible when left sidebar is CLOSED */}
      {!isMobile && !leftSidebarOpen && (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2000,
            background: 'var(--adm-primary, #4f46e5)',
            color: '#fff',
            border: 'none',
            borderRadius: '0 12px 12px 0',
            width: '28px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 0 16px rgba(79,70,229,0.35)',
            fontSize: '18px',
            fontWeight: '800',
            lineHeight: 1,
          }}
          className="adm-sidebar-toggle-btn adm-left-open-btn"
          title="Open sidebar"
        >
          ›
        </button>
      )}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside 
        className={`adm-sidebar ${sidebarOpen ? 'mobile-open' : ''} ${leftSidebarOpen ? '' : 'collapsed'}`}
        style={{
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : (leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'),
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          width: '280px',
        }}
      >
        {/* ← Close arrow centered on RIGHT edge of the left sidebar */}
        {!isMobile && (
          <button
            onClick={() => setLeftSidebarOpen(false)}
            style={{
              position: 'absolute',
              right: '-18px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              background: 'var(--adm-primary, #4f46e5)',
              color: '#fff',
              border: 'none',
              borderRadius: '0 10px 10px 0',
              width: '18px',
              height: '60px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 0 14px rgba(79,70,229,0.35)',
              fontSize: '18px',
              fontWeight: '800',
              lineHeight: 1,
            }}
            className="adm-sidebar-toggle-btn adm-left-close-btn"
            title="Close sidebar"
          >
            ‹
          </button>
        )}

        <div className="adm-sidebar-header">
          <div className="adm-logo-brand">
            <div className="adm-logo-icon">
              <GraduationCap size={24} weight="fill" color="white" />
            </div>
            <div className="adm-brand-text">
              <span className="adm-brand-lancers">LANCERS</span>
              <span className="adm-brand-tech">TECH</span>
            </div>
          </div>
          
          <div className="adm-portal-pill">
            <div className="adm-portal-pill-content">
              <ShieldCheck size={18} weight="bold" />
              <span>Admissions Command</span>
            </div>
            <div className="adm-status-dot"></div>
          </div>
        </div>

        <nav className="adm-nav-links">
          <button className="adm-nav-item" onClick={() => navigate('/chat')}>
            <ChatCircle size={22} weight="duotone" />
            <span>Chat</span>
          </button>

          {navItems.map((item) => (
            <button 
              key={item.id} 
              className={`adm-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
            >
              <item.icon size={22} weight={activeNav === item.id ? 'fill' : 'regular'} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-bottom">
          <button onClick={onLogout} className="adm-logout-btn">
            <SignOut size={22} weight="bold" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div 
        className="adm-main-content"
        style={{
          marginLeft: isMobile ? '0px' : (leftSidebarOpen ? '280px' : '24px'),
          transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          flex: 1,
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
        <header className="adm-top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ display: 'flex', background: '#4f46e5', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                <List size={24} weight="bold" />
              </button>
            )}
            <div>
              <h1 className="adm-header-title">{navItems.find(n => n.id === activeNav)?.label || 'Institutional Admissions'}</h1>
              <p className="adm-header-subtitle">Command Center • Management Portal</p>
            </div>
          </div>
          
          <div className="adm-user-pill">
            <UserCircle size={24} color="#4f46e5" weight="duotone" />
            <span className="adm-user-name">{user?.name || 'Admission Officer'}</span>
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
      </div>
    </div>
  );
};

export default AdmissionsDashboard;
