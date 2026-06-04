import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  House, BookOpen, Clock, CheckCircle, GraduationCap, 
  PlusCircle, SignOut, CalendarBlank, User, UserPlus, 
  ChartLineUp, FileText, DotsThreeOutline, Bell, 
  ChartBar, Pulse, ChatCircle, Buildings, UserCircle, X, Cardholder
, Globe } from "@phosphor-icons/react";
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
import EPayroll from '../principal/sections/EPayroll';

import TDAttendance from './sections/TDAttendance';

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
    semester: 1, password: 'Password123'
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
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null)

  const [myLeaves, setMyLeaves] = useState([])
  const [myPayroll, setMyPayroll] = useState([])
  const [loadingMyLeaves, setLoadingMyLeaves] = useState(false)
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false)
  const [newLeave, setNewLeave] = useState({ leave_type: 'Casual', start_date: '', end_date: '', reason: '' })

  const token = sessionStorage.getItem('token')

  useEffect(() => {
    fetchDashboardData();
  }, [])

  const fetchDashboardData = async () => {
    setGlobalLoading(true)
    try {
      await Promise.all([
        fetchCourses(), fetchClasses(), fetchStudents(), fetchPendingRequests(),
        fetchTimetable(), fetchAssignments(), fetchLabUsage(), fetchReports(),
        fetchMyLeaves(), fetchMyPayroll()
      ])
    } catch (error) { console.error('Fetch error:', error) }
    finally { setGlobalLoading(false) }
  }

  const fetchMyLeaves = async () => {
    setLoadingMyLeaves(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/my-leaves`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json()
      if (data.success) setMyLeaves(data.leaves || [])
    } catch (error) { console.error('Error fetching my leaves:', error) }
    finally { setLoadingMyLeaves(false) }
  }

  const fetchMyPayroll = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/finance/my-payroll`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await response.json()
      if (data.success) setMyPayroll(data.payroll || [])
    } catch (error) { console.error('Error fetching my payroll:', error) }
  };

  const handlePrintPayroll = (p) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${p.month} ${p.year}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
            .voucher-container { max-width: 800px; margin: 0 auto; background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: 800; color: #7c3aed; }
            .badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; background: #dcfce7; color: #15803d; }
            .badge.pending { background: #fef9c3; color: #a16207; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 12px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
            .info-item { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #f1f5f9; }
            .info-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
            .info-val { font-size: 14px; font-weight: 700; color: #0f172a; }
            .fees-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .fees-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            .fees-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
            .total-row { background: #f5f3ff; font-weight: 800; color: #7c3aed; }
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
                <div class="logo">LANCERS <span style="color:#c084fc">TECH</span></div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Lancers Tech Institute of Technology & Sciences</div>
              </div>
              <div>
                <span class="badge ${p.status}">${p.status}</span>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">OFFICIAL SALARY DISBURSEMENT SLIP</h2>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Pay Period: <strong>${p.month} ${p.year}</strong></div>
            </div>

            <div class="section-title">Employee Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Employee Name</div>
                <div class="info-val">${p.employee_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Employee Code</div>
                <div class="info-val">${p.employee_code}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Designation</div>
                <div class="info-val">${p.designation}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Disbursed Date</div>
                <div class="info-val">${p.disbursed_at ? new Date(p.disbursed_at).toLocaleDateString() : 'Pending'}</div>
              </div>
            </div>

            <div class="section-title">Salary Breakdown</div>
            <table class="fees-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th style="text-align: right;">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(p.basic_salary || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #10b981;">Bonus & Allowances</td>
                  <td style="text-align: right; font-weight: 600; color: #10b981;">+ Rs. ${(p.bonus || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #ef4444;">Deductions & Taxes</td>
                  <td style="text-align: right; font-weight: 600; color: #ef4444;">- Rs. ${(p.deductions || 0).toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                  <td>Net Payable Amount</td>
                  <td style="text-align: right; font-size: 16px;">Rs. ${(p.net_payable || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 30px;">
              <strong>Important Notes:</strong><br/>
              1. This is a computer-generated salary slip and does not require manual signature unless stamped by the accounts department.<br/>
              2. Any query regarding tax deductions or basic salary increments should be reported to the HR Director within 5 working days.<br/>
              3. Strictly confidential. Keep secure.
            </div>

            <div class="footer">
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Employee Signature</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Finance Officer</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Audited By</div>
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

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/my-leaves`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLeave)
      });
      const data = await response.json();
      if (data.success) {
        showToast('Leave request submitted successfully!', 'success');
        setShowAddLeaveModal(false);
        setNewLeave({ leave_type: 'Casual', start_date: '', end_date: '', reason: '' });
        fetchMyLeaves();
      } else {
        showToast(data.message || 'Failed to submit leave request', 'error');
      }
    } catch (error) {
      showToast('Error submitting leave request', 'error');
    }
  };

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

  const handleBulkGradeCourseSelect = async (courseId) => {
    const course = courses.find(c => c.id === parseInt(courseId));
    setSelectedCourse(course);
    
    if (!course) {
      setBulkGrades([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/grades/course/${course.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json(); 
      const fetchedGrades = data.success ? (data.grades || []) : [];
      setGrades(fetchedGrades);

      const filteredStudents = students.filter(s => s.class_id === course.class_id);
      const initialBulk = filteredStudents.map(s => {
        const existing = fetchedGrades.find(g => g.student_id === s.student_id);
        return { student_id:s.student_id, student_name:s.name, marks_obtained: existing ? existing.marks_obtained : '', remarks: existing ? existing.remarks : '' };
      });
      setBulkGrades(initialBulk);
    } catch (error) { 
      console.error(error); 
    }
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
          semester: 1, password: 'Password123'
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

    const submissionToGrade = gradingSubmission || selectedSubmissionStudent;
    if (!submissionToGrade) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions/${submissionToGrade.id}/grade`, {
        method: 'PUT',
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
            myLeaves={myLeaves}
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
      case 'attendance':
        return <TDAttendance teacherClasses={teacherClasses} token={token} showToast={showToast} />
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
        return <TDPending pendingEnrollments={pendingRequests} loadingPending={loadingPending} fetchPendingEnrollments={fetchPendingRequests} onOpenStudentProfile={(s) => { setSelectedStudentProfile(s); setShowProfileModal(true); }} />
      case 'reports':
        return <TDReports myReports={reports} reportsLoading={reportsLoading} onViewDetails={fetchReportDetails} />
      case 'profile':
        return <TDProfile user={user} courses={courses} students={students} teacherClasses={teacherClasses} />
      case 'my-payroll':
        return <EPayroll payroll={myPayroll} onPrint={handlePrintPayroll} />
      case 'my-leaves':
        return (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Leaves & Attendance</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>Request leave and view your leave history.</p>
              </div>
              <button 
                onClick={() => setShowAddLeaveModal(true)} 
                style={{
                  background: 'linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #6366f1 100%)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '14px',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 20px -6px rgba(var(--primary-rgb, 79, 70, 229), 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <PlusCircle size={18} weight="bold" /> Apply for Leave
              </button>
            </div>

            <div style={{ overflowX: 'auto', background: '#f8fafc', borderRadius: '18px', padding: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Leave Period</th>
                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</th>
                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{l.days}</td>
                      <td style={{ padding: '16px', fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>{l.type}</td>
                      <td style={{ padding: '16px', fontSize: '0.85rem', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={l.reason}>{l.reason || 'N/A'}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          background: l.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : l.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: l.status === 'Approved' ? '#10b981' : l.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                        }}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {myLeaves.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                        No leave requests submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
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

      <aside 
        style={{
          ...S.sidebar,
          transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'visible',
          padding: '0px',
        }} 
        className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''} ${leftSidebarOpen ? '' : 'collapsed'}`}
      >
        {leftSidebarOpen && (
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
        )}

        <div
          style={{
            height: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: leftSidebarOpen ? '32px 20px' : '0px',
            width: '100%',
          }}
          className="hidden-scrollbar"
        >
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
              ['attendance', 'Attendance', <CheckCircle size={20} />, null],
              ['assignments', 'Assignments', <FileText size={20} />, assignments.length],
              ['timetable', 'Schedule', <Clock size={20} />, timetable.length],
              ['students', 'Students', <UserPlus size={20} />, students.length],
              ['pending', 'Requests', <Pulse size={20} weight="duotone" />, pendingRequests.length],
              ['grades', 'Grading', <GraduationCap size={20} />, null],
              ['reports', 'Reports', <ChartLineUp size={20} />, reports.length],
              ['lab-usage', 'Lab Insights', <Pulse size={20} />, null],
              ['profile', 'My Profile', <User size={20} />, null],
              ['my-payroll', 'My Payroll', <Cardholder size={20} />, myPayroll.length],
              ['my-leaves', 'My Leaves', <CalendarBlank size={20} />, null],
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
        </div>
      </aside>

      <main 
        style={{
          ...S.main,
          marginLeft: leftSidebarOpen ? '280px' : '24px',
          transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1)',
        }} 
        className="main-content"
      >
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

      {showAddLeaveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div className="hr-animate" style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '40px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 30px 70px -15px rgba(15, 23, 42, 0.3)',
            border: '1px solid rgba(15, 23, 42, 0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(var(--primary-rgb, 79, 70, 229), 0.1)',
                  color: 'var(--primary-color, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CalendarBlank size={22} weight="bold" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Apply for Leave</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Submit your leave request to HR.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddLeaveModal(false)}
                style={{ 
                  border: 'none', 
                  background: 'rgba(15, 23, 42, 0.05)', 
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer', 
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Leave Type</label>
                  <select 
                    value={newLeave.leave_type}
                    onChange={e => setNewLeave({...newLeave, leave_type: e.target.value})}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      border: '2px solid #e2e8f0',
                      background: '#f8fafc',
                      width: '100%',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                    required
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Short">Short Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Start Date</label>
                    <input 
                      type="date"
                      value={newLeave.start_date}
                      onChange={e => setNewLeave({...newLeave, start_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        border: '2px solid #e2e8f0',
                        background: '#f8fafc',
                        width: '100%',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>End Date</label>
                    <input 
                      type="date"
                      value={newLeave.end_date}
                      onChange={e => setNewLeave({...newLeave, end_date: e.target.value})}
                      min={newLeave.start_date || new Date().toISOString().split('T')[0]}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        border: '2px solid #e2e8f0',
                        background: '#f8fafc',
                        width: '100%',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>
                </div>

                {newLeave.leave_type === 'Other' && (
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Reason</label>
                    <textarea 
                      value={newLeave.reason}
                      onChange={e => setNewLeave({...newLeave, reason: e.target.value})}
                      placeholder="Describe your reason for leave..."
                      rows={4}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        border: '2px solid #e2e8f0',
                        background: '#f8fafc',
                        width: '100%',
                        fontSize: '0.92rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                        resize: 'none',
                      }}
                      required
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddLeaveModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    border: '2px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#64748b',
                    borderRadius: '16px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{
                    flex: 2,
                    padding: '14px 24px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #6366f1 100%)',
                    color: '#ffffff',
                    borderRadius: '16px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px -8px rgba(var(--primary-rgb, 79, 70, 229), 0.4)',
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        courses={courses}
        handleBulkGradeCourseSelect={handleBulkGradeCourseSelect}
      />
    </div>
  )
}

export default TeacherDashboard;
