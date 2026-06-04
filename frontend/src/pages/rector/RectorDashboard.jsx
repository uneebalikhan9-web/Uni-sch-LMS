import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  House, Buildings, Users, ChalkboardTeacher, 
  ChartLineUp, Certificate, CurrencyDollar, 
  GraduationCap, SignOut, Bell, MagnifyingGlass,
  CheckCircle, WarningCircle, Clock, ChatCircle
, Globe } from '@phosphor-icons/react';
import { S } from './sections/RDStyles';
import API_BASE_URL from '../../config/api';

import RDOverview from './sections/RDOverview';
import RDDataTable from './sections/RDDataTable';
import RDStrategy from './sections/RDStrategy';

const RectorDashboard = ({ user = { name: "Pro-VC / Rector" }, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalEnrollment: '0', facultyStrength: '0', activeResearch: '0', overallGPA: '0' });
  const [departments, setDepartments] = useState([]);
  const [facultyData, setFacultyData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [researchData, setResearchData] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, deptRes, facRes, stuRes, compRes, resRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/rector/stats`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/rector/departments`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/rector/faculty`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/rector/students`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/rector/compliance`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/rector/research`, { headers }).then(r => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (facRes.success) setFacultyData(facRes.faculty);
      if (stuRes.success) setStudentData(stuRes.trends);
      if (compRes.success) setComplianceData(compRes.compliance);
      if (resRes && resRes.success) setResearchData(resRes.research);
    } catch (error) {
      console.error('Error fetching rector data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Institutional Overview', icon: House },
    { id: 'academic', label: 'Academic Strategy', icon: ChartLineUp },
    { id: 'faculty',  label: 'Faculty Oversight',  icon: ChalkboardTeacher },
    { id: 'students', label: 'Student Enrollment', icon: Users },
    { id: 'research', label: 'Research & Innovation', icon: GraduationCap },
    { id: 'compliance', label: 'Accreditation & Quality', icon: Certificate },
    { id: 'finance',  label: 'Financial Governance', icon: CurrencyDollar },
  ];

  if (isLoading) return (
    <div style={S.loadingContainer}>
      <div style={S.loadingSpinner}></div>
      <p style={{...S.subtitle, color: '#1e3a8a'}}>Initializing Rectorate Command Center...</p>
    </div>
  );

  return (
    <div className="portal-container dashboard-wrapper">
      <div style={S.bgOrb1} /><div style={S.bgOrb2} />

      {/* Floating open button for LEFT sidebar — only visible when left sidebar is CLOSED */}
      {!leftSidebarOpen && (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: '#1e3a8a',
            color: '#fff',
            border: 'none',
            borderRadius: '0 12px 12px 0',
            width: '28px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 0 16px rgba(30,58,138,0.35)',
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

      {/* Sidebar */}
      <aside style={{
        ...S.sidebar,
        padding: 0,
      }} className={`portal-sidebar ${leftSidebarOpen ? 'open' : ''}`}>
        
        {/* ← Close arrow centered on RIGHT edge of the left sidebar */}
        <button
          onClick={() => setLeftSidebarOpen(false)}
          style={{
            position: 'absolute',
            right: '-18px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            background: '#1e3a8a',
            color: '#fff',
            border: 'none',
            borderRadius: '0 10px 10px 0',
            width: '18px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 0 14px rgba(30,58,138,0.35)',
            fontSize: '18px',
            fontWeight: '800',
            lineHeight: 1,
          }}
          className="sidebar-toggle-btn left-close-btn"
          title="Close sidebar"
        >
          ‹
        </button>

        {/* Inner Scrollable Container Wrapper */}
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 20px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }} className="hidden-scrollbar">
                    <div style={S.logoWrapper}>
            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <>
                <div style={S.logoIcon}><Globe size={24} weight="fill" /></div>
                <span style={S.logoText}>Lancers<span style={S.logoAccent}>Tech</span></span>
              </>
            )}
          </div>


          <div style={S.rectorBadge}>
            <div style={S.liveIndicator} />
            <span>PRO-VC / RECTORATE OFFICE</span>
          </div>

          <nav style={S.nav}>
            <button onClick={() => navigate('/chat')} style={S.navBtn}>
              <ChatCircle size={22} />
              <span>Institutional Chat</span>
            </button>
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                style={{...S.navBtn, ...(activeTab === item.id ? S.navBtnActive : {})}}
              >
                <item.icon size={22} weight={activeTab === item.id ? "fill" : "regular"} />
                <span>{item.label}</span>
                {activeTab === item.id && <div style={S.activeIndicator} />}
              </button>
            ))}
          </nav>

          <button onClick={onLogout} style={S.logoutBtn}>
            <SignOut size={22} weight="bold" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        ...S.main,
      }} className="portal-main rector-main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>Rectorate Dashboard</h1>
            <p style={S.subtitle}>{navItems.find(n => n.id === activeTab)?.label} — {user.name}</p>
          </div>
          <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
            <div style={{width:'45px', height:'45px', borderRadius:'12px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #e2e8f0', color:'#1e3a8a', cursor:'pointer'}}>
              <Bell size={22} weight="duotone" />
            </div>
          </div>
        </header>

        {activeTab === 'overview' && <RDOverview stats={stats} departments={departments} leftSidebarOpen={leftSidebarOpen} />}
        
        {(activeTab === 'academic' || activeTab === 'finance') && <RDStrategy activeTab={activeTab} />}

        {activeTab === 'faculty' && <RDDataTable title="Faculty & Leadership Oversight" activeTab={activeTab} data={facultyData} />}
        {activeTab === 'students' && <RDDataTable title="Global Enrollment Trends" activeTab={activeTab} data={studentData} />}
        {activeTab === 'research' && <RDDataTable title="Research Projects & Funding" activeTab={activeTab} data={researchData} />}
        {activeTab === 'compliance' && <RDDataTable title="Institutional Accreditation Status" activeTab={activeTab} data={complianceData} />}
      </main>
    </div>
  );
};

export default RectorDashboard;
