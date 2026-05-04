import { useState, useEffect } from "react";
import "../../responsive.css";
import { Chart } from "chart.js/auto";
import {
  House, ChalkboardTeacher, UserCircle, Buildings, BookOpen,
  UserPlus, SignOut, Plus, DotsThreeOutline, Clock, SquaresFour,
  ChartLine, FileText, ChatCircle, GraduationCap, ShieldCheck
} from "@phosphor-icons/react";
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
import { AddEditModal, TimetableModal, ReportModal, ClassCoursesModal, StudentProfileModal } from "./sections/PDModals";

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
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [lastUpdated, setLastUpdated]   = useState(new Date());

  const [showAddModal,      setShowAddModal]      = useState(false);
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
  const [newTimetableEntry, setNewTimetableEntry] = useState({ course_id:'', class_id:'', teacher_id:'', day_of_week:'Monday', start_time:'09:00', end_time:'11:00', room_number:'', academic_year:'2024-2025', semester:'Fall' });

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

  // ── Fetch ──
  useEffect(() => {
    fetchData();
    const iv = setInterval(() => { fetchData(); setLastUpdated(new Date()); }, refreshInterval);
    return () => clearInterval(iv);
  }, [refreshInterval]);

  useEffect(() => { if (activeTab === 'course_reports') fetchCampusReports(); }, [activeTab]);

  const fetchData = async () => {
    try {
      const h = { Authorization:`Bearer ${token}` };
      const [t,s,cl,co,ps,tt,tth,lu,labsRes,logsRes,r7,r8,eng] = await Promise.all([
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
      ]);
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
    } catch(e) { console.error(e); }
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
    const endpointMap = {teachers:'principal/teachers',students:'students',classes:'classes',courses:'courses',labs:'labs'};
    const bodyMap     = {teachers:newPerson,students:newPerson,classes:newClass,courses:newCourse,labs:newLab};
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
      }
    }
    const res  = await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await res.json();
    if (data.success) { showToast(`${editingItem?'Updated':'Added'} successfully!`,"success"); setShowAddModal(false); fetchData(); resetForms(); }
    else showToast(data.message||"Error","error");
  };

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
        setShowAddModal(false);
        fetchData();
      } else showToast(data.message || 'Bulk upload failed', 'error');
    } catch (error) { showToast('Connection error during bulk upload', 'error'); }
  };

  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    const url    = editingItem ? `${API}/timetables/${editingItem.id}` : `${API}/timetables`;
    const method = editingItem ? 'PUT' : 'POST';
    const res    = await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(newTimetableEntry)});
    const data   = await res.json();
    if (data.success) { showToast(`Timetable ${editingItem?'updated':'added'}!`,"success"); setShowTimetableModal(false); fetchData(); resetForms(); }
    else showToast(data.message||"Error","error");
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

  const navItems = [
    ['overview',      'Academic Analytics', <House size={20}/>,                teachers.length+students.length],
    ['teachers',      'Faculty Management', <ChalkboardTeacher size={20}/>,    teachers.length],
    ['students',      'Student Lifecycle', <UserCircle size={20}/>,           students.length],
    ['classes',       'Academic Groups',   <Buildings size={20}/>,            classes.length],
    ['courses',       'Programs & Courses', <BookOpen size={20}/>,             courses.filter(c=>c.status==='active').length],
    ['exams',         'Exam & Results',     <FileText size={20}/>,             null],
    ['finance',       'Dept. Finance',     <ShieldCheck size={20}/>,          null],
    ['timetable',     'Academic Schedule', <Clock size={20}/>,                timetables.length],
    ['labs',          'Lab & Assets',      <SquaresFour size={20}/>,          labs.length],
    ['library',       'Research Resources', <BookOpen size={20}/>,             null],
    ['feedback',      'Quality Assurance', <ChartLine size={20} weight="duotone"/>, null],
    ['pending',       'Enrollment Queue',  <UserPlus size={20}/>,             pendingStudents.length],
  ];

  return (
    <div style={S.container} className="dashboard-wrapper">
      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message}
        onConfirm={confirmModal.onConfirm} onCancel={()=>setConfirmModal(p=>({...p,isOpen:false}))} isDanger={confirmModal.isDanger} />

      <div style={S.bgOrb1}/><div style={S.bgOrb2}/><div style={S.bgOrb3}/>

      <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} style={S.mobileMenuBtn} className="mobile-menu-btn">
        <DotsThreeOutline size={24} weight="bold"/>
      </button>

      {/* Sidebar */}
      <aside style={S.sidebar} className={`sidebar ${mobileMenuOpen?'mobile-open':''}`}>
        <div style={S.logoWrapper}>
          <div style={S.logoIcon}><GraduationCap size={24} weight="fill"/></div>
          <span style={S.logoText}>LANCERS <span style={S.logoAccent}>TECH</span></span>
        </div>
        <div style={S.principalBadge}>
          <ShieldCheck size={20} weight="duotone"/>
          <span>{user.department_name ? `Dean of ${user.department_name}` : 'Academic Dean'}</span>
          <div style={S.liveIndicator}/>
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
      </aside>

      {/* Main */}
      <main style={S.main} className="main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>{user.department_name||'Deanery Office'}</h1>
            <p style={S.subtitle}>Academic Council Portal — {user.name}</p>
          </div>
          <div style={S.headerActions}>
            <div style={S.dateBadge}>{new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
            <div style={S.refreshBadge} onClick={()=>fetchData()}>
              <Clock size={14}/> <span>Last: {lastUpdated.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
            </div>
          </div>
        </header>

        {activeTab==='overview' && (
          <PDOverview teachers={teachers} students={students} classes={classes} courses={courses}
            pendingStudents={pendingStudents} logs={logs} engagementData={engagementData}
            setActiveTab={setActiveTab} setShowAddModal={setShowAddModal}/>
        )}

        {activeTab==='timetable' && (
          <PDTimetable timetables={timetables} timetableHistory={timetableHistory}
            courses={courses} classes={classes} teachers={teachers}
            setShowTimetableModal={setShowTimetableModal}
            setEditingItem={setEditingItem} setNewTimetableEntry={setNewTimetableEntry}
            onDelete={handleDeleteTimetable}/>
        )}

        {activeTab==='feedback' && (
          <PDFeedback courseFeedbackAnalytics={courseFeedbackAnalytics} labFeedbackAnalytics={labFeedbackAnalytics}/>
        )}

        {activeTab==='course_reports' && (
          <PDCourseReports campusReports={campusReports} reportsLoading={reportsLoading} onViewDetails={fetchReportDetails}/>
        )}

        {!['overview','timetable','feedback','course_reports'].includes(activeTab) && (
          <PDDataTable activeTab={activeTab} tableData={getTableData()}
            setShowAddModal={setShowAddModal} setEditingItem={setEditingItem}
            onDelete={handleDelete} onApprove={handleApprove} onReject={handleReject}
            onUpdateCourseStatus={handleUpdateCourseStatus} onGenerateReport={handleGenerateReport}
            onOpenClassCourses={(item)=>{setSelectedClassForCourses(item);setShowClassCoursesModal(true);}}
            onOpenStudentProfile={(item)=>{setSelectedStudentForProfile(item);setShowStudentProfileModal(true);}}
            setActiveTab={setActiveTab} setNewCourse={setNewCourse} courses={courses}/>
        )}
      </main>

      {/* Right Panel */}
      <aside style={S.rightPanel} className="right-panel">
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
            <span style={S.healthValue}><span style={S.healthDot}/>Operational</span>
          </div>
          <div style={S.healthItem}>
            <span style={S.healthLabel}>Refresh Rate</span>
            <select value={refreshInterval} onChange={e=>setRefreshInterval(Number(e.target.value))} style={S.healthSelect}>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <AddEditModal show={showAddModal} onClose={()=>{setShowAddModal(false);resetForms();}}
        activeTab={activeTab} editingItem={editingItem} setEditingItem={setEditingItem}
        newPerson={newPerson} setNewPerson={setNewPerson}
        newClass={newClass} setNewClass={setNewClass}
        newCourse={newCourse} setNewCourse={setNewCourse}
        newLab={newLab} setNewLab={setNewLab}
        teachers={teachers} classes={classes} onSubmit={handleAddSubmit}
        handleBulkStudentUpload={handleBulkStudentUpload} />

      <TimetableModal show={showTimetableModal} onClose={()=>{setShowTimetableModal(false);resetForms();}}
        editingItem={editingItem} newTimetableEntry={newTimetableEntry} setNewTimetableEntry={setNewTimetableEntry}
        courses={courses} classes={classes} teachers={teachers} onSubmit={handleTimetableSubmit}/>

      <ReportModal showReportModal={showReportModal} setShowReportModal={setShowReportModal}
        selectedReport={selectedReport} setReportDetails={setReportDetails}
        reportDetails={reportDetails} isReportDetailsLoading={isReportDetailsLoading}
        onRefresh={()=>fetchReportDetails(selectedReport)}/>

      <ClassCoursesModal show={showClassCoursesModal} selectedClass={selectedClassForCourses}
        onClose={()=>setShowClassCoursesModal(false)} courses={courses}/>

      <StudentProfileModal show={showStudentProfileModal} student={selectedStudentForProfile}
        onClose={()=>setShowStudentProfileModal(false)} />
    </div>
  );
}

export default PrincipalDashboard;
