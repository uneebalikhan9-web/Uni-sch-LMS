import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../responsive.css";
import { Chart } from "chart.js/auto";
import { 
  House, ChalkboardTeacher, UserCircle, Buildings, BookOpen, 
  UserPlus, SignOut, Plus, Trash, PencilSimple, TrendUp, 
  Pulse, GraduationCap, CalendarBlank, Users, ChartLine,
  CheckCircle, XCircle, DotsThreeOutline, Clock, Star,
  Warning, Bell, Gear, Eye, EyeSlash, SquaresFour,
  Check, ArrowsCounterClockwise, Download, ChatCircle, FileText, ChartBar, WarningCircle, Flask
} from "@phosphor-icons/react";

const API = "http://localhost:5000/api";

function PrincipalDashboard({ user = { name: "HOD" }, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: "", email: "", password: "", semester: "1" });
  const [newClass, setNewClass] = useState({ name: "", section: "", academic_year: "2024-2025", teacher_id: "" });
  const [newCourse, setNewCourse] = useState({ title: "", description: "", teacher_id: "", class_id: "" });
  const [newLab, setNewLab] = useState({ name: "", description: "", icon: "🔬", environment: "Python", classId: "", url: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [timetableHistory, setTimetableHistory] = useState([]);
  const [timetableView, setTimetableView] = useState('schedule'); // 'schedule' or 'history'
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [newTimetableEntry, setNewTimetableEntry] = useState({
    course_id: '',
    class_id: '',
    teacher_id: '',
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '11:00',
    room_number: '',
    academic_year: '2024-2025',
    semester: 'Fall'
  });
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showStats, setShowStats] = useState(true);
  const [labUsage, setLabUsage] = useState([]);
  const [loadingLabs, setLoadingLabs] = useState(false);
  const [courseFeedbackAnalytics, setCourseFeedbackAnalytics] = useState([]);
  const [labFeedbackAnalytics, setLabFeedbackAnalytics] = useState([]);
  const [campusReports, setCampusReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false);
  const [engagementData, setEngagementData] = useState([7, 9.5, 4, 6, 3, 1.5, 10.7]); // Fallback
  
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const token = sessionStorage.getItem("token");

  // Real-time data fetch with interval
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
      setLastUpdated(new Date());
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [t, s, cl, co, ps, tt, tth, lu, labsRes, logsRes, res7, res8, engRes] = await Promise.all([
        fetch(`${API}/principal/teachers`, { headers }).then(r => r.json()),
        fetch(`${API}/principal/students`, { headers }).then(r => r.json()),
        fetch(`${API}/classes`, { headers }).then(r => r.json()),
        fetch(`${API}/courses?status=all`, { headers }).then(r => r.json()),
        fetch(`${API}/pending-students`, { headers }).then(r => r.json()),
        fetch(`${API}/timetables`, { headers }).then(r => r.json()),
        fetch(`${API}/timetables/history`, { headers }).then(r => r.json()),
        fetch(`${API}/labs/usage/all`, { headers }).then(r => r.json()),
        fetch(`${API}/labs`, { headers }).then(r => r.json()),
        fetch(`${API}/logs`, { headers }).then(r => r.json()),
        fetch(`${API}/feedback/analytics/courses`, { headers }).then(r => r.json()),
        fetch(`${API}/feedback/analytics/labs`, { headers }).then(r => r.json()),
        fetch(`${API}/principal/engagement-stats`, { headers }).then(r => r.json()),
      ]);
      if (engRes.success) setEngagementData(engRes.data);
      if (t.success) setTeachers(t.teachers || []);
      if (s.success) setStudents(s.students || []);
      if (cl.success) setClasses(cl.classes || []);
      if (co.success) setCourses(co.courses || []);
      if (ps.success) setPendingStudents(ps.students || []);
      if (tt.success) setTimetables(tt.timetables || []);
      if (tth.success) setTimetableHistory(tth.history || []);
      if (lu.success) setLabUsage(lu.usage || []);
      if (labsRes.success) setLabs(labsRes.labs || []);
      if (logsRes.success) setLogs(logsRes.logs || []);
      if (res7 && res7.success) setCourseFeedbackAnalytics(res7.analytics || []);
      if (res8 && res8.success) setLabFeedbackAnalytics(res8.analytics || []);
      setIsLoading(false);
    } catch (e) { 
      console.error(e);
      setIsLoading(false);
    }
  };

  const fetchCampusReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch(`${API}/reports/campus`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCampusReports(data.reports || []);
    } catch (e) { console.error(e); }
    setReportsLoading(false);
  };

  const fetchReportDetails = async (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
    setIsReportDetailsLoading(true);
    try {
      const res = await fetch(`${API}/reports/${report.id}/details`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setReportDetails(data);
    } catch (e) { console.error(e); }
    setIsReportDetailsLoading(false);
  };

  const handleGenerateReport = async (courseId, courseTitle) => {
    if (!window.confirm(`Mark "${courseTitle}" as complete and generate its report?`)) return;
    try {
      const res = await fetch(`${API}/reports/generate/${courseId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Report generated for "${courseTitle}"!\n\nSummary:\n• Students: ${data.summary.total_students}\n• Avg Marks: ${data.summary.avg_marks}%\n• Avg Attendance: ${data.summary.avg_attendance}%\n• Pass: ${data.summary.pass_count} | Fail: ${data.summary.fail_count}`);
        fetchData();
        fetchCampusReports();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (e) {
      alert('❌ Error generating report');
    }
  };

  useEffect(() => { if (activeTab === 'course_reports') fetchCampusReports(); }, [activeTab]);


  // Chart initialization with animation
  useEffect(() => {
    if (chartRef.current && activeTab === "overview") {
      if (chartInstance.current) chartInstance.current.destroy();
      
      // Real-time activity data from backend
      const activityData = engagementData;

      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            { 
              label: 'Activity', 
              data: activityData, 
              borderColor: '#7c3aed', 
              backgroundColor: 'rgba(124,58,237,0.1)', 
              fill: true, 
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointBackgroundColor: '#7c3aed',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              borderWidth: 3
            }
          ]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { 
            legend: { display: false },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
          },
          scales: { 
            y: { 
              grid: { color: '#f1f5f9' }, 
              border: { display: false },
              beginAtZero: true,
              ticks: { stepSize: 5 }
            }, 
            x: { grid: { display: false } } 
          },
          animation: { duration: 1000, easing: 'easeInOutQuart' }
        }
      });
    }
  }, [activeTab, teachers.length, students.length, classes.length, courses.length, pendingStudents.length]);

  const singularTab = (tab) => {
    if (tab === 'classes') return 'class';
    if (tab === 'pending') return 'student';
    if (tab === 'labs') return 'lab';
    if (tab === 'history') return 'course';
    return tab.slice(0, -1);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    const endpointMap = { 
      teacher: 'principal/teachers', 
      student: 'principal/students', 
      class: 'classes', 
      course: 'courses', 
      lab: 'labs',
      lab_report: 'labs/usage'
    };
    const res = await fetch(`${API}/${endpointMap[type]}/${id}`, { 
      method: 'DELETE', 
      headers: { Authorization: `Bearer ${token}` } 
    });
    const data = await res.json();
    if (data.success) fetchData(); else alert('❌ ' + data.message);
  };

  const handleApprove = async (id, name) => {
    if (!window.confirm(`Approve ${name}?`)) return;
    const res = await fetch(`${API}/pending-students/${id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) { 
      alert('✅ Approved!'); 
      fetchData(); 
    } else alert('❌ ' + data.message);
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}?`)) return;
    const res = await fetch(`${API}/pending-students/${id}/reject`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) { 
      alert('✅ Rejected'); 
      fetchData(); 
    } else alert('❌ ' + data.message);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const endpointMap = { teachers: 'principal/teachers', students: 'principal/students', classes: 'classes', courses: 'courses', labs: 'labs' };
    const bodyMap = { teachers: newPerson, students: newPerson, classes: newClass, courses: newCourse, labs: newLab };
    
    let url = `${API}/${endpointMap[activeTab]}`;
    let method = 'POST';

    if (editingItem) {
      url = `${API}/${endpointMap[activeTab]}/${editingItem.id}`;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(editingItem || bodyMap[activeTab])
    });
    const data = await res.json();
    if (data.success) { 
      setShowAddModal(false); 
      fetchData(); 
      resetForms(); 
    } else alert('❌ ' + data.message);
  };

  const resetForms = () => {
    setNewPerson({ name: "", email: "", password: "", semester: "1" });
    setNewClass({ name: "", section: "", academic_year: "2024-2025", teacher_id: "" });
    setNewCourse({ title: "", description: "", teacher_id: "", class_id: "" });
    setNewLab({ name: "", description: "", icon: "🔬", environment: "Python", classId: "", url: "" });
    setNewTimetableEntry({
      course_id: '',
      class_id: '',
      teacher_id: '',
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '11:00',
      room_number: '',
      academic_year: '2024-2025',
      semester: 'Fall'
    });
    setEditingItem(null);
  };

  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/timetables`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newTimetableEntry)
      });
      const data = await res.json();
      if (data.success) {
        setShowTimetableModal(false);
        fetchData();
        resetForms();
        alert('✅ Timetable added!');
      } else alert('❌ ' + data.message);
    } catch (e) { console.error(e); }
  };

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      const res = await fetch(`${API}/timetables/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchData(); else alert('❌ ' + data.message);
    } catch (e) { console.error(e); }
  };

  const handleUpdateCourseStatus = async (id, status) => {
    if (!window.confirm(`Mark this course as ${status}?`)) return;
    try {
      const res = await fetch(`${API}/courses/${id}/status`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Course ${status === 'completed' ? 'moved to history' : 're-activated'}!`);
        fetchData();
      } else alert('❌ ' + data.message);
    } catch (e) {
      console.error(e);
      alert('❌ Error updating course status');
    }
  };

  const getTableData = () => {
    if (activeTab === 'courses') return courses.filter(c => c.status === 'active');
    if (activeTab === 'history') return courses.filter(c => c.status === 'completed');
    if (activeTab === 'lab_reports') return labUsage;
    if (activeTab === 'course_reports') return [];
    return { teachers, students, classes, pending: pendingStudents, labs }[activeTab] || [];
  };

  // Calculate stats
  const totalActiveCourses = courses.filter(c => c.status === 'active').length;
  const pendingCount = pendingStudents.length;
  const teacherStudentRatio = teachers.length > 0 ? (students.length / teachers.length).toFixed(1) : 0;
  const classAverageSize = classes.length > 0 ? Math.round(students.length / classes.length) : 0;

  if (isLoading) return (
    <div style={S.loadingContainer}>
      <div style={S.loadingSpinner}></div>
      <p style={S.loadingText}>Loading Department Dashboard...</p>
    </div>
  );

  return (
    <div style={S.container} className="dashboard-wrapper">
      <style>{`
        .hidden-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hidden-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Animated Background Orbs */}
      <div style={S.bgOrb1}></div>
      <div style={S.bgOrb2}></div>
      <div style={S.bgOrb3}></div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={S.mobileMenuBtn}
        className="mobile-menu-btn"
      >
        <DotsThreeOutline size={24} weight="bold" />
      </button>

      {/* Sidebar */}
      <aside style={S.sidebar} className={`sidebar hidden-scrollbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={S.logoWrapper}>
          <div style={S.logoIcon}><GraduationCap size={24} weight="fill" /></div>
          <span style={S.logoText}>Department<span style={S.logoAccent}>Hub</span></span>
        </div>

        <div style={S.principalBadge}>
          <UserCircle size={20} weight="duotone" />
          <span>HOD Dashboard</span>
          <div style={S.liveIndicator}></div>
        </div>

        <nav style={S.nav}>
          <button type="button" onClick={() => navigate('/chat')} style={S.navBtn} className="nav-btn">
            <ChatCircle size={20} /><span style={{ flex: 1, textAlign: 'left' }}>Chat</span>
          </button>
          {[
            ['overview', 'Overview', <House size={20} />, teachers.length + students.length],
            ['teachers', 'Teachers', <ChalkboardTeacher size={20} />, teachers.length],
            ['students', 'Students', <UserCircle size={20} />, students.length],
            ['classes', 'Classes', <Buildings size={20} />, classes.length],
            ['courses', 'Courses', <BookOpen size={20} />, courses.filter(c => c.status === 'active').length],
            ['history', 'Course History', <Clock size={20} />, courses.filter(c => c.status === 'completed').length],
            ['timetable', 'Time Table', <Clock size={20} />, timetables.length],
            ['labs', 'Lab Management', <SquaresFour size={20} />, labs.length],
            ['lab_reports', 'Lab Reports', <FileText size={20} />, null],
            ['feedback', 'Quality Reports', <ChartLine size={20} weight="duotone" />, null],
            ['course_reports', 'Course Reports', <ChartLine size={20} weight="duotone" />, campusReports.length || null],
            ['pending', 'Pending', <UserPlus size={20} />, pendingStudents.length]
          ].map(([tab, label, icon, count]) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              style={{...S.navBtn, ...(activeTab === tab ? S.navBtnActive : {})}}
              className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {icon}
              <span style={{flex: 1, textAlign: 'left'}}>{label}</span>
              {count > 0 && <span style={S.navBadge}>{count}</span>}
              {activeTab === tab && <div style={S.activeIndicator}></div>}
            </button>
          ))}
        </nav>

        <button onClick={onLogout} style={S.logoutBtn} className="logout-btn">
          <SignOut size={20} /><span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main style={S.main} className="main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>{user.department_name || 'Department Hub'}</h1>
            <p style={S.subtitle}>Welcome back, {user.name}</p>
          </div>
          <div style={S.headerActions}>
            <div style={S.dateBadge}>
              <CalendarBlank size={18} /> 
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div style={S.refreshBadge} onClick={() => fetchData()}>
              <Clock size={14} />
              <span>Last: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {activeTab === "overview" && (
          <div style={S.overviewContainer}>
            {/* Stats Grid with more metrics */}
            <div style={S.statsGrid} className="stats-grid">
              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('#7c3aed')}>
                  <ChalkboardTeacher size={24} weight="duotone" />
                </div>
                <div style={S.metricContent}>
                  <p style={S.metricLabel}>Teachers</p>
                  <h2 style={{...S.metricValue, color: '#7c3aed'}}>{teachers.length}</h2>
                  <span style={S.metricTrend}>+{Math.floor(teachers.length * 0.2) || 2}%</span>
                </div>
              </div>

              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('#8b5cf6')}>
                  <Users size={24} weight="duotone" />
                </div>
                <div style={S.metricContent}>
                  <p style={S.metricLabel}>Students</p>
                  <h2 style={{...S.metricValue, color: '#8b5cf6'}}>{students.length}</h2>
                  <span style={S.metricTrend}>+{Math.floor(students.length * 0.15) || 5}%</span>
                </div>
              </div>

              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('#a78bfa')}>
                  <Buildings size={24} weight="duotone" />
                </div>
                <div style={S.metricContent}>
                  <p style={S.metricLabel}>Classes</p>
                  <h2 style={{...S.metricValue, color: '#a78bfa'}}>{classes.length}</h2>
                  <span style={S.metricTrend}>Avg {classAverageSize} students</span>
                </div>
              </div>

              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('#c084fc')}>
                  <BookOpen size={24} weight="duotone" />
                </div>
                <div style={S.metricContent}>
                  <p style={S.metricLabel}>Active Courses</p>
                  <h2 style={{...S.metricValue, color: '#c084fc'}}>{totalActiveCourses}</h2>
                  <span style={S.metricTrend}>{courses.length - totalActiveCourses} inactive</span>
                </div>
              </div>

              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('#f472b6')}>
                  <UserPlus size={24} weight="duotone" />
                </div>
                <div style={S.metricContent}>
                  <p style={S.metricLabel}>Pending</p>
                  <h2 style={{...S.metricValue, color: '#f472b6'}}>{pendingCount}</h2>
                  <span style={S.metricTrend}>Awaiting approval</span>
                </div>
              </div>

              <div style={S.metricCard} className="metric-card">
                <div style={S.metricIconWrapper('#60a5fa')}>
                  <TrendUp size={24} weight="duotone" />
                </div>
                <div style={S.metricContent}>
                  <p style={S.metricLabel}>Teacher:Student</p>
                  <h2 style={{...S.metricValue, color: '#60a5fa'}}>{teacherStudentRatio}</h2>
                  <span style={S.metricTrend}>Ratio</span>
                </div>
              </div>
            </div>

            {/* Chart with real data */}
            <div style={S.chartCard}>
              <div style={S.chartHeader}>
                <div>
                  <h3 style={S.chartTitle}>Department Engagement</h3>
                  <p style={S.chartSubtitle}>Weekly activity based on real-time data</p>
                </div>
                <div style={S.chartControls}>
                  <Pulse size={20} color="#7c3aed" weight="duotone" />
                  <span style={S.chartLive}>LIVE</span>
                </div>
              </div>
              <div style={{ height: '300px' }}><canvas ref={chartRef}></canvas></div>
            </div>

            {/* Quick Actions and Recent Activity */}
            <div style={S.bottomGrid}>
              {/* Quick Actions */}
              <div style={S.quickActionsCard}>
                <h4 style={S.sectionTitle}>Quick Actions</h4>
                <div style={S.actionsGrid}>
                  <button style={S.actionButton} className="action-btn" onClick={() => { setActiveTab('teachers'); setShowAddModal(true); }}>
                    <UserPlus size={20} /> Add Teacher
                  </button>
                  <button style={S.actionButton} className="action-btn" onClick={() => { setActiveTab('students'); setShowAddModal(true); }}>
                    <Users size={20} /> Add Student
                  </button>
                  <button style={S.actionButton} className="action-btn" onClick={() => { setActiveTab('classes'); setShowAddModal(true); }}>
                    <Buildings size={20} /> New Class
                  </button>
                  <button style={S.actionButton} className="action-btn" onClick={() => { setActiveTab('courses'); setShowAddModal(true); }}>
                    <BookOpen size={20} /> New Course
                  </button>
                </div>
              </div>

              {/* Recent Activity with timestamps */}
              <div style={S.recentActivityCard}>
                <div style={S.sectionHeader}>
                  <h4 style={S.sectionTitle}>Recent Activity</h4>
                  <Bell size={16} color="#64748b" />
                </div>
                <div style={S.activityList}>
                  {logs.slice(0, 5).map((log, i) => (
                    <div key={i} style={S.activityItem}>
                      <div style={S.activityIcon}>
                        <Clock size={12} color="#7c3aed" />
                      </div>
                      <div style={S.activityContent}>
                        <p style={S.activityText}>{log.action}</p>
                        <span style={S.activityTime}>
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
          <div style={S.tableCard} className="table-container animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>{activeTab}</h2>
                <p style={S.tableSubtitle}>
                  {getTableData().length} {activeTab} total
                </p>
              </div>
              <div style={S.tableActions}>
                {activeTab !== 'pending' && activeTab !== 'timetable' && activeTab !== 'history' && (
                  <button onClick={() => setShowAddModal(true)} style={S.addBtn} className="add-btn">
                    <Plus size={18} weight="bold" /> Add New
                  </button>
                )}
                {activeTab === 'timetable' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={S.tabToggle}>
                      <button 
                        onClick={() => setTimetableView('schedule')}
                        style={{...S.toggleItem, ...(timetableView === 'schedule' ? S.toggleActive : {})}}
                      >Schedule</button>
                      <button 
                        onClick={() => setTimetableView('history')}
                        style={{...S.toggleItem, ...(timetableView === 'history' ? S.toggleActive : {})}}
                      >History</button>
                    </div>
                    <button onClick={() => setShowTimetableModal(true)} style={S.addBtn} className="add-btn">
                      <Plus size={18} weight="bold" /> Add Entry
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              {activeTab === 'timetable' ? (
                timetableView === 'schedule' ? (
                  <div style={S.timetableMatrixContainer}>
                    <div style={S.timetableGrid}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} style={S.dayColumn}>
                          <h4 style={S.dayTitle}>{day}</h4>
                          <div style={S.dayEntries}>
                            {timetables.filter(t => t.day_of_week === day).map(entry => (
                              <div key={entry.id} style={{
                                ...S.timetableEntry,
                                borderLeft: `4px solid #7c3aed`,
                                background: '#fff'
                              }}>
                                <div style={S.entryMain}>
                                  <p style={S.entryCourse}>{entry.course_title}</p>
                                  <p style={S.entryMeta}>
                                    <Clock size={12} weight="fill" color="#7c3aed" /> {entry.start_time} - {entry.end_time}
                                  </p>
                                  <div style={S.entryBadgeContainer}>
                                    <span style={S.entryMiniBadge}><Buildings size={10} /> {entry.class_name}</span>
                                    <span style={S.entryMiniBadge}><ChalkboardTeacher size={10} /> {entry.teacher_name}</span>
                                  </div>
                                  <p style={{...S.entryDetail, marginTop: '4px'}}>Room: {entry.room_number || 'TBD'}</p>
                                </div>
                                <button 
                                  style={S.entryDelete} 
                                  onClick={() => handleDeleteTimetable(entry.id)}
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            ))}
                            {timetables.filter(t => t.day_of_week === day).length === 0 && (
                              <p style={S.noEntries}>Free Day</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={S.historyLogContainer}>
                    {timetableHistory.length > 0 ? (
                      <div style={S.historyList}>
                        {timetableHistory.map((h, i) => (
                          <div key={i} style={S.historyItem}>
                            <div style={S.historyDateBadge}>
                              <span style={S.hDateDay}>{new Date(h.date).getDate()}</span>
                              <span style={S.hDateMonth}>{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div style={S.historyContent}>
                              <div style={S.hRow}>
                                <h4 style={S.hTitle}>{h.course_title}</h4>
                                <span style={S.hStatusBadge}>COMPLETED</span>
                              </div>
                              <p style={S.hSub}>Class: <strong>{h.class_name} ({h.section})</strong> • Instructor: <strong>{h.teacher_name}</strong></p>
                              <div style={S.hMeta}>
                                <span style={S.hMetaItem}><Users size={14} /> {h.student_count} students attended</span>
                                <span style={S.hMetaItem}><Clock size={14} /> Session logged on {new Date(h.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={S.emptyState}>
                        <Clock size={48} weight="duotone" />
                        <p>No class history found. History is generated when teachers mark attendance.</p>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <table style={S.table}>
                  <thead>
                    <tr style={S.tableHeadRow}>
                      <th style={S.th}>
                        {activeTab === 'lab_reports' ? 'STUDENT / LAB' : 'NAME / TITLE'}
                      </th>
                      {activeTab === 'students' && <th style={S.th}>ROLL NO</th>}
                      {activeTab === 'students' && <th style={S.th}>SEM</th>}
                      {activeTab === 'lab_reports' && <th style={S.th}>DATE</th>}
                      {(activeTab === 'labs') && <th style={S.th}>URL</th>}
                      <th style={S.th}>
                        {activeTab === 'lab_reports' ? 'DURATION' : 'EMAIL / DETAIL'}
                      </th>
                      {(activeTab === 'classes' || activeTab === 'courses') && <th style={S.th}>TEACHER</th>}
                      {activeTab === 'courses' && <th style={S.th}>STATUS</th>}
                      <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTableData().map(item => (
                      <tr key={item.id} style={S.tableRow}>
                        <td style={S.tdName}>
                          {activeTab === 'lab_reports' ? (
                            <>
                              {item.student_name}
                              <div style={{fontSize: '11px', color: '#64748b'}}>{item.lab_name}</div>
                            </>
                          ) : (
                            item.name || item.title
                          )}
                        </td>
                        {activeTab === 'students' && <td style={S.td}>{item.roll_number || <span style={{color: '#94a3b8'}}>Pending</span>}</td>}
                        {activeTab === 'students' && <td style={S.td}>{item.semester || 1}</td>}
                        {activeTab === 'lab_reports' && <td style={S.td}>{new Date(item.date).toLocaleDateString()}</td>}
                        {activeTab === 'labs' && <td style={S.td}>{item.url || '—'}</td>}
                        <td style={S.td}>
                          {activeTab === 'lab_reports' ? (
                            `${item.time_spent || 0} mins`
                          ) : (
                            item.email || item.section || (item.description || '').substring(0, 40)
                          )}
                        </td>
                        {(activeTab === 'classes' || activeTab === 'courses') && <td style={S.td}>{item.teacher_name || '—'}</td>}
                        {activeTab === 'courses' && (
                          <td style={S.td}>
                            <span style={{
                              ...S.statusBadge,
                              background: item.status === 'active' ? '#dcfce7' : '#fee2e2',
                              color: item.status === 'active' ? '#166534' : '#991b1b'
                            }}>
                              {item.status || 'active'}
                            </span>
                          </td>
                        )}
                        <td style={{...S.td, textAlign: 'right'}}>
                          {activeTab === 'pending' ? (
                            <div style={S.actionGroup}>
                              <button 
                                style={S.approveBtn} 
                                className="approve-btn"
                                onClick={() => handleApprove(item.id, item.name)}
                              >
                                <CheckCircle size={14} weight="fill" /> Approve
                              </button>
                              <button 
                                style={S.rejectBtn} 
                                className="reject-btn"
                                onClick={() => handleReject(item.id, item.name)}
                              >
                                <XCircle size={14} weight="fill" /> Reject
                              </button>
                            </div>
                          ) : (
                            <div style={S.actionGroup}>
                              {activeTab === 'courses' && (
                                <button 
                                  style={{...S.iconBtn, color: '#22c55e'}} 
                                  title="Complete Course"
                                  onClick={() => handleUpdateCourseStatus(item.id, 'completed')}
                                >
                                  <Check size={16} weight="bold" />
                                </button>
                              )}
                              {activeTab === 'history' && (
                                <>
                                  <button 
                                    style={{...S.iconBtn, color: '#7c3aed'}} 
                                    title="Re-activate Course"
                                    onClick={() => handleUpdateCourseStatus(item.id, 'active')}
                                  >
                                    <ArrowsCounterClockwise size={16} weight="bold" />
                                  </button>
                                  <button 
                                    style={{...S.iconBtn, color: '#22c55e'}} 
                                    title="Generate Report"
                                    onClick={() => handleGenerateReport(item.id, item.title)}
                                  >
                                    <ChartBar size={16} weight="bold" />
                                  </button>
                                </>
                              )}
                              {activeTab === 'classes' && (
                                <button 
                                  style={{...S.iconBtn, color: '#7c3aed'}} 
                                  title="Add Course to this Class"
                                  onClick={() => {
                                    setActiveTab('courses');
                                    setNewCourse(prev => ({ ...prev, class_id: item.id }));
                                    setShowAddModal(true);
                                  }}
                                >
                                  <Plus size={16} weight="bold" />
                                </button>
                              )}
                              <button 
                                style={S.iconBtn} 
                                onClick={() => { setEditingItem(item); setShowAddModal(true); }}
                              >
                                <PencilSimple size={16} />
                              </button>
                              <button 
                                style={S.deleteBtn} 
                                onClick={() => handleDelete(item.id, activeTab === 'history' ? 'course' : singularTab(activeTab))}
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CLOUD LABS ANALYTICS */}
        {activeTab === 'lab_usage' && (
          <div style={S.tableCard} className="table-container animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>
                  <Flask size={28} weight="duotone" color="#7c3aed" style={{verticalAlign:'middle', marginRight:'12px'}} />
                  Cloud Lab Analytics
                </h2>
                <p style={S.tableSubtitle}>Unified view of lab usage across departments</p>
              </div>
            </div>
            
            <table style={S.table}>
              <thead>
                <tr style={S.tableHeadRow}>
                  <th style={S.th}>STUDENT</th>
                  <th style={S.th}>LAB NAME</th>
                  <th style={S.th}>DATE</th>
                  <th style={S.th}>DURATION</th>
                  <th style={S.th}>STATUS</th>
                  <th style={S.th}>SUBMISSION</th>
                </tr>
              </thead>
              <tbody>
                {labUsage.map((usage, idx) => (
                  <tr key={idx} style={S.tableRow}>
                    <td style={S.tdName}>
                      {usage.student_name} <br/>
                      <span style={{fontSize: '11px', color: '#64748b'}}>{usage.roll_number}</span>
                    </td>
                    <td style={S.td}>{usage.lab_name}</td>
                    <td style={S.td}>{new Date(usage.date).toLocaleDateString()}</td>
                    <td style={S.td}>{usage.time_spent || 0} mins</td>
                    <td style={S.td}>
                      <span style={{
                        ...S.statusBadge,
                        background: usage.end_time ? '#dcfce7' : '#fef3c7',
                        color: usage.end_time ? '#166534' : '#92400e'
                      }}>
                        {usage.end_time ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td style={S.td}>
                      {usage.submission_code ? (
                        <button 
                          onClick={() => {
                            const newWin = window.open('', '_blank');
                            newWin.document.write(`
                              <html>
                                <head>
                                  <title>Submission: ${usage.lab_name}</title>
                                  <style>
                                    body { background: #1e293b; color: #f8fafc; font-family: monospace; padding: 20px; }
                                    pre { background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; white-space: pre-wrap; word-wrap: break-word; }
                                  </style>
                                </head>
                                <body>
                                  <h2>Lab: ${usage.lab_name}</h2>
                                  <p>Student: ${usage.student_name} (${usage.roll_number})</p>
                                  <hr/>
                                  <pre>${usage.submission_code}</pre>
                                </body>
                              </html>
                            `);
                          }}
                          style={{
                            background: '#7c3aed',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          View Code
                        </button>
                      ) : (
                        <span style={{color: '#94a3b8', fontSize: '11px'}}>No Submission</span>
                      )}
                    </td>
                  </tr>
                ))}
                {labUsage.length === 0 && (
                  <tr>
                    <td colSpan="6" style={S.emptyTableCell}>No lab usage history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* FEEDBACK ANALYTICS */}
        {activeTab === 'feedback' && (
          <div className="animate-fadeIn">
            <div style={{...S.tableCard, marginBottom: '24px'}}>
              <div style={S.tableHeader}>
                <div>
                  <h2 style={S.tableTitle}>📈 Course Quality Metrics</h2>
                  <p style={S.tableSubtitle}>Monitoring training standards through student feedback</p>
                </div>
              </div>
              
              <div style={{padding: '24px'}}>
                {courseFeedbackAnalytics.length > 0 ? (
                  <div style={{height: '350px'}}>
                    <canvas ref={el => {
                      if (el) {
                        const ctx = el.getContext('2d');
                        if (el.chart) el.chart.destroy();
                        el.chart = new Chart(ctx, {
                          type: 'bar',
                          data: {
                            labels: courseFeedbackAnalytics.map(a => a.title),
                            datasets: [{
                              label: 'Average Rating',
                              data: courseFeedbackAnalytics.map(a => parseFloat(a.avg_rating).toFixed(1)),
                              backgroundColor: '#7c3aed',
                              borderRadius: 8,
                              barThickness: 40
                            }]
                          },
                          options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: { beginAtZero: true, max: 5 }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }
                        });
                      }
                    }}></canvas>
                  </div>
                ) : (
                  <div style={S.emptyState}>No feedback data available for courses yet.</div>
                )}
              </div>
            </div>

            <div style={S.tableCard}>
              <div style={S.tableHeader}>
                <div>
                  <h2 style={S.tableTitle}>Feedback Details</h2>
                  <p style={S.tableSubtitle}>Breakdown by course and rating count</p>
                </div>
              </div>
              <table style={S.table}>
                <thead>
                  <tr style={S.tableHeadRow}>
                    <th style={S.th}>COURSE</th>
                    <th style={S.th}>AVERAGE RATING</th>
                    <th style={S.th}>TOTAL FEEDBACKS</th>
                    <th style={S.th}>QUALITY STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {courseFeedbackAnalytics.map((item, idx) => (
                    <tr key={idx} style={S.tableRow}>
                      <td style={S.tdName}>{item.title}</td>
                      <td style={S.td}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Star size={16} color="#f59e0b" weight="fill" />
                          {parseFloat(item.avg_rating).toFixed(1)} / 5.0
                        </div>
                      </td>
                      <td style={S.td}>{item.feedback_count} reviews</td>
                      <td style={S.td}>
                        <span style={{
                          ...S.statusBadge,
                          background: parseFloat(item.avg_rating) >= 4 ? '#dcfce7' : parseFloat(item.avg_rating) >= 3 ? '#fef3c7' : '#fee2e2',
                          color: parseFloat(item.avg_rating) >= 4 ? '#166534' : parseFloat(item.avg_rating) >= 3 ? '#92400e' : '#991b1b'
                        }}>
                          {parseFloat(item.avg_rating) >= 4 ? 'Excellent' : parseFloat(item.avg_rating) >= 3 ? 'Good' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LAB FEEDBACK ANALYTICS */}
            <div style={{...S.tableCard, marginTop: '24px', marginBottom: '24px'}}>
              <div style={S.tableHeader}>
                <div>
                  <h2 style={S.tableTitle}>🔬 Lab Quality Metrics</h2>
                  <p style={S.tableSubtitle}>Student feedback on cloud labs performance and utility</p>
                </div>
              </div>
              
              <div style={{padding: '24px'}}>
                {labFeedbackAnalytics.length > 0 ? (
                  <div style={{height: '350px'}}>
                    <canvas ref={el => {
                      if (el) {
                        const ctx = el.getContext('2d');
                        if (el.chart) el.chart.destroy();
                        el.chart = new Chart(ctx, {
                          type: 'bar',
                          data: {
                            labels: labFeedbackAnalytics.map(a => a.title),
                            datasets: [{
                              label: 'Average Lab Rating',
                              data: labFeedbackAnalytics.map(a => parseFloat(a.avg_rating).toFixed(1)),
                              backgroundColor: '#8b5cf6',
                              borderRadius: 8,
                              barThickness: 40
                            }]
                          },
                          options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: { beginAtZero: true, max: 5 }
                            },
                            plugins: {
                              legend: { display: false }
                            }
                          }
                        });
                      }
                    }}></canvas>
                  </div>
                ) : (
                  <div style={S.emptyState}>No feedback data available for labs yet.</div>
                )}
              </div>
            </div>

            <div style={S.tableCard}>
              <div style={S.tableHeader}>
                <div>
                  <h2 style={S.tableTitle}>Lab Feedback Details</h2>
                  <p style={S.tableSubtitle}>Ratings summary per cloud lab</p>
                </div>
              </div>
              <table style={S.table}>
                <thead>
                  <tr style={S.tableHeadRow}>
                    <th style={S.th}>LAB NAME</th>
                    <th style={S.th}>AVERAGE RATING</th>
                    <th style={S.th}>TOTAL FEEDBACKS</th>
                    <th style={S.th}>QUALITY STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {labFeedbackAnalytics.map((item, idx) => (
                    <tr key={idx} style={S.tableRow}>
                      <td style={S.tdName}>{item.title}</td>
                      <td style={S.td}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                          <Star size={16} color="#f59e0b" weight="fill" />
                          {parseFloat(item.avg_rating).toFixed(1)} / 5.0
                        </div>
                      </td>
                      <td style={S.td}>{item.feedback_count} reviews</td>
                      <td style={S.td}>
                        <span style={{
                          ...S.statusBadge,
                          background: parseFloat(item.avg_rating) >= 4 ? '#dcfce7' : parseFloat(item.avg_rating) >= 3 ? '#fef3c7' : '#fee2e2',
                          color: parseFloat(item.avg_rating) >= 4 ? '#166534' : parseFloat(item.avg_rating) >= 3 ? '#92400e' : '#991b1b'
                        }}>
                          {parseFloat(item.avg_rating) >= 4 ? 'Excellent' : parseFloat(item.avg_rating) >= 3 ? 'Good' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {labFeedbackAnalytics.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{...S.td, textAlign: 'center', padding: '24px', color: '#94a3b8'}}>No lab feedback data matches the selected criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COURSE REPORTS */}
        {activeTab === 'course_reports' && (
          <div style={S.tableCard} className="animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>📊 Course Completion Reports</h2>
                <p style={S.tableSubtitle}>{campusReports.length} report{campusReports.length !== 1 ? 's' : ''} for your department</p>
              </div>
            </div>
            {reportsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading reports...</div>
            ) : campusReports.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                <p>No reports yet. Reports auto-generate when a teacher marks a course complete.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr style={S.tableHeadRow}>
                      <th style={S.th}>COURSE</th>
                      <th style={S.th}>CLASS</th>
                      <th style={S.th}>TEACHER</th>
                      <th style={S.th}>STUDENTS</th>
                      <th style={S.th}>AVG MARKS</th>
                      <th style={S.th}>ATTENDANCE</th>
                      <th style={S.th}>PASS / FAIL</th>
                      <th style={S.th}>ASSIGNMENTS</th>
                      <th style={S.th}>COMPLETED ON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campusReports.map(r => (
                      <tr 
                        key={r.id} 
                        style={{...S.tableRow, cursor: 'pointer'}} 
                        onClick={() => fetchReportDetails(r)}
                      >
                        <td style={S.tdName}>
                          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <ChartBar size={18} color="#7c3aed" />
                            {r.course_title}
                          </div>
                        </td>
                        <td style={S.td}>{r.class_name}</td>
                        <td style={S.td}>{r.teacher_name}</td>
                        <td style={S.td}><strong>{r.total_students}</strong></td>
                        <td style={S.td}>
                          <span style={{
                            ...S.statusBadge,
                            padding: '4px 10px',
                            background: r.avg_marks >= 50 ? '#dcfce7' : '#fee2e2',
                            color: r.avg_marks >= 50 ? '#166534' : '#991b1b'
                          }}>
                            {parseFloat(r.avg_marks).toFixed(1)}%
                          </span>
                        </td>
                        <td style={S.td}>
                          <span style={{...S.statusBadge, padding: '4px 10px', background: '#dbeafe', color: '#1e40af'}}>
                            {parseFloat(r.avg_attendance).toFixed(1)}%
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                            <span style={{color:'#166534', fontWeight:700}}>{r.pass_count}✓</span>
                            <span style={{color:'#94a3b8'}}>|</span>
                            <span style={{color:'#ef4444', fontWeight:700}}>{r.fail_count}✗</span>
                          </div>
                        </td>
                        <td style={S.td}>{r.total_assignments}</td>
                        <td style={S.td}>{new Date(r.completed_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Panel - Enhanced */}
      <aside style={S.rightPanel} className="right-panel hidden-scrollbar">
        <div style={S.profileCard}>
          <div style={{...S.avatar, background: 'linear-gradient(135deg, #7c3aed, #a78bfa)'}}>
            {user.name.charAt(0)}
          </div>
          <h3 style={S.profileName}>{user.name}</h3>
          <span style={S.roleBadge}>HOD</span>
          
          <div style={S.profileStats}>
            <div style={S.profileStat}>
              <span style={S.profileStatLabel}>Teachers</span>
              <span style={S.profileStatValue}>{teachers.length}</span>
            </div>
            <div style={S.profileStat}>
              <span style={S.profileStatLabel}>Students</span>
              <span style={S.profileStatValue}>{students.length}</span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div style={S.section}>
          <div style={S.sectionHeader}>
            <h4 style={S.sectionTitle}>Top Performers</h4>
            <Star size={16} color="#f59e0b" weight="fill" />
          </div>
          <div style={S.performersList}>
            {teachers.slice(0, 3).map((teacher, i) => (
              <div key={i} style={S.performerItem}>
                <div style={S.performerAvatar}>{teacher.name.charAt(0)}</div>
                <div style={S.performerInfo}>
                  <p style={S.performerName}>{teacher.name}</p>
                  <span style={S.performerRole}>Teacher</span>
                </div>
                <div style={S.performerBadge}>
                  <Star size={12} color="#f59e0b" weight="fill" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        {pendingCount > 0 && (
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <h4 style={S.sectionTitle}>Pending Approvals</h4>
              <Warning size={16} color="#f97316" />
            </div>
            <div style={S.pendingList}>
              {pendingStudents.slice(0, 3).map((student, i) => (
                <div key={i} style={S.pendingItem}>
                  <div style={S.pendingAvatar}>{student.name.charAt(0)}</div>
                  <div style={S.pendingInfo}>
                    <p style={S.pendingName}>{student.name}</p>
                    <span style={S.pendingTime}>
                      {new Date(student.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {pendingCount > 3 && (
                <button style={S.viewAllBtn} onClick={() => setActiveTab('pending')}>
                  View all {pendingCount} pending
                </button>
              )}
            </div>
          </div>
        )}

        {/* System Health */}
        <div style={S.systemHealth}>
          <div style={S.healthItem}>
            <div style={S.healthLabel}>System Status</div>
            <div style={S.healthValue}>
              <span style={S.healthDot}></span>
              Operational
            </div>
          </div>
          <div style={S.healthItem}>
            <div style={S.healthLabel}>Refresh Rate</div>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={S.healthSelect}
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
            </select>
          </div>
        </div>
      </aside>

      {/* DETAILED REPORT MODAL */}
      {showReportModal && selectedReport && (
        <div style={S.modalOverlay} onClick={() => { setShowReportModal(false); setReportDetails(null); }} className="modal-overlay">
          <div style={{...S.modal, maxWidth: '800px', width: '95%'}} onClick={e => e.stopPropagation()} className="modal animate-slideUp">
            <div style={S.modalHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{width:'48px', height:'48px', borderRadius:'16px', background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', color:'#7c3aed'}}>
                  <ChartLine size={24} weight="duotone" />
                </div>
                <div>
                  <h2 style={S.modalTitle}>{selectedReport.course_title}</h2>
                  <p style={{margin:0, fontSize:'14px', color:'#64748b'}}>Detailed Academic Performance Report</p>
                </div>
              </div>
              <button style={S.modalClose} onClick={() => setShowReportModal(false)}>×</button>
            </div>
            
            <div style={{padding: '24px', maxHeight: '70vh', overflowY: 'auto'}} className="hidden-scrollbar">
              {isReportDetailsLoading ? (
                <div style={{textAlign:'center', padding:'40px', color:'#64748b'}}>Fetching detailed metrics...</div>
              ) : reportDetails ? (
                <>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'20px', marginBottom:'24px'}}>
                    <div style={{padding:'24px', borderRadius:'24px', background:'linear-gradient(135deg, #f5f7ff, #ffffff)', border:'1px solid #e0e7ff', boxShadow:'0 4px 12px rgba(79, 70, 229, 0.05)'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:700, letterSpacing:'0.05em'}}>AVERAGE MARKS</span>
                      <h3 style={{margin:'10px 0 0', fontSize:'28px', color:'#1e1b4b', fontWeight:800}}>{parseFloat(reportDetails.teacher_performance.avg_student_marks).toFixed(1)}%</h3>
                    </div>
                    <div style={{padding:'24px', borderRadius:'24px', background:'linear-gradient(135deg, #f0f9ff, #ffffff)', border:'1px solid #e0f2fe', boxShadow:'0 4px 12px rgba(14, 165, 233, 0.05)'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:700, letterSpacing:'0.05em'}}>ATTENDANCE</span>
                      <h3 style={{margin:'10px 0 0', fontSize:'28px', color:'#075985', fontWeight:800}}>{parseFloat(reportDetails.teacher_performance.avg_attendance).toFixed(1)}%</h3>
                    </div>
                    <div style={{padding:'24px', borderRadius:'24px', background:'linear-gradient(135deg, #f0fdf4, #ffffff)', border:'1px solid #dcfce7', boxShadow:'0 4px 12px rgba(34, 197, 94, 0.05)'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:700, letterSpacing:'0.05em'}}>PASS RATE</span>
                      <h3 style={{margin:'10px 0 0', fontSize:'28px', color:'#166534', fontWeight:800}}>
                        {Math.round((selectedReport.pass_count / selectedReport.total_students) * 100)}%
                      </h3>
                    </div>
                  </div>

                  <div style={{marginBottom:'24px', padding:'20px', borderRadius:'24px', background:'linear-gradient(135deg, #f5f3ff, #fdf4ff)', border:'1px solid #ddd6fe'}}>
                    <h3 style={{margin:'0 0 12px', fontSize:'16px', color:'#5b21b6', display:'flex', alignItems:'center', gap:'8px'}}>
                      <UserCircle size={20} /> Teacher Progress: {selectedReport.teacher_name}
                    </h3>
                    <div style={{display:'flex', gap:'24px', flexWrap: 'wrap'}}>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:600}}>RATING</span>
                        <div style={{display:'flex', alignItems:'center', gap:'4px', marginTop:'4px'}}>
                          <span style={{fontSize:'20px', fontWeight:700, color:'#5b21b6'}}>{reportDetails.teacher_performance.rating}</span>
                          <span style={{fontSize:'14px', color:'#a78bfa'}}>/ 5.0</span>
                        </div>
                      </div>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:600}}>FEEDBACKS</span>
                        <div style={{marginTop:'4px', fontSize:'18px', fontWeight:600, color:'#5b21b6'}}>
                          {reportDetails.teacher_performance.feedback_count} Students
                        </div>
                      </div>
                      <div style={{flex:1, textAlign:'right', minWidth:'150px'}}>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:600}}>OVERALL STATUS</span>
                        <div style={{marginTop:'4px'}}>
                          <span style={{padding:'4px 12px', borderRadius:'20px', background:'#fff', color:'#7c3aed', fontSize:'13px', fontWeight:700, border:'1px solid #ddd6fe'}}>
                            ACCOMPLISHED
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 style={{marginBottom:'16px', fontSize:'16px', color:'#1e293b'}}>🎓 Student-wise Performance</h3>
                  <div style={{border:'1px solid #e2e8f0', borderRadius:'20px', overflow:'hidden'}}>
                    <div style={{overflowX: 'auto'}}>
                      <table style={{width:'100%', borderCollapse:'collapse', minWidth:'500px'}}>
                        <thead>
                          <tr style={{background:'#f8fafc'}}>
                            <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b'}}>STUDENT NAME</th>
                            <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b'}}>MARKS (%)</th>
                            <th style={{padding:'12px 20px', textAlign:'right', fontSize:'12px', color:'#64748b'}}>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportDetails.students.map(s => (
                            <tr key={s.id} style={{borderTop:'1px solid #f1f5f9'}}>
                              <td style={{padding:'12px 20px', fontSize:'14px', fontWeight:600, color:'#0f172a'}}>{s.name}</td>
                              <td style={{padding:'12px 20px', fontSize:'14px', color:'#64748b'}}>
                                {s.marks_obtained ? `${s.marks_obtained} / ${s.max_marks} (${s.percentage}%)` : 'Not Graded'}
                              </td>
                              <td style={{padding:'12px 20px', textAlign:'right'}}>
                                {s.status === 'Pass' ? (
                                  <span style={{display:'inline-flex', alignItems:'center', gap:'4px', color:'#166534', fontWeight:700, fontSize:'13px'}}>
                                    <CheckCircle weight="fill" /> PASS
                                  </span>
                                ) : (
                                  <span style={{display:'inline-flex', alignItems:'center', gap:'4px', color:'#ef4444', fontWeight:700, fontSize:'13px'}}>
                                    <WarningCircle weight="fill" /> FAIL
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{textAlign:'center', padding:'60px 20px'}}>
                  <div style={{fontSize:'48px', marginBottom:'16px'}}>📊</div>
                  <h3 style={{color:'#1e293b', marginBottom:'8px'}}>No detailed records found</h3>
                  <p style={{color:'#64748b', fontSize:'14px', maxWidth:'400px', margin:'0 auto 24px'}}>
                    We couldn't find student-wise breakdowns or teacher feedback for this course report.
                  </p>
                  <button 
                    onClick={() => fetchReportDetails(selectedReport)}
                    style={{...S.cancelBtn, background:'#f1f5f9', padding:'10px 20px', fontSize:'14px'}}
                  >
                    🔄 Try Refreshing
                  </button>
                </div>
              )}
            </div>
            
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={() => { setShowReportModal(false); setReportDetails(null); }}>Close Report</button>
              <button style={{...S.submitBtn, background:'#4f46e5', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'}} onClick={() => window.print()}>🖨️ Export as PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Modal */}
      {showAddModal && (
        <div style={S.modalOverlay} onClick={() => { setShowAddModal(false); resetForms(); }} className="modal-overlay">
          <div style={S.modal} onClick={e => e.stopPropagation()} className="modal animate-slideUp">
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>
                {editingItem ? 'Edit' : 'Add New'} {singularTab(activeTab)}
              </h3>
              <button onClick={() => { setShowAddModal(false); resetForms(); }} style={S.modalClose}>
                ×
              </button>
            </div>
            <form onSubmit={handleAddSubmit} style={S.modalForm}>
              {activeTab === 'classes' ? (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Class Name</label>
                    <input 
                      placeholder="e.g., Grade 10" 
                      required 
                      value={editingItem ? editingItem.name : newClass.name} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewClass({...newClass, name: e.target.value})} 
                      style={S.input}
                    />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Section</label>
                    <input 
                      placeholder="e.g., A" 
                      required 
                      value={editingItem ? editingItem.section : newClass.section} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, section: e.target.value}) : setNewClass({...newClass, section: e.target.value})} 
                      style={S.input}
                    />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Academic Year</label>
                    <input 
                      placeholder="2024-2025" 
                      value={editingItem ? editingItem.academic_year : newClass.academic_year} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, academic_year: e.target.value}) : setNewClass({...newClass, academic_year: e.target.value})} 
                      style={S.input}
                    />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Assign Teacher</label>
                    <select 
                      value={editingItem ? editingItem.teacher_id : newClass.teacher_id} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, teacher_id: e.target.value}) : setNewClass({...newClass, teacher_id: e.target.value})} 
                      style={S.input}
                    >
                      <option value="">No Teacher</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </>
              ) : activeTab === 'labs' ? (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Lab Name</label>
                    <input 
                      placeholder="e.g. Linux Fundamentals" 
                      required 
                      value={editingItem ? editingItem.name : newLab.name} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewLab({...newLab, name: e.target.value})} 
                      style={S.input}
                    />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Lab Environment</label>
                    <select 
                      required 
                      value={editingItem ? editingItem.environment : newLab.environment} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, environment: e.target.value}) : setNewLab({...newLab, environment: e.target.value})} 
                      style={S.input}
                    >
                      <option value="Python">Python Environment</option>
                      <option value="Node.js">Node.js Environment</option>
                      <option value="MySQL">MySQL Database</option>
                      <option value="React">React Framework</option>
                      <option value="Custom">Custom Link</option>
                    </select>
                  </div>
                  {((editingItem ? editingItem.environment : newLab.environment) || '').toLowerCase() === 'custom' && (
                    <div style={S.inputGroup}>
                      <label style={S.inputLabel}>Lab Link / URL</label>
                      <input 
                        placeholder="https://example.com/lab" 
                        required 
                        value={editingItem ? editingItem.url : newLab.url} 
                        onChange={e => editingItem ? setEditingItem({...editingItem, url: e.target.value}) : setNewLab({...newLab, url: e.target.value})} 
                        style={S.input}
                      />
                    </div>
                  )}
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Assign to Class</label>
                    <select 
                      required 
                      value={editingItem ? editingItem.class_id : newLab.classId} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, class_id: e.target.value}) : setNewLab({...newLab, classId: e.target.value})} 
                      style={S.input}
                    >
                      <option value="">Select a Class...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                    </select>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Select Icon</label>
                    <select 
                      value={editingItem ? editingItem.icon : newLab.icon} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, icon: e.target.value}) : setNewLab({...newLab, icon: e.target.value})} 
                      style={S.input}
                    >
                      {['🔬', '🐧', '⚛️', '🗄️', '🛡️', '💻', '🐍', '🚀'].map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Description</label>
                    <textarea 
                      placeholder="What students will learn..." 
                      value={editingItem ? editingItem.description : newLab.description} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewLab({...newLab, description: e.target.value})} 
                      style={{...S.input, height: '80px', resize: 'vertical'}}
                    />
                  </div>
                </>
              ) : activeTab === 'courses' ? (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Course Title</label>
                    <input 
                      placeholder="e.g., Mathematics 101" 
                      required 
                      value={editingItem ? editingItem.title : newCourse.title} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, title: e.target.value}) : setNewCourse({...newCourse, title: e.target.value})} 
                      style={S.input}
                    />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Description</label>
                    <textarea 
                      placeholder="Course description..." 
                      value={editingItem ? editingItem.description : newCourse.description} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewCourse({...newCourse, description: e.target.value})} 
                      style={{...S.input, height: '100px', resize: 'vertical'}}
                    />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Class (Required)</label>
                    <select 
                      required
                      value={editingItem ? editingItem.class_id : newCourse.class_id} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, class_id: e.target.value}) : setNewCourse({...newCourse, class_id: e.target.value})} 
                      style={S.input}
                    >
                      <option value="">Select a Class...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                    </select>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Assign Teacher</label>
                    <select 
                      value={editingItem ? editingItem.teacher_id : newCourse.teacher_id} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, teacher_id: e.target.value}) : setNewCourse({...newCourse, teacher_id: e.target.value})} 
                      style={S.input}
                    >
                      <option value="">No Teacher</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Full Name</label>
                    <input 
                      placeholder="e.g., John Doe" 
                      required 
                      value={editingItem ? editingItem.name : newPerson.name} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewPerson({...newPerson, name: e.target.value})} 
                      style={S.input}
                    />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Email Address</label>
                    <input 
                      placeholder="email@example.com" 
                      required 
                      type="email" 
                      value={editingItem ? editingItem.email : newPerson.email} 
                      onChange={e => editingItem ? setEditingItem({...editingItem, email: e.target.value}) : setNewPerson({...newPerson, email: e.target.value})} 
                      style={S.input}
                    />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Password</label>
                    <input 
                      placeholder="••••••••" 
                      required={!editingItem} 
                      type="password" 
                      value={newPerson.password} 
                      onChange={e => setNewPerson({...newPerson, password: e.target.value})} 
                      style={S.input}
                    />
                  </div>
                  {activeTab === 'students' && (
                    <div style={S.inputGroup}>
                      <label style={S.inputLabel}>Semester</label>
                      <select 
                        required 
                        value={editingItem ? editingItem.semester : newPerson.semester} 
                        onChange={e => editingItem ? setEditingItem({...editingItem, semester: e.target.value}) : setNewPerson({...newPerson, semester: e.target.value})} 
                        style={S.input}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); resetForms(); }} style={S.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={S.saveBtn}>
                  {editingItem ? 'Update' : 'Add'} {singularTab(activeTab)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Timetable Modal */}
      {showTimetableModal && (
        <div style={S.modalOverlay} onClick={() => { setShowTimetableModal(false); resetForms(); }}>
          <div style={{...S.modal, width: '600px'}} onClick={e => e.stopPropagation()} className="animate-slideUp">
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>Add Timetable Entry</h3>
              <button onClick={() => { setShowTimetableModal(false); resetForms(); }} style={S.modalClose}>×</button>
            </div>
            <form onSubmit={handleTimetableSubmit} style={S.modalForm}>
              <div style={S.row}>
                <div style={S.flex1}>
                  <label style={S.inputLabel}><Buildings size={14} /> Target Class</label>
                  <select 
                    required 
                    value={newTimetableEntry.class_id} 
                    onChange={e => {
                      const classId = e.target.value;
                      setNewTimetableEntry({...newTimetableEntry, class_id: classId, course_id: '', teacher_id: ''});
                    }} 
                    style={S.input}
                  >
                    <option value="">Select Class...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
                  </select>
                </div>
                <div style={S.flex1}>
                  <label style={S.inputLabel}><BookOpen size={14} /> Subject / Course</label>
                  <select 
                    required 
                    disabled={!newTimetableEntry.class_id}
                    value={newTimetableEntry.course_id} 
                    onChange={e => {
                      const courseId = e.target.value;
                      const course = courses.find(c => c.id === parseInt(courseId));
                      setNewTimetableEntry({
                        ...newTimetableEntry, 
                        course_id: courseId, 
                        teacher_id: course ? course.teacher_id : ''
                      });
                    }} 
                    style={S.input}
                  >
                    <option value="">Select Course...</option>
                    {courses.filter(c => c.class_id === parseInt(newTimetableEntry.class_id)).map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={S.inputGroup}>
                <label style={S.inputLabel}><ChalkboardTeacher size={14} /> Assigned Instructor</label>
                <select disabled value={newTimetableEntry.teacher_id} style={{...S.input, background: '#f8fafc', border: '1px dashed #e2e8f0'}}>
                  <option value="">Teacher will be assigned automatically</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div style={S.row}>
                <div style={S.flex1}>
                   <label style={S.inputLabel}><CalendarBlank size={14} /> Scheduled Day</label>
                   <select 
                    style={S.input}
                    value={newTimetableEntry.day_of_week}
                    onChange={e => setNewTimetableEntry({...newTimetableEntry, day_of_week: e.target.value})}
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div style={S.flex1}>
                  <label style={S.inputLabel}><Flask size={14} /> Room / Lab</label>
                  <input 
                    placeholder="e.g. 101 or Lab A" 
                    style={S.input}
                    value={newTimetableEntry.room_number}
                    onChange={e => setNewTimetableEntry({...newTimetableEntry, room_number: e.target.value})}
                  />
                </div>
              </div>

              <div style={S.row}>
                <div style={S.flex1}>
                  <label style={S.inputLabel}><Clock size={14} /> Start Time</label>
                  <input type="time" required value={newTimetableEntry.start_time} onChange={e => setNewTimetableEntry({...newTimetableEntry, start_time: e.target.value})} style={S.input} />
                </div>
                <div style={S.flex1}>
                  <label style={S.inputLabel}><Clock size={14} /> End Time</label>
                  <input type="time" required value={newTimetableEntry.end_time} onChange={e => setNewTimetableEntry({...newTimetableEntry, end_time: e.target.value})} style={S.input} />
                </div>
              </div>

              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowTimetableModal(false); resetForms(); }} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Publish Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ENHANCED STYLES ====================
const S = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  // Animated Background Orbs (3 for more depth)
  bgOrb1: {
    position: 'fixed',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(124, 58, 237, 0.12), transparent 70%)',
    top: '-250px',
    left: '-250px',
    zIndex: 0,
    animation: 'float 25s infinite alternate ease-in-out',
  },

  bgOrb2: {
    position: 'fixed',
    width: '550px',
    height: '550px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 70% 70%, rgba(167, 139, 250, 0.12), transparent 70%)',
    bottom: '-200px',
    right: '-200px',
    zIndex: 0,
    animation: 'float 30s infinite alternate ease-in-out',
  },

  bgOrb3: {
    position: 'fixed',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 50% 50%, rgba(196, 181, 253, 0.1), transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
    animation: 'float 20s infinite alternate ease-in-out',
  },

  mobileMenuBtn: {
    position: 'fixed',
    top: '16px',
    left: '16px',
    zIndex: 1001,
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    display: 'none',
    boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.4)',
  },

  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #2e1065 0%, #4c1d95 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 20px',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '10px 0 30px -10px rgba(0,0,0,0.2)',
  },

  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '0 8px',
  },

  logoIcon: {
    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    padding: '10px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.4)',
  },

  logoText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },

  logoAccent: {
    color: '#c4b5fd',
    marginLeft: '2px',
  },

  principalBadge: {
    background: 'rgba(124, 58, 237, 0.2)',
    borderRadius: '30px',
    padding: '8px 16px',
    margin: '0 8px 24px 8px',
    fontSize: '12px',
    color: '#c4b5fd',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
  },

  liveIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    animation: 'pulse 1.5s infinite',
    position: 'absolute',
    right: '12px',
  },

  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  navBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#c4b5fd',
    fontWeight: '600',
    textAlign: 'left',
    fontSize: '15px',
    position: 'relative',
    transition: 'all 0.3s ease',
  },

  navBtnActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    color: '#fff',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
  },

  navBadge: {
    background: '#7c3aed',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '30px',
    fontSize: '11px',
    fontWeight: '700',
  },

  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    width: '4px',
    height: '50%',
    background: 'linear-gradient(180deg, #7c3aed, #a78bfa)',
    borderRadius: '0 4px 4px 0',
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 18px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    cursor: 'pointer',
    borderRadius: '16px',
    fontWeight: '700',
    fontSize: '15px',
    marginTop: '20px',
    transition: 'all 0.3s ease',
  },

  main: {
    flex: 1,
    padding: '48px',
    marginLeft: '280px',
    marginRight: '320px',
    overflowY: 'auto',
    zIndex: 5,
    position: 'relative',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },

  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    margin: 0,
    background: 'linear-gradient(135deg, #2e1065, #4c1d95)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },

  subtitle: {
    color: '#64748b',
    marginTop: '6px',
    fontSize: '1rem',
    fontWeight: '500',
  },

  dateBadge: {
    background: '#fff',
    padding: '12px 24px',
    borderRadius: '30px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  refreshBadge: {
    background: '#fff',
    padding: '12px 20px',
    borderRadius: '30px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  overviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },

  metricCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -2px rgba(0,0,0,0.05)',
  },

  metricIconWrapper: (color) => ({
    width: '52px',
    height: '52px',
    borderRadius: '18px',
    background: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
  }),

  metricContent: {
    flex: 1,
  },

  metricLabel: {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: '0.02em',
  },

  metricValue: {
    margin: '2px 0',
    fontSize: '1.8rem',
    fontWeight: '800',
  },

  metricTrend: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#22c55e',
    background: '#dcfce7',
    padding: '2px 8px',
    borderRadius: '30px',
    display: 'inline-block',
  },

  chartCard: {
    backgroundColor: '#fff',
    padding: '28px',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
  },

  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  chartTitle: {
    margin: 0,
    fontWeight: '700',
    fontSize: '1.2rem',
    color: '#0f172a',
  },

  chartSubtitle: {
    margin: '4px 0 0',
    fontSize: '0.85rem',
    color: '#64748b',
  },

  chartControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f1f5f9',
    padding: '6px 14px',
    borderRadius: '30px',
  },

  chartLive: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#7c3aed',
    letterSpacing: '0.05em',
  },

  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },

  quickActionsCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
  },

  recentActivityCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },

  sectionTitle: {
    margin: 0,
    fontWeight: '700',
    fontSize: '1rem',
    color: '#0f172a',
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },

  actionButton: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '12px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  activityItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },

  activityIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '8px',
    background: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityContent: {
    flex: 1,
  },

  activityText: {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1e293b',
  },

  activityTime: {
    fontSize: '0.7rem',
    color: '#94a3b8',
  },

  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
  },

  tableHeader: {
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
  },

  tableTitle: {
    margin: 0,
    fontWeight: '700',
    fontSize: '1.2rem',
    color: '#0f172a',
    textTransform: 'capitalize',
  },

  tableSubtitle: {
    margin: '4px 0 0',
    fontSize: '0.85rem',
    color: '#64748b',
  },

  tableActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  addBtn: {
    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 20px -8px rgba(124, 58, 237, 0.5)',
  },

  exportBtn: {
    background: '#f1f5f9',
    border: 'none',
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    transition: 'all 0.2s ease',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px',
  },

  tableHeadRow: {
    borderBottom: '1px solid #e2e8f0',
  },

  th: {
    padding: '18px 28px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
    textAlign: 'left',
  },

  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background 0.2s ease',
  },

  tdName: {
    padding: '20px 28px',
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '0.95rem',
  },

  td: {
    padding: '20px 28px',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
  },

  statusBadge: {
    padding: '4px 10px',
    borderRadius: '30px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    display: 'inline-block',
  },

  actionGroup: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },

  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  approveBtn: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '30px',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px -2px rgba(34, 197, 94, 0.3)',
  },

  rejectBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '30px',
    fontWeight: '600',
    fontSize: '0.8rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px -2px rgba(239, 68, 68, 0.3)',
  },

  rightPanel: {
    width: '320px',
    backgroundColor: '#fff',
    borderLeft: '1px solid #e2e8f0',
    padding: '40px 24px',
    position: 'fixed',
    right: 0,
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '-10px 0 30px -10px rgba(0,0,0,0.05)',
  },

  profileCard: {
    textAlign: 'center',
    background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
    padding: '32px 20px',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  },

  avatar: {
    width: '80px',
    height: '80px',
    color: '#fff',
    borderRadius: '28px',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '800',
    boxShadow: '0 15px 30px -10px rgba(124, 58, 237, 0.3)',
  },

  profileName: {
    margin: '0 0 8px',
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
  },

  roleBadge: {
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '700',
    background: '#ede9fe',
    color: '#6d28d9',
    display: 'inline-block',
  },

  profileStats: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-around',
  },

  profileStat: {
    textAlign: 'center',
  },

  profileStatLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
  },

  profileStatValue: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#7c3aed',
  },

  section: {
    marginTop: '24px',
  },

  performersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  performerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    background: '#f8fafc',
    borderRadius: '16px',
  },

  performerAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    background: '#7c3aed',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
  },

  performerInfo: {
    flex: 1,
  },

  performerName: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#0f172a',
  },

  performerRole: {
    fontSize: '0.7rem',
    color: '#64748b',
  },

  performerBadge: {
    padding: '4px 8px',
    background: '#fef3c7',
    borderRadius: '30px',
  },

  pendingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  pendingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    background: '#f8fafc',
    borderRadius: '16px',
  },

  pendingAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    background: '#f97316',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
  },

  pendingInfo: {
    flex: 1,
  },

  pendingName: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#0f172a',
  },

  pendingTime: {
    fontSize: '0.7rem',
    color: '#64748b',
  },

  viewAllBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    padding: '10px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#7c3aed',
    width: '100%',
    transition: 'all 0.2s ease',
  },

  systemHealth: {
    marginTop: '24px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '20px',
  },

  healthItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },

  healthLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
  },

  healthValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#22c55e',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  healthDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    animation: 'pulse 2s infinite',
  },

  healthSelect: {
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#7c3aed',
    background: '#fff',
    cursor: 'pointer',
  },

  // Timetable Toggles
  tabToggle: {
    display: 'flex',
    background: '#f1f5f9',
    padding: '4px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  toggleItem: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toggleActive: {
    background: '#fff',
    color: '#7c3aed',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },

  // Timetable Grid Matrix
  timetableMatrixContainer: {
    overflowX: 'auto',
    padding: '10px 0',
  },
  timetableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '20px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '24px',
    minWidth: '1200px',
  },

  dayColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minWidth: '160px',
  },

  dayTitle: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    padding: '10px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
  },

  dayEntries: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  timetableEntry: {
    background: '#fff',
    padding: '14px',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1px solid #f1f5f9',
    position: 'relative',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '120px',
  },

  entryMain: {
    flex: 1,
  },

  entryCourse: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0',
    lineHeight: '1.2',
  },

  entryMeta: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    margin: '0 0 10px 0',
  },

  entryBadgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  entryMiniBadge: {
    fontSize: '0.7rem',
    color: '#64748b',
    background: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: 'fit-content',
    fontWeight: '600',
  },

  entryDetail: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    margin: '0',
    fontWeight: '500',
  },

  // History Log Styles
  historyLogContainer: {
    padding: '20px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  historyItem: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    background: '#fff',
    borderRadius: '24px',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  historyDateBadge: {
    width: '60px',
    height: '60px',
    background: '#f5f3ff',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7c3aed',
    flexShrink: 0,
  },
  hDateDay: {
    fontSize: '1.2rem',
    fontWeight: '800',
    lineHeight: '1',
  },
  hDateMonth: {
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  historyContent: {
    flex: 1,
  },
  hRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  hTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  hStatusBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    background: '#dcfce7',
    color: '#166534',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  hSub: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0 0 12px 0',
  },
  hMeta: {
    display: 'flex',
    gap: '20px',
  },
  hMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    color: '#94a3b8',
    fontWeight: '600',
  },

  entryDelete: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    opacity: 0,
    transition: 'all 0.2s ease',
  },

  noEntries: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: '10px',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px dashed #e2e8f0',
  },

  // Modal Styles
  modalFooter: {
    padding: '20px 24px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    background: '#f8fafc',
  },
  submitBtn: {
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    color: '#fff',
  },
  modalOverlay: {

    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  },

  modal: {
    background: '#fff',
    padding: '40px',
    borderRadius: '40px',
    width: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 50px 70px -20px rgba(0,0,0,0.3)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },

  modalTitle: {
    fontWeight: '800',
    fontSize: '1.5rem',
    color: '#0f172a',
    letterSpacing: '-0.02em',
    margin: 0,
  },

  modalClose: {
    background: '#f1f5f9',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    transition: 'all 0.2s ease',
  },

  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  inputLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#475569',
    marginLeft: '4px',
  },

  input: {
    padding: '14px 18px',
    borderRadius: '20px',
    border: '2px solid #f1f5f9',
    outline: 'none',
    width: '100%',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },

  cancelBtn: {
    flex: 1,
    padding: '14px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: '700',
    color: '#64748b',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },

  saveBtn: {
    flex: 2,
    padding: '14px',
    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 10px 20px -8px rgba(124, 58, 237, 0.5)',
  },

  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: '#f8fafc',
  },

  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#7c3aed',
  },
};

