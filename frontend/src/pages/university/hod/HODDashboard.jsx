import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOD_STYLES as S } from './sections/HODStyles';
import API_BASE_URL from '../../../config/api';
import HODCourseOfferings from './sections/HODCourseOfferings';
import HODOBEMapping from './sections/HODOBEMapping';
import HODFYPManagement from './sections/HODFYPManagement';
import RegistrarTeacherWorkload from '../registrar/sections/RegistrarTeacherWorkload';
import PDFaceAttendance from '../../principal/sections/PDFaceAttendance';
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
  ChartLine,
  UserFocus,
  MagnifyingGlass,
  Plus
} from '@phosphor-icons/react';

const HODDashboard = ({ user = { name: "Dean / Department Head" }, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    facultyCount: 0,
    enrolledStudents: 0,
    activeCourses: 0,
    activeSections: 0,
    fypCount: 0,
    obeCount: 0
  });

  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchHODData = async () => {
    try {
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

      setFacultyList(teachersList);
      setStudentList(studentsList);

      setStats({
        facultyCount: teachersList.length || 1,
        activeCourses: coursesList.length || 0,
        activeSections: sectionsList.length || 0,
        fypCount: fypList.length || 0,
        enrolledStudents: studentsList.length || 4,
        obeCount: coursesList.length > 0 ? coursesList.length * 3 : 0
      });
    } catch (err) {
      console.error('Error fetching HOD data:', err);
    }
  };

  useEffect(() => {
    fetchHODData();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Academic Analytics', icon: House, count: null },
    { id: 'offerings', label: 'Course Offerings & Sections', icon: BookOpen, count: stats.activeSections },
    { id: 'workload', label: 'Faculty Workload', icon: ChalkboardTeacher, count: stats.facultyCount },
    { id: 'obe', label: 'OBE / CLO-PLO Matrix', icon: Target, count: stats.obeCount },
    { id: 'fyp', label: 'FYP & Capstone Projects', icon: GraduationCap, count: stats.fypCount },
    { id: 'faculty', label: 'Department Faculty', icon: ChalkboardTeacher, count: stats.facultyCount },
    { id: 'students', label: 'Student Lifecycle & Roster', icon: Users, count: stats.enrolledStudents },
    { id: 'face-attendance', label: 'Face Attendance', icon: UserFocus, count: null }
  ];

  const handleSignOut = () => {
    sessionStorage.clear();
    navigate('/signin');
  };

  const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userName = user?.name || storedUser?.name || 'Department Head';
  const userRole = storedUser?.role ? storedUser.role.replace('_', ' ').toUpperCase() : 'DEAN / HOD';

  const filteredFaculty = facultyList.filter(f => 
    (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.specialization || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = studentList.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.roll_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <span>Academic Council / HOD</span>
          <span style={S.liveIndicator} />
        </div>

        <nav style={S.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
                style={{
                  ...S.navBtn,
                  ...(active ? S.navBtnActive : {})
                }}
              >
                {active && <span style={S.activeIndicator} />}
                <Icon size={20} weight={active ? 'bold' : 'regular'} color={active ? '#ffffff' : '#818cf8'} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {item.count !== null && item.count !== undefined && item.count > 0 && (
                  <span style={{
                    background: active ? '#ffffff' : 'rgba(99, 102, 241, 0.25)',
                    color: active ? '#4f46e5' : '#c7d2fe',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}>
                    {item.count}
                  </span>
                )}
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
            <p style={S.subtitle}>Department Operations, Course Offerings, OBE & FYP Monitoring</p>
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
              <ChalkboardTeacher size={26} weight="duotone" />
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
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Supervise course offerings, faculty workloads, OBE matrix, and capstone project defenses</p>
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

        {/* Faculty Roster Tab */}
        {activeTab === 'faculty' && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Department Faculty Roster</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Active professors, associate professors, and lecturers</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <MagnifyingGlass size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Faculty Name & Email</th>
                    <th style={S.th}>Employee ID</th>
                    <th style={S.th}>Designation</th>
                    <th style={S.th}>Department / Domain</th>
                    <th style={S.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ ...S.td, textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No faculty members found.
                      </td>
                    </tr>
                  ) : (
                    filteredFaculty.map(f => (
                      <tr key={f.id}>
                        <td style={S.td}>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{f.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{f.email}</div>
                        </td>
                        <td style={S.td}><span style={{ fontWeight: '600', color: '#475569' }}>{f.employee_id || 'FAC-001'}</span></td>
                        <td style={S.td}><span style={S.badge('#eff6ff', '#2563eb')}>{f.designation || 'Professor'}</span></td>
                        <td style={S.td}><span style={{ color: '#475569' }}>{f.department || 'Computer Science'}</span></td>
                        <td style={S.td}><span style={S.badge('#dcfce7', '#16a34a')}>Active</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Lifecycle Tab */}
        {activeTab === 'students' && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Enrolled Student Roster</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Undergraduate & Graduate enrolled cohorts</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <MagnifyingGlass size={18} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#0f172a' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Student Name & Email</th>
                    <th style={S.th}>Roll Number</th>
                    <th style={S.th}>Semester</th>
                    <th style={S.th}>Standing / GPA</th>
                    <th style={S.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ ...S.td, textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        No enrolled students found.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(s => (
                      <tr key={s.id}>
                        <td style={S.td}>
                          <div style={{ fontWeight: '700', color: '#0f172a' }}>{s.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{s.email}</div>
                        </td>
                        <td style={S.td}><span style={{ fontWeight: '700', color: '#4f46e5' }}>{s.roll_number || 'FA26-BCS-001'}</span></td>
                        <td style={S.td}><span style={S.badge('#f1f5f9', '#475569')}>Semester {s.semester || 1}</span></td>
                        <td style={S.td}>
                          <span style={{ fontWeight: '700', color: '#16a34a' }}>{s.current_gpa ? `${s.current_gpa} GPA` : 'Good Standing'}</span>
                        </td>
                        <td style={S.td}><span style={S.badge('#dcfce7', '#16a34a')}>Enrolled</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Face Attendance Tab */}
        {activeTab === 'face-attendance' && (
          <div style={S.card}>
            <PDFaceAttendance token={token} />
          </div>
        )}
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

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Faculty</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#2563eb' }}>{stats.facultyCount}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Students</span>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#db2777' }}>{stats.enrolledStudents}</div>
            </div>
          </div>
        </div>

        {/* Department Stats */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>Platform Stats</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Active Sections</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>{stats.activeSections}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Active Courses</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#3b82f6' }}>{stats.activeCourses}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>OBE PLO Matrix</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#16a34a' }}>100%</span>
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
