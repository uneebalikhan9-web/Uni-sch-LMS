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
import AdmissionsApplicants from './sections/AdmissionsApplicants';
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

  // Manual admissions entry states
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', program_id: '', stage: 'Lead', score: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState(null);

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

      const [statsRes, pipeRes, verRes, intRes, meritRes, actRes, progRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admissions/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/pipeline`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/verifications`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/interviews`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/merit-list`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/activities`, { headers }),
        axios.get(`${API_BASE_URL}/api/admissions/programs`, { headers }).catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pipeRes.data.success) setPipeline(pipeRes.data.pipeline);
      if (verRes.data.success) setVerifications(verRes.data.documents);
      if (intRes.data.success) setInterviews(intRes.data.interviews);
      if (meritRes.data.success) setMeritList(meritRes.data.meritList);
      if (actRes.data.success) setActivities(actRes.data.activities);
      if (progRes && progRes.data && progRes.data.success) setPrograms(progRes.data.programs);

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

  const handleUpdateStage = async (id, stage) => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API_BASE_URL}/api/admissions/applications/${id}/stage`, { stage }, { headers });
      showToast('Candidate stage updated successfully', 'success');
      fetchAllData();
    } catch (err) {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.email) {
      showToast('Name and Email are required', 'error');
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const payload = {
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone || null,
        program_id: newLead.program_id ? parseInt(newLead.program_id) : null,
        stage: newLead.stage,
        score: newLead.score ? parseFloat(newLead.score) : null
      };

      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/api/admissions/applications/${editingCandidateId}`, payload, { headers });
        showToast('Candidate details updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/api/admissions/applications`, payload, { headers });
        showToast('Candidate added to pipeline successfully!', 'success');
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingCandidateId(null);
      setNewLead({ name: '', email: '', phone: '', program_id: '', stage: 'Lead', score: '' });
      fetchAllData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleEditCandidate = (candidate) => {
    setNewLead({
      name: candidate.name,
      email: candidate.email || '',
      phone: candidate.phone || '',
      program_id: candidate.program_id || '',
      stage: candidate.stage || 'Lead',
      score: candidate.rawScore || ''
    });
    setIsEditMode(true);
    setEditingCandidateId(candidate.id);
    setIsModalOpen(true);
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_BASE_URL}/api/admissions/applications/${id}`, { headers });
      showToast('Candidate deleted successfully', 'success');
      fetchAllData();
    } catch (err) {
      showToast('Failed to delete candidate', 'error');
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
            background: 'var(--adm-primary, var(--primary-color, #4f46e5))',
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
              background: 'var(--adm-primary, var(--primary-color, #4f46e5))',
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
            className="adm-sidebar-toggle-btn adm-left-close-btn"
            title="Close sidebar"
          >
            ‹
          </button>
        )}

        <div className="adm-sidebar-header">
          <div className="adm-logo-brand">
            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <>
                <div className="adm-logo-icon">
                  <GraduationCap size={24} weight="fill" color="white" />
                </div>
                <div className="adm-brand-text">
                  <span className="adm-brand-lancers">LANCERS</span>
                  <span className="adm-brand-tech">TECH</span>
                </div>
              </>
            )}
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
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ display: 'flex', background: 'var(--primary-color, #4f46e5)', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                <List size={24} weight="bold" />
              </button>
            )}
            <div>
              <h1 className="adm-header-title">{navItems.find(n => n.id === activeNav)?.label || 'Institutional Admissions'}</h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {(activeNav === 'pipeline' || activeNav === 'applicants') && (
              <button 
                onClick={() => {
                  setIsEditMode(false);
                  setEditingCandidateId(null);
                  setNewLead({ name: '', email: '', phone: '', program_id: '', stage: 'Lead', score: '' });
                  setIsModalOpen(true);
                }}
                className="adm-primary-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}
              >
                + Add Candidate
              </button>
            )}
            
            <div className="adm-user-pill">
              <UserCircle size={24} color="var(--primary-color, #4f46e5)" weight="duotone" />
              <span className="adm-user-name">{user?.name || 'Admission Officer'}</span>
              <div style={{ marginLeft: 10, position: 'relative', cursor: 'pointer' }}>
                <Bell size={22} color="#64748b" weight="bold" />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
              </div>
            </div>
          </div>
        </header>

        <div className="animate-fadeIn">
          {activeNav === 'overview' && <AdmissionsOverview stats={stats} activities={activities} />}
          {activeNav === 'pipeline' && (
            <AdmissionsPipeline 
              stages={pipeline} 
              onUpdateStage={handleUpdateStage} 
              onEditCandidate={handleEditCandidate}
              onDeleteCandidate={handleDeleteCandidate}
            />
          )}
          {activeNav === 'applicants' && (
            <AdmissionsApplicants 
              stages={pipeline} 
              onUpdateStage={handleUpdateStage} 
              onEditCandidate={handleEditCandidate}
              onDeleteCandidate={handleDeleteCandidate}
            />
          )}
          {activeNav === 'verification' && <AdmissionsVerification documents={verifications} onAction={handleVerificationAction} />}
          {activeNav === 'merit' && <AdmissionsMeritList meritList={meritList} />}
          {activeNav === 'interviews' && <AdmissionsInterviews interviews={interviews} />}
        </div>
      </div>

      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={24} weight="bold" />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '24px', color: '#0f172a' }}>
              {isEditMode ? 'Edit Candidate Details' : 'Add Admission Candidate'}
            </h2>

            <form onSubmit={handleSubmitLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Candidate Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter full name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="Enter email address"
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="Enter phone number"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Program</label>
                  <select
                    value={newLead.program_id}
                    onChange={(e) => setNewLead({ ...newLead, program_id: e.target.value })}
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                  >
                    <option value="">Select Program</option>
                    {programs.map(prog => (
                      <option key={prog.id} value={prog.id}>{prog.name} ({prog.code})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Pipeline Stage</label>
                  <select
                    value={newLead.stage}
                    onChange={(e) => setNewLead({ ...newLead, stage: e.target.value })}
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: 'white' }}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Merit List">Merit List</option>
                    <option value="Admitted">Admitted</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Merit / Entry Score (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Enter score (e.g. 85.50)"
                  value={newLead.score}
                  onChange={(e) => setNewLead({ ...newLead, score: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="adm-secondary-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="adm-primary-btn"
                >
                  {isEditMode ? 'Save Changes' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionsDashboard;
