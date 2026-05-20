import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
  House,
  Student,
  Certificate,
  FileText,
  GraduationCap,
  MagnifyingGlass,
  Bell,
  UserCircle,
  List,
  X,
  Spinner,
  SignOut,
  ChatCircle,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import './registrar.css';

// Import Modular Sections
import RegistrarOverview from './sections/RegistrarOverview';
import RegistrarStudentRecords from './sections/RegistrarStudentRecords';
import RegistrarDegreeVerification from './sections/RegistrarDegreeVerification';
import RegistrarTranscriptRequests from './sections/RegistrarTranscriptRequests';
import RegistrarAlumniDirectory from './sections/RegistrarAlumniDirectory';

const RegistrarDashboard = ({ user, onLogout }) => {
  // Navigation & UI States
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeNav, setActiveNav] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data States
  const [stats, setStats] = useState({ totalEnrolled: 0, degreesIssued: 0, pendingVerifications: 0, transcriptRequests: 0 });
  const [recentRecords, setRecentRecords] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, studentsRes, verificationsRes, transcriptsRes, alumniRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/registrar/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/registrar/students`, { headers }),
        axios.get(`${API_BASE_URL}/api/registrar/verifications/pending`, { headers }),
        axios.get(`${API_BASE_URL}/api/registrar/transcripts`, { headers }),
        axios.get(`${API_BASE_URL}/api/registrar/alumni`, { headers })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (studentsRes.data.success) setRecentRecords(studentsRes.data.students);
      if (verificationsRes.data.success) setPendingVerifications(verificationsRes.data.verifications);
      if (transcriptsRes.data.success) setTranscripts(transcriptsRes.data.transcripts);
      if (alumniRes.data.success) setAlumni(alumniRes.data.alumni);
    } catch (error) {
      console.error('Error fetching registrar data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helpers & Handlers
  const getStatusClass = (status) => {
    switch(status) {
      case 'Enrolled': return 'status-success';
      case 'Graduated': return 'status-info';
      case 'Suspended': return 'status-danger';
      default: return 'status-warning';
    }
  };

  const handleVerify = async (requestId) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/registrar/verifications/action`, 
        { requestId, action: 'verify' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) { alert('Failed to verify'); }
  };

  const handleReject = async (requestId) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/registrar/verifications/action`, 
        { requestId, action: 'reject' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) { alert('Failed to reject'); }
  };

  const handleProcessTranscript = async (id) => {
    if (!window.confirm(`Are you sure you want to mark Transcript Request TSR-${id + 500} as processed?`)) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/registrar/transcripts/process`, 
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) { alert('Failed to process transcript'); }
  };

  const handleEditRecord = async (id) => {
    const newStatus = window.prompt(`Update status for Student ${id} (Enter: Enrolled, Suspended, or Graduated):`, 'Enrolled');
    if (!newStatus || !['Enrolled', 'Suspended', 'Graduated'].includes(newStatus)) {
      if (newStatus !== null) alert('Invalid status entered. Must be Enrolled, Suspended, or Graduated.');
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/registrar/students/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) { alert('Failed to update student record'); }
  };

  const filterData = (data, fields) => {
    if (!searchQuery) return data;
    return data.filter(item => 
      fields.some(field => String(item[field]).toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: House },
    { id: 'students', label: 'Student Records', icon: Student },
    { id: 'verification', label: 'Degree Verification', icon: Certificate },
    { id: 'transcripts', label: 'Transcript Requests', icon: FileText },
    { id: 'alumni', label: 'Alumni Directory', icon: GraduationCap },
  ];

  return (
    <div className="dashboard-container" style={{ position: 'relative', display: 'flex', minHeight: '100vh', overflowX: 'hidden' }}>
      
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
            background: 'var(--reg-primary, #4f46e5)',
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
          className="sidebar-toggle-btn left-open-btn"
          title="Open sidebar"
        >
          ›
        </button>
      )}

      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside 
        className={`sidebar ${sidebarOpen ? 'open mobile-open' : ''} ${leftSidebarOpen ? '' : 'collapsed'}`}
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
              background: 'var(--reg-primary, #4f46e5)',
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
            className="sidebar-toggle-btn left-close-btn"
            title="Close sidebar"
          >
            ‹
          </button>
        )}

        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo" style={{ gap: '12px' }}>
            <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--reg-primary) 0%, #818cf8 100%)', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)' }}>
              <GraduationCap size={22} weight="fill" color="white" />
            </div>
            <span>Lancers<span style={{ color: '#818cf8' }}>Tech</span></span>
          </div>

          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} style={{ display: 'none', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', outline: 'none' }}>
            <X size={20} weight="bold" />
          </button>
        </div>
        <nav className="nav-links">
          <div className="nav-item" onClick={() => { navigate('/chat'); setSidebarOpen(false); }} style={{ justifyContent: 'flex-start', padding: '12px 16px' }}>
            <ChatCircle size={22} weight="regular" />
            <span>Chat</span>
          </div>
          {navItems.map((item) => (
            <div key={item.id} className={`nav-item ${activeNav === item.id ? 'active' : ''}`} onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }} style={{ justifyContent: 'flex-start', padding: '12px 16px' }}>
              <item.icon size={22} weight={activeNav === item.id ? 'fill' : 'regular'} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="sidebar-bottom" style={{ padding: '20px 16px' }}>
          <button onClick={onLogout} className="logout-btn" style={{ justifyContent: 'flex-start', padding: '14px 18px' }}>
            <SignOut size={20} weight="bold" />
            <span>Sign Out</span>
          </button>
          <div className="sidebar-footer">
            <div>Lancers Tech Institute</div>
            <div>v2.0</div>
          </div>
        </div>
      </aside>

      <main 
        className="main-content" 
        style={{
          marginLeft: isMobile ? '0px' : (leftSidebarOpen ? '280px' : '24px'),
          transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <header className="top-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <List size={28} weight="bold" />
            </button>
            <h1 className="header-title">Institutional Registrar</h1>
          </div>
          
          <div className="header-right">
            <Bell size={24} color="var(--reg-text-muted)" style={{ cursor: 'pointer' }} />
            <div className="user-pill">
              <UserCircle size={24} color="var(--reg-text-muted)" />
              <span className="user-name">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'Registrar Admin'}</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="loader-container"><Spinner size={40} className="spinner" /></div>
        ) : (
          <div className="tab-content">
            {activeNav === 'overview' && (
              <RegistrarOverview 
                stats={stats} 
                recentRecords={recentRecords} 
                getStatusClass={getStatusClass} 
                handleEditRecord={handleEditRecord} 
                handleViewTranscript={handleProcessTranscript} 
              />
            )}
            {activeNav === 'students' && (
              <RegistrarStudentRecords 
                records={recentRecords} 
                filterData={filterData} 
                getStatusClass={getStatusClass} 
                handleEditRecord={handleEditRecord} 
                handleViewTranscript={handleProcessTranscript} 
              />
            )}
            {activeNav === 'verification' && (
              <RegistrarDegreeVerification 
                verifications={pendingVerifications} 
                filterData={filterData} 
                handleVerify={handleVerify} 
                handleReject={handleReject} 
              />
            )}
            {activeNav === 'transcripts' && (
              <RegistrarTranscriptRequests 
                transcripts={transcripts} 
                filterData={filterData} 
                handleProcessTranscript={handleProcessTranscript} 
              />
            )}
            {activeNav === 'alumni' && (
              <RegistrarAlumniDirectory 
                alumni={alumni} 
                filterData={filterData} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default RegistrarDashboard;