// Inject global styles
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  @keyframes float {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(3%, 3%) scale(1.05); }
  }
  
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .metric-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px -10px rgba(124, 58, 237, 0.15);
    border-color: #c4b5fd;
  }

  tr:hover {
    background: #f8fafc;
  }

  .timetableEntry:hover .entryDelete {
    opacity: 1;
  }

  .metric-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px -10px rgba(79, 70, 229, 0.15);
    border-color: #cbd5e1;
  }

  tr:hover {
    background: #f8fafc;
  }

  .add-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px -8px rgba(124, 58, 237, 0.6);
  }

  .export-btn:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  .icon-btn:hover {
    background: #ede9fe;
    color: #7c3aed;
  }

  .delete-btn:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  .approve-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(34, 197, 94, 0.4);
  }

  .reject-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(239, 68, 68, 0.4);
  }

  .action-btn:hover {
    background: #ede9fe;
    border-color: #7c3aed;
    color: #7c3aed;
    transform: translateY(-2px);
  }

  .view-all-btn:hover {
    background: #7c3aed;
    color: #fff;
    border-color: #7c3aed;
  }

  input:focus, select:focus, textarea:focus {
    border-color: #7c3aed !important;
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1) !important;
    outline: none !important;
  }

  .cancel-btn:hover {
    background: #e2e8f0;
  }

  .save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 25px -8px rgba(124, 58, 237, 0.6);
  }

  .modal-close:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .logout-btn:hover {
    background: rgba(239, 68, 68, 0.2) !important;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease forwards;
  }

  .animate-slideUp {
    animation: slideUp 0.3s ease forwards;
  }

  /* Responsive handled by responsive.css */
`;
document.head.appendChild(style);

export default PrincipalDashboard;
