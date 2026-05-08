import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  House, BookOpen, Clock, CheckCircle, GraduationCap, 
  PlusCircle, SignOut, CalendarBlank, User, UserPlus, 
  ChartLineUp, FileText, DotsThreeOutline, Bell, 
  ChartBar, Pulse, ChatCircle, Buildings, UserCircle
} from "@phosphor-icons/react";
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import API_BASE_URL from '../../config/api';

// Section Imports
import { S } from './sections/TDStyles';
import TDOverview from './sections/TDOverview';
import TDClasses from './sections/TDClasses';
import TDGrades from './sections/TDGrades';
import TDTimetable from './sections/TDTimetable';
import TDLabUsage from './sections/TDLabUsage';
import TDStudents from './sections/TDStudents';
import TDPending from './sections/TDPending';
import TDReports from './sections/TDReports';
import TDProfile from './sections/TDProfile';
import TDAssignments from './sections/TDAssignments';
import TDModals from './sections/TDModals';

const SidebarBtn = ({ active, icon, label, count, onClick }) => (
  <button 
    onClick={onClick} 
    style={{...S.navBtn, ...(active ? S.navBtnActive : {})}}
    className={`nav-btn ${active ? 'active' : ''}`}
  >
    {icon}
    <span style={{flex:1, textAlign:'left'}}>{label}</span>
    {count > 0 && <span style={S.navBadge}>{count}</span>}
    {active && <div style={S.activeIndicator}></div>}
  </button>
);

function TeacherDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [teacherClasses, setTeacherClasses] = useState([])
  const [classCourses, setClassCourses] = useState([])
  const [students, setStudents] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [grades, setGrades] = useState([])
  const [timetable, setTimetable] = useState([])
  const [assignments, setAssignments] = useState([])
  const [labUsage, setLabUsage] = useState([])
  const [reports, setReports] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [assignmentFilter, setAssignmentFilter] = useState('all')
  const [assignmentViewMode, setAssignmentViewMode] = useState('list')
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([])
  const [selectedSubmissionStudent, setSelectedSubmissionStudent] = useState(null)
  const [gradingSubmission, setGradingSubmission] = useState(null)
  const [gradeData, setGradeData] = useState({ marks_obtained: '', feedback: '' })
  
  const [newAssignment, setNewAssignment] = useState({ 
    title: '', description: '', course_id: '', due_date: '', max_marks: 100, 
    status: 'draft', assignment_type: 'Homework', academic_period: '2026-2027' 
  })
  const [newGrade, setNewGrade] = useState({ student_id: '', exam_type: 'midterm', marks_obtained: '', max_marks: 100, exam_date: '', remarks: '' })
  const [bulkGrades, setBulkGrades] = useState([])
  const [bulkGradeHeader, setBulkGradeHeader] = useState({ exam_type: 'midterm', max_marks: 100, exam_date: '' })
  const [newStudent, setNewStudent] = useState({ 
    name: '', email: '', father_name: '', father_cnic: '', 
    last_education: '', father_number: '', bform_number: '',
    password: 'Password123'
  })
  
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [showBulkGradeModal, setShowBulkGradeModal] = useState(false)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportDetails, setReportDetails] = useState(null)
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingPending, setLoadingPending] = useState(false)
  const [loadingLabs, setLoadingLabs] = useState(false)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [globalLoading, setGlobalLoading] = useState(false)
  const { showToast } = useToast()
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDanger: false })
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null)

  const token = sessionStorage.getItem('token')

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [])

  const fetchDashboardData = async () => {
    setGlobalLoading(true)
    try {
      await Promise.all([
        fetchCourses(), fetchClasses(), fetchStudents(), fetchPendingRequests(),
        fetchTimetable(), fetchAssignments(), fetchLabUsage(), fetchReports()
      ])
    } catch (error) { console.error('Fetch error:', error) }
    finally { setGlobalLoading(false) }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers/courses`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setCourses(data.courses || [])
    } catch (error) { console.error(error) }
  }

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/teacher/my-classes`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setTeacherClasses(data.classes || [])
    } catch (error) { console.error(error) }
  }

  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers/students`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setStudents(data.students || [])
    } catch (error) { console.error(error) }
    finally { setLoadingStudents(false) }
  }

  const fetchPendingRequests = async () => {
    setLoadingPending(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers/pending-enrollments`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setPendingRequests(data.pendingEnrollments || [])
    } catch (error) { console.error(error) }
    finally { setLoadingPending(false) }
  }

  const fetchCourseGrades = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grades/course/${courseId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setGrades(data.grades || [])
    } catch (error) { console.error(error) }
  }

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timetables/my-timetable`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setTimetable(data.timetable || [])
    } catch (error) { console.error(error) }
  }

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assignments/my-assignments`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setAssignments(data.assignments || [])
    } catch (error) { console.error(error) }
  }

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/assignment/${assignmentId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); 
      if (data.success) {
        setAssignmentSubmissions(data.submissions || []);
        setAssignmentViewMode('submissions');
        setSelectedSubmissionStudent(null);
      }
    } catch (error) { console.error(error) }
  }

  const fetchLabUsage = async () => {
    setLoadingLabs(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/labs/usage/all`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setLabUsage(data.usage || [])
    } catch (error) { console.error(error) }
    finally { setLoadingLabs(false) }
  }

  const fetchReports = async () => {
    setReportsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/my`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setReports(data.reports || [])
    } catch (error) { console.error(error) }
    finally { setReportsLoading(false) }
  }

  const fetchClassCourses = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${classId}/courses`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setClassCourses(data.courses || [])
    } catch (error) { console.error(error) }
  }

  const handleManageGrades = (course) => {
    setSelectedCourse(course); fetchCourseGrades(course.id); setActivePage('grades');
  }

  const handleGenerateReport = (courseId, courseTitle) => {
    setConfirmModal({
      isOpen: true, title: 'Generate Report', message: `Generate report and mark "${courseTitle}" as completed?`, isDanger: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const response = await fetch(`${API_BASE_URL}/api/reports/generate/${courseId}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
          const data = await response.json();
          if (data.success) { showToast('Report generated successfully!', 'success'); fetchCourses(); fetchReports(); }
          else showToast(data.message || 'Generation failed', 'error');
        } catch (error) { showToast('Network error', 'error'); }
      }
    });
  }

  const handleGradesCourseSelect = (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    setSelectedCourse(course);
  }

  const fetchReportDetails = async (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
    setIsReportDetailsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${report.id}/details`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setReportDetails(data);
      else showToast(data.message || 'Failed to fetch report details', 'error');
    } catch (error) { showToast('Error fetching report details', 'error'); }
    finally { setIsReportDetailsLoading(false); }
  }


  const handleAddStudent = async (e) => {
    e.preventDefault()
    
    // Ensure class_id is included
    const payload = {
      ...newStudent,
      class_id: newStudent.class_id || (selectedCourse ? selectedCourse.class_id : null)
    };

    if (!payload.class_id) {
      showToast('Please assign a class to the student', 'warning');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (data.success) { 
        showToast('Student added successfully!', 'success'); 
        setShowAddStudentModal(false); 
        setNewStudent({ 
          name: '', email: '', father_name: '', father_cnic: '', 
          last_education: '', father_number: '', bform_number: '',
          password: 'Password123'
        }); 
        fetchStudents(); 
      }
      else showToast(data.message || 'Failed to add student', 'error')
    } catch (error) { showToast('Failed to add student', 'error') }
  }

  const handleBulkStudentUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/students/bulk`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        showToast(`Successfully uploaded ${data.count} students!`, 'success');
        setShowAddStudentModal(false);
        fetchStudents();
      } else {
        showToast(data.message || 'Bulk upload failed', 'error');
      }
    } catch (error) {
      showToast('Connection error during bulk upload', 'error');
    }
  }

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (assignmentViewMode === 'create') {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `${API_BASE_URL}/api/assignments/${editingItem.id}` : `${API_BASE_URL}/api/assignments`;
      try {
        const response = await fetch(url, {
          method,
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(newAssignment)
        });
        const data = await response.json();
        if (data.success) {
          showToast(`Assignment ${editingItem ? 'updated' : 'created'} successfully!`, 'success');
          setAssignmentViewMode('list');
          fetchAssignments();
        } else showToast(data.message || 'Operation failed', 'error');
      } catch (err) { showToast('Operation failed', 'error'); }
      return;
    }

    if (!gradingSubmission) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/${gradingSubmission.id}/grade`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
      const data = await response.json();
      if (data.success) {
        showToast('Submission graded successfully!', 'success');
        setGradingSubmission(null);
        fetchSubmissions(selectedAssignment.id);
      } else showToast(data.message || 'Grading failed', 'error');
    } catch (err) { showToast('Grading failed', 'error'); }
  }

  const handleBackToAssignments = () => {
    setAssignmentViewMode('list');
    setSelectedAssignment(null);
    setAssignmentSubmissions([]);
    setSelectedSubmissionStudent(null);
  }

  const renderContent = () => {
    switch (activePage) {
      case 'overview':
        const stats = {
          total_courses: courses.length,
          total_students: students.length,
          total_classes: teacherClasses.length,
          total_assignments: assignments.length,
          total_graded: assignments.reduce((acc, curr) => acc + (curr.submission_count || 0), 0),
          total_pending: pendingRequests.length,
          recent_students: students.slice(0, 5).map(s => ({ ...s, enrolled_at: s.created_at, course_title: 'Software Engineering' })) // Fallback labels
        };
        return (
          <TDOverview 
            stats={stats}
            timetable={timetable} 
            pendingCount={pendingRequests.length}
            setActivePage={setActivePage} 
          />
        )
      case 'classes':
        return (
          <TDClasses 
            teacherClasses={teacherClasses} 
            courses={classCourses} 
            selectedClassId={selectedClassId} 
            setSelectedClassId={setSelectedClassId} 
            fetchClassCourses={fetchClassCourses} 
            handleManageGrades={handleManageGrades} 
            handleGenerateReport={handleGenerateReport} 
          />
        )
      case 'grades':
        return (
          <TDGrades 
            courses={courses} 
            selectedCourse={selectedCourse} 
            setSelectedCourse={setSelectedCourse} 
            students={students} 
            grades={grades} 
            fetchCourseGrades={fetchCourseGrades}
            setShowGradeModal={setShowGradeModal}
            setNewGrade={setNewGrade}
            setEditingItem={setEditingItem}
            setShowBulkGradeModal={setShowBulkGradeModal}
            setBulkGrades={setBulkGrades}
            bulkGrades={bulkGrades}
            bulkGradeHeader={bulkGradeHeader}
            setBulkGradeHeader={setBulkGradeHeader}
            handleGradesCourseSelect={handleGradesCourseSelect}
            setActivePage={setActivePage}
          />
        )
      case 'timetable':
        return <TDTimetable timetable={timetable} />
      case 'assignments':
        return (
          <TDAssignments 
            assignmentViewMode={assignmentViewMode}
            setAssignmentViewMode={setAssignmentViewMode}
            assignments={assignments}
            assignmentFilter={assignmentFilter}
            setAssignmentFilter={setAssignmentFilter}
            setSelectedAssignment={setSelectedAssignment}
            fetchSubmissions={fetchSubmissions}
            setNewAssignment={setNewAssignment}
            setEditingItem={setEditingItem}
            handleBackToAssignments={handleBackToAssignments}
            selectedAssignment={selectedAssignment}
            assignmentSubmissions={assignmentSubmissions}
            selectedSubmissionStudent={selectedSubmissionStudent}
            setSelectedSubmissionStudent={setSelectedSubmissionStudent}
            gradeData={gradeData}
            setGradeData={setGradeData}
            setGradingSubmission={setGradingSubmission}
            handleGradeSubmission={handleGradeSubmission}
            editingItem={editingItem}
            courses={courses}
            newAssignment={newAssignment}
            showToast={showToast}
          />
        )
      case 'lab-usage':
        return <TDLabUsage labUsage={labUsage} loadingLabs={loadingLabs} />
      case 'students':
        return (
          <TDStudents 
            campusStudents={students} 
            loadingStudents={loadingStudents} 
            setShowAddStudentModal={setShowAddStudentModal} 
            onOpenStudentProfile={(s) => { setSelectedStudentProfile(s); setShowProfileModal(true); }}
          />
        )
      case 'pending':
        return <TDPending pendingEnrollments={pendingRequests} loadingPending={loadingPending} fetchPendingEnrollments={fetchPendingRequests} />
      case 'reports':
        return <TDReports myReports={reports} reportsLoading={reportsLoading} onViewDetails={fetchReportDetails} />
      case 'profile':
        return <TDProfile user={user} courses={courses} students={students} teacherClasses={teacherClasses} />
      default: return <div>Select a module</div>
    }
  }

  return (
    <div style={S.container}>
      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn { display: block !important; }
          .sidebar { 
            left: -280px !important; 
            transition: all 0.3s ease !important;
            box-shadow: none !important;
          }
          .sidebar.mobile-open { 
            left: 0 !important; 
            box-shadow: 10px 0 30px rgba(0,0,0,0.2) !important;
            z-index: 1002 !important;
          }
          .main-content { margin-left: 0 !important; padding: 20px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          .header { flex-direction: column; align-items: flex-start !important; gap: 16px; }
        }
      `}</style>
      <div style={S.bgOrb1}></div>
      <div style={S.bgOrb2}></div>
      <div style={S.bgOrb3}></div>

      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={S.mobileMenuBtn} className="mobile-menu-btn">
        <DotsThreeOutline size={24} weight="bold" />
      </button>

      {globalLoading && <LoadingSpinner fullPage size="large" />}

      <ConfirmModal 
        isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message}
        onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmModal.isDanger}
      />

      <aside style={S.sidebar} className={`sidebar hidden-scrollbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={S.logoWrapper}>
          <div style={S.logoIcon}><GraduationCap size={24} weight="fill" /></div>
          <span style={S.logoText}>LANCERS <span style={S.logoAccent}>TECH</span></span>
        </div>

        <div style={S.userBadge}>
          <UserCircle size={20} weight="duotone" />
          <span>{user.department_name ? `${user.department_name} • Teacher` : 'Lancers Faculty'}</span>
          <div style={S.liveIndicator}></div>
        </div>

        <nav style={S.nav}>
          <SidebarBtn active={false} onClick={() => { navigate('/chat'); setMobileMenuOpen(false); }} icon={<ChatCircle size={20} />} label="Messages" count={null} />
          {[
            ['overview', 'Overview', <House size={20} />, null],
            ['classes', 'Classes', <Buildings size={20} />, teacherClasses.length],
            ['assignments', 'Assignments', <FileText size={20} />, assignments.length],
            ['timetable', 'Schedule', <Clock size={20} />, timetable.length],
            ['students', 'Students', <UserPlus size={20} />, students.length],
            ['pending', 'Requests', <Pulse size={20} weight="duotone" />, pendingRequests.length],
            ['grades', 'Grading', <GraduationCap size={20} />, null],
            ['reports', 'Reports', <ChartLineUp size={20} />, reports.length],
            ['lab-usage', 'Lab Insights', <Pulse size={20} />, null],
            ['profile', 'My Profile', <User size={20} />, null],
          ].map(([page, label, icon, count]) => (
            <SidebarBtn 
              key={page}
              active={activePage === page} 
              onClick={() => { 
                if (page === 'assignments') setAssignmentViewMode('list');
                setActivePage(page);
                setMobileMenuOpen(false); 
              }} 
              icon={icon} 
              label={label} 
              count={count} 
            />
          ))}
        </nav>

        <button onClick={onLogout} style={S.logoutBtn} className="logout-btn">
          <SignOut size={20} /> <span>Sign Out</span>
        </button>
      </aside>

      <main style={S.main} className="main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>{user.department_name || 'Faculty Hub'}</h1>
            <p style={S.subtitle}>Teacher Portal • Welcome back, <span style={S.userName}>{user.name}</span></p>
          </div>
          <div style={S.dateBadge}>
            <CalendarBlank size={18} /> {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
          </div>
        </header>

        {renderContent()}
      </main>

      <TDModals 
        showReportModal={showReportModal} setShowReportModal={setShowReportModal}
        selectedReport={selectedReport} reportDetails={reportDetails}
        isReportDetailsLoading={isReportDetailsLoading} fetchReportDetails={fetchReportDetails}
        showGradeModal={showGradeModal} setShowGradeModal={setShowGradeModal}
        selectedCourse={selectedCourse} editingItem={editingItem} setEditingItem={setEditingItem}
        newGrade={newGrade} setNewGrade={setNewGrade} students={students}
        showToast={showToast} fetchCourseGrades={fetchCourseGrades} token={token}
        showBulkGradeModal={showBulkGradeModal} setShowBulkGradeModal={setShowBulkGradeModal}
        bulkGradeHeader={bulkGradeHeader} setBulkGradeHeader={setBulkGradeHeader}
        bulkGrades={bulkGrades} setBulkGrades={setBulkGrades}
        showAddStudentModal={showAddStudentModal} setShowAddStudentModal={setShowAddStudentModal}
        handleAddStudent={handleAddStudent} 
        handleBulkStudentUpload={handleBulkStudentUpload}
        newStudent={newStudent} setNewStudent={setNewStudent}
        showProfileModal={showProfileModal} setShowProfileModal={setShowProfileModal}
        selectedStudentProfile={selectedStudentProfile}
        teacherClasses={teacherClasses}
        fetchStudents={fetchStudents}
      />
    </div>
  )
}

export default TeacherDashboard;
