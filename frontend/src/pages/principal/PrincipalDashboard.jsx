import { useState, useEffect } from "react";
import "../../responsive.css";
import { Chart } from "chart.js/auto";
import {
  House, ChalkboardTeacher, UserCircle, Buildings, BookOpen,
  UserPlus, SignOut, Plus, List, Clock, SquaresFour,
  ChartLine, FileText, ChatCircle, GraduationCap, ShieldCheck, Cardholder
, Globe, UserFocus } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config/api";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";
import { S } from "./sections/PDStyles";
import PDOverview      from "./sections/PDOverview";
import PDDataTable     from "./sections/PDDataTable";
import PDTimetable     from "./sections/PDTimetable";
import PDFeedback      from "./sections/PDFeedback";
import PDCourseReports from "./sections/PDCourseReports";
import EPayroll        from "./sections/EPayroll";
import PDFaceAttendance from "./sections/PDFaceAttendance";
import PDAdmissionRequests from "./sections/PDAdmissionRequests";
import PDStaffAttendance from "./sections/PDStaffAttendance";
import FinExpenses     from "../finance/sections/FinExpenses";
import "../finance/finance.css";
import { AddEditModal, TimetableModal, ReportModal, ClassCoursesModal, StudentProfileModal } from "./sections/PDModals";
import { BulkDataSheetModal } from "../../components/BulkDataSheetModal";

const API = `${API_BASE_URL}/api`;

// Global keyframes
const _s = document.createElement('style');
_s.textContent = `
  @keyframes float { 0% { transform:translate(0,0) scale(1); } 100% { transform:translate(3%,3%) scale(1.05); } }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.7;transform:scale(1.1);} }
  @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
  @keyframes spin { to{transform:rotate(360deg);} }
  .metric-card:hover{transform:translateY(-5px);box-shadow:0 20px 30px -10px rgba(124,58,237,.15);border-color:#c4b5fd;}
  .add-btn:hover{transform:translateY(-3px);box-shadow:0 15px 25px -8px rgba(124,58,237,.6);}
  .action-btn:hover{background:#ede9fe;border-color:#7c3aed;color:#7c3aed;transform:translateY(-2px);}
  .approve-btn:hover{transform:translateY(-2px);}
  .reject-btn:hover{transform:translateY(-2px);}
  .logout-btn:hover{background:rgba(239,68,68,.2)!important;}
  input:focus,select:focus,textarea:focus{border-color:#7c3aed!important;box-shadow:0 0 0 4px rgba(124,58,237,.1)!important;outline:none!important;}
  tr:hover{background:#f8fafc;}
  .timetable-entry-card:hover .entry-actions-overlay{opacity:1!important;transform:translateY(0)!important;}
  .animate-fadeIn{animation:fadeIn .3s ease forwards;}
  .animate-slideUp{animation:slideUp .3s ease forwards;}
`;
if (!document.head.querySelector('[data-pd-styles]')) { _s.setAttribute('data-pd-styles','true'); document.head.appendChild(_s); }

