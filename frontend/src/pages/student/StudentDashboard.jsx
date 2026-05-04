import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../responsive.css'
import {
  House, BookOpen, Clock, CheckCircle, GraduationCap,
  SignOut, CalendarBlank, User, Buildings, 
  DotsThreeOutline, FileText, Pulse, ChatCircle
} from "@phosphor-icons/react";
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import API_BASE_URL from '../../config/api';

// Section Imports
import { S } from './sections/SDStyles';
import SDOverview from './sections/SDOverview';
import SDAttendance from './sections/SDAttendance';
import SDGrades from './sections/SDGrades';
import SDRegistration from './sections/SDRegistration';
import SDTimetable from './sections/SDTimetable';
import SDAssignments from './sections/SDAssignments';
import SDLabs from './sections/SDLabs';
import SDCourseDetail from './sections/SDCourseDetail';
import SDRightPanel from './sections/SDRightPanel';
import SDModals from './sections/SDModals';

const SidebarBtn = ({ active, icon, label, count, onClick }) => (
  <button 
    onClick={onClick} 
    style={{...S.navBtn, ...(active ? S.navBtnActive : {})}}
    className={`nav-btn ${active ? 'active' : ''}`}
  >
    {active && <div style={S.activeIndicator}></div>}
    {icon}
    <span>{label}</span>
    {count !== null && count !== undefined && <span style={S.navBadge}>{count}</span>}
  </button>
);

function StudentDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState('courses')
  const [registrationTab, setRegistrationTab] = useState('class')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [attendanceStats, setAttendanceStats] = useState([])
  const [attendanceLogs, setAttendanceLogs] = useState([])
  const [grades, setGrades] = useState([])
  const [timetable, setTimetable] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [availableClasses, setAvailableClasses] = useState([])
  const [expandedClassId, setExpandedClassId] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [availableCourses, setAvailableCourses] = useState([])
  const [enrolling, setEnrolling] = useState(false)
  const [myClassSubjects, setMyClassSubjects] = useState([])
  const [myClassInfo, setMyClassInfo] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submissionFile, setSubmissionFile] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [availableLabs, setAvailableLabs] = useState([])
  const { showToast } = useToast()
  const [globalLoading, setGlobalLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  })

  const token = sessionStorage.getItem('token')

  useEffect(() => {
    fetchCourses(); fetchAttendance(); fetchGrades();
    fetchTimetable(); fetchAvailableClasses(); fetchStudentAssignments();
    fetchLabs();
  }, [])

  useEffect(() => {
    if (courses.length >= 0) {
      fetchAvailableCourses()
    }
  }, [courses])

  useEffect(() => {
    if(courses.length > 0) fetchStudentAssignments();
  }, [courses]);

  const fetchLabs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/labs`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setAvailableLabs(data.labs || []);
    } catch (error) { console.error('Error fetching labs:', error); }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/my-enrollments`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setCourses(data.enrollments || [])
    } catch (error) { console.error(error) }
  }

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/my-attendance`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); 
      if (data.success) { 
        setAttendanceStats(data.stats || { total: 0, present: 0, absent: 0, late: 0, percentage: 0 }); 
        setAttendanceLogs(data.records || []);
      }
    } catch (error) { console.error('Attendance fetch error:', error) }
  }

  const fetchGrades = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grades/my-grades`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setGrades(data.grades || [])
    } catch (error) { console.error(error) }
  }

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timetables/student-timetable`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setTimetable(data.timetable || [])
    } catch (error) { console.error(error) }
  }

  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/available`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setAvailableClasses(data.classes || [])
      if (data.success && data.classes) {
        const registeredClass = data.classes.find(c => c.is_registered > 0);
        if (registeredClass) {
          setMyClassInfo(registeredClass);
          fetchClassSubjects(registeredClass.id);
        }
      }
    } catch (error) { console.error(error) }
  }

  const fetchClassSubjects = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${classId}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setMyClassSubjects(data.courses || []);
    } catch (error) { console.error(error); }
  }

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        const enrolledIds = courses.map(c => c.id)
        const available = data.courses.filter(c => !enrolledIds.includes(c.id))
        setAvailableCourses(available)
      }
    } catch (error) { console.error(error) }
  }

  const handleEnrollCourse = (courseId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Enroll in Course',
      message: 'Are you sure you want to enroll in this course? Your request will be sent to the instructor for approval.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setEnrolling(true)
        try {
          const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success) {
            showToast('Enrollment request sent successfully!', 'success')
            fetchCourses()
          } else {
            showToast(data.message || 'Enrollment failed', 'error')
          }
        } catch (error) {
          showToast('Enrollment failed', 'error')
        } finally {
          setEnrolling(false)
        }
      },
      isDanger: false
    });
  }

  const handleRegisterClass = async (classId) => {
    setRegistering(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/register`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classId })
      })
      const data = await response.json()
      if (data.success) { 
        showToast('Successfully registered for class!', 'success'); 
        fetchAvailableClasses(); 
        setExpandedClassId(classId);
        fetchClassSubjects(classId);
      } else {
        showToast(data.sqlError || data.message || 'Registration failed', 'error');
      }
    } catch (error) { 
      showToast('Registration failed', 'error'); 
    } finally { setRegistering(false) }
  }

  const fetchStudentAssignments = async () => {
    if (courses.length === 0) return;
    let allAssignments = [];
    for (const course of courses) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/submissions/course/${course.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (data.success) {
          const courseAssignments = data.assignments.map(a => ({...a, course_title: course.title, teacher_name: course.teacher_name}));
          allAssignments = [...allAssignments, ...courseAssignments];
        }
      } catch (e) { console.error(e) }
    }
    setAssignments(allAssignments);
  }

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if(!selectedAssignment) return;
    const formData = new FormData();
    formData.append('submission_text', submissionText);
    if(submissionFile) formData.append('file', submissionFile);
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if(data.success) {
        showToast('Assignment Submitted!', 'success');
        setShowSubmitModal(false);
        setSubmissionText('');
        setSubmissionFile(null);
        fetchStudentAssignments();
      } else {
        showToast(data.message || 'Submission failed', 'error');
      }
    } catch(err) { 
      showToast('Submission failed', 'error');
    }
  }

  const groupTimetableByDay = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const grouped = {}; days.forEach(day => grouped[day] = [])
    timetable.forEach(entry => { if (grouped[entry.day_of_week]) grouped[entry.day_of_week].push(entry) })
    return grouped
  }

  const calculateGPA = () => {
    if (!grades || grades.length === 0) return 'N/A';
    let totalPoints = 0;
    let totalGrades = 0;
    grades.forEach(courseGrade => {
      if (courseGrade.grades && courseGrade.grades.length > 0) {
        courseGrade.grades.forEach(grade => {
          const gradePoints = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0
          };
          const points = gradePoints[grade.grade_letter] || 0;
          totalPoints += points;
          totalGrades++;
        });
      }
    });
    if (totalGrades === 0) return 'N/A';
    return (totalPoints / totalGrades).toFixed(2);
  };

  const totalAssignments = assignments.length;
  const pendingAssignments = assignments.filter(a => !a.marks_obtained && !a.submitted_at).length;
  const completedAssignments = assignments.filter(a => a.marks_obtained).length;

  const renderContent = () => {
    switch (activePage) {
      case 'courses':
        return (
          <SDOverview 
            courses={courses}
            attendanceStats={attendanceStats}
            attendanceLogs={attendanceLogs}
            calculateGPA={calculateGPA}
            completedAssignments={completedAssignments}
            totalAssignments={totalAssignments}
            pendingAssignments={pendingAssignments}
            myClassInfo={myClassInfo}
            myClassSubjects={myClassSubjects}
            setActivePage={setActivePage}
          />
        )
      case 'course-detail':
        return <SDCourseDetail selectedCourse={selectedCourse} setActivePage={setActivePage} />
      case 'attendance':
        return <SDAttendance attendanceStats={attendanceStats} attendanceLogs={attendanceLogs} />
      case 'grades':
        return <SDGrades grades={grades} calculateGPA={calculateGPA} />
      case 'registration':
        return (
          <SDRegistration 
            registrationTab={registrationTab}
            setRegistrationTab={setRegistrationTab}
            availableClasses={availableClasses}
            expandedClassId={expandedClassId}
            setExpandedClassId={setExpandedClassId}
            fetchClassSubjects={fetchClassSubjects}
            handleRegisterClass={handleRegisterClass}
            registering={registering}
            myClassSubjects={myClassSubjects}
            handleEnrollCourse={handleEnrollCourse}
            courses={courses}
            availableCourses={availableCourses}
            enrolling={enrolling}
            setSelectedCourse={setSelectedCourse}
            setActivePage={setActivePage}
          />
        )
      case 'timetable':
        return <SDTimetable groupTimetableByDay={groupTimetableByDay} />
      case 'assignments':
        return (
          <SDAssignments 
            assignments={assignments}
            setSelectedAssignment={setSelectedAssignment}
            setShowSubmitModal={setShowSubmitModal}
            setSubmissionText={setSubmissionText}
          />
        )
      case 'labs':
        return <SDLabs selectedLab={selectedLab} setSelectedLab={setSelectedLab} availableLabs={availableLabs} user={user} />
      default: return <div>Select a module</div>
    }
  }

  return (
    <div style={S.container}>
      <div style={S.bgOrb1}></div>
      <div style={S.bgOrb2}></div>
      <div style={S.bgOrb3}></div>

      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={S.mobileMenuBtn} className="mobile-menu-btn">
        <DotsThreeOutline size={24} weight="bold" />
      </button>

      {globalLoading && <LoadingSpinner fullPage size="large" />}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmModal.isDanger}
      />

      <aside style={S.sidebar} className={`sidebar hidden-scrollbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={S.logoWrapper}>
          <div style={S.logoIcon}><GraduationCap size={24} weight="fill" /></div>
          <span style={S.logoText}>LANCERS<span style={S.logoAccent}>TECH</span></span>
        </div>

        <div style={S.studentBadge}>
          <User size={14} weight="fill" />
          <span>{user.department_name || 'Lancers Student'}</span>
          <div style={S.liveIndicator}></div>
        </div>

        <nav style={S.nav}>
          <SidebarBtn active={false} onClick={() => { navigate('/chat'); setMobileMenuOpen(false); }} icon={<ChatCircle size={20} />} label="Chat" count={null} />
          <p style={S.navLabel}>ACADEMIC</p>
          <SidebarBtn active={activePage === 'courses'} onClick={() => { setActivePage('courses'); setMobileMenuOpen(false); }} icon={<House size={20} />} label="Dashboard" count={null} />
          <SidebarBtn active={activePage === 'registration'} onClick={() => { setActivePage('registration'); setMobileMenuOpen(false); }} icon={<Buildings size={20} />} label="Registration" count={availableClasses.length} />
          <SidebarBtn active={activePage === 'assignments'} onClick={() => { setActivePage('assignments'); setMobileMenuOpen(false); }} icon={<FileText size={20} />} label="Assignments" count={pendingAssignments} />
          <SidebarBtn active={activePage === 'timetable'} onClick={() => { setActivePage('timetable'); setMobileMenuOpen(false); }} icon={<Clock size={20} />} label="Schedule" count={timetable.length} />
          
          <p style={{...S.navLabel, marginTop:'20px'}}>RESOURCES</p>
          <SidebarBtn active={activePage === 'labs'} onClick={() => { setSelectedLab(null); setActivePage('labs'); setMobileMenuOpen(false); }} icon={<Pulse size={20} weight="duotone" />} label="Cloud Labs" count={null} />

          <p style={{...S.navLabel, marginTop:'20px'}}>PERFORMANCE</p>
          <SidebarBtn active={activePage === 'attendance'} onClick={() => { setActivePage('attendance'); setMobileMenuOpen(false); }} icon={<CheckCircle size={20} />} label="Attendance" count={attendanceStats.percentage ? attendanceStats.percentage + '%' : null} />
          <SidebarBtn active={activePage === 'grades'} onClick={() => { setActivePage('grades'); setMobileMenuOpen(false); }} icon={<GraduationCap size={20} />} label="Results" count={grades.length} />
        </nav>

        <button onClick={onLogout} style={S.logoutBtn} className="logout-btn">
          <SignOut size={20} /> <span>Sign Out</span>
        </button>
      </aside>

      <main 
        style={{
          ...S.main, 
          marginRight: (activePage === 'labs' && selectedLab) ? '0' : '320px',
          padding: (activePage === 'labs' && selectedLab) ? '24px' : '48px',
          width: (activePage === 'labs' && selectedLab) ? 'calc(100% - 280px)' : 'auto',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          minHeight: '100vh',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }} 
        className="main-content"
      >
        {!(activePage === 'labs' && selectedLab) && (
          <header style={{...S.header, marginBottom:'40px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <h1 style={{...S.title, fontSize:'2.5rem', fontWeight:'800', letterSpacing:'-1px', background:'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>{user.department_name || 'Lancers Academic Portal'}</h1>
              <p style={{...S.subtitle, fontSize:'1.1rem', color:'#94a3b8', marginTop:'8px'}}>Welcome back, <span style={{color:'#818cf8', fontWeight:'700'}}>{user.name}</span> ✨</p>
            </div>
            <div style={{...S.dateBadge, padding:'12px 20px', background:'rgba(255, 255, 255, 0.05)', border:'1px solid rgba(255, 255, 255, 0.1)', borderRadius:'16px', color:'#fff', display:'flex', alignItems:'center', gap:'10px', fontWeight:'600'}}>
              <CalendarBlank size={20} weight="duotone" color="#818cf8" /> {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
            </div>
          </header>
        )}
        <div style={{animation:'fadeIn 0.5s ease-out'}}>
          {renderContent()}
        </div>
      </main>

      {!(activePage === 'labs' && selectedLab) && (
        <SDRightPanel user={user} courses={courses} attendanceStats={attendanceStats} />
      )}

      <SDModals 
        showSubmitModal={showSubmitModal}
        setShowSubmitModal={setShowSubmitModal}
        selectedAssignment={selectedAssignment}
        handleSubmitAssignment={handleSubmitAssignment}
        submissionText={submissionText}
        setSubmissionText={setSubmissionText}
        submissionFile={submissionFile}
        setSubmissionFile={setSubmissionFile}
      />
    </div>
  )
}

export default StudentDashboard;
