import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOD_STYLES as S } from './sections/HODStyles';
import API_BASE_URL from '../../../config/api';
import HODCourseOfferings from './sections/HODCourseOfferings';
import HODOBEMapping from './sections/HODOBEMapping';
import HODFYPManagement from './sections/HODFYPManagement';
import RegistrarTeacherWorkload from '../registrar/sections/RegistrarTeacherWorkload';
import { 
  House, 
  BookOpen, 
  ChalkboardTeacher, 
  Clock, 
  Target, 
  GraduationCap, 
  UserCheck, 
  SignOut, 
  Bell, 
  CheckCircle, 
  Users,
  ShieldCheck,
  Buildings,
  ChartLine
} from '@phosphor-icons/react';

const HODDashboard = ({ user = { name: "Dean / Department Head" }, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [stats, setStats] = useState({
    facultyCount: 0,
    enrolledStudents: 0,
    activeCourses: 0,
    activeSections: 0,
    fypCount: 0,
    obeCount: 0
  });

  const fetchHODStats = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [tchRes, crsRes, secRes, fypRes, stuRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/teachers`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/courses`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/course-sections`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/fyp`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/students`, { headers }).then(r => r.json())
      ]);

      const teachersList = tchRes.teachers || tchRes.data || [];
      const coursesList = crsRes.courses || crsRes.data || [];
      const sectionsList = secRes.data || [];
      const fypList = fypRes.data || [];
      const studentsList = stuRes.students || stuRes.data || [];

      setStats({
        facultyCount: teachersList.length || 1,
        activeCourses: coursesList.length || 0,
        activeSections: sectionsList.length || 0,
        fypCount: fypList.length || 0,
        enrolledStudents: studentsList.length || 4,
        obeCount: coursesList.length > 0 ? coursesList.length * 3 : 0
      });
    } catch (err) {
      console.error('Error fetching HOD stats:', err);
    }
  };

  useEffect(() => {
    fetchHODStats();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Department Overview', icon: House },
    { id: 'offerings', label: 'Course Offerings & Sections', icon: BookOpen },
    { id: 'workload', label: 'Faculty Workload', icon: ChalkboardTeacher },
    { id: 'obe', label: 'OBE / CLO-PLO Mapping', icon: Target },
    { id: 'fyp', label: 'FYP & Thesis Projects', icon: GraduationCap }
  ];

  const handleSignOut = () => {
    sessionStorage.clear();
    navigate('/signin');
  };

  const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userName = user?.name || storedUser?.name || 'Department Head';
  const userRole = storedUser?.role ? storedUser.role.replace('_', ' ').toUpperCase() : 'DEAN / HOD';

  return (
    <div style={S.container}>
      <div style={S.bgOrb1} />
      <div style={S.bgOrb2} />

      {/* Floating Toggle Button for Left Sidebar */}
      {!leftSidebarOpen && (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: '0 12px 12px 0',
            width: '28px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
            fontSize: '18px',
            fontWeight: '800'
          }}
          title="Open Navigation"
        >
          ›
        </button>
      )}

      {/* ─── 1. LEFT SIDEBAR ─────────────────────────────────────────── */}
      <aside style={{
        ...S.sidebar,
        transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={S.logoWrapper}>
            <div style={S.logoIcon}>
              🏛️
            </div>
            <div>
              <div style={S.logoText}>Department Hub</div>
              <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: '700', letterSpacing: '0.05em' }}>UNIVERSITY LMS</div>
            </div>
          </div>
          <button
            onClick={() => setLeftSidebarOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '8px',
              color: '#94a3b8',
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1
            }}
            title="Collapse Sidebar"
          >
            ‹
          </button>
        </div>

        <div style={S.roleBadge}>
          <Buildings size={16} color="#818cf8" />
          <span>CS & Engineering Dept</span>
          <span style={S.liveIndicator} />
        </div>

        <nav style={S.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  ...S.navBtn,
                  ...(active ? S.navBtnActive : {})
                }}
              >
                {active && <span style={S.activeIndicator} />}
                <Icon size={20} weight={active ? 'bold' : 'regular'} color={active ? '#ffffff' : '#818cf8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button onClick={handleSignOut} style={S.logoutBtn}>
          <SignOut size={18} weight="bold" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* ─── 2. CENTER CONTENT ───────────────────────────────────────── */}
      <main style={{
        ...S.main,
        marginLeft: leftSidebarOpen ? '280px' : '32px',
        marginRight: rightPanelOpen ? '320px' : '32px'
      }}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Dean & HOD Departmental Hub</h1>
            <p style={S.subtitle}>Department Operations, OBE & FYP Monitoring</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={S.badgePill}>
              <Buildings size={16} weight="bold" /> 1 Department Active
            </span>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div style={S.grid4}>
          <div style={S.statCard('#eff6ff', '#2563eb')}>
            <div style={S.metricIconWrapper('#2563eb', '#eff6ff')}>
              <Buildings size={26} weight="duotone" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Active Faculty</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2563eb', margin: '2px 0' }}>{stats.facultyCount}</div>
            </div>
          </div>

          <div style={S.statCard('#fdf2f8', '#db2777')}>
            <div style={S.metricIconWrapper('#db2777', '#fdf2f8')}>
              <Users size={26} weight="duotone" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Enrolled Students</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#db2777', margin: '2px 0' }}>{stats.enrolledStudents}</div>
            </div>
          </div>

          <div style={S.statCard('#eff6ff', '#3b82f6')}>
            <div style={S.metricIconWrapper('#3b82f6', '#eff6ff')}>
              <BookOpen size={26} weight="duotone" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Active Courses</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#3b82f6', margin: '2px 0' }}>{stats.activeCourses}</div>
            </div>
          </div>

          <div style={S.statCard('#faf5ff', '#9333ea')}>
            <div style={S.metricIconWrapper('#9333ea', '#faf5ff')}>
              <GraduationCap size={26} weight="duotone" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>FYP Projects</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#9333ea', margin: '2px 0' }}>{stats.fypCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'overview' && (
          <div>
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Buildings size={24} weight="bold" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Departmental Academic Command</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Manage semester offerings, faculty workload allocations, OBE mapping, and FYPs</p>
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                Welcome to the Departmental Operations Hub. Use the navigation to supervise active course sections, enforce HEC/PEC Outcome-Based Education (OBE) compliance, allocate faculty workloads, and track final-year capstone project defenses.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button style={S.btnPrimary} onClick={() => setActiveTab('offerings')}>
                  <BookOpen size={18} weight="bold" /> Manage Course Offerings
                </button>
                <button
                  onClick={() => setActiveTab('obe')}
                  style={{
                    ...S.btnPrimary,
                    background: '#f8fafc',
                    color: '#4f46e5',
                    border: '1px solid #c7d2fe',
                    boxShadow: 'none'
                  }}
                >
                  <Target size={18} weight="bold" /> OBE / CLO-PLO Matrix
                </button>
                <button
                  onClick={() => setActiveTab('fyp')}
                  style={{
                    ...S.btnPrimary,
                    background: '#f8fafc',
                    color: '#9333ea',
                    border: '1px solid #e9d5ff',
                    boxShadow: 'none'
                  }}
                >
                  <GraduationCap size={18} weight="bold" /> FYP Management
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offerings' && <HODCourseOfferings />}
        {activeTab === 'workload' && <RegistrarTeacherWorkload />}
        {activeTab === 'obe' && <HODOBEMapping />}
        {activeTab === 'fyp' && <HODFYPManagement />}
      </main>

      {/* Floating Toggle Button for Right Sidebar */}
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            background: '#ffffff',
            color: '#4f46e5',
            border: '1px solid #e2e8f0',
            borderRadius: '12px 0 0 12px',
            width: '28px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
            fontSize: '18px',
            fontWeight: '800'
          }}
          title="Open Profile Panel"
        >
          ‹
        </button>
      )}

      {/* ─── 3. RIGHT PROFILE / ANALYTICS SIDEBAR ─────────────────────── */}
      <aside style={{
        ...S.rightPanel,
        transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
          <button
            onClick={() => setRightPanelOpen(false)}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              color: '#64748b',
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1
            }}
            title="Collapse Profile Panel"
          >
            ›
          </button>
        </div>

        {/* Profile Card */}
        <div style={S.profileCard}>
          <div style={S.avatar}>
            {userName ? userName.charAt(0).toUpperCase() : 'D'}
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
            {userName}
          </h3>
          <span style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            background: '#eff6ff',
            color: '#2563eb'
          }}>
            {userRole}
          </span>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '13px', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Last Login</span>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>Today 09:24</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Role Scope</span>
              <span style={{ fontWeight: '700', color: '#0f172a' }}>Main Department</span>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>Platform Stats</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Departments</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>1</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Faculty & Teachers</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>{stats.facultyCount}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Enrolled Students</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#db2777' }}>{stats.enrolledStudents}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Active Courses</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#3b82f6' }}>{stats.activeCourses}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>FYP Projects</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#9333ea' }}>{stats.fypCount}</span>
            </div>
          </div>
        </div>

        {/* Security & Health */}
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>Security & Health</h4>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>System Status</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Operational
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default HODDashboard;