function PrincipalDashboard({ user = { name: "Principal" }, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState("overview");
  const [teachers,  setTeachers]        = useState([]);
  const [students,  setStudents]        = useState([]);
  const [classes,   setClasses]         = useState([]);
  const [courses,   setCourses]         = useState([]);
  const [logs,      setLogs]            = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [labs,      setLabs]            = useState([]);
  const [labUsage,  setLabUsage]        = useState([]);
  const [timetables, setTimetables]     = useState([]);
  const [timetableHistory, setTimetableHistory] = useState([]);
  const [courseFeedbackAnalytics, setCourseFeedbackAnalytics] = useState([]);
  const [labFeedbackAnalytics,    setLabFeedbackAnalytics]    = useState([]);
  const [engagementData, setEngagementData] = useState({ data:[7,9.5,4,6,3,1.5,10.7], labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] });
  const [isLoading, setIsLoading]       = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState("Operational");

  const [showAddModal,      setShowAddModal]      = useState(false);
  const [showBulkModal,     setShowBulkModal]     = useState(false);
  const [bulkModalType,     setBulkModalType]     = useState('student');
  const [showTimetableModal,setShowTimetableModal]= useState(false);
  const [editingItem,       setEditingItem]        = useState(null);
  const [newPerson, setNewPerson] = useState({ 
    name: '', email: '', password: 'Password123', semester: 1, 
    father_name: '', father_cnic: '', last_education: '', 
    father_number: '', bform_number: '' 
  });
  const [newClass,   setNewClass]   = useState({ name:"", section:"", academic_year:"2024-2025", teacher_id:"" });
  const [newCourse,  setNewCourse]  = useState({ title:"", description:"", teacher_id:"", class_id:"" });
  const [newLab,     setNewLab]     = useState({ name:"", description:"", icon:"Flask", environment:"Python", classId:"", url:"" });
  const [newTimetableEntry, setNewTimetableEntry] = useState({ course_id:'', class_id:'', teacher_id:'', day_of_week:['Monday'], start_time:'09:00', end_time:'11:00', room_number:'', academic_year:'2024-2025', semester:'Fall' });

  const [campusReports,  setCampusReports]  = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [showReportModal,   setShowReportModal]   = useState(false);
  const [selectedReport,    setSelectedReport]    = useState(null);
  const [reportDetails,     setReportDetails]     = useState(null);
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false);
  const [selectedClassForCourses,setSelectedClassForCourses]= useState(null);
  const [showClassCoursesModal, setShowClassCoursesModal] = useState(false);
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState(null);

  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({ isOpen:false, title:"", message:"", onConfirm:()=>{}, isDanger:false });
  const token = sessionStorage.getItem("token");

  const [myLeaves, setMyLeaves] = useState([]);
  const [myPayroll, setMyPayroll] = useState([]);
  const [campusExpenses, setCampusExpenses] = useState([]);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({ leave_type: 'Casual', start_date: '', end_date: '', reason: '' });

  const fetchMyLeaves = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/my-leaves`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setMyLeaves(data.leaves || []);
    } catch (error) { console.error('Error fetching my leaves:', error); }
  };

  const fetchMyPayroll = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/finance/my-payroll`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setMyPayroll(data.payroll || []);
    } catch (error) { console.error('Error fetching my payroll:', error); }
  };

  const fetchCampusExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/finance/expenses`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setCampusExpenses(data.expenses || []);
    } catch (error) { console.error('Error fetching campus expenses:', error); }
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => { 
    if (activeTab === 'course_reports') fetchCampusReports(); 
    if (activeTab === 'my-leaves') fetchMyLeaves();
    if (activeTab === 'my-payroll') fetchMyPayroll();
    if (activeTab === 'campus-expenses') fetchCampusExpenses();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const h = { Authorization:`Bearer ${token}` };
      const [t,s,cl,co,ps,tt,tth,lu,labsRes,logsRes,r7,r8,eng,repRes] = await Promise.all([
        fetch(`${API}/principal/teachers`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/principal/students`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/classes`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/courses?status=all`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/pending-students`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/timetables`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/timetables/history`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/labs/usage/all`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/labs`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/logs`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/feedback/analytics/courses`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/feedback/analytics/labs`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/principal/engagement-stats`,{headers:h}).then(r=>r.json()),
        fetch(`${API}/reports/campus`,{headers:h}).then(r=>r.json()),
      ]);
      
      const hasErrors = !t.success || !s.success || !cl.success || !co.success;
      if (hasErrors) {
        setSystemStatus("Degraded");
      } else {
        setSystemStatus("Operational");
      }

      if (eng.success)   setEngagementData({ data:eng.data, labels:eng.labels });
      if (t.success)     setTeachers(t.teachers||[]);
      if (s.success)     setStudents(s.students||[]);
      if (cl.success)    setClasses(cl.classes||[]);
      if (co.success)    setCourses(co.courses||[]);
      if (ps.success)    setPendingStudents(ps.students||[]);
      if (tt.success)    setTimetables(tt.timetables||[]);
      if (tth.success)   setTimetableHistory(tth.history||[]);
      if (lu.success)    setLabUsage(lu.usage||[]);
      if (labsRes.success) setLabs(labsRes.labs||[]);
      if (logsRes.success) setLogs(logsRes.logs||[]);
      if (r7?.success)   setCourseFeedbackAnalytics(r7.analytics||[]);
      if (r8?.success)   setLabFeedbackAnalytics(r8.analytics||[]);
      if (repRes?.success) setCampusReports(repRes.reports||[]);
    } catch(e) { 
      console.error(e); 
      setSystemStatus("Offline");
    }
    setIsLoading(false);
  };

  const fetchCampusReports = async () => {
    setReportsLoading(true);
    try {
      const res  = await fetch(`${API}/reports/campus`,{headers:{Authorization:`Bearer ${token}`}});
      const data = await res.json();
      if (data.success) setCampusReports(data.reports||[]);
    } catch(e){} 
    setReportsLoading(false);
  };

  const fetchReportDetails = async (report) => {
    setSelectedReport(report); setShowReportModal(true); setIsReportDetailsLoading(true);
    try {
      const res  = await fetch(`${API}/reports/${report.id}/details`,{headers:{Authorization:`Bearer ${token}`}});
      const data = await res.json();
      if (data.success) setReportDetails(data);
    } catch(e){}
    setIsReportDetailsLoading(false);
  };

  const resetForms = () => {
    setNewPerson({ name: '', email: '', password: 'Password123', semester: 1, father_name: '', father_cnic: '', last_education: '', father_number: '', bform_number: '' });
    setNewClass({name:"",section:"",academic_year:"2024-2025",teacher_id:""});
    setNewCourse({title:"",description:"",teacher_id:"",class_id:""});
    setNewLab({name:"",description:"",icon:"Flask",environment:"Python",classId:"",url:""});
    setNewTimetableEntry({course_id:'',class_id:'',teacher_id:'',day_of_week:'Monday',start_time:'09:00',end_time:'11:00',room_number:'',academic_year:'2024-2025',semester:'Fall'});
    setEditingItem(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const endpointMap = {
      teachers: 'principal/teachers',
      students: 'students',
      classes: 'classes',
      courses: 'courses',
      labs: 'labs',
      exams: 'exams',
      finance: 'finance',
      timetable: 'timetables',
      library: 'library',
      feedback: 'feedback'
    };
    const bodyMap = {
      teachers: newPerson,
      students: newPerson,
      classes: newClass,
      courses: newCourse,
      labs: newLab,
      exams: {}, // Placeholders for now
      finance: {},
      timetable: newTimetableEntry,
      library: {},
      feedback: {}
    };
    let url    = `${API}/${endpointMap[activeTab]}`;
    let method = 'POST';
    let body   = editingItem || bodyMap[activeTab];
    if (editingItem) {
      url = `${API}/${endpointMap[activeTab]}/${editingItem.id}`; method='PUT';
      if (activeTab==='teachers') {
        body={name:editingItem.name,email:editingItem.email,semester:editingItem.semester};
        if (newPerson.password) body.password=newPerson.password;
      } else if (activeTab==='students') {
        body={
          name:editingItem.name, email:editingItem.email, semester:editingItem.semester,
          father_name:editingItem.father_name, father_cnic:editingItem.father_cnic,
          last_education:editingItem.last_education, father_number:editingItem.father_number,
          bform_number:editingItem.bform_number
        };
        if (newPerson.password) body.password=newPerson.password;
      } else if (activeTab==='courses') {
        body={title:editingItem.title, description:editingItem.description, teacher_id:editingItem.teacher_id||null, class_id:editingItem.class_id||null};
      } else if (activeTab==='classes') {
        body={name:editingItem.name, section:editingItem.section, academic_year:editingItem.academic_year, teacher_id:editingItem.teacher_id||null};
      }
    }
    const res  = await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await res.json();
    if (data.success) { showToast(`${editingItem?'Updated':'Added'} successfully!`,"success"); setShowAddModal(false); fetchData(); resetForms(); }
    else showToast(data.message||"Error","error");
  };

  const handleBulkJsonUpload = async (studentsList) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/bulk-json`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ students: studentsList })
      });
      const data = await response.json();
      if (data.success) {
        if (data.count === 0 && data.errors && data.errors.length > 0) {
          showToast(`Bulk Upload failed: ${data.errors[0]}`, 'error');
        } else {
          showToast(`Successfully added ${data.count} students!`, 'success');
          if (data.errors && data.errors.length > 0) {
            setTimeout(() => showToast(`Skipped duplicate rows: ${data.errors.join(', ')}`, 'warning'), 3000);
          }
          setShowBulkModal(false);
          fetchData();
        }
      } else {
        showToast(data.message || 'Bulk upload failed', 'error');
      }
    } catch (error) { 
      showToast('Connection error during bulk upload', 'error'); 
    }
  };

  const handleBulkTeacherUpload = async (teachersList) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/principal/teachers/bulk-json`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teachers: teachersList })
      });
      const data = await response.json();
      if (data.success) {
        if (data.count === 0 && data.errors && data.errors.length > 0) {
          showToast(`Bulk Upload failed: ${data.errors[0]}`, 'error');
        } else {
          showToast(`Successfully added ${data.count} teachers!`, 'success');
          if (data.errors && data.errors.length > 0) {
            setTimeout(() => showToast(`Skipped duplicate rows: ${data.errors.join(', ')}`, 'warning'), 3000);
          }
          setShowBulkModal(false);
          fetchData();
        }
      } else {
        showToast(data.message || 'Bulk upload failed', 'error');
      }
    } catch (error) { 
      showToast('Connection error during bulk upload', 'error'); 
    }
  };

  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    const days = Array.isArray(newTimetableEntry.day_of_week) ? newTimetableEntry.day_of_week : [newTimetableEntry.day_of_week].filter(Boolean);
    
    if (days.length === 0) {
      showToast("Please select at least one day", "error");
      return;
    }

    try {
      const url = editingItem ? `${API_BASE_URL}/api/timetables/${editingItem.id}` : `${API_BASE_URL}/api/timetables`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const promises = days.map(day => {
         const entry = {...newTimetableEntry, day_of_week: day};
         return fetch(url, {method, headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}, body:JSON.stringify(entry)});
      });
      
      const responses = await Promise.all(promises);
      const dataResults = await Promise.all(responses.map(r => r.json()));
      
      const hasError = dataResults.some(d => !d.success);
      if (!hasError) {
        showToast(`Timetable ${editingItem?'updated':'added'} successfully!`, "success");
        setShowTimetableModal(false);
        fetchData();
        resetForms();
      } else {
        const errorMsg = dataResults.find(d => !d.success)?.message || "Error";
        showToast(errorMsg, "error");
      }
    } catch (err) {
       showToast("Error saving timetable", "error");
    }
  };

  const confirm = (title,message,onConfirm,isDanger=false) => setConfirmModal({isOpen:true,title,message,onConfirm,isDanger});

  const handleDelete = (id, type) => confirm(`Delete ${type}`,`Delete this ${type}?`, async () => {
    setConfirmModal(p=>({...p,isOpen:false}));
    const map={teacher:'principal/teachers',student:'students',class:'classes',course:'courses',lab:'labs',lab_report:'labs/usage'};
    const res=await fetch(`${API}/${map[type]}/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json();
    data.success ? (showToast("Deleted!","success"),fetchData()) : showToast(data.message||"Error","error");
  }, true);

  const handleDeleteTimetable = (id) => confirm("Delete Entry","Delete this timetable entry?", async () => {
    setConfirmModal(p=>({...p,isOpen:false}));
    const res=await fetch(`${API}/timetables/${id}`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json();
    data.success ? (showToast("Deleted!","success"),fetchData()) : showToast(data.message||"Error","error");
  }, true);

  const handleApprove = (id,name) => confirm("Approve Student",`Approve ${name}?`, async () => {
    setConfirmModal(p=>({...p,isOpen:false}));
    const res=await fetch(`${API}/pending-students/${id}/approve`,{method:'PUT',headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json();
    data.success ? (showToast(`${name} approved!`,"success"),fetchData()) : showToast(data.message||"Error","error");
  });

  const handleReject = (id,name) => confirm("Reject Student",`Reject ${name}?`, async () => {
    setConfirmModal(p=>({...p,isOpen:false}));
    const res=await fetch(`${API}/pending-students/${id}/reject`,{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json();
    data.success ? (showToast("Rejected","success"),fetchData()) : showToast(data.message||"Error","error");
  }, true);

  const handleUpdateCourseStatus = (id,status) => confirm(status==='completed'?"Complete Course":"Re-activate Course",status==='completed'?"Mark as completed?":"Re-activate?", async () => {
    setConfirmModal(p=>({...p,isOpen:false}));
    const res=await fetch(`${API}/courses/${id}/status`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({status})});
    const data=await res.json();
    data.success ? (showToast(`Course ${status==='completed'?'completed':'re-activated'}!`,"success"),fetchData()) : showToast(data.message||"Error","error");
  });

  const handleGenerateReport = (courseId,courseTitle) => confirm("Generate Report",`Generate report for "${courseTitle}"?`, async () => {
    setConfirmModal(p=>({...p,isOpen:false}));
    const res=await fetch(`${API}/reports/generate/${courseId}`,{method:'POST',headers:{Authorization:`Bearer ${token}`}});
    const data=await res.json();
    data.success ? (showToast(`Report generated!`,"success"),fetchData(),fetchCampusReports()) : showToast(data.message||"Error","error");
  });

  const getTableData = () => {
    if (activeTab==='courses')     return courses.filter(c=>c.status==='active');
    if (activeTab==='history')     return courses.filter(c=>c.status==='completed');
    if (activeTab==='lab_reports') return labUsage;
    if (activeTab==='course_reports') return [];
    return {teachers,students,classes,pending:pendingStudents,labs}[activeTab]||[];
  };

  const singularTab = (tab) => {
    if (tab==='classes') return 'class'; if (tab==='pending') return 'student';
    if (tab==='labs')    return 'lab';   if (tab==='history') return 'course';
    return tab.slice(0,-1);
  };

  if (isLoading) return (
    <div style={S.loadingContainer}>
      <div style={S.loadingSpinner}></div>
      <p style={S.loadingText}>Loading Department Dashboard...</p>
    </div>
  );

  const isSchool = (user?.institution_type || 'university') === 'school';
  const isCollege = isSchool;

  const navItems = [
    ['overview',      'Academic Analytics',                                   <House size={20}/>,                teachers.length+students.length],
    ['teachers',      isSchool ? 'Teachers' : 'Faculty Management',          <ChalkboardTeacher size={20}/>,    teachers.length],
    ['students',      isSchool ? 'Students' : 'Student Lifecycle',           <UserCircle size={20}/>,           students.length],
    ['classes',       isSchool ? 'Classes' : 'Programs & Courses',           <Buildings size={20}/>,           classes.length],
    ['courses',       isSchool ? 'Subjects / Courses' : 'Courses',           <BookOpen size={20}/>,            courses.filter(c=>c.status==='active').length],
    ['history',       'Course History',                                       <Clock size={20}/>,                courses.filter(c=>c.status==='completed').length],
    ['course_reports','Course Reports',                                       <FileText size={20}/>,             campusReports.length],
    ...(isSchool ? [['staff-attendance', 'Staff Attendance', <UserFocus size={20}/>, null]] : []),
    ['face-attendance','Face Attendance',                                     <UserFocus size={20}/>,            null],
    ['timetable',     isSchool ? 'College Schedule' : 'Academic Schedule',    <Clock size={20}/>,                timetables.length],
    ['labs',          'Lab & Assets',                                        <SquaresFour size={20}/>,          labs.length],
    ['pending',       isSchool ? 'Admission Queue' : 'Enrollment Queue',     <UserPlus size={20}/>,             pendingStudents.length],
    ['my-payroll',    'My Payroll',                                          <Cardholder size={20}/>,           myPayroll.length],
    ['campus-expenses','Campus Expenses',                                    <Buildings size={20}/>,            campusExpenses.length],
    ['my-leaves',     'My Leaves',                                           <Clock size={20}/>,                null],
  ];


  return (
    <div style={S.container} className="dashboard-wrapper">
      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message}
        onConfirm={confirmModal.onConfirm} onCancel={()=>setConfirmModal(p=>({...p,isOpen:false}))} isDanger={confirmModal.isDanger} />

      <div style={S.bgOrb1}/><div style={S.bgOrb2}/><div style={S.bgOrb3}/>

      <button onClick={() => { console.log("Sidebar toggled. Current state:", mobileMenuOpen, "-> Next:", !mobileMenuOpen); setMobileMenuOpen(!mobileMenuOpen); }} className="mobile-menu-btn">
        <List size={24} weight="bold"/>
      </button>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

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
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: '0 12px 12px 0',
            width: '28px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '4px 0 16px rgba(124,58,237,0.35)',
            fontSize: '18px',
            fontWeight: '800',
            lineHeight: 1,
          }}
          className="sidebar-toggle-btn left-open-btn"
          title="Open sidebar"
        >
          &gt;
        </button>
      )}

      {/* Sidebar */}
      <aside style={{
        ...S.sidebar,
        transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'visible',
        padding: 0,
      }} className={`sidebar ${mobileMenuOpen ? 'mobile-open' : (leftSidebarOpen ? '' : 'collapsed')}`}>
        
        {/* ← Close arrow centered on RIGHT edge of the left sidebar */}
        {leftSidebarOpen && (
          <button
            onClick={() => setLeftSidebarOpen(false)}
            style={{
              position: 'absolute',
              right: '-18px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: '0 10px 10px 0',
              width: '18px',
              height: '60px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 0 14px rgba(124,58,237,0.35)',
              fontSize: '18px',
              fontWeight: '800',
              lineHeight: 1,
            }}
            className="sidebar-toggle-btn left-close-btn"
            title="Close sidebar"
          >
          &lt;
          </button>
        )}

        {/* Inner Scrollable Container */}
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

          <div style={S.principalBadge}>
            <ShieldCheck size={20} weight="duotone"/>
            <span>{user.department_name ? `Dean of ${user.department_name}` : 'Academic Dean'}</span>
            <div style={S.liveIndicator}/>
          </div>
          {/* Institution Type Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            marginBottom: '16px',
            background: isSchool ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            border: `1px solid ${isSchool ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
            fontSize: '12px',
            fontWeight: '700',
            color: isSchool ? '#10b981' : '#818cf8',
            letterSpacing: '0.02em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            {isSchool ? <Buildings size={16} weight="duotone" color="#10b981" /> : <GraduationCap size={16} weight="duotone" color="#818cf8" />}
            <span>{isSchool ? 'College Mode' : 'University Mode'}</span>
          </div>
          <nav style={S.nav}>
            <button type="button" onClick={()=>{navigate('/chat');setMobileMenuOpen(false);}} style={S.navBtn} className="nav-btn">
              <ChatCircle size={20}/><span style={{flex:1,textAlign:'left'}}>Chat</span>
            </button>
            {navItems.map(([tab,label,icon,count])=>(
              <button key={tab} onClick={()=>{setActiveTab(tab);setMobileMenuOpen(false);}}
                style={{...S.navBtn,...(activeTab===tab?S.navBtnActive:{})}}
                className={`nav-btn ${activeTab===tab?'active':''}`}>
                {icon}
                <span style={{flex:1,textAlign:'left'}}>{label}</span>
                {count>0 && <span style={S.navBadge}>{count}</span>}
                {activeTab===tab && <div style={S.activeIndicator}/>}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} style={S.logoutBtn} className="logout-btn">
            <SignOut size={20}/><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        ...S.main,
        marginLeft: leftSidebarOpen ? '280px' : '24px',
        marginRight: rightPanelOpen ? '320px' : '24px',
        transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1), margin-right 0.35s cubic-bezier(0.4,0,0.2,1)',
      }} className="main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>{user.department_name||'Deanery Office'}</h1>
            <p style={S.subtitle}>Academic Council Portal — {user.name}</p>
          </div>
          <div style={S.headerActions}>
              <div style={{...S.dateBadge, cursor:"pointer", background: "#e0e7ff", color: "#4f46e5"}} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/student-admission?campus=${user.campus_id}`); alert("Admission Link Copied: " + `${window.location.origin}/student-admission?campus=${user.campus_id}`); }}><span>Link:</span> <span>Copy Admission Link</span></div>
            <div style={S.dateBadge}>{new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            <div style={S.refreshBadge} onClick={() => fetchData()}>
              <Clock size={14}/> <span>Refresh</span>
            </div>
          </div>
        </header>

        {activeTab==='overview' && (
          <PDOverview teachers={teachers} students={students} classes={classes} courses={courses}
            pendingStudents={pendingStudents} logs={logs} engagementData={engagementData}
            setActiveTab={setActiveTab} setShowAddModal={setShowAddModal} 
            rightPanelOpen={rightPanelOpen} leftSidebarOpen={leftSidebarOpen}/>
        )}

        {activeTab==='timetable' && (
          <PDTimetable timetables={timetables} timetableHistory={timetableHistory}
            courses={courses} classes={classes} teachers={teachers}
            setShowTimetableModal={setShowTimetableModal}
            setEditingItem={setEditingItem} setNewTimetableEntry={setNewTimetableEntry}
            onDelete={handleDeleteTimetable}/>
        )}

        {activeTab==='staff-attendance' && (
          <PDStaffAttendance leftSidebarOpen={leftSidebarOpen} />
        )}

        {activeTab==='feedback' && (
          <PDFeedback courseFeedbackAnalytics={courseFeedbackAnalytics} labFeedbackAnalytics={labFeedbackAnalytics}/>
        )}

        {activeTab==='course_reports' && (
          <PDCourseReports campusReports={campusReports} reportsLoading={reportsLoading} onViewDetails={fetchReportDetails}/>
        )}

        {activeTab === 'face-attendance' && (
          <PDFaceAttendance token={token} />
        )}

        {activeTab === 'pending' && (
            <PDAdmissionRequests />
          )}

        {!['overview','timetable','feedback','course_reports', 'my-leaves', 'my-payroll', 'campus-expenses', 'face-attendance', 'pending'].includes(activeTab) && (
          <PDDataTable activeTab={activeTab} tableData={getTableData()}
            setShowAddModal={setShowAddModal} setEditingItem={setEditingItem}
            onDelete={handleDelete} onApprove={handleApprove} onReject={handleReject}
            onUpdateCourseStatus={handleUpdateCourseStatus} onGenerateReport={handleGenerateReport}
            onOpenClassCourses={(item)=>{setSelectedClassForCourses(item);setShowClassCoursesModal(true);}}
            onOpenStudentProfile={(item)=>{setSelectedStudentForProfile(item);setShowStudentProfileModal(true);}}
            onOpenBulkModal={(type) => { setBulkModalType(type); setShowBulkModal(true); }}
            setActiveTab={setActiveTab} setNewCourse={setNewCourse} courses={courses} isCollege={isCollege}/>
        )}

        {activeTab === 'my-payroll' && (
          <EPayroll payroll={myPayroll} onPrint={handlePrintPayroll} />
        )}

        {activeTab === 'campus-expenses' && (
          <div style={{ background: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Campus Operational Expenses</h2>
            <FinExpenses expenses={campusExpenses} readOnly={true} />
          </div>
        )}

        {activeTab === 'my-leaves' && (
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
                  background: 'linear-gradient(135deg, #7c3aed 0%, #9061f9 100%)',
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
                  boxShadow: '0 8px 20px -6px rgba(124, 58, 237, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Plus size={18} weight="bold" /> Apply for Leave
              </button>
            </div>

            <div style={{ overflowX: 'auto', background: '#f8fafc', borderRadius: '18px', padding: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Leave Period</th>
                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</th>
                    <th style={{ padding: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
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
        )}
      </main>

      {/* Floating open button — only visible when right panel is CLOSED */}
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          style={{
            position: 'fixed',
            right: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: '12px 0 0 12px',
            width: '28px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-4px 0 16px rgba(124,58,237,0.35)',
            fontSize: '18px',
            fontWeight: '800',
            lineHeight: 1,
          }}
          className="sidebar-toggle-btn right-open-btn"
          title="Open sidebar"
        >
          &lt;
        </button>
      )}

      <aside style={{
        ...S.rightPanel,
        transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'visible',
        padding: 0,
      }} className={`right-panel ${rightPanelOpen ? '' : 'collapsed'}`}>

        {/* ← Close arrow centered on LEFT edge of the panel */}
        <button
          onClick={() => setRightPanelOpen(false)}
          style={{
            position: 'absolute',
            left: '-18px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: '10px 0 0 10px',
            width: '18px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-4px 0 14px rgba(124,58,237,0.35)',
            fontSize: '18px',
            fontWeight: '800',
            lineHeight: 1,
          }}
          className="sidebar-toggle-btn right-close-btn"
          title="Close sidebar"
        >
          &gt;
        </button>

        {/* Inner Scrollable Container */}
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 24px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }} className="hidden-scrollbar">
          <div style={S.profileCard}>
            <div style={{...S.avatar,background:'linear-gradient(135deg,#7c3aed,#a78bfa)'}}>{user.name.charAt(0)}</div>
            <h3 style={S.profileName}>{user.name}</h3>
            <span style={S.roleBadge}>Dean</span>
            <div style={S.profileStats}>
              <div style={S.profileStat}><span style={S.profileStatLabel}>Teachers</span><span style={S.profileStatValue}>{teachers.length}</span></div>
              <div style={S.profileStat}><span style={S.profileStatLabel}>Students</span><span style={S.profileStatValue}>{students.length}</span></div>
            </div>
          </div>
          <div style={S.section}>
            <div style={S.sectionHeader}><h4 style={S.sectionTitle}>Top Performers</h4></div>
            <div style={S.performersList}>
              {teachers.slice(0,3).map((t,i)=>(
                <div key={i} style={S.performerItem}>
                  <div style={S.performerAvatar}>{t.name.charAt(0)}</div>
                  <div style={S.performerInfo}><p style={S.performerName}>{t.name}</p><span style={S.performerRole}>Teacher</span></div>
                  <div style={S.performerBadge}>⭐</div>
                </div>
              ))}
            </div>
          </div>
          {pendingStudents.length>0 && (
            <div style={S.section}>
              <div style={S.sectionHeader}><h4 style={S.sectionTitle}>Pending Approvals</h4></div>
              <div style={S.pendingList}>
                {pendingStudents.slice(0,3).map((st,i)=>(
                  <div key={i} style={S.pendingItem}>
                    <div style={S.pendingAvatar}>{st.name.charAt(0)}</div>
                    <div style={S.pendingInfo}><p style={S.pendingName}>{st.name}</p><span style={S.pendingTime}>{new Date(st.created_at).toLocaleDateString()}</span></div>
                  </div>
                ))}
                {pendingStudents.length>3 && (
                  <button style={S.viewAllBtn} onClick={()=>setActiveTab('pending')}>View all {pendingStudents.length} pending</button>
                )}
              </div>
            </div>
          )}
          <div style={S.systemHealth}>
            <div style={S.healthItem}>
              <span style={S.healthLabel}>System Status</span>
              <span style={{
                ...S.healthValue,
                color: systemStatus === "Offline" ? "#ef4444" : systemStatus === "Degraded" ? "#f59e0b" : "#22c55e"
              }}>
                <span style={{
                  ...S.healthDot,
                  background: systemStatus === "Offline" ? "#ef4444" : systemStatus === "Degraded" ? "#f59e0b" : "#22c55e"
                }}/>
                {systemStatus}
              </span>
            </div>
            <div style={S.healthItem}>
              <span style={S.healthLabel}>Refresh Rate</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#64748b" }}>Manual</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <AddEditModal show={showAddModal} onClose={()=>{setShowAddModal(false);resetForms();}} 
        activeTab={editingItem?.hasOwnProperty('title') ? 'courses' : activeTab} editingItem={editingItem} setEditingItem={setEditingItem}
        newPerson={newPerson} setNewPerson={setNewPerson} newClass={newClass} setNewClass={setNewClass}
        newCourse={newCourse} setNewCourse={setNewCourse}
        newLab={newLab} setNewLab={setNewLab}
        teachers={teachers} classes={classes} onSubmit={handleAddSubmit}
        onOpenDataSheet={(tabType) => { setShowAddModal(false); setBulkModalType(tabType === 'teachers' ? 'teacher' : 'student'); setShowBulkModal(true); }} />

      <BulkDataSheetModal show={showBulkModal} onClose={() => setShowBulkModal(false)} onSaveAll={bulkModalType === 'teacher' ? handleBulkTeacherUpload : handleBulkJsonUpload} type={bulkModalType} />

      <TimetableModal show={showTimetableModal} onClose={()=>{setShowTimetableModal(false);resetForms();}}
        editingItem={editingItem} newTimetableEntry={newTimetableEntry} setNewTimetableEntry={setNewTimetableEntry}
        courses={courses} classes={classes} teachers={teachers} onSubmit={handleTimetableSubmit}/>

      <ReportModal showReportModal={showReportModal} setShowReportModal={setShowReportModal}
        selectedReport={selectedReport} setReportDetails={setReportDetails}
        reportDetails={reportDetails} isReportDetailsLoading={isReportDetailsLoading}
        onRefresh={()=>fetchReportDetails(selectedReport)}/>

      <ClassCoursesModal show={showClassCoursesModal} selectedClass={selectedClassForCourses}
        onClose={()=>setShowClassCoursesModal(false)} courses={courses} 
        onEditCourse={(course)=>{setEditingItem(course); setShowAddModal(true); setShowClassCoursesModal(false);}} />

      <StudentProfileModal show={showStudentProfileModal} student={selectedStudentForProfile}
        onClose={()=>setShowStudentProfileModal(false)} />

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
                  background: 'rgba(124, 58, 237, 0.1)',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Clock size={22} weight="bold" />
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
                ×
              </button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Leave Type</label>
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
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Start Date</label>
                    <input 
                      type="date"
                      value={newLeave.start_date}
                      onChange={e => setNewLeave({...newLeave, start_date: e.target.value})}
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
                    <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>End Date</label>
                    <input 
                      type="date"
                      value={newLeave.end_date}
                      onChange={e => setNewLeave({...newLeave, end_date: e.target.value})}
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

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Reason</label>
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
                    background: 'linear-gradient(135deg, #7c3aed 0%, #9061f9 100%)',
                    color: '#ffffff',
                    borderRadius: '16px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px -8px rgba(124, 58, 237, 0.4)',
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrincipalDashboard;



