import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../responsive.css'
import {
  House, BookOpen, Clock, CheckCircle, GraduationCap,
  SignOut, CalendarBlank, User, Buildings, 
  DotsThreeOutline, FileText, Pulse, ChatCircle, Sparkle,
  Receipt, Globe, UserFocus } from "@phosphor-icons/react";
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
import SDFees from './sections/SDFees';
import SDGraduation from './sections/SDGraduation';
import SDFaceAttendance from './sections/SDFaceAttendance';

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
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
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
  const [myChallans, setMyChallans] = useState([])
  const [exams, setExams] = useState([])
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
    fetchLabs(); fetchMyChallans(); fetchExams();
  }, [])

  useEffect(() => {
    if (courses.length >= 0) {
      fetchAvailableCourses()
    }
  }, [courses])

  useEffect(() => {
    if(courses.length > 0) fetchStudentAssignments();
  }, [courses]);

  const fetchMyChallans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/finance/my-challans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMyChallans(data.challans || []);
      }
    } catch (error) {
      console.error('Error fetching student challans:', error);
    }
  };

  const handlePrintChallan = (c) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Challan - ${c.challan_no}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
            .voucher-container { max-width: 800px; margin: 0 auto; background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: 800; color: var(--primary-color, #4f46e5); }
            .badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; background: #dcfce7; color: #15803d; }
            .badge.pending { background: #fef9c3; color: #a16207; }
            .badge.overdue { background: #fee2e2; color: #b91c1c; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 12px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
            .info-item { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #f1f5f9; }
            .info-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
            .info-val { font-size: 14px; font-weight: 700; color: #0f172a; }
            .fees-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .fees-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            .fees-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
            .total-row { background: #eef2ff; font-weight: 800; color: var(--primary-color, #4f46e5); }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
            .signature { text-align: center; width: 150px; }
            .signature-line { border-bottom: 1px solid #94a3b8; margin-bottom: 8px; height: 30px; }
            .signature-label { font-size: 11px; color: #64748b; }
            @media print {
              body { background: white; padding: 0; }
              .voucher-container { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="voucher-container">
            <div class="header">
              <div>
                <div class="logo">LANCERS <span style="color:#a5b4fc">TECH</span></div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Lancers Tech Institute of Technology & Sciences</div>
              </div>
              <div>
                <span class="badge ${c.status}">${c.status}</span>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">OFFICIAL FEE CHALLAN VOUCHER</h2>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Challan No: <strong>${c.challan_no}</strong></div>
            </div>

            <div class="section-title">Student Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Student Name</div>
                <div class="info-val">${c.student_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Roll Number</div>
                <div class="info-val">${c.roll_number}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Semester / Session</div>
                <div class="info-val">${c.semester || 'N/A'} (${c.academic_year || 'N/A'})</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-val">${user.email || 'N/A'}</div>
              </div>
            </div>

            <div class="section-title">Fee Particulars</div>
            <table class="fees-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th style="text-align: right;">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tuition Fee</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(c.tuition_fee || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Lab Charges</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(c.lab_fee || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Library Fee</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(c.library_fee || 0).toLocaleString()}</td>
                </tr>
                ${c.other_fee > 0 ? `
                <tr>
                  <td>Miscellaneous Charges</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(c.other_fee || 0).toLocaleString()}</td>
                </tr>
                ` : ''}
                ${c.discount_amount > 0 ? `
                <tr style="color: #10b981; font-weight: 600;">
                  <td>Scholarship Discount</td>
                  <td style="text-align: right;">- Rs. ${(c.discount_amount || 0).toLocaleString()}</td>
                </tr>
                ` : ''}
                ${c.accrued_late_fee > 0 ? `
                <tr style="color: #ef4444; font-weight: 600;">
                  <td>Accrued Late Surcharge</td>
                  <td style="text-align: right;">+ Rs. ${(c.accrued_late_fee || 0).toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td>Total Amount Payable</td>
                  <td style="text-align: right; font-size: 16px;">Rs. ${(c.total_amount + (c.accrued_late_fee || 0)).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 30px;">
              <strong>Important Notes:</strong><br/>
              1. Please deposit the fee in any designated bank branch before the due date: <strong>${new Date(c.due_date).toLocaleDateString()}</strong>.<br/>
              2. Late fee surcharge of Rs. ${c.late_fee_per_day || 100}/day will be applicable after the due date.<br/>
              3. This is a computer-generated voucher and does not require manual signature unless stamped by the cashier.
            </div>

            <div class="footer">
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Student Signature</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Cashier / Stamp</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Officer</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
      const response = await fetch(`${API_BASE_URL}/api/grades/my-academic-record`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setGrades(data.semester_records || [])
    } catch (error) { console.error(error) }
  }

  const fetchTimetable = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/timetables/student-timetable`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); 
      console.log('[DEBUG] Student Timetable API Response:', data);
      if (data.success) setTimetable(data.timetable || [])
    } catch (error) { console.error(error) }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/exams/student-schedule`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) setExams(data.exams || [])
    } catch (error) { console.error('Error fetching student exams:', error) }
  }

  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/available`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json(); if (data.success) setAvailableClasses(data.classes || [])
      if (data.success && data.classes) {
        const registeredClass = data.classes.find(c => c.registration_status === 'approved');
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
    // Deduplicate by assignment id just in case a course is fetched twice
    const uniqueAssignments = Array.from(new Map(allAssignments.map(a => [a.id, a])).values());
    setAssignments(uniqueAssignments);
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
  const unpaidCount = myChallans.filter(c => c.status !== 'paid').length;

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
            key={`${leftSidebarOpen}-${rightPanelOpen}`}
          />
        )
      case 'course-detail':
        return <SDCourseDetail selectedCourse={selectedCourse} setActivePage={setActivePage} assignments={assignments} grades={grades} attendanceLogs={attendanceLogs} />
      case 'attendance':
        return <SDAttendance attendanceStats={attendanceStats} attendanceLogs={attendanceLogs} />
      case 'grades':
        return <SDGrades />;
      case 'graduation':
        return <SDGraduation user={user} />;
      case 'registration':
        return <SDRegistration 
          user={user}
          availableClasses={availableClasses}
          myClassInfo={myClassInfo}
          myClassSubjects={myClassSubjects}
          availableCourses={availableCourses}
          courses={courses}
          handleRegisterClass={handleRegisterClass}
          handleEnrollCourse={handleEnrollCourse}
          registering={registering}
          enrolling={enrolling}
        />;
      case 'timetable':
        return <SDTimetable groupTimetableByDay={groupTimetableByDay} exams={exams} />
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
      case 'fees':
        return <SDFees challans={myChallans} onPrint={handlePrintChallan} />
      case 'face-attendance':
        return <SDFaceAttendance user={user} />
      default: return <div>Select a module</div>
    }
  }

  return (
    <div style={S.container} className="dashboard-wrapper">
      <div style={S.bgOrb1}></div>
      <div style={S.bgOrb2}></div>
      <div style={S.bgOrb3}></div>

      {!mobileMenuOpen && (
        <button onClick={() => setMobileMenuOpen(true)} style={S.mobileMenuBtn} className="mobile-menu-btn">
          <DotsThreeOutline size={24} weight="bold" />
        </button>
      )}

      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', zIndex: 1000
          }} 
          className="sidebar-backdrop"
        />
      )}

      {globalLoading && <LoadingSpinner fullPage size="large" />}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmModal.isDanger}
      />

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
            background: 'var(--primary-color, #4f46e5)',
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

      {/* ── Left Sidebar ── */}
      <aside style={{
        ...S.sidebar,
        transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',
        padding: 0,
      }} className={`sidebar ${leftSidebarOpen ? '' : 'collapsed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        
        {/* ← Close arrow centered on RIGHT edge of the left sidebar */}
        <button
          onClick={() => setLeftSidebarOpen(false)}
          style={{
            position: 'absolute',
            right: '-18px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            background: 'var(--primary-color, #4f46e5)',
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

            <p style={{...S.navLabel, marginTop:'20px'}}>ACCOUNTS</p>
            <SidebarBtn active={activePage === 'fees'} onClick={() => { setActivePage('fees'); setMobileMenuOpen(false); }} icon={<Receipt size={20} />} label="Fee Challans" count={unpaidCount > 0 ? unpaidCount : null} />

            <p style={{...S.navLabel, marginTop:'20px'}}>PERFORMANCE</p>
            <SidebarBtn active={activePage === 'attendance'} onClick={() => { setActivePage('attendance'); setMobileMenuOpen(false); }} icon={<CheckCircle size={20} />} label="Attendance" count={attendanceStats.percentage ? attendanceStats.percentage + '%' : null} />
            <SidebarBtn active={activePage === 'grades'} onClick={() => { setActivePage('grades'); setMobileMenuOpen(false); }} icon={<GraduationCap size={20} />} label="Results" count={grades.length} />
            <SidebarBtn active={activePage === 'graduation'} onClick={() => { setActivePage('graduation'); setMobileMenuOpen(false); }} icon={<FileText size={20} />} label="Transcript & Grad" count={null} />

            <p style={{...S.navLabel, marginTop:'20px'}}>SMART FEATURES</p>
            <SidebarBtn active={activePage === 'face-attendance'} onClick={() => { setActivePage('face-attendance'); setMobileMenuOpen(false); }} icon={<UserFocus size={20} />} label="Face Attendance" count={null} />
          </nav>

          <button onClick={onLogout} style={S.logoutBtn} className="logout-btn">
            <SignOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main 
        style={{
          ...S.main, 
          marginLeft: leftSidebarOpen ? '280px' : '24px',
          marginRight: (activePage === 'labs' && selectedLab) ? '0' : (rightPanelOpen ? '320px' : '24px'),
          padding: (activePage === 'labs' && selectedLab) ? '24px' : '48px',
          width: 'auto',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          minHeight: '100vh',
          transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
        }} 
        className="main-content"
      >
        {!(activePage === 'labs' && selectedLab) && (
          <header style={{...S.header, marginBottom:'40px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <h1 style={{...S.title, fontSize:'2.5rem', fontWeight:'800', letterSpacing:'-1px', background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>{user.department_name || 'Lancers Academic Portal'}</h1>
              <p style={{...S.subtitle, fontSize:'1.1rem', color:'#64748b', marginTop:'8px'}}>Welcome back, <span style={{color:'var(--primary-color, #4f46e5)', fontWeight:'700'}}>{user.name}</span> <Sparkle size={20} weight="fill" color="#f59e0b" style={{ display: 'inline-block', verticalAlign: 'text-bottom', marginLeft: '2px' }} /></p>
            </div>
            <div style={{...S.dateBadge, padding:'12px 20px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'16px', color:'#1e293b', display:'flex', alignItems:'center', gap:'10px', fontWeight:'600', boxShadow:'0 4px 12px rgba(0,0,0,0.03)'}}>
              <CalendarBlank size={20} weight="duotone" color="var(--primary-color, #4f46e5)" /> {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
            </div>
          </header>
        )}
        <div style={{animation:'fadeIn 0.5s ease-out'}}>
          {renderContent()}
        </div>
      </main>

      {/* Floating open button for RIGHT panel — only visible when right panel is CLOSED */}
      {!(activePage === 'labs' && selectedLab) && !rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          style={{
            position: 'fixed',
            right: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: 'var(--primary-color, #4f46e5)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px 0 0 12px',
            width: '28px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-4px 0 16px rgba(var(--primary-rgb, 79, 70, 229),0.35)',
            fontSize: '18px',
            fontWeight: '800',
            lineHeight: 1,
          }}
          className="sidebar-toggle-btn right-open-btn"
          title="Open profile panel"
        >
          ‹
        </button>
      )}

      {/* ── Right Panel ── */}
      {!(activePage === 'labs' && selectedLab) && (
        <SDRightPanel 
          user={user} 
          courses={courses} 
          attendanceStats={attendanceStats} 
          grades={grades}
          assignments={assignments}
          timetable={timetable}
          rightPanelOpen={rightPanelOpen} 
          setRightPanelOpen={setRightPanelOpen} 
        />
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
