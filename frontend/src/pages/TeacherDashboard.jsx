import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../responsive.css'
import {
  House, BookOpen, PlusCircle, CheckCircle, GraduationCap,
  Clock, UserCircle, SignOut, CalendarBlank, Trash,
  List, ChalkboardTeacher, UserPlus, X, ClipboardText, Pulse, 
  PencilSimple, FileText, DotsThreeOutline, ChartLine, Users,
  Warning, Bell, Star, Download, Eye, EyeSlash, TrendUp, Chalkboard,
  ChatCircle, ChartBar, WarningCircle, Flask, Buildings, Check,
  ArrowLeft, Circle
} from "@phosphor-icons/react";
import { Chart } from "chart.js/auto";
import ClassAttendance from './ClassAttendance';
import Whiteboard from '../components/Whiteboard';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import LoadingSpinner from '../components/LoadingSpinner';
import API_BASE_URL from '../config/api';

function TeacherDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendanceData, setAttendanceData] = useState({})
  const [grades, setGrades] = useState([])
  const [timetable, setTimetable] = useState([])
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [newGrade, setNewGrade] = useState({ student_id: '', exam_type: 'midterm', marks_obtained: '', max_marks: 100, exam_date: '', remarks: '' })
  const [pendingEnrollments, setPendingEnrollments] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Assignment State
  const [assignments, setAssignments] = useState([])
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([])
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [gradingSubmission, setGradingSubmission] = useState(null)
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', 
    description: '', 
    course_id: '', 
    due_date: '', 
    max_marks: 100,
    status: 'published',
    assignment_type: 'Homework',
    academic_period: '2026-2027'
  })
  const [gradeData, setGradeData] = useState({ marks_obtained: '', feedback: '' })
  const [assignmentFilter, setAssignmentFilter] = useState('all')
  const [assignmentViewMode, setAssignmentViewMode] = useState('list') // 'list', 'submissions', 'create'
  const [selectedSubmissionStudent, setSelectedSubmissionStudent] = useState(null)
  const [stats, setStats] = useState({ total_courses: 0, total_students: 0, total_classes: 0, total_assignments: 0, total_graded: 0, total_pending: 0, recent_students: [] })

  // Reports State
  const [myReports, setMyReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportDetails, setReportDetails] = useState(null)
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false)
  
  // Lab Usage State
  const [labUsage, setLabUsage] = useState([])
  const [loadingLabs, setLoadingLabs] = useState(false)

  // Bulk Grading State
  const [showBulkGradeModal, setShowBulkGradeModal] = useState(false)
  const [bulkGradeHeader, setBulkGradeHeader] = useState({ exam_type: 'midterm', max_marks: 100, exam_date: new Date().toISOString().split('T')[0] })
  const [bulkGrades, setBulkGrades] = useState([]) // Array of { student_id, student_name, marks_obtained, remarks }

  // Chart references
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const token = sessionStorage.getItem('token')
  const { showToast } = useToast()
  
  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  })
  
  useEffect(() => {
    fetchTeacherCourses()
    fetchTimetable()
    fetchTeacherClasses()
    fetchStats()
    fetchPendingEnrollments()
    if (activePage === 'assignments') {
      fetchAssignments()
    }
    if (activePage === 'lab-usage') {
      fetchGlobalLabUsage()
    }
    if (activePage === 'reports') {
      fetchMyReports()
    }
  }, [activePage])

  const fetchGlobalLabUsage = async () => {
    setLoadingLabs(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/labs/usage/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setLabUsage(data.usage || [])
    } catch (error) { console.error('Error fetching lab usage:', error) }
    finally { setLoadingLabs(false) }
  }

  const fetchMyReports = async () => {
    setReportsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setMyReports(data.reports || [])
    } catch (e) { console.error(e) }
    setReportsLoading(false)
  }

  const handleGenerateReport = (courseId, courseTitle) => {
    setConfirmModal({
      isOpen: true,
      title: 'Complete Course',
      message: `Mark "${courseTitle}" as complete and generate its report?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`${API_BASE_URL}/api/reports/generate/${courseId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await res.json()
          if (data.success) {
            showToast(`Report generated for "${courseTitle}"!`, 'success');
            fetchTeacherCourses()
            fetchStats()
          } else {
            showToast(data.message || 'Error generating report', 'error');
          }
        } catch (e) {
          showToast('Error generating report', 'error');
        }
      },
      isDanger: false
    });
  }

  // Chart initialization for overview
  useEffect(() => {
    if (chartRef.current && activePage === "overview") {
      if (chartInstance.current) chartInstance.current.destroy();
      
      // Dynamic data based on actual counts
      const activityData = [
        stats.total_courses,
        stats.total_students,
        stats.total_classes,
        stats.total_assignments,
        stats.total_graded,
        stats.total_pending,
        stats.recent_students.length
      ];

      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            { 
              label: 'Activity', 
              data: activityData.slice(0, 7), 
              borderColor: '#4f46e5', 
              backgroundColor: 'rgba(79, 70, 229, 0.1)', 
              fill: true, 
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointBackgroundColor: '#4f46e5',
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
  }, [activePage, courses.length, students.length, teacherClasses.length, assignments.length, grades.length, timetable.length, pendingEnrollments.length]);

  // --- API Functions (Aapka Original Logic - Unchanged) ---
  const fetchTeacherCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setCourses(data.courses || [])
    } catch (error) { console.error(error) }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setStats(data.stats)
    } catch (error) { console.error('Error fetching stats:', error) }
  }

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timetables/my-timetable`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setTimetable(data.timetable || [])
    } catch (error) { console.error('Error:', error) }
  }


  const fetchTeacherClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/teacher/my-classes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setTeacherClasses(data.classes || [])
    } catch (error) { console.error(error) }
  }

  const fetchPendingEnrollments = async () => {
    setLoadingPending(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers/pending-enrollments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) { setPendingEnrollments(data.pendingEnrollments || []) }
    } catch (error) { console.error('Error fetching pending enrollments:', error) }
    finally { setLoadingPending(false) }
  }

  const handleApproveEnrollment = (enrollmentId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Enrollment',
      message: 'Are you sure you want to approve this enrollment request?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const response = await fetch(`${API_BASE_URL}/api/teachers/enrollments/${enrollmentId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success) { 
            showToast('Enrollment Approved', 'success'); 
            fetchPendingEnrollments(); 
            fetchStats(); 
          }
          else { 
            showToast(data.message || 'Error approving enrollment', 'error'); 
          }
        } catch (error) { 
          showToast('Error approving enrollment', 'error'); 
        }
      },
      isDanger: false
    });
  }

  const handleRejectEnrollment = (enrollmentId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Reject Enrollment',
      message: 'Are you sure you want to reject this enrollment request?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const response = await fetch(`${API_BASE_URL}/api/teachers/enrollments/${enrollmentId}/reject`, {
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success) { 
            showToast('Enrollment Rejected', 'success'); 
            fetchPendingEnrollments(); 
            fetchStats(); 
          }
          else { 
            showToast(data.message || 'Error rejecting enrollment', 'error'); 
          }
        } catch (error) { 
          showToast('Error rejecting enrollment', 'error'); 
        }
      },
      isDanger: true
    });
  }

  const handleCourseSelect = async (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId))
    setSelectedCourse(course)
    try {
      const url = selectedClassId
        ? `${API_BASE_URL}/api/courses/${courseId}/students?classId=${selectedClassId}`
        : `${API_BASE_URL}/api/courses/${courseId}/students`;

      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json()
      if (data.success) {
        setStudents(data.students)
        const initialData = {}
        data.students.forEach(s => initialData[s.id] = 'present')
        setAttendanceData(initialData)
      }
    } catch (error) { 
      console.error('Fetch students error:', error) 
    }
  }

  const fetchCourseGrades = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setGrades(data.grades || [])
    } catch (error) { console.error(error) }
  }

  const handleGradesCourseSelect = async (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId))
    setSelectedCourse(course)
    
    if (!courseId) {
      setStudents([])
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setStudents(data.students || [])
      } else {
        console.error('Failed to fetch students:', data.message);
        setStudents([])
      }
    } catch (error) { 
      console.error('Fetch students error for grades:', error)
      setStudents([])
    }
  }

  // --- ASSIGNMENT FUNCTIONS ---
  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assignments/my-assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setAssignments(data.assignments || [])
    } catch (error) { console.error(error) }
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem 
        ? `${API_BASE_URL}/api/assignments/${editingItem.id}` : `${API_BASE_URL}/api/assignments`;

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });
      const data = await response.json();
      if (data.success) {
        showToast(`Assignment ${editingItem ? 'updated' : 'created'}!`, 'success');
        setAssignmentViewMode('list');
        setNewAssignment({ 
          title: '', description: '', course_id: '', due_date: '', max_marks: 100,
          status: 'draft', assignment_type: 'Homework', academic_period: '2026-2027' 
        });
        setEditingItem(null);
        fetchAssignments();
      } else { 
        showToast(data.message || 'Error saving assignment', 'error');
      }
    } catch (error) { 
      showToast('Error saving assignment', 'error');
    }
  }

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/assignment/${assignmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setAssignmentSubmissions(data.submissions || [])
        setAssignmentViewMode('submissions')
        if (data.submissions && data.submissions.length > 0) {
          setSelectedSubmissionStudent(data.submissions[0])
          setGradeData({
            marks_obtained: data.submissions[0].marks_obtained || '',
            feedback: data.submissions[0].feedback || ''
          })
        }
      }
    } catch (error) { console.error(error) }
  }

  const handleBackToAssignments = () => {
    setAssignmentViewMode('list')
    setSelectedAssignment(null)
    setSelectedSubmissionStudent(null)
  }

  const handleGradeSubmission = async (e) => {

    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/${gradingSubmission.id}/grade`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      })
      const data = await response.json()
      if (data.success) {
        showToast('Graded successfully!', 'success');
        setGradingSubmission(null);
        fetchSubmissions(selectedAssignment.id);
      } else {
        showToast(data.message || 'Error grading submission', 'error');
      }
    } catch (error) { 
      showToast('Error grading submission', 'error');
    }
  }

  const handleDeleteAssignment = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Assignment',
      message: 'Are you sure you want to delete this assignment?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const response = await fetch(`${API_BASE_URL}/api/assignments/${id}`, {
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if(response.ok) { 
            fetchAssignments(); 
            showToast('Assignment Deleted', 'success'); 
          } else {
            showToast('Error deleting assignment', 'error');
          }
        } catch(err) { 
          showToast('Error deleting assignment', 'error'); 
        }
      },
      isDanger: true
    });
  }

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }))
  }

  const fetchClassCourses = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${classId}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) { console.error('Error fetching class courses:', error); }
  };

  const groupTimetableByDay = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const grouped = {}; days.forEach(day => grouped[day] = [])
    timetable.forEach(entry => { if (grouped[entry.day_of_week]) grouped[entry.day_of_week].push(entry) })
    return grouped
  }

  // Calculate stats
  const totalStudents = stats.total_students
  const totalCourses = stats.total_courses
  const totalClasses = stats.total_classes
  const pendingCount = stats.total_pending
  const totalAssignments = stats.total_assignments
  const displayCompletionRate = stats.total_assignments > 0 ? Math.min(100, Math.round((stats.total_graded / (stats.total_assignments || 1)) * 10)) : 0

  return (
    <div style={S.container}>
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

      {/* SIDEBAR */}
      <aside style={S.sidebar} className={`sidebar hidden-scrollbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={S.logoWrapper}>
          <span style={S.logoText}>HITech</span>
        </div>

        <div style={S.teacherBadge}>
          <ChalkboardTeacher size={14} weight="fill" />
          <span>Faculty Dashboard</span>
          <div style={S.liveIndicator}></div>
        </div>

        <nav style={S.nav}>
          <SidebarBtn active={false} onClick={() => { navigate('/chat'); setMobileMenuOpen(false); }} icon={<ChatCircle size={20} />} label="Chat" count={null} />
          <SidebarBtn active={activePage === 'overview'} onClick={() => { setActivePage('overview'); setMobileMenuOpen(false); }} icon={<House size={20} />} label="Overview" count={null} />
          <SidebarBtn active={activePage === 'classes'} onClick={() => { setActivePage('classes'); setMobileMenuOpen(false); }} icon={<BookOpen size={20} />} label="My Classes" count={totalClasses} />
          <SidebarBtn active={activePage === 'class-attendance'} onClick={() => { setActivePage('class-attendance'); setMobileMenuOpen(false); }} icon={<ClipboardText size={20} />} label="Class Attendance" count={null} />
          <SidebarBtn active={activePage === 'grades'} onClick={() => { setActivePage('grades'); setMobileMenuOpen(false); }} icon={<GraduationCap size={20} />} label="Grades" count={grades.length} />
          <SidebarBtn active={activePage === 'assignments'} onClick={() => { setActivePage('assignments'); setMobileMenuOpen(false); }} icon={<FileText size={20} />} label="Assignments" count={totalAssignments} />
          <SidebarBtn active={activePage === 'timetable'} onClick={() => { setActivePage('timetable'); setMobileMenuOpen(false); }} icon={<Clock size={20} />} label="Time Table" count={timetable.length} />
          <SidebarBtn active={activePage === 'whiteboard'} onClick={() => { setActivePage('whiteboard'); setMobileMenuOpen(false); }} icon={<Chalkboard size={20} />} label="Whiteboard" count={null} />
          <SidebarBtn active={activePage === 'lab-usage'} onClick={() => { setActivePage('lab-usage'); setMobileMenuOpen(false); }} icon={<Pulse size={20} weight="duotone" />} label="Analytics" count={null} />
          <SidebarBtn active={activePage === 'pending'} onClick={() => { setActivePage('pending'); setMobileMenuOpen(false); }} icon={<UserPlus size={20} />} label="Requests" count={pendingCount} />
          <SidebarBtn active={activePage === 'reports'} onClick={() => { setActivePage('reports'); setMobileMenuOpen(false); }} icon={<ChartLine size={20} weight="duotone" />} label="Reports" count={myReports.length || null} />
          <SidebarBtn active={activePage === 'profile'} onClick={() => { setActivePage('profile'); setMobileMenuOpen(false); }} icon={<UserCircle size={20} />} label="Profile" count={null} />
        </nav>

        <button onClick={onLogout} style={S.logoutBtn} className="logout-btn">
          <SignOut size={20} /> <span>Sign Out</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main style={S.main} className="main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>{user.department_name || 'Faculty Hub'}</h1>
            <p style={S.subtitle}>Welcome back, <span style={S.teacherName}>Prof. {user.name}</span></p>
          </div>
          <div style={S.headerActions}>
            <div style={S.dateBadge}>
              <CalendarBlank size={18} /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </header>

        {/* OVERVIEW PAGE - WITH GRAPH */}
        {activePage === 'overview' && (
          <div className="animate-fadeIn">
            {/* Stats Grid */}
            <div style={S.statsGrid} className="stats-grid">
              <MetricBox 
                label="Total Courses" 
                value={totalCourses} 
                icon={<BookOpen weight="duotone" />} 
                color="#7c3aed"
                trend="+2 this month"
              />
              <MetricBox 
                label="Students" 
                value={totalStudents} 
                icon={<Users weight="duotone" />} 
                color="#7c3aed"
                trend={`${stats.recent_students.length} recent`}
              />
              <MetricBox 
                label="Classes" 
                value={totalClasses} 
                icon={<ChalkboardTeacher weight="duotone" />} 
                color="#2563eb"
                trend="Real-time"
              />
              <MetricBox 
                label="Assignments" 
                value={totalAssignments} 
                icon={<FileText weight="duotone" />} 
                color="#0891b2"
                trend={`${displayCompletionRate}% progress`}
              />
            </div>

            {/* Chart Card */}
            <div style={S.chartCard}>
              <div style={S.chartHeader}>
                <div>
                  <h3 style={S.chartTitle}>Weekly Activity</h3>
                  <p style={S.chartSubtitle}>Teaching engagement over the last 7 days</p>
                </div>
                <div style={S.chartControls}>
                  <Pulse size={20} color="#4f46e5" weight="duotone" />
                  <span style={S.chartLive}>LIVE</span>
                </div>
              </div>
              <div style={{ height: '300px' }}>
                <canvas ref={chartRef}></canvas>
              </div>
            </div>

            {/* Quick Actions and Recent Students */}
            <div style={S.bottomGrid}>
              {/* Quick Actions */}
              <div style={S.quickActionsCard}>
                <h4 style={S.sectionTitle}>Recent Student Enrollments</h4>
                <div style={S.scheduleList}>
                  {stats.recent_students.length > 0 ? stats.recent_students.map((stu, idx) => (
                    <div key={idx} style={S.scheduleItem}>
                      <div style={S.scheduleTime}>{new Date(stu.enrolled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                      <div style={S.scheduleInfo}>
                        <span style={S.scheduleCourse}>{stu.name}</span>
                        <span style={S.scheduleRoom}>Joined: {stu.course_title}</span>
                      </div>
                      <div className="animate-fadeIn" style={{ ...S.statusBadge, background: '#dcfce7', color: '#166534', padding: '4px 12px', fontSize: '10px' }}>APPROVED</div>
                    </div>
                  )) : (
                    <p style={S.emptySchedule}>No approved students yet</p>
                  )}
                </div>
              </div>

              {/* Upcoming Schedule */}
              <div style={S.scheduleCard}>
                <div style={S.sectionHeader}>
                  <h4 style={S.sectionTitle}>Today's Schedule</h4>
                  <Clock size={16} color="#64748b" />
                </div>
                <div style={S.scheduleList}>
                  {timetable.filter(t => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    return t.day_of_week === today;
                  }).slice(0, 3).map((item, idx) => (
                    <div key={idx} style={S.scheduleItem}>
                      <div style={S.scheduleTime}>{item.start_time}</div>
                      <div style={S.scheduleInfo}>
                        <span style={S.scheduleCourse}>{item.course_title}</span>
                        <span style={S.scheduleRoom}>Room {item.room_number || 'TBD'}</span>
                      </div>
                    </div>
                  ))}
                  {timetable.filter(t => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    return t.day_of_week === today;
                  }).length === 0 && (
                    <p style={S.emptySchedule}>No classes scheduled today</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Secondary */}
            <div style={S.bottomGrid}>
              <div style={S.quickActionsCard}>
                <h4 style={S.sectionTitle}>Quick Actions</h4>
                <div style={S.actionsGrid}>
                  <button onClick={() => setActivePage('classes')} style={S.primarySmallBtn}>
                    <BookOpen size={18} /> My Classes
                  </button>
                  <button onClick={() => setActivePage('pending')} style={S.primarySmallBtn}>
                    <UserPlus size={18} /> Pending Requests
                  </button>
                  <button onClick={() => setActivePage('grades')} style={S.secondarySmallBtn}>
                    <GraduationCap size={18} /> Update Grades
                  </button>
                  <button onClick={() => setActivePage('assignments')} style={S.secondarySmallBtn}>
                    <FileText size={18} /> New Assignment
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Approvals Alert */}
            {pendingCount > 0 && (
              <div style={S.pendingAlert} className="animate-fadeIn">
                <Warning size={20} color="#f97316" />
                <span>You have <strong>{pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}</strong> to review</span>
                <button onClick={() => setActivePage('pending')} style={S.viewBtn}>View Now →</button>
              </div>
            )}
          </div>
        )}

        {/* MY CLASSES PAGE */}
        {activePage === 'classes' && !selectedClassId ? (
          <div style={S.tableCard} className="table-container animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>
                  <Buildings size={28} weight="duotone" color="#4f46e5" style={{verticalAlign:'middle', marginRight:'12px'}} />
                  My Classes
                </h2>
                <p style={S.tableSubtitle}>Classes assigned to you by the HOD</p>
              </div>
            </div>
            <div style={S.classesGrid}>
              {teacherClasses.map(cls => (
                <div key={cls.id} style={S.classCard}
                  onClick={() => { setSelectedClassId(cls.id); fetchClassCourses(cls.id); }}
                >
                  <div style={S.classCardHeader}>
                    <span style={S.classYearBadge}>{cls.academic_year}</span>
                    <span style={S.classStudentCount}>
                      <Users size={14} /> {cls.student_count || 0}
                    </span>
                  </div>
                  <h3 style={S.className}>{cls.name}</h3>
                  <p style={S.classSection}>Section: {cls.section}</p>
                  <div style={S.classFooter}>
                    <span style={S.classCoursesCount}>
                      <BookOpen size={12} /> {cls.course_count || 0} courses
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {teacherClasses.length === 0 && (
              <div style={S.emptyState}>
                <ChalkboardTeacher size={48} weight="duotone" />
                <p>No classes assigned to you yet. Contact your HOD to get classes assigned.</p>
              </div>
            )}
          </div>
        ) : activePage === 'classes' && selectedClassId ? (
          // CLASS DETAILS VIEW
          <div className="animate-fadeIn">
            <button onClick={() => setSelectedClassId(null)} style={S.backButton}>
              ← Back to Classes
            </button>
            
            <div style={S.tableCard} className="table-container">
              <div style={S.tableHeader}>
                <div>
                  <h2 style={S.tableTitle}>
                    {teacherClasses.find(c => c.id === selectedClassId)?.name}
                  </h2>
                  <p style={S.tableSubtitle}>Manage courses for this class</p>
                </div>
              </div>

              <div style={S.coursesList}>
                <h4 style={S.listSubtitle}>Active Courses</h4>
                {courses.length > 0 ? (
                  <table style={S.table}>
                    <thead>
                      <tr style={S.tableHeadRow}>
                        <th style={S.th}>COURSE TITLE</th>
                        <th style={S.th}>DESCRIPTION</th>
                        <th style={S.th}>STUDENTS</th>
                        <th style={{ ...S.th, textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(course => (
                        <tr key={course.id} style={S.tableRow}>
                          <td style={S.tdName}>{course.title}</td>
                          <td style={S.td}>{course.description || "—"}</td>
                          <td style={S.td}>{course.enrolled_students || 0}</td>
                          <td style={{ ...S.td, textAlign: 'right' }}>
                            <div style={S.actionGroup}>
                              <button 
                                onClick={() => {
                                  setSelectedCourse(course);
                                  setActivePage('grades');
                                }}
                                style={S.iconBtn}
                                title="Manage Grades"
                              >
                                <GraduationCap size={16} />
                              </button>
                              {course.status !== 'completed' && (
                                <button
                                  onClick={() => handleGenerateReport(course.id, course.title)}
                                  style={{...S.iconBtn, color: '#22c55e', fontSize: '10px', padding: '6px 10px', gap: '4px', display: 'flex', alignItems: 'center', background: '#dcfce7', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600}}
                                  title="Mark Complete & Generate Report"
                                >
                                  ✅ Complete
                                </button>
                              )}
                              <button style={S.deleteIconBtn}><Trash size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={S.emptyMessage}>No courses in this class yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* CLASS ATTENDANCE PAGE */}
        {activePage === 'class-attendance' && (
          <div className="animate-fadeIn">
            <ClassAttendance user={user} onBack={() => setActivePage('overview')} />
          </div>
        )}

        {/* GRADES PAGE */}
        {activePage === 'grades' && (
          <div style={S.tableCard} className="table-container animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>
                  <GraduationCap size={28} weight="duotone" color="#7c3aed" style={{verticalAlign:'middle', marginRight:'12px'}} />
                  Student Performance
                </h2>
                <p style={S.tableSubtitle}>Manage grades and exam results</p>
              </div>
              {selectedCourse && (
                <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={() => {
                    // Initialize bulk grades with all students
                    const initialBulk = students.map(s => ({
                      student_id: s.id,
                      student_name: s.name,
                      marks_obtained: '',
                      remarks: ''
                    }));
                    setBulkGrades(initialBulk);
                    setShowBulkGradeModal(true);
                  }} style={{...S.addBtn, background: '#1e293b'}}>
                    <List size={18} weight="bold" /> Bulk Grade
                  </button>
                  <button onClick={() => setShowGradeModal(true)} style={S.addBtn}>
                    <PlusCircle size={18} /> Add Grade
                  </button>
                </div>
              )}
            </div>
            
            <div style={S.gradesFilter}>
              <select 
                onChange={(e) => {
                  const cid = e.target.value;
                  handleGradesCourseSelect(cid);
                  if (cid) fetchCourseGrades(cid);
                }} 
                style={S.modernSelect}
                value={selectedCourse?.id || ''}
              >
                <option value="">Select a course to view grades</option>
                {courses.map(c => (
                  <option key={c.id} value={c.title}>{c.title}</option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <>
                <div style={S.gradesSummary}>
                  <div style={S.summaryItem}>
                    <span>Total Students</span>
                    <strong>{students.length}</strong>
                  </div>
                  <div style={S.summaryItem}>
                    <span>Graded</span>
                    <strong>{grades.length}</strong>
                  </div>
                  <div style={S.summaryItem}>
                    <span>Average</span>
                    <strong>
                      {grades.length > 0 
                        ? Math.round(grades.reduce((acc, g) => acc + (g.percentage || 0), 0) / grades.length) 
                        : 0}%
                    </strong>
                  </div>
                </div>

                <table style={S.table}>
                  <thead>
                    <tr style={S.tableHeadRow}>
                      <th style={S.th}>STUDENT</th>
                      <th style={S.th}>EXAM</th>
                      <th style={S.th}>MARKS</th>
                      <th style={S.th}>GRADE</th>
                      <th style={S.th}>DATE</th>
                      <th style={{ ...S.th, textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map(g => (
                      <tr key={g.id} style={S.tableRow}>
                        <td style={S.tdName}>{g.student_name}</td>
                        <td style={S.td}><span style={S.examType}>{g.exam_type}</span></td>
                        <td style={S.td}>{g.marks_obtained}/{g.max_marks}</td>
                        <td style={S.td}><span style={S.gradeBadge}>{g.grade_letter}</span></td>
                        <td style={S.td}>{new Date(g.exam_date).toLocaleDateString()}</td>
                        <td style={{ ...S.td, textAlign: 'right' }}>
                          <button 
                            style={S.iconBtn}
                            onClick={() => {
                              setEditingItem(g);
                              setNewGrade({
                                student_id: g.student_id,
                                exam_type: g.exam_type,
                                marks_obtained: g.marks_obtained,
                                max_marks: g.max_marks,
                                exam_date: new Date(g.exam_date).toISOString().split('T')[0],
                                remarks: g.remarks || ''
                              });
                              setShowGradeModal(true);
                            }}
                          >
                            <PencilSimple size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {grades.length === 0 && (
                      <tr>
                        <td colSpan="6" style={S.emptyTableCell}>No grades recorded yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* REDESIGNED ASSIGNMENTS PAGE */}
        {activePage === 'assignments' && (
          <div className="animate-fadeIn" style={{ padding: '0 24px' }}>
            {assignmentViewMode === 'list' ? (
              <div style={S.tableCard} className="table-container">
                <div style={S.tableHeader}>
                  <div>
                    <h2 style={S.tableTitle}>
                      <FileText size={28} weight="duotone" color="#4f46e5" style={{verticalAlign:'middle', marginRight:'12px'}} />
                      Assignments
                    </h2>
                    <p style={S.tableSubtitle}>Manage and track your course assignments</p>
                  </div>
                  <button 
                    onClick={() => {
                      setNewAssignment({ 
                        title: '', description: '', course_id: '', due_date: '', max_marks: 100, 
                        status: 'draft', assignment_type: 'Homework', academic_period: '2026-2027' 
                      });
                      setEditingItem(null);
                      setAssignmentViewMode('create');
                    }} 
                    style={S.addBtn} 
                    className="add-btn"
                  >
                    <PlusCircle size={18} /> Create Assignment
                  </button>
                </div>

                {/* Tabs Filter */}
                <div style={{ padding: '0 28px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  {['all', 'draft', 'published', 'closed'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setAssignmentFilter(tab)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        background: assignmentFilter === tab ? '#4f46e5' : 'transparent',
                        color: assignmentFilter === tab ? '#fff' : '#64748b',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div style={S.assignmentGrid}>
                  {assignments
                    .filter(a => {
                      if (assignmentFilter === 'all') return true;
                      if (assignmentFilter === 'draft') return a.status === 'draft';
                      if (assignmentFilter === 'published') return a.status === 'published';
                      if (assignmentFilter === 'closed') {
                        const dueDate = new Date(a.due_date);
                        const now = new Date();
                        return dueDate < now;
                      }
                      return true;
                    })
                    .map(a => {
                    const dueDate = new Date(a.due_date);
                    const today = new Date();
                    const isOverdue = dueDate < today;
                    
                    return (
                      <div key={a.id} style={S.assignmentCard} className="metric-card" onClick={() => { setSelectedAssignment(a); fetchSubmissions(a.id); }}>
                        <div style={S.assignmentCardHeader}>
                          <div style={S.assignmentTags}>
                            <div style={S.tagHomework}>
                              <PencilSimple size={14} weight="bold" /> {a.assignment_type || 'Homework'}
                            </div>
                            <div style={{
                              ...S.tagPublished,
                              background: a.status === 'draft' ? '#f1f5f9' : '#dcfce7',
                              color: a.status === 'draft' ? '#64748b' : '#166534'
                            }}>
                              <Circle size={8} weight="fill" color={a.status === 'draft' ? '#94a3b8' : '#22c55e'} /> 
                              {(a.status || 'published').toUpperCase()}
                            </div>
                          </div>
                          <h3 style={S.assignmentCardTitle}>{a.title}</h3>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                            Course: {a.course_title}
                          </p>
                        </div>

                        <div style={S.assignmentCardInfo}>
                          <div style={S.dueInfo}>
                            <div style={S.dueIconWrapper}>
                              <CalendarBlank size={16} weight="bold" />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>
                                {isOverdue ? "Overdue" : "Due Date"}
                              </p>
                              <strong style={{ color: isOverdue ? '#ef4444' : '#1e293b' }}>
                                {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </strong>
                            </div>
                          </div>

                          <div style={S.submissionCounterBox}>
                            {a.submission_count || 0} Submissions
                          </div>
                        </div>

                        <div style={S.assignmentCardActions}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedAssignment(a); fetchSubmissions(a.id); }}
                            style={S.viewSubBtn}
                          >
                            <FileText size={18} /> View Submissions
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(a);
                              setNewAssignment({
                                title: a.title,
                                description: a.description || '',
                                course_id: a.course_id,
                                due_date: new Date(a.due_date).toISOString().split('T')[0],
                                max_marks: a.max_marks,
                                status: a.status || 'published',
                                assignment_type: a.assignment_type || 'Homework',
                                academic_period: a.academic_period || '2026-2027'
                              });
                              setAssignmentViewMode('create');
                            }}
                            style={S.editAssignBtn}
                          >
                            <PencilSimple size={18} /> Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {assignments.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                      <p style={{ color: '#94a3b8' }}>No assignments found.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : assignmentViewMode === 'submissions' ? (
              /* SPLIT VIEW SUBMISSIONS */
              <div className="animate-fadeIn">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <button 
                    onClick={handleBackToAssignments}
                    style={{ ...S.iconBtn, background: '#fff', border: '1px solid #e2e8f0', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ArrowLeft size={20} weight="bold" />
                  </button>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Assignment Submissions</h2>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', margin: 0 }}>{selectedAssignment?.title}</p>
                  </div>
                </div>

                <div style={S.submissionSplitView}>
                  {/* Left Pane: Student List */}
                  <div style={S.studentListPane} className="hidden-scrollbar">
                    <div style={S.paneHeader}>
                      <h3 style={S.paneTitle}>Students ({assignmentSubmissions.length})</h3>
                    </div>
                    
                    <div style={S.studentList}>
                      {assignmentSubmissions.map(sub => (
                        <div 
                          key={sub.id} 
                          style={S.studentItem(selectedSubmissionStudent?.id === sub.id)}
                          onClick={() => {
                            setSelectedSubmissionStudent(sub);
                            setGradeData({
                              marks_obtained: sub.marks_obtained || '',
                              feedback: sub.feedback || ''
                            });
                          }}
                        >
                          <div style={S.studentItemInfo}>
                            <span style={S.studentItemName}>{sub.student_name}</span>
                            <span style={S.studentItemId}>{sub.student_id_number || sub.student_email.split('@')[0]}</span>
                            <span style={S.studentItemDate}>
                              {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <span style={{
                            ...S.statusBadge,
                            background: sub.marks_obtained ? '#dcfce7' : '#fef3c7',
                            color: sub.marks_obtained ? '#166534' : '#92400e',
                            padding: '4px 8px',
                            fontSize: '10px'
                          }}>
                            {sub.marks_obtained ? 'Graded' : 'Pending'}
                          </span>
                        </div>
                      ))}
                      {assignmentSubmissions.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No submissions yet</p>
                      )}
                    </div>
                  </div>

                  {/* Right Pane: Grading Details */}
                  <div style={S.gradingPane} className="hidden-scrollbar">
                    {selectedSubmissionStudent ? (
                      <div style={S.submissionContent}>
                        <div style={S.gradingHeader}>
                          <div style={S.gradableInfo}>
                            <h2 style={S.gradableName}>{selectedSubmissionStudent.student_name}</h2>
                            <p style={S.gradableSubText}>
                              Student ID: {selectedSubmissionStudent.student_id_number || "HIT-" + selectedSubmissionStudent.student_id} • {selectedSubmissionStudent.student_email}
                            </p>
                          </div>
                          <div style={S.statusText}>
                            Submitted<br/>
                            {new Date(selectedSubmissionStudent.submitted_at).toLocaleString('en-GB', { 
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </div>
                        </div>

                        {selectedSubmissionStudent.submission_text && (
                          <div style={S.contentSection}>
                            <label style={S.sectionLabel}><FileText size={18} /> Student Submission</label>
                            <div style={S.textSubmission}>{selectedSubmissionStudent.submission_text}</div>
                          </div>
                        )}

                        {selectedSubmissionStudent.file_path && (
                          <div style={S.contentSection}>
                            <label style={S.sectionLabel}><Flask size={18} /> Attachments</label>
                            <div style={S.attachmentCard}>
                              <div style={S.fileIcon}>
                                <FileText size={24} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{selectedSubmissionStudent.submitted_file_name || "Attachment"}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Submission File</p>
                              </div>
                              <button 
                                onClick={async () => {
                                  try {
                                    const response = await fetch(`${API_BASE_URL}/api/submissions/${selectedSubmissionStudent.id}/download`, {
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = selectedSubmissionStudent.submitted_file_name || 'submission';
                                    a.click();
                                  } catch (err) { showToast('Download failed', 'error'); }
                                }}
                                style={{ ...S.iconBtn, color: '#4f46e5' }}
                              >
                                <Download size={18} />
                              </button>
                            </div>

                            {/* Image Preview */}
                            {(selectedSubmissionStudent.file_path.toLowerCase().endsWith('.png') || 
                              selectedSubmissionStudent.file_path.toLowerCase().endsWith('.jpg') || 
                              selectedSubmissionStudent.file_path.toLowerCase().endsWith('.jpeg')) && (
                              <div style={S.filePreview}>
                                <img 
                                  src={`${API_BASE_URL}/${selectedSubmissionStudent.file_path.replace(/\\/g, '/')}`} 
                                  alt="Submission Preview" 
                                  style={S.previewImg} 
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Grading Form */}
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          setGradingSubmission(selectedSubmissionStudent);
                          handleGradeSubmission(e);
                        }} style={S.gradingForm}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>Grade Submission</h4>
                          <div style={S.row}>
                            <div style={{ ...S.inputGroup, flex: 1 }}>
                              <label style={S.inputLabel}>Score (out of {selectedAssignment?.max_marks || 100})</label>
                              <input 
                                type="number" 
                                placeholder="Enter score" 
                                style={S.input}
                                value={gradeData.marks_obtained}
                                onChange={(e) => setGradeData({ ...gradeData, marks_obtained: e.target.value })}
                                max={selectedAssignment?.max_marks}
                                min={0}
                                required
                              />
                            </div>
                          </div>
                          <div style={S.inputGroup}>
                            <label style={S.inputLabel}>Feedback</label>
                            <textarea 
                              placeholder="Enter feedback for the student..." 
                              style={{ ...S.input, minHeight: '120px', resize: 'vertical' }}
                              value={gradeData.feedback}
                              onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button type="submit" style={S.saveBtn} className="save-btn">Submit Grade</button>
                            <button type="button" onClick={handleBackToAssignments} style={S.cancelBtn} className="cancel-btn">Back to List</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '100px 40px', color: '#94a3b8' }}>
                        <FileText size={64} weight="duotone" />
                        <p style={{ marginTop: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Select a student from the left to view and grade their submission.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* CREATE / EDIT ASSIGNMENT PAGE (Mirroring Screenshot) */
              <div className="animate-fadeIn">
                <button 
                  onClick={() => setAssignmentViewMode('list')}
                  style={S.backToLink}
                >
                  <ArrowLeft size={16} /> Back to Assignments
                </button>
                
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                  {editingItem ? 'Edit Assignment' : 'Create New Assignment'}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '32px', fontWeight: '500' }}>
                  Fill in the details below to {editingItem ? 'update your' : 'create a new'} assignment
                </p>

                <div style={S.createFormContainer}>
                  {/* Course Selection */}
                  <div style={S.formSection}>
                    <h3 style={S.sectionTitle}><Flask size={20} weight="fill" color="#4f46e5" /> Course Selection</h3>
                    <div style={S.inputGroup}>
                      <label style={S.inputLabel}>Select Course</label>
                      <select 
                        style={S.input}
                        value={newAssignment.course_id}
                        onChange={(e) => setNewAssignment({ ...newAssignment, course_id: e.target.value })}
                        required
                      >
                        <option value="">Select a course</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div style={S.formSection}>
                    <h3 style={S.sectionTitle}><FileText size={20} weight="fill" color="#4f46e5" /> Basic Information</h3>
                    <div style={S.formGrid}>
                      <div style={{ ...S.inputGroup, ...S.fullWidth }}>
                        <label style={S.inputLabel}>Assignment Name *</label>
                        <input 
                          type="text" 
                          placeholder="Enter assignment name" 
                          style={S.input}
                          value={newAssignment.title}
                          onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div style={S.inputGroup}>
                        <label style={S.inputLabel}>Assignment Type *</label>
                        <select 
                          style={S.input}
                          value={newAssignment.assignment_type}
                          onChange={(e) => setNewAssignment({ ...newAssignment, assignment_type: e.target.value })}
                        >
                          <option value="Homework">Homework</option>
                          <option value="Project">Project</option>
                          <option value="Quiz">Quiz</option>
                          <option value="Lab">Lab</option>
                        </select>
                      </div>

                      <div style={S.inputGroup}>
                        <label style={S.inputLabel}>Status *</label>
                        <select 
                          style={S.input}
                          value={newAssignment.status}
                          onChange={(e) => setNewAssignment({ ...newAssignment, status: e.target.value })}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>

                      <div style={S.inputGroup}>
                        <label style={S.inputLabel}>Academic Period *</label>
                        <select 
                          style={S.input}
                          value={newAssignment.academic_period}
                          onChange={(e) => setNewAssignment({ ...newAssignment, academic_period: e.target.value })}
                        >
                          <option value="2026-2027">2026-2027</option>
                          <option value="2027-2028">2027-2028</option>
                        </select>
                      </div>

                      <div style={S.inputGroup}>
                        <label style={S.inputLabel}>Maximum Marks *</label>
                        <input 
                          type="number" 
                          style={S.input}
                          value={newAssignment.max_marks}
                          onChange={(e) => setNewAssignment({ ...newAssignment, max_marks: e.target.value })}
                        />
                      </div>

                      <div style={S.inputGroup}>
                        <label style={S.inputLabel}>Due Date & Time *</label>
                        <input 
                          type="datetime-local" 
                          style={S.input}
                          value={newAssignment.due_date}
                          onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={S.formSection}>
                    <h3 style={S.sectionTitle}><List size={20} weight="fill" color="#4f46e5" /> Description</h3>
                    <div style={S.inputGroup}>
                      <label style={S.inputLabel}>Text Description *</label>
                      <textarea 
                        placeholder="Enter description and details..." 
                        style={S.richTextPlaceholder}
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                    <button 
                      onClick={handleCreateAssignment} 
                      style={S.saveBtn} 
                      className="save-btn"
                    >
                      {editingItem ? 'Update Assignment' : 'Create Assignment'}
                    </button>
                    <button 
                      onClick={() => setAssignmentViewMode('list')} 
                      style={{ ...S.cancelBtn, flex: 1 }} 
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}




        {/* LAB USAGE ANALYTICS PAGE */}
        {activePage === 'lab-usage' && (
          <div style={S.tableCard} className="table-container animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>
                  <Flask size={28} weight="duotone" color="#4f46e5" style={{verticalAlign:'middle', marginRight:'12px'}} />
                  Cloud Lab Analytics
                </h2>
                <p style={S.tableSubtitle}>Track student engagement in cloud labs</p>
              </div>
            </div>
            
            {loadingLabs ? (
              <p style={S.emptyState}>Loading lab data...</p>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr style={S.tableHeadRow}>
                    <th style={S.th}>STUDENT</th>
                    <th style={S.th}>LAB NAME</th>
                    <th style={S.th}>DATE</th>
                    <th style={S.th}>TIME SPENT</th>
                    <th style={S.th}>STATUS</th>
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
                      <td style={S.td}>{usage.time_spent} mins</td>
                      <td style={S.td}>
                        <span style={{
                          ...S.statusBadge, 
                          background: usage.end_time ? '#dcfce7' : '#fef3c7', 
                          color: usage.end_time ? '#166534' : '#92400e'
                        }}>
                          {usage.end_time ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {labUsage.length === 0 && (
                    <tr>
                      <td colSpan="5" style={S.emptyTableCell}>No lab usage history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TIMETABLE PAGE */}
        {activePage === 'timetable' && (
          <div style={S.tableCard} className="table-container animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>
                  <CalendarBlank size={28} weight="duotone" color="#4f46e5" style={{verticalAlign:'middle', marginRight:'12px'}} />
                  Academic Schedule
                </h2>
                <p style={S.tableSubtitle}>Your weekly class timetable</p>
              </div>
            </div>
            
            <div style={S.timetableContainer}>
              {Object.entries(groupTimetableByDay()).map(([day, entries]) => (
                entries.length > 0 && (
                  <div key={day} style={S.daySection}>
                    <h4 style={S.dayHeading}>{day}</h4>
                    {entries.map(entry => (
                      <div key={entry.id} style={S.timetableSlot}>
                        <div>
                          <span style={S.courseTitle}>{entry.course_title}</span>
                          <div style={S.roomInfo}>
                            <Clock size={12} /> {entry.start_time} - {entry.end_time} • Room {entry.room_number || 'TBD'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={S.classBadge}>{entry.class_name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ))}
              {timetable.length === 0 && (
                <div style={S.emptyState}>
                  <Clock size={48} weight="duotone" />
                  <p>No timetable entries found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PENDING ENROLLMENT REQUESTS PAGE */}
        {activePage === 'pending' && (
          <div style={S.tableCard} className="table-container animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>📋 Pending Enrollment Requests</h2>
                <p style={S.tableSubtitle}>Students requesting to enroll in your courses</p>
              </div>
            </div>
            
            {loadingPending ? (
              <div style={S.loadingContainer}>
                <div style={S.loadingSpinner}></div>
                <p>Loading enrollment requests...</p>
              </div>
            ) : (
              <table style={S.table}>
                <thead>
                  <tr style={S.tableHeadRow}>
                    <th style={S.th}>STUDENT</th>
                    <th style={S.th}>EMAIL</th>
                    <th style={S.th}>COURSE</th>
                    <th style={S.th}>CLASS</th>
                    <th style={S.th}>REQUESTED</th>
                    <th style={S.th}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEnrollments.map(enrollment => (
                    <tr key={enrollment.enrollment_id} style={S.tableRow}>
                      <td style={S.td}>
                        <div style={S.studentInfo}>
                          <div style={S.avatarPlaceholder}>{enrollment.student_name.charAt(0)}</div>
                          <span style={S.studentName}>{enrollment.student_name}</span>
                        </div>
                      </td>
                      <td style={S.td}>{enrollment.student_email}</td>
                      <td style={S.td}>
                        <span style={S.courseBadge}>{enrollment.course_title}</span>
                      </td>
                      <td style={S.td}>
                        <span style={S.classBadge}>{enrollment.class_name} ({enrollment.class_section})</span>
                      </td>
                      <td style={S.td}>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                      <td style={S.td}>
                        <div style={S.actionGroup}>
                          <button 
                            onClick={() => handleApproveEnrollment(enrollment.enrollment_id)} 
                            style={S.approveBtn} 
                            className="approve-btn"
                          >
                            <span style={S.btnIcon}>✓</span> Approve
                          </button>
                          <button 
                            onClick={() => handleRejectEnrollment(enrollment.enrollment_id)} 
                            style={S.rejectBtn} 
                            className="reject-btn"
                          >
                            <span style={S.btnIcon}>✕</span> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingEnrollments.length === 0 && (
                    <tr>
                      <td colSpan="6" style={S.emptyTableCell}>No pending enrollment requests</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* WHITEBOARD PAGE */}
        {activePage === 'whiteboard' && (
          <div className="animate-fadeIn">
            <header style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>🎨 Live Whiteboard</h2>
              <p style={{ color: '#64748b', marginTop: '4px' }}>Draw, type and share concepts with your students</p>
            </header>
            <Whiteboard />
          </div>
        )}

        {/* MY REPORTS PAGE */}
        {activePage === 'reports' && (
          <div style={S.tableCard} className="table-container animate-fadeIn">
            <div style={S.tableHeader}>
              <div>
                <h2 style={S.tableTitle}>
                  <ChartBar size={28} weight="duotone" color="#7c3aed" style={{verticalAlign:'middle', marginRight:'12px'}} />
                  My Course Reports
                </h2>
                <p style={S.tableSubtitle}>{myReports.length} completed course{myReports.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {reportsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading reports...</div>
            ) : myReports.length === 0 ? (
              <div style={S.emptyState}>
                <ChartLine size={48} weight="duotone" />
                <p style={{ marginTop: '12px' }}>No reports yet. Go to My Classes, open a course, and click ✅ Complete to generate your first report.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr style={S.tableHeadRow}>
                      <th style={S.th}>COURSE</th>
                      <th style={S.th}>CLASS</th>
                      <th style={S.th}>STUDENTS</th>
                      <th style={S.th}>AVG MARKS</th>
                      <th style={S.th}>ATTENDANCE</th>
                      <th style={S.th}>PASS / FAIL</th>
                      <th style={S.th}>ASSIGNMENTS</th>
                      <th style={S.th}>COMPLETED ON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReports.map(r => (
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
                          <div style={{display:'flex', alignItems:'center', gap:'12px', fontSize: '13px', fontWeight: 700}}>
                            <span style={{color:'#166534', display: 'flex', alignItems: 'center', gap: '4px'}}><Check size={14} weight="bold" /> {r.pass_count}</span>
                            <span style={{color:'#94a3b8'}}>|</span>
                            <span style={{color:'#ef4444', display: 'flex', alignItems: 'center', gap: '4px'}}><X size={14} weight="bold" /> {r.fail_count}</span>
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

        {/* PROFILE PAGE */}
        {activePage === 'profile' && (
          <div style={S.profileCard} className="animate-fadeIn">
            <div style={S.profileHeader}>
              <div style={S.profileAvatar}>{user.name.charAt(0)}</div>
              <h2 style={S.profileName}>{user.name}</h2>
              <span style={S.profileRole}>Senior Faculty • Computer Science</span>
            </div>
            
            <div style={S.profileStats}>
              <div style={S.profileStatItem}>
                <span>Courses</span>
                <strong>{courses.length}</strong>
              </div>
              <div style={S.profileStatItem}>
                <span>Students</span>
                <strong>{students.length}</strong>
              </div>
              <div style={S.profileStatItem}>
                <span>Classes</span>
                <strong>{teacherClasses.length}</strong>
              </div>
            </div>

            <div style={S.profileInfoGrid}>
              <div style={S.infoItem}>
                <span>Email Address</span>
                <p>{user.email || 'teacher@qau.edu.pk'}</p>
              </div>
              <div style={S.infoItem}>
                <span>Designation</span>
                <p style={{textTransform:'capitalize'}}>{user.role || 'Teacher'}</p>
              </div>
              <div style={S.infoItem}>
                <span>Department</span>
                <p>Computer Science</p>
              </div>
              <div style={S.infoItem}>
                <span>Joined</span>
                <p>January 2024</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SUBMISSIONS MODAL */}
      {showSubmissionModal && selectedAssignment && (
        <div style={S.modalOverlay} onClick={() => setShowSubmissionModal(false)}>
          <div style={{...S.modal, width: '900px', maxWidth:'95vw'}} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>{selectedAssignment.title} - Submissions</h3>
              <button onClick={() => setShowSubmissionModal(false)} style={S.modalClose} className="modal-close">×</button>
            </div>
            
            <div style={S.submissionsInfo}>
              <div style={S.infoBadge}>
                <FileText size={14} /> Total: {assignmentSubmissions.length}
              </div>
              <div style={S.infoBadge}>
                <CheckCircle size={14} /> Graded: {assignmentSubmissions.filter(s => s.marks_obtained).length}
              </div>
            </div>

            <table style={S.table}>
              <thead>
                <tr style={S.tableHeadRow}>
                  <th style={S.th}>STUDENT</th>
                  <th style={S.th}>SUBMITTED</th>
                  <th style={S.th}>FILE</th>
                  <th style={S.th}>MARKS</th>
                  <th style={S.th}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {assignmentSubmissions.length === 0 ? (
                  <tr><td colSpan="5" style={S.emptyTableCell}>No submissions yet</td></tr>
                ) : (
                  assignmentSubmissions.map(sub => (
                    <tr key={sub.id} style={S.tableRow}>
                      <td style={S.tdName}>{sub.student_name}</td>
                      <td style={S.td}>{new Date(sub.submitted_at).toLocaleString()}</td>
                      <td style={S.td}>
                        {sub.file_path ? (
                          <span onClick={async () => {
                            try {
                              const response = await fetch(`${API_BASE_URL}/api/submissions/${sub.id}/download`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'submission_file';
                              a.click();
                            } catch (err) {
                              showToast('Download failed', 'error');
                            }
                          }} style={S.downloadLink}>
                            Download
                          </span>
                        ) : (
                          <span>Text submission</span>
                        )}
                      </td>
                      <td style={S.td}>
                        {sub.marks_obtained ? (
                          <span style={S.gradedMarks}>{sub.marks_obtained}</span>
                        ) : (
                          <span style={S.notGraded}>Pending</span>
                        )}
                      </td>
                      <td style={S.td}>
                        <button 
                          onClick={() => { setGradingSubmission(sub); setGradeData({ marks_obtained: sub.marks_obtained || '', feedback: sub.feedback || '' }); }}
                          style={S.gradeBtn}
                          className="grade-btn"
                        >
                          Grade
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {gradingSubmission && (
        <div style={{...S.modalOverlay, zIndex: 1002}} onClick={() => setGradingSubmission(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Grade Submission</h3>
            <p style={S.modalSubtitle}>Student: <strong>{gradingSubmission.student_name}</strong></p>
            
            {gradingSubmission.submission_text && (
              <div style={S.submissionTextBlock}>
                <p style={S.submissionLabel}>Submission Text:</p>
                <p>{gradingSubmission.submission_text}</p>
              </div>
            )}

            <form onSubmit={handleGradeSubmission} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Marks Obtained (Max: {selectedAssignment?.max_marks || 100})</label>
                <input 
                  type="number" 
                  placeholder="Enter marks" 
                  value={gradeData.marks_obtained} 
                  onChange={e => setGradeData({...gradeData, marks_obtained: e.target.value})} 
                  style={S.input} 
                  required 
                  max={selectedAssignment?.max_marks || 100}
                />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Feedback</label>
                <textarea 
                  placeholder="Provide feedback to student..." 
                  value={gradeData.feedback} 
                  onChange={e => setGradeData({...gradeData, feedback: e.target.value})} 
                  style={{...S.input, height:'80px'}} 
                />
              </div>
              <div style={S.modalActions}>
                <button type="button" onClick={() => setGradingSubmission(null)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateAssignmentModal && (
        <div style={S.modalOverlay} onClick={() => setShowCreateAssignmentModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>
              <ClipboardText size={24} weight="duotone" color="#7c3aed" style={{verticalAlign:'middle', marginRight:'8px'}} />
              {editingItem ? 'Edit Assignment' : 'Create Assignment'}
            </h3>
            <form onSubmit={handleCreateAssignment} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Course</label>
                <select required value={newAssignment.course_id} onChange={e => setNewAssignment({...newAssignment, course_id: e.target.value})} style={S.input}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Assignment Title</label>
                <input placeholder="e.g., Chapter 5 Exercise" required value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} style={S.input} />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Description</label>
                <textarea placeholder="Instructions for students..." value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} style={{...S.input, height:'80px'}} />
              </div>
              
              <div style={S.row}>
                <div style={S.flex1}>
                  <label style={S.inputLabel}>Due Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newAssignment.due_date} 
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})} 
                    style={S.input} 
                  />
                </div>
                <div style={S.flex1}>
                  <label style={S.inputLabel}>Max Marks</label>
                  <input type="number" required value={newAssignment.max_marks} onChange={e => setNewAssignment({...newAssignment, max_marks: e.target.value})} style={S.input} />
                </div>
              </div>
              
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowCreateAssignmentModal(false); setEditingItem(null); setNewAssignment({ title: '', description: '', course_id: '', due_date: '', max_marks: 100 }); }} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>{editingItem ? 'Update Assignment' : 'Create Assignment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COURSE AND CLASS MODALS REMOVED - Only HOD can create */}

      {/* GRADE MODAL */}
      {/* DETAILED REPORT MODAL */}
      {showReportModal && selectedReport && (
        <div style={S.modalOverlay} onClick={() => { setShowReportModal(false); setReportDetails(null); }} className="modal-overlay">
          <div style={{...S.modal, maxWidth: '800px', width: '95%'}} onClick={e => e.stopPropagation()} className="modal animate-slideUp">
            <div style={S.modalHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{width:'48px', height:'48px', borderRadius:'16px', background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', color:'#7c3aed'}}>
                  <ChartLine size={24} weight="duotone" color="#7c3aed" />
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
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'16px', marginBottom:'24px'}}>
                    <div style={{padding:'20px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:600}}>AVERAGE MARKS</span>
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#0f172a'}}>{parseFloat(reportDetails.teacher_performance.avg_student_marks).toFixed(1)}%</h3>
                    </div>
                    <div style={{padding:'20px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:600}}>ATTENDANCE</span>
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#0f172a'}}>{parseFloat(reportDetails.teacher_performance.avg_attendance).toFixed(1)}%</h3>
                    </div>
                    <div style={{padding:'20px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:600}}>PASS RATE</span>
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#166534'}}>
                        {Math.round((selectedReport.pass_count / selectedReport.total_students) * 100)}%
                      </h3>
                    </div>
                  </div>

                  <div style={{marginBottom:'24px', padding:'20px', borderRadius:'24px', background:'linear-gradient(135deg, #f5f3ff, #fdf4ff)', border:'1px solid #ddd6fe'}}>
                    <h3 style={{margin:'0 0 12px', fontSize:'16px', color:'#5b21b6', display:'flex', alignItems:'center', gap:'8px'}}>
                      <UserCircle size={20} color="#7c3aed" /> Teacher Progress: {selectedReport.teacher_name}
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

                  <h3 style={{marginBottom:'16px', fontSize:'16px', color:'#1e293b', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <GraduationCap size={20} color="#7c3aed" /> Student-wise Performance
                  </h3>
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
                <div style={{...S.emptyState, padding: '40px'}}>
                  <ChartBar size={48} weight="duotone" color="#94a3b8" />
                  <h3 style={{color:'#1e293b', marginBottom:'8px', marginTop: '16px'}}>No detailed records found</h3>
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
              <button style={S.cancelBtn} onClick={() => setShowReportModal(false)}>Close Report</button>
              <button style={{...S.submitBtn, background:'#1e293b'}} onClick={() => window.print()}>🖨️ Print PDF</button>
            </div>
          </div>
        </div>
      )}

      {showGradeModal && (
        <div style={S.modalOverlay} onClick={() => { setShowGradeModal(false); setEditingItem(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Record Grade</h3>
            <p style={S.modalSubtitle}>Course: <strong>{selectedCourse?.title}</strong></p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedCourse) {
                showToast('Please select a course first!', 'warning');
                return;
              }
              try {
                const method = editingItem ? 'PUT' : 'POST';
                const url = editingItem 
                  ? `${API_BASE_URL}/api/grades/${editingItem.id}` 
                  : `${API_BASE_URL}/api/grades`;

                const response = await fetch(url, {
                  method,
                  headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    student_id: newGrade.student_id,
                    course_id: selectedCourse.id,
                    exam_type: newGrade.exam_type,
                    marks_obtained: newGrade.marks_obtained,
                    max_marks: newGrade.max_marks,
                    exam_date: newGrade.exam_date,
                    remarks: newGrade.remarks
                  })
                });
                const resData = await response.json();
                if (resData.success) {
                  showToast(`Grade ${editingItem ? 'updated' : 'saved'} successfully!`, 'success');
                  setShowGradeModal(false);
                  setNewGrade({ student_id: '', exam_type: 'midterm', marks_obtained: '', max_marks: 100, exam_date: '', remarks: '' });
                  setEditingItem(null);
                  fetchCourseGrades(selectedCourse.id);
                } else {
                  showToast(resData.message || 'Error saving grade', 'error');
                }
              } catch (error) {
                showToast('Error saving grade', 'error');
              }
            }} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Student</label>
                <select required value={newGrade.student_id} onChange={e => setNewGrade({...newGrade, student_id: e.target.value})} style={S.input}>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Exam Type</label>
                <select required value={newGrade.exam_type} onChange={e => setNewGrade({...newGrade, exam_type: e.target.value})} style={S.input}>
                  <option value="midterm">Midterm Exam</option>
                  <option value="final">Final Exam</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>
              
              <div style={S.row}>
                <div style={S.flex1}>
                  <label style={S.inputLabel}>Marks Obtained</label>
                  <input type="number" required value={newGrade.marks_obtained} onChange={e => setNewGrade({...newGrade, marks_obtained: e.target.value})} style={S.input} />
                </div>
                <div style={S.flex1}>
                  <label style={S.inputLabel}>Max Marks</label>
                  <input type="number" required value={newGrade.max_marks} onChange={e => setNewGrade({...newGrade, max_marks: e.target.value})} style={S.input} />
                </div>
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Exam Date</label>
                <input type="date" required value={newGrade.exam_date} onChange={e => setNewGrade({...newGrade, exam_date: e.target.value})} style={S.input} />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Remarks (Optional)</label>
                <textarea placeholder="Additional comments..." value={newGrade.remarks} onChange={e => setNewGrade({...newGrade, remarks: e.target.value})} style={{...S.input, height:'60px'}} />
              </div>
              
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowGradeModal(false); setEditingItem(null); }} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkGradeModal && (
        <div style={S.modalOverlay} onClick={() => setShowBulkGradeModal(false)}>
          <div style={{...S.modal, width: '900px', maxWidth: '95vw'}} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Bulk Batch Grading</h3>
            <p style={S.modalSubtitle}>Excel-style grading for <strong>{selectedCourse?.title}</strong></p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`${API_BASE_URL}/api/grades/bulk`, {
                  method: 'POST',
                  headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    course_id: selectedCourse.id,
                    exam_type: bulkGradeHeader.exam_type,
                    max_marks: bulkGradeHeader.max_marks,
                    exam_date: bulkGradeHeader.exam_date,
                    grades: bulkGrades.filter(g => g.marks_obtained !== '').map(g => ({
                      student_id: g.student_id,
                      marks_obtained: parseFloat(g.marks_obtained),
                      remarks: g.remarks
                    }))
                  })
                });
                const resData = await response.json();
                if (resData.success) {
                  showToast(`Successfully saved ${resData.message}`, 'success');
                  setShowBulkGradeModal(false);
                  fetchCourseGrades(selectedCourse.id);
                } else {
                  showToast(resData.message || 'Error saving bulk grades', 'error');
                }
              } catch (err) {
                showToast('Error saving bulk grades', 'error');
              }
            }}>
              {/* Common Header Fields */}
              <div style={{display:'flex', gap:'20px', marginBottom:'24px', padding:'20px', background:'#f8fafc', borderRadius:'16px', border:'1px solid #e2e8f0'}}>
                <div style={{flex:1}}>
                  <label style={S.inputLabel}>Exam Type</label>
                  <select required value={bulkGradeHeader.exam_type} onChange={e => setBulkGradeHeader({...bulkGradeHeader, exam_type: e.target.value})} style={S.input}>
                    <option value="midterm">Midterm Exam</option>
                    <option value="final">Final Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={S.inputLabel}>Max Marks</label>
                  <input type="number" required value={bulkGradeHeader.max_marks} onChange={e => setBulkGradeHeader({...bulkGradeHeader, max_marks: e.target.value})} style={S.input} />
                </div>
                <div style={{flex:1}}>
                  <label style={S.inputLabel}>Exam Date</label>
                  <input type="date" required value={bulkGradeHeader.exam_date} onChange={e => setBulkGradeHeader({...bulkGradeHeader, exam_date: e.target.value})} style={S.input} />
                </div>
              </div>

              {/* Student Entry Table */}
              <div style={{maxHeight:'400px', overflowY:'auto', border:'1px solid #e2e8f0', borderRadius:'12px', marginBottom:'24px'}} className="hidden-scrollbar">
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                  <thead style={{position:'sticky', top:0, background:'#fff', zIndex:1, boxShadow:'0 1px 0 #e2e8f0'}}>
                    <tr>
                      <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b'}}>STUDENT NAME</th>
                      <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b', width:'150px'}}>MARKS OBTAINED</th>
                      <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b'}}>REMARKS (OPTIONAL)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkGrades.map((bg, index) => (
                      <tr key={bg.student_id} style={{borderTop:'1px solid #f1f5f9'}}>
                        <td style={{padding:'12px 20px', fontSize:'14px', fontWeight:600, color:'#0f172a'}}>{bg.student_name}</td>
                        <td style={{padding:'8px 20px'}}>
                          <input 
                            type="number" 
                            placeholder="Marks"
                            value={bg.marks_obtained}
                            onChange={(e) => {
                              const newList = [...bulkGrades];
                              newList[index].marks_obtained = e.target.value;
                              setBulkGrades(newList);
                            }}
                            style={{...S.input, padding:'8px 12px', margin:0}}
                          />
                        </td>
                        <td style={{padding:'8px 20px'}}>
                          <input 
                            type="text" 
                            placeholder="Add remarks..."
                            value={bg.remarks}
                            onChange={(e) => {
                              const newList = [...bulkGrades];
                              newList[index].remarks = e.target.value;
                              setBulkGrades(newList);
                            }}
                            style={{...S.input, padding:'8px 12px', margin:0}}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowBulkGradeModal(false)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Save All Grades</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

// ==================== PROFESSIONAL STYLES ====================
const S = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  // Animated Background Orbs
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
    background: 'radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.12), transparent 70%)',
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
    background: 'radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.12), transparent 70%)',
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
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '12px',
  },

  logoText: {
    fontSize: '1.6rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },

  logoAccent: {
    color: '#c4b5fd',
    marginLeft: '2px',
  },

  teacherBadge: {
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
    marginLeft: 'auto',
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
    marginRight: '0',
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

  teacherName: {
    color: '#7c3aed',
    fontWeight: '700',
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
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },

  metricCard: {
    background: '#fff',
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
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: '0.02em',
  },

  metricValue: {
    margin: '4px 0 0',
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
    marginTop: '4px',
  },

  // Chart Card
  chartCard: {
    background: '#fff',
    padding: '28px',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
    marginBottom: '32px',
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
    color: '#4f46e5',
    letterSpacing: '0.05em',
  },

  // Bottom Grid
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },

  quickActionsCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '28px',
    border: '1px solid #e2e8f0',
  },

  scheduleCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '28px',
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

  primarySmallBtn: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '16px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },

  secondarySmallBtn: {
    background: '#f8fafc',
    color: '#0f172a',
    border: '1px solid #e2e8f0',
    padding: '12px',
    borderRadius: '16px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },

  scheduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  scheduleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },

  scheduleTime: {
    background: '#f1f5f9',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#0f172a',
  },

  scheduleInfo: {
    flex: 1,
  },

  scheduleCourse: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '0.9rem',
    display: 'block',
  },

  scheduleRoom: {
    fontSize: '0.75rem',
    color: '#64748b',
  },

  emptySchedule: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '20px 0',
  },

  // Pending Alert
  pendingAlert: {
    background: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '20px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#92400e',
  },

  viewBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },

  // Classes Grid
  tableCard: {
    background: '#fff',
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
  },

  tableSubtitle: {
    margin: '4px 0 0',
    fontSize: '0.85rem',
    color: '#64748b',
  },

  timetableContainer: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  daySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  dayHeading: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#1e293b',
    borderLeft: '4px solid #4f46e5',
    paddingLeft: '12px',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  timetableSlot: {
    background: '#f8fafc',
    borderRadius: '20px',
    padding: '20px 24px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  courseTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#0f172a',
    display: 'block',
    marginBottom: '6px',
  },
  roomInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
  },
  classBadge: {
    background: '#e0e7ff',
    color: '#4338ca',
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '800',
    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)',
  },

  addBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
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
    boxShadow: '0 10px 20px -8px rgba(79, 70, 229, 0.5)',
  },

  classesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    padding: '24px',
  },

  classCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '20px',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },

  classCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },

  classYearBadge: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },

  classStudentCount: {
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8rem',
  },

  className: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#0f172a',
  },

  classSection: {
    margin: '0 0 12px 0',
    color: '#64748b',
    fontSize: '0.9rem',
  },

  classFooter: {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },

  classCoursesCount: {
    fontSize: '0.8rem',
    color: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#94a3b8',
    '& p': {
      margin: '16px 0',
    },
  },

  backButton: {
    margin: '0 0 20px 24px',
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1rem',
    fontWeight: '600',
  },

  coursesList: {
    padding: '0 24px 24px',
  },

  listSubtitle: {
    margin: '0 0 16px 0',
    color: '#334155',
    fontWeight: '700',
    fontSize: '0.95rem',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px',
  },

  tableHeadRow: {
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },

  th: {
    padding: '16px 28px',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '800',
    textAlign: 'left',
    letterSpacing: '0.05em',
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

  emptyMessage: {
    color: '#94a3b8',
    fontStyle: 'italic',
    padding: '20px',
    textAlign: 'center',
  },


  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },

  deleteIconBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
  },

  // Grades
  gradesFilter: {
    padding: '20px 28px',
    borderBottom: '1px solid #f1f5f9',
  },

  modernSelect: {
    padding: '12px 16px',
    borderRadius: '16px',
    border: '2px solid #f1f5f9',
    background: '#f8fafc',
    outline: 'none',
    fontWeight: '600',
    color: '#0f172a',
    cursor: 'pointer',
    width: '350px',
    maxWidth: '100%',
  },

  gradesSummary: {
    display: 'flex',
    gap: '24px',
    padding: '20px 28px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },

  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    '& span': {
      fontSize: '0.8rem',
      color: '#64748b',
      fontWeight: '600',
    },
    '& strong': {
      fontSize: '1.2rem',
      color: '#0f172a',
      fontWeight: '800',
    },
  },

  examType: {
    background: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'capitalize',
  },


  emptyTableCell: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
  },

  // Redesigned Assignments
  assignmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    padding: '24px',
  },
  assignmentCard: {
    background: '#fff',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    borderTop: '6px solid #4f46e5',
    padding: '28px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  assignmentCardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  assignmentTags: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '8px',
  },
  tagHomework: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '12px',
    background: '#f1f5f9',
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: '800',
  },
  tagPublished: {
    padding: '6px 14px',
    borderRadius: '12px',
    background: '#dcfce7',
    color: '#166534',
    fontSize: '0.75rem',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  assignmentCardTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    lineHeight: '1.4',
  },
  assignmentCardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 0',
  },
  dueInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  dueIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: '#fef2f2',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submissionCounterBox: {
    background: '#fffbeb',
    padding: '12px 16px',
    borderRadius: '16px',
    border: '1px solid #fef3c7',
    color: '#92400e',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  assignmentCardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: 'auto',
  },
  viewSubBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '18px',
    fontWeight: '800',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 15px -4px rgba(79, 70, 229, 0.4)',
  },
  editAssignBtn: {
    background: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    padding: '14px',
    borderRadius: '18px',
    fontWeight: '800',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },

  // Split View Submissions
  submissionSplitView: {
    display: 'flex',
    flexWrap: 'wrap',
    background: '#fff',
    borderRadius: '32px',
    overflow: 'hidden',
    height: 'auto',
    minHeight: 'calc(100vh - 180px)',
    boxShadow: '0 20px 50px -15px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  studentListPane: {
    flex: '1 1 350px',
    borderRight: '1px solid #f1f5f9',
    maxHeight: 'calc(100vh - 180px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    background: '#f8fafc',
  },
  paneHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid #f1f5f9',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 5,
  },
  paneTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  studentList: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  studentItem: (active) => ({
    padding: '20px',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: active ? '#fff' : 'transparent',
    border: '1px solid',
    borderColor: active ? '#e2e8f0' : 'transparent',
    boxShadow: active ? '0 10px 15px -5px rgba(0,0,0,0.05)' : 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  studentItemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  studentItemName: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '0.95rem',
  },
  studentItemId: {
    fontSize: '0.75rem',
    color: '#4f46e5',
    fontWeight: '700',
  },
  studentItemDate: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  gradingPane: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
    background: '#fff',
  },
  gradingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f1f5f9',
  },
  gradableInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  gradableName: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  gradableSubText: {
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  statusText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'right',
  },
  submissionContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  contentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionLabel: {
    fontSize: '0.9rem',
    fontWeight: '800',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  textSubmission: {
    background: '#f8fafc',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#334155',
    whiteSpace: 'pre-wrap',
  },
  attachmentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    background: '#fff',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  fileIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    background: '#eff6ff',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filePreview: {
    marginTop: '16px',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    padding: '12px',
  },
  previewImg: {
    width: '100%',
    height: 'auto',
    borderRadius: '16px',
    display: 'block',
  },
  gradingForm: {
    marginTop: '40px',
    padding: '32px',
    background: '#f8fafc',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  // Profile
  profileCard: {

    background: '#fff',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    padding: '40px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
  },

  profileHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },

  profileAvatar: {
    width: '100px',
    height: '100px',
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    color: '#fff',
    borderRadius: '32px',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '42px',
    fontWeight: '800',
    boxShadow: '0 15px 30px -10px rgba(79, 70, 229, 0.3)',
  },

  profileName: {
    fontSize: '1.5rem',
    fontWeight: '800',
    margin: '0 0 8px',
    color: '#0f172a',
  },

  profileRole: {
    background: '#f1f5f9',
    color: '#64748b',
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'inline-block',
  },

  profileStats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '24px 0',
    borderTop: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '24px',
  },

  profileStatItem: {
    textAlign: 'center',
    '& span': {
      display: 'block',
      fontSize: '0.8rem',
      color: '#64748b',
      marginBottom: '4px',
    },
    '& strong': {
      fontSize: '1.4rem',
      color: '#4f46e5',
    },
  },

  profileInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },

  infoItem: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    '& span': {
      fontSize: '0.75rem',
      fontWeight: '700',
      color: '#64748b',
      display: 'block',
      marginBottom: '4px',
    },
    '& p': {
      margin: 0,
      fontSize: '0.95rem',
      fontWeight: '600',
      color: '#0f172a',
    },
  },

  // Modals
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
    width: '500px',
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

  modalSubtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginBottom: '20px',
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

  row: {
    display: 'flex',
    gap: '16px',
  },

  flex1: {
    flex: 1,
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
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 20px -8px rgba(79, 70, 229, 0.5)',
  },

  createFormContainer: {
    background: '#fff',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    padding: 'min(40px, 5vw)',
    maxWidth: '1000px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  richTextPlaceholder: {
    minHeight: '300px',
    border: '2px solid #f1f5f9',
    borderRadius: '20px',
    padding: '20px',
    fontSize: '1rem',
    width: '100%',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  attachmentArea: {
    border: '2px dashed #e2e8f0',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    background: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  backToLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '12px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },

  // Premium Table UI
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  studentName: {
    fontWeight: '600',
    color: '#1e293b',
  },
  courseBadge: {
    background: '#eef2ff',
    color: '#4f46e5',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid #e0e7ff',
  },

  actionGroup: {
    display: 'flex',
    gap: '10px',
  },
  approveBtn: {
    padding: '8px 16px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
  },
  rejectBtn: {
    padding: '8px 16px',
    background: '#fff',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  },
  btnIcon: {
    fontSize: '0.9rem',
  },

  // Submission modal extras
  submissionsInfo: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },

  infoBadge: {
    background: '#f1f5f9',
    padding: '8px 16px',
    borderRadius: '30px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  downloadLink: {
    color: '#4f46e5',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },

  gradedMarks: {
    fontWeight: '700',
    color: '#166534',
  },

  notGraded: {
    color: '#ef4444',
    fontSize: '0.85rem',
  },

  gradeBtn: {
    background: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '0.7rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  submissionTextBlock: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '20px',
    marginBottom: '20px',
    maxHeight: '200px',
    overflowY: 'auto',
  },

  submissionLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    marginBottom: '8px',
  },
};

// Helper component for sidebar buttons
const SidebarBtn = ({ active, icon, label, count, onClick }) => (
  <button 
    onClick={onClick} 
    className={`nav-btn ${active ? 'active' : ''}`}
    style={{
      ...S.navBtn,
      ...(active ? S.navBtnActive : {}),
    }}
  >
    {icon}
    <span style={{flex: 1, textAlign: 'left'}}>{label}</span>
    {count > 0 && <span style={S.navBadge}>{count}</span>}
    {active && <div style={S.activeIndicator}></div>}
  </button>
);

// MetricBox component
const MetricBox = ({ label, value, icon, color, trend }) => (
  <div style={S.metricCard} className="metric-card">
    <div style={S.metricIconWrapper(color)}>
      {icon}
    </div>
    <div style={S.metricContent}>
      <p style={S.metricLabel}>{label}</p>
      <h2 style={S.metricValue}>{value}</h2>
      {trend && <span style={S.metricTrend}>{trend}</span>}
    </div>
  </div>
);

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
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .metric-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px -10px rgba(79, 70, 229, 0.15);
    border-color: #cbd5e1;
  }

  tr:hover {
    background: #f8fafc;
  }

  .class-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px -10px rgba(79, 70, 229, 0.1);
    border-color: #a5b4fc;
  }

  .add-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px -8px rgba(79, 70, 229, 0.6);
  }

  .primary-small-btn:hover {
    background: #1e293b;
    transform: translateY(-2px);
  }

  .secondary-small-btn:hover {
    border-color: #4f46e5;
    color: #4f46e5;
    transform: translateY(-2px);
  }

  .approve-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(34, 197, 94, 0.4);
  }

  .reject-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(239, 68, 68, 0.4);
  }

  .submission-btn:hover {
    background: #c7d2fe;
    transform: translateY(-2px);
  }

  .grade-btn:hover {
    background: #1e293b;
    transform: translateY(-2px);
  }

  input:focus, select:focus, textarea:focus {
    border-color: #4f46e5 !important;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
    outline: none !important;
  }

  .cancel-btn:hover {
    background: #e2e8f0;
  }

  .save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 25px -8px rgba(79, 70, 229, 0.6);
  }

  .modal-close:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
  
  .logout-btn:hover {
    background: rgba(239, 68, 68, 0.2) !important;
  }

  .nav-btn:hover:not(.active) {
    background: rgba(79, 70, 229, 0.1) !important;
    color: #fff !important;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease forwards;
  }

  /* Responsive handled by responsive.css */
`;
document.head.appendChild(style);

export default TeacherDashboard;
