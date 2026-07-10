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
  CaretRight,
  Calendar,
  Building,
  BookOpen,
  Presentation,
  ShieldCheck
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import './registrar.css';

// Import Modular Sections
import RegistrarOverview from './sections/RegistrarOverview';
import RegistrarStudentRecords from './sections/RegistrarStudentRecords';
import RegistrarDegreeVerification from './sections/RegistrarDegreeVerification';
import RegistrarTranscriptRequests from './sections/RegistrarTranscriptRequests';
import RegistrarAlumniDirectory from './sections/RegistrarAlumniDirectory';
import RegistrarSemesters from './sections/RegistrarSemesters';
import RegistrarRooms from './sections/RegistrarRooms';
import RegistrarDegreePlans from './sections/RegistrarDegreePlans';
import RegistrarCourseSections from './sections/RegistrarCourseSections';
import RegistrarEnrollment from './sections/RegistrarEnrollment';
import RegistrarEnrollmentRules from './sections/RegistrarEnrollmentRules';
import RegistrarTeacherWorkload from './sections/RegistrarTeacherWorkload';
import RegistrarGraduationAudit from './sections/RegistrarGraduationAudit';

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

  // Modal States
  const [editModal, setEditModal] = useState({ isOpen: false, studentId: null, currentStatus: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, studentData: null });
  const [processTranscriptModal, setProcessTranscriptModal] = useState({ isOpen: false, transcriptId: null });

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
    // Open modal instead of confirm
    setProcessTranscriptModal({ isOpen: true, transcriptId: id });
  };

  const confirmProcessTranscript = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/registrar/transcripts/process`, 
        { id: processTranscriptModal.transcriptId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProcessTranscriptModal({ isOpen: false, transcriptId: null });
      fetchDashboardData();
    } catch (error) { alert('Failed to process transcript'); }
  };

  const handleEditRecord = (id) => {
    const student = recentRecords.find(r => r.id === id) || alumni.find(r => r.id === id);
    setEditModal({ isOpen: true, studentId: id, currentStatus: student ? student.status : 'Enrolled' });
  };

  const confirmEditStatus = async (newStatus) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/registrar/students/${editModal.studentId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditModal({ isOpen: false, studentId: null, currentStatus: '' });
      fetchDashboardData();
    } catch (error) { alert('Failed to update student record'); }
  };

  const handleViewStudentRecord = (id) => {
    const student = recentRecords.find(r => r.id === id) || alumni.find(r => r.id === id);
    if (student) {
      setViewModal({ isOpen: true, studentData: student });
    }
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
    { id: 'semesters', label: 'Semesters Calendar', icon: Calendar },
    { id: 'rooms', label: 'Classrooms / Rooms', icon: Building },
    { id: 'degree-plans', label: 'Degree Plans', icon: BookOpen },
    { id: 'sections', label: 'Course Sections', icon: Presentation },
    { id: 'enrollment', label: 'Enrollment Management', icon: Student },
    { id: 'enrollment-rules', label: 'HEC Enrollment Rules', icon: GraduationCap },
    { id: 'teacher-workload', label: 'Teacher Workload', icon: Certificate },
    { id: 'verification', label: 'Degree Verification', icon: Certificate },
    { id: 'transcripts', label: 'Transcript Requests', icon: FileText },
    { id: 'graduation-audit', label: 'Graduation Audit', icon: ShieldCheck },
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
            background: 'var(--reg-primary, var(--primary-color, #4f46e5))',
            color: '#fff',
            border: 'none',
            borderRadius: '0 12px 12px 0',
            width: '28px',
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
              background: 'var(--reg-primary, var(--primary-color, #4f46e5))',
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
            className="sidebar-toggle-btn left-close-btn"
            title="Close sidebar"
          >
            ‹
          </button>
        )}

        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo" style={{ gap: '12px' }}>
            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <>
                <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--reg-primary) 0%, #818cf8 100%)', boxShadow: '0 4px 10px rgba(var(--primary-rgb, 79, 70, 229), 0.3)' }}>
                  <GraduationCap size={22} weight="fill" color="white" />
                </div>
                <span>Lancers<span style={{ color: '#818cf8' }}>Tech</span></span>
              </>
            )}
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
          
          <div className="sidebar-bottom" style={{ padding: '20px 16px', marginTop: 'auto' }}>
            <button onClick={onLogout} className="logout-btn" style={{ justifyContent: 'flex-start', padding: '14px 18px' }}>
              <SignOut size={20} weight="bold" />
              <span>Sign Out</span>
            </button>
            <div className="sidebar-footer">
              <div>Lancers Tech Institute</div>
              <div>v2.0</div>
            </div>
          </div>
        </nav>
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
                handleViewTranscript={handleViewStudentRecord} 
              />
            )}
            {activeNav === 'students' && (
              <RegistrarStudentRecords 
                records={recentRecords} 
                filterData={filterData} 
                getStatusClass={getStatusClass} 
                handleEditRecord={handleEditRecord} 
                handleViewTranscript={handleViewStudentRecord} 
              />
            )}
            {activeNav === 'semesters' && (
              <RegistrarSemesters />
            )}
            {activeNav === 'rooms' && (
              <RegistrarRooms />
            )}
            {activeNav === 'degree-plans' && (
              <RegistrarDegreePlans />
            )}
            {activeNav === 'sections' && (
              <RegistrarCourseSections />
            )}
            {activeNav === 'enrollment' && (
              <RegistrarEnrollment />
            )}
            {activeNav === 'enrollment-rules' && (
              <RegistrarEnrollmentRules />
            )}
            {activeNav === 'teacher-workload' && (
              <RegistrarTeacherWorkload />
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
            {activeNav === 'graduation-audit' && (
              <RegistrarGraduationAudit />
            )}
            {activeNav === 'alumni' && (
              <RegistrarAlumniDirectory 
                alumni={alumni} 
                filterData={filterData} 
              />
            )}
          </div>
        )}

        {/* MODALS */}
        {/* Edit Status Modal */}
        {editModal.isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Update Academic Status</h3>
                <button onClick={() => setEditModal({ isOpen: false, studentId: null, currentStatus: '' })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={24} weight="bold" />
                </button>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
                Select a new status for student <strong>{editModal.studentId}</strong>.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                {['Enrolled', 'Graduated', 'Suspended'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setEditModal(prev => ({ ...prev, currentStatus: status }))}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                      background: editModal.currentStatus === status ? '#eef2ff' : '#f8fafc',
                      color: editModal.currentStatus === status ? '#4f46e5' : '#475569',
                      border: editModal.currentStatus === status ? '2px solid #4f46e5' : '2px solid transparent',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditModal({ isOpen: false, studentId: null, currentStatus: '' })} style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => confirmEditStatus(editModal.currentStatus)} style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: '700', color: 'white', background: '#4f46e5', border: 'none', cursor: 'pointer' }}>Save Status</button>
              </div>
            </div>
          </div>
        )}

        {/* View Transcript/Student Details Modal */}
        {viewModal.isOpen && viewModal.studentData && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Academic Record</h3>
                <button onClick={() => setViewModal({ isOpen: false, studentData: null })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={24} weight="bold" />
                </button>
              </div>
              
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Roll Number</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>{viewModal.studentData.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Full Name</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>{viewModal.studentData.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Program</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>{viewModal.studentData.program || 'Unassigned'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>CGPA</span>
                  <span style={{ fontSize: '14px', color: '#4f46e5', fontWeight: 900 }}>{viewModal.studentData.cgpa || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Status</span>
                  <span className={`status-badge ${getStatusClass(viewModal.studentData.status)}`} style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: '800' }}>
                    {viewModal.studentData.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => setViewModal({ isOpen: false, studentData: null })} style={{ padding: '12px 30px', borderRadius: '12px', fontWeight: '700', color: 'white', background: '#0f172a', border: 'none', cursor: 'pointer', width: '100%' }}>Close Record</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Transcript Process Modal */}
        {processTranscriptModal.isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out', textAlign: 'center' }}>
              <div style={{ background: '#e0e7ff', color: '#4f46e5', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <FileText size={32} weight="duotone" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>Process Transcript</h3>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '30px' }}>
                Are you sure you want to mark Transcript Request <strong>TSR-{processTranscriptModal.transcriptId + 500}</strong> as fully processed?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => setProcessTranscriptModal({ isOpen: false, transcriptId: null })} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer', flex: 1 }}>Cancel</button>
                <button onClick={confirmProcessTranscript} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: 'white', background: '#4f46e5', border: 'none', cursor: 'pointer', flex: 1 }}>Confirm Process</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RegistrarDashboard;
