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
  SignOut,
  Bell,
  CheckCircle,
  Users,
  Buildings,
  FileText,
  ChartBar,
  MagnifyingGlass,
  ArrowUpRight,
  ShieldCheck,
  CalendarCheck,
  CaretRight,
  Plus
} from '@phosphor-icons/react';

const HODDashboard = ({ user = { name: "Dean / Department Head" }, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('Computer Science & Software Engineering');
  const [stats, setStats] = useState({
    facultyCount: 24,
    activeCourses: 18,
    activeSections: 32,
    enrolledStudents: 640,
    obeMappedPercent: 100,
    activeFypGroups: 16
  });

  useEffect(() => {
    const fetchHODStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [tchRes, crsRes, secRes, fypRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/teachers`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE_URL}/api/courses`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE_URL}/api/course-sections`, { headers }).then(r => r.json()).catch(() => ({})),
          fetch(`${API_BASE_URL}/api/fyp`, { headers }).then(r => r.json()).catch(() => ({}))
        ]);

        const tchCount = (tchRes.teachers || tchRes.data || []).length;
        const crsCount = (crsRes.courses || crsRes.data || []).length;
        const secCount = (secRes.data || []).length;
        const fypCount = (fypRes.data || []).length;

        setStats({
          facultyCount: tchCount > 0 ? tchCount : 24,
          activeCourses: crsCount > 0 ? crsCount : 18,
          activeSections: secCount > 0 ? secCount : 32,
          enrolledStudents: 640,
          obeMappedPercent: 100,
          activeFypGroups: fypCount > 0 ? fypCount : 16
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchHODStats();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Department Overview', icon: House },
    { id: 'offerings', label: 'Course Offerings & Sections', icon: BookOpen },
    { id: 'workload', label: 'Faculty Workload & Allocation', icon: ChalkboardTeacher },
    { id: 'obe', label: 'OBE / CLO-PLO Matrix', icon: Target },
    { id: 'fyp', label: 'FYP & Thesis Projects', icon: GraduationCap }
  ];

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    } else {
      sessionStorage.clear();
      navigate('/signin');
    }
  };

  return (
    <div style={S.container}>
      {/* Top Executive Header */}
      <div style={S.headerCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#09090B',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '15px',
            letterSpacing: '0.5px',
            border: '1px solid #27272A'
          }}>
            HOD
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#09090B', letterSpacing: '-0.3px' }}>
                Departmental Executive Command Center
              </h1>
              <span style={S.badge('#F4F4F5', '#18181B', '#E4E4E7')}>
                Fall Term 2026-2027
              </span>
            </div>
            <p style={{ color: '#71717A', fontSize: '12px', margin: '4px 0 0 0', fontWeight: '500' }}>
              Dean & Head of Department • {selectedDept}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#F4F4F5',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #E4E4E7'
          }}>
            <MagnifyingGlass size={15} color="#71717A" />
            <input 
              type="text" 
              placeholder="Search faculty, courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12px', color: '#09090B', width: '160px' }}
            />
          </div>

          <button 
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#09090B',
              border: '1px solid #E4E4E7',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              transition: 'background 0.15s ease'
            }}
          >
            <SignOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={S.navRow}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={S.navTab(active)}
            >
              <Icon size={16} weight={active ? 'bold' : 'regular'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Screen */}
      {activeTab === 'overview' && (
        <div>
          {/* 4 Executive Metric Cards */}
          <div style={S.grid4}>
            <div style={S.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Faculty Members
                </span>
                <span style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px', border: '1px solid #E4E4E7' }}>
                  <ChalkboardTeacher size={18} color="#09090B" />
                </span>
              </div>
              <div style={{ margin: '14px 0 6px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#09090B', letterSpacing: '-0.5px' }}>
                  {stats.facultyCount}
                </span>
                <span style={{ fontSize: '12px', color: '#71717A', marginLeft: '6px' }}>Professors & Lecturers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#52525B', borderTop: '1px solid #F4F4F5', paddingTop: '10px' }}>
                <span style={{ fontWeight: '700', color: '#09090B' }}>12 PhD</span> • 100% Workload Balanced
              </div>
            </div>

            <div style={S.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Course Sections
                </span>
                <span style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px', border: '1px solid #E4E4E7' }}>
                  <BookOpen size={18} color="#09090B" />
                </span>
              </div>
              <div style={{ margin: '14px 0 6px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#09090B', letterSpacing: '-0.5px' }}>
                  {stats.activeSections}
                </span>
                <span style={{ fontSize: '12px', color: '#71717A', marginLeft: '6px' }}>Active Class Sections</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#52525B', borderTop: '1px solid #F4F4F5', paddingTop: '10px' }}>
                <span style={{ fontWeight: '700', color: '#09090B' }}>{stats.activeCourses} Courses</span> • 640 Enrolled
              </div>
            </div>

            <div style={S.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  OBE Compliance
                </span>
                <span style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px', border: '1px solid #E4E4E7' }}>
                  <ShieldCheck size={18} color="#09090B" />
                </span>
              </div>
              <div style={{ margin: '14px 0 6px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#09090B', letterSpacing: '-0.5px' }}>
                  98.4%
                </span>
                <span style={{ fontSize: '12px', color: '#71717A', marginLeft: '6px' }}>HEC / PEC Ready</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#52525B', borderTop: '1px solid #F4F4F5', paddingTop: '10px' }}>
                <span style={{ fontWeight: '700', color: '#09090B' }}>12 PLOs Mapped</span> • CQI Audit Passed
              </div>
            </div>

            <div style={S.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  FYP & Capstones
                </span>
                <span style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px', border: '1px solid #E4E4E7' }}>
                  <GraduationCap size={18} color="#09090B" />
                </span>
              </div>
              <div style={{ margin: '14px 0 6px 0' }}>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#09090B', letterSpacing: '-0.5px' }}>
                  {stats.activeFypGroups}
                </span>
                <span style={{ fontSize: '12px', color: '#71717A', marginLeft: '6px' }}>Project Teams</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#52525B', borderTop: '1px solid #F4F4F5', paddingTop: '10px' }}>
                <span style={{ fontWeight: '700', color: '#09090B' }}>Batch '26</span> • Mid Defenses in Week 12
              </div>
            </div>
          </div>

          {/* Middle 2-Column Grid */}
          <div style={S.grid2}>
            {/* Department Operational Health & Workload */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#09090B' }}>
                    Department Faculty Workload Distribution
                  </h3>
                  <p style={{ fontSize: '12px', color: '#71717A', margin: '3px 0 0 0' }}>
                    HEC Maximum Limit: 12 Credit Hours / Faculty
                  </p>
                </div>
                <button style={S.btnSecondary} onClick={() => setActiveTab('workload')}>
                  <span>Full Matrix</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                    <span>Permanent Professors & Associate Faculty</span>
                    <span>10.5 / 12 Avg CH (88%)</span>
                  </div>
                  <div style={{ height: '7px', background: '#F4F4F5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', background: '#09090B', borderRadius: '10px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                    <span>Lecturers & Assistant Professors</span>
                    <span>9.2 / 12 Avg CH (76%)</span>
                  </div>
                  <div style={{ height: '7px', background: '#F4F4F5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '76%', height: '100%', background: '#27272A', borderRadius: '10px' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                    <span>Lab Instructors & Visiting Lecturers</span>
                    <span>6.0 / 9 Avg CH (66%)</span>
                  </div>
                  <div style={{ height: '7px', background: '#F4F4F5', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '66%', height: '100%', background: '#71717A', borderRadius: '10px' }}></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '14px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E4E4E7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={18} color="#09090B" weight="fill" />
                  <span style={{ fontSize: '12px', color: '#18181B', fontWeight: '600' }}>
                    All 24 faculty members are within HEC credit threshold.
                  </span>
                </div>
                <span style={S.badge('#09090B', '#FFFFFF', '#09090B')}>Compliant</span>
              </div>
            </div>

            {/* OBE & Accreditation Status */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#09090B' }}>
                    HEC / PEC OBE Accreditation Engine
                  </h3>
                  <p style={{ fontSize: '12px', color: '#71717A', margin: '3px 0 0 0' }}>
                    Continuous Quality Improvement (CQI) Tracking
                  </p>
                </div>
                <button style={S.btnSecondary} onClick={() => setActiveTab('obe')}>
                  <span>View CLO Grid</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
                <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E4E4E7', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#09090B' }}>12 / 12</div>
                  <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>PLOs Active</div>
                </div>
                <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E4E4E7', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#09090B' }}>100%</div>
                  <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>Courses Mapped</div>
                </div>
                <div style={{ padding: '12px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E4E4E7', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#09090B' }}>Level C4</div>
                  <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>Avg Bloom Level</div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#52525B', lineHeight: '1.6' }}>
                • <strong>Direct Assessment:</strong> Midterm, Final Exams, and Lab rubrics automatically aggregate into Course Learning Outcomes.<br />
                • <strong>Indirect Assessment:</strong> Exit Surveys & Industry Advisory Board (IAB) feedback synced.
              </div>
            </div>
          </div>

          {/* Bottom Row: Quick Action Command Center & Recent Activity */}
          <div style={S.grid2}>
            {/* Quick Actions */}
            <div style={S.card}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: '#09090B' }}>
                Executive Quick Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <button 
                  onClick={() => setActiveTab('offerings')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E4E4E7',
                    background: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <BookOpen size={18} color="#09090B" weight="bold" />
                    <CaretRight size={14} color="#A1A1AA" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#09090B', marginTop: '6px' }}>Offer New Section</div>
                  <div style={{ fontSize: '11px', color: '#71717A' }}>Assign faculty, room & capacity</div>
                </button>

                <button 
                  onClick={() => setActiveTab('obe')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E4E4E7',
                    background: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Target size={18} color="#09090B" weight="bold" />
                    <CaretRight size={14} color="#A1A1AA" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#09090B', marginTop: '6px' }}>Define OBE CLO</div>
                  <div style={{ fontSize: '11px', color: '#71717A' }}>Map Bloom taxonomy & PLO</div>
                </button>

                <button 
                  onClick={() => setActiveTab('fyp')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E4E4E7',
                    background: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <GraduationCap size={18} color="#09090B" weight="bold" />
                    <CaretRight size={14} color="#A1A1AA" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#09090B', marginTop: '6px' }}>Register FYP Project</div>
                  <div style={{ fontSize: '11px', color: '#71717A' }}>Assign supervisor & rubric</div>
                </button>

                <button 
                  onClick={() => setActiveTab('workload')}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E4E4E7',
                    background: '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <ChalkboardTeacher size={18} color="#09090B" weight="bold" />
                    <CaretRight size={14} color="#A1A1AA" />
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#09090B', marginTop: '6px' }}>Balance Workloads</div>
                  <div style={{ fontSize: '11px', color: '#71717A' }}>Audit teaching contact hours</div>
                </button>
              </div>
            </div>

            {/* Department Notifications & Announcements */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#09090B' }}>
                    Department Operational Noticeboard
                  </h3>
                  <p style={{ fontSize: '12px', color: '#71717A', margin: '3px 0 0 0' }}>
                    Academic alerts & compliance notices
                  </p>
                </div>
                <Bell size={18} color="#09090B" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px 12px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E4E4E7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#09090B' }}>Fall 2026 Midterm Exam Schedule Submission</div>
                    <div style={{ fontSize: '11px', color: '#71717A' }}>Controller of Exams requires date verification by Friday.</div>
                  </div>
                  <span style={S.badge('#09090B', '#FFFFFF', '#09090B')}>Urgent</span>
                </div>

                <div style={{ padding: '10px 12px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E4E4E7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#09090B' }}>PEC Accreditation Council Visit Scheduled</div>
                    <div style={{ fontSize: '11px', color: '#71717A' }}>Review CLO-PLO attainment dossiers for BS Software Engineering.</div>
                  </div>
                  <span style={S.badge('#F4F4F5', '#18181B', '#E4E4E7')}>Audit</span>
                </div>

                <div style={{ padding: '10px 12px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #E4E4E7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#09090B' }}>FYP Initial Proposal Defense Window</div>
                    <div style={{ fontSize: '11px', color: '#71717A' }}>16 Capstone teams submitted domain abstracts.</div>
                  </div>
                  <span style={S.badge('#F4F4F5', '#18181B', '#E4E4E7')}>Defense</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Sub-Tabs */}
      {activeTab === 'offerings' && <HODCourseOfferings />}
      {activeTab === 'workload' && <RegistrarTeacherWorkload />}
      {activeTab === 'obe' && <HODOBEMapping />}
      {activeTab === 'fyp' && <HODFYPManagement />}
    </div>
  );
};

export default HODDashboard;
