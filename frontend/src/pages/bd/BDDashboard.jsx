import { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import {
  House, Buildings, Briefcase, Users, UserPlus, SignOut, Plus, 
  Clock, CalendarBlank, DotsThreeOutline, Bell, Pulse,
  ChalkboardTeacher, BookOpen, ChartLine, Briefcase as BriefcaseIcon
, Globe } from "@phosphor-icons/react";

import API_BASE_URL from "../../config/api";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";

// Section Imports
import { S } from './sections/BDStyles';
import BDOverview from './sections/BDOverview';
import BDLeads from './sections/BDLeads';
import BDJobs from './sections/BDJobs';
import BDApplicants from './sections/BDApplicants';
import BDBulkHires from './sections/BDBulkHires';
import BDGlobalData from './sections/BDGlobalData';
import BDModals from './sections/BDModals';

const API = `${API_BASE_URL}/api/bd`;
const LEAD_STATUSES = ['prospect', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const LEAD_COLORS = { prospect: '#94a3b8', contacted: '#60a5fa', proposal: '#a78bfa', negotiation: '#f59e0b', closed_won: '#22c55e', closed_lost: '#ef4444' };
const BATCH_STATUSES = ['planning', 'recruiting', 'onboarding', 'completed', 'cancelled'];
const APPLICANT_STATUSES = ['applied', 'shortlisted', 'interviewed', 'hired', 'rejected'];

// Global keyframes for premium animations
const _s = document.createElement('style');
_s.textContent = `
  @keyframes float { 0% { transform:translate(0,0) scale(1); } 100% { transform:translate(3%,3%) scale(1.05); } }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.7;transform:scale(1.1);} }
  @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
  @keyframes slideUp { from{opacity:0;transform:translateY(30px) scale(0.95);}to{opacity:1;transform:translateY(0) scale(1);} }
  .metric-card { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #f1f5f9; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); }
  .metric-card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(var(--primary-rgb, 79, 70, 229), 0.2); border-color: var(--primary-color, #4f46e5); }
  .add-btn { transition: all 0.3s ease; background: linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #818cf8 100%) !important; }
  .add-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 20px 30px -10px rgba(var(--primary-rgb, 79, 70, 229), 0.6) !important; }
  .logout-btn:hover { background: rgba(239,68,68,0.15) !important; color: #dc2626 !important; border-color: rgba(239,68,68,0.3) !important; }
  .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }
  .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  
  /* Input focus states for premium feel */
  .dashboard-wrapper input, .dashboard-wrapper select, .dashboard-wrapper textarea { transition: all 0.3s ease; }
  .dashboard-wrapper input:hover, .dashboard-wrapper select:hover, .dashboard-wrapper textarea:hover { border-color: #cbd5e1 !important; background: #fff !important; }
  .dashboard-wrapper input:focus, .dashboard-wrapper select:focus, .dashboard-wrapper textarea:focus { border-color: var(--primary-color, #4f46e5) !important; background: #ffffff !important; box-shadow: 0 0 0 4px rgba(var(--primary-rgb, 79, 70, 229), 0.15) !important; outline: none !important; }
  
  /* Card hover states */
  .table-container { transition: all 0.4s ease; border: 1px solid transparent; }
  .table-container:hover { border-color: #e2e8f0; }
  
  /* Mobile Responsiveness */
  @media (max-width: 1024px) {
    .sidebar { position: fixed !important; left: -280px; z-index: 1000 !important; }
    .sidebar.mobile-open { left: 0 !important; box-shadow: 10px 0 30px rgba(0,0,0,0.5) !important; }
    .main-content { margin-left: 0 !important; margin-right: 0 !important; padding: 80px 20px 20px 20px !important; }
    .right-panel { display: none !important; }
    .mobile-menu-btn { display: flex !important; background: #fff !important; border-radius: 12px; z-index: 1001; }
    .left-open-btn, .left-close-btn, .right-open-btn, .right-close-btn { display: none !important; }
    .dashboard-wrapper header { flex-direction: column; gap: 16px; }
  }
`;
if (!document.head.querySelector('[data-bd-styles]')) { _s.setAttribute('data-bd-styles','true'); document.head.appendChild(_s); }

function BDDashboard({ user = { name: "BD Manager" }, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [stats, setStats] = useState({});
  const [pipeline, setPipeline] = useState([]);
  const [leads, setLeads] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [batches, setBatches] = useState([]);
  const [globalStats, setGlobalStats] = useState({});
  const [globalCampuses, setGlobalCampuses] = useState([]);
  const [globalTeachers, setGlobalTeachers] = useState([]);
  const [globalStudents, setGlobalStudents] = useState([]);
  const [globalClasses, setGlobalClasses] = useState([]);
  const [labUsage, setLabUsage] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});
  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {}, isDanger: false });
  
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [ov, l, j, a, b, gs, gc, gt, gs2, gcl] = await Promise.all([
        fetch(`${API}/overview`, { headers }).then(r => r.json()),
        fetch(`${API}/leads`, { headers }).then(r => r.json()),
        fetch(`${API}/jobs`, { headers }).then(r => r.json()),
        fetch(`${API}/applicants`, { headers }).then(r => r.json()),
        fetch(`${API}/bulk-hires`, { headers }).then(r => r.json()),
        fetch(`${API}/global/stats`, { headers }).then(r => r.json()),
        fetch(`${API}/global/campuses`, { headers }).then(r => r.json()),
        fetch(`${API}/global/teachers`, { headers }).then(r => r.json()),
        fetch(`${API}/global/students`, { headers }).then(r => r.json()),
        fetch(`${API}/global/classes`, { headers }).then(r => r.json()),
      ]);
      if (ov.success) { setStats(ov.stats || {}); setPipeline(ov.pipeline || []); }
      if (l.success) setLeads(l.leads || []);
      if (j.success) setJobs(j.jobs || []);
      if (a.success) setApplicants(a.applicants || []);
      if (b.success) setBatches(b.batches || []);
      if (gs.success) setGlobalStats(gs.stats || {});
      if (gc.success) setGlobalCampuses(gc.campuses || []);
      if (gt.success) setGlobalTeachers(gt.teachers || []);
      if (gs2.success) setGlobalStudents(gs2.students || []);
      if (gcl.success) setGlobalClasses(gcl.classes || []);
      
      const labsData = await fetch(`${API_BASE_URL}/api/labs/usage/all`, { headers }).then(r => r.json());
      if (labsData.success) setLabUsage(labsData.usage || []);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAllReports(data.reports || []);
    } catch (e) { console.error(e); }
    setReportsLoading(false);
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false);

  const fetchReportDetails = async (report) => {
    setSelectedReport(report); setShowReportModal(true); setIsReportDetailsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${report.id}/details`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setReportDetails(data);
    } catch (e) { console.error(e); }
    setIsReportDetailsLoading(false);
  };

  useEffect(() => { if (activeTab === 'course_reports') fetchReports(); }, [activeTab]);

  useEffect(() => {
    if (chartRef.current && activeTab === "overview" && pipeline.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: pipeline.map(p => p.status.replace('_', ' ')),
          datasets: [{
            data: pipeline.map(p => p.count),
            backgroundColor: pipeline.map(p => LEAD_COLORS[p.status] || '#94a3b8'),
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: 600 } } },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
          },
          cutout: '70%',
          animation: { animateRotate: true, duration: 1000 }
        }
      });
    }
  }, [activeTab, pipeline]);

  const openAdd = () => { setEditingItem(null); setForm({}); setShowModal(true); };
  const openEdit = (item) => { setEditingItem(item); setForm({ ...item }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpointMap = { leads: 'leads', jobs: 'jobs', applicants: 'applicants', bulkhires: 'bulk-hires' };
    const tabKey = activeTab === 'bulkhires' ? 'bulkhires' : activeTab;
    const url = editingItem ? `${API}/${endpointMap[tabKey]}/${editingItem.id}` : `${API}/${endpointMap[tabKey]}`;
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { 
      showToast(editingItem ? "Updated successfully!" : "Created successfully!", "success");
      setShowModal(false); fetchAll(); 
    } else showToast(data.message || "Error saving item", "error");
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true, title: "Delete Item", message: "Are you sure you want to delete this item? This action cannot be undone.",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const endpointMap = { leads: 'leads', jobs: 'jobs', applicants: 'applicants', bulkhires: 'bulk-hires' };
          const tabKey = activeTab === 'bulkhires' ? 'bulkhires' : activeTab;
          const res = await fetch(`${API}/${endpointMap[tabKey]}/${id}`, { method: 'DELETE', headers });
          const data = await res.json();
          if (data.success) { showToast("Item deleted successfully", "success"); fetchAll(); }
          else showToast(data.message || "Error deleting", "error");
        } catch (e) { showToast("Error deleting item", "error"); }
      }, isDanger: true
    });
  };

  const handleApplicantStatus = async (id, status) => {
    const res = await fetch(`${API}/applicants/${id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
    const data = await res.json();
    if (data.success) fetchAll(); else showToast(data.message, 'error');
  };

  if (isLoading) return (
    <div style={S.loadingContainer}>
      <div style={S.loadingSpinner}></div>
      <p style={S.loadingText}>Loading BD Portal...</p>
    </div>
  );

  return (
    <div style={S.container} className="dashboard-wrapper">
      <ConfirmModal 
        isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message}
        onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} isDanger={confirmModal.isDanger}
      />
      <div style={S.bgOrb1}></div><div style={S.bgOrb2}></div><div style={S.bgOrb3}></div>

      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={S.mobileMenuBtn} className="mobile-menu-btn">
        <DotsThreeOutline size={24} weight="bold" />
      </button>

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
          <div style={S.bdBadge}>
            <Briefcase size={16} weight="duotone" />
            <span>{user.department_name || 'Lancers BD'}</span>
            <div style={S.liveIndicator}></div>
          </div>
          <nav style={S.nav}>
            {[
              ['overview', 'Overview', <House size={20} />, null],
              ['leads', 'Dept Leads', <Buildings size={20} />, stats.totalLeads],
              ['jobs', 'Job Postings', <Briefcase size={20} />, stats.openJobs],
              ['applicants', 'Applicants', <Users size={20} />, stats.totalApplicants],
              ['bulkhires', 'Bulk Hire', <UserPlus size={20} />, stats.activeBatches],
              ['all_campuses', 'Global Departments', <Buildings size={20} weight="duotone" />, globalStats.totalCampuses],
              ['all_teachers', 'All Teachers', <ChalkboardTeacher size={20} />, globalStats.totalTeachers],
              ['all_students', 'All Students', <Users size={20} weight="duotone" />, globalStats.totalStudents],
              ['all_classes', 'All Classes', <BookOpen size={20} />, globalStats.totalClasses],
              ['lab_usage', 'Lab Analytics', <Pulse size={20} weight="duotone" />, null],
              ['course_reports', 'Course Reports', <ChartLine size={20} weight="duotone" />, allReports.length || null],
            ].map(([tab, label, icon, count]) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                style={{ ...S.navBtn, ...(activeTab === tab ? S.navBtnActive : {}) }}
                className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {icon}
                <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                {count > 0 && <span style={S.navBadge}>{count}</span>}
                {activeTab === tab && <div style={S.activeIndicator}></div>}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} style={S.logoutBtn} className="logout-btn"><SignOut size={20} /> <span>Sign Out</span></button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{
        ...S.main,
        marginLeft: leftSidebarOpen ? '280px' : '24px',
        marginRight: rightPanelOpen ? '320px' : '24px',
        transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }} className="main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>
              {user.department_name || "Business Development"}
            </h1>
            <p style={S.subtitle}>Welcome back, <span style={S.userName}>{user.name}</span></p>
          </div>
          <div style={S.headerActions}>
            <div style={S.dateBadge}><CalendarBlank size={18} /> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            {!['overview', 'all_campuses', 'all_teachers', 'all_students', 'all_classes', 'lab_usage', 'course_reports'].includes(activeTab) && (
              <button onClick={openAdd} style={S.addBtn} className="add-btn"><Plus size={18} weight="bold" /> Add New</button>
            )}
          </div>
        </header>
        
        {activeTab === 'overview' && <BDOverview stats={stats} globalStats={globalStats} pipeline={pipeline} chartRef={chartRef} LEAD_COLORS={LEAD_COLORS} key={`${leftSidebarOpen}-${rightPanelOpen}`} />}
        {activeTab === 'leads' && <BDLeads leads={leads} openEdit={openEdit} handleDelete={handleDelete} LEAD_COLORS={LEAD_COLORS} />}
        {activeTab === 'jobs' && <BDJobs jobs={jobs} openEdit={openEdit} handleDelete={handleDelete} showToast={showToast} />}
        {activeTab === 'applicants' && <BDApplicants applicants={applicants} handleApplicantStatus={handleApplicantStatus} handleDelete={handleDelete} APPLICANT_STATUSES={APPLICANT_STATUSES} />}
        {activeTab === 'bulkhires' && <BDBulkHires batches={batches} openEdit={openEdit} handleDelete={handleDelete} />}
        {['all_campuses', 'all_teachers', 'all_students', 'all_classes', 'lab_usage'].includes(activeTab) && <BDGlobalData type={activeTab.replace('all_', '')} data={{all_campuses:globalCampuses, all_teachers:globalTeachers, all_students:globalStudents, all_classes:globalClasses, lab_usage:labUsage}[activeTab]} />}
        
        {activeTab === 'course_reports' && (
          <div style={S.tableCard} className="animate-fadeIn">
            <div style={S.tableContainer} className="table-container">
              <table style={S.table}>
                <thead>
                  <tr style={S.tableHeadRow}>
                    <th style={S.th}>COURSE</th>
                    <th style={S.th}>DEPARTMENT</th>
                    <th style={S.th}>TEACHER</th>
                    <th style={S.th}>PASS RATE</th>
                    <th style={S.th}>STATUS</th>
                    <th style={{...S.th, textAlign:'right'}}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {allReports.map(r => (
                    <tr key={r.id} style={S.tableRow}>
                      <td style={S.tdName}>{r.course_title}</td>
                      <td style={S.td}>{r.campus_name}</td>
                      <td style={S.td}>{r.teacher_name}</td>
                      <td style={S.td}>{Math.round((r.pass_count / r.total_students) * 100)}%</td>
                      <td style={S.td}><span style={{...S.statusBadge, background:'#dcfce7', color:'#166534'}}>Completed</span></td>
                      <td style={{...S.td, textAlign:'right'}}>
                        <button onClick={() => fetchReportDetails(r)} style={S.iconBtn}><ChartLine size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Floating open button for RIGHT panel — only visible when right panel is CLOSED */}
      {!rightPanelOpen && (
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
      <aside style={{
        ...S.rightPanel,
        transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',
        padding: 0,
      }} className={`right-panel ${rightPanelOpen ? '' : 'collapsed'}`}>

        {/* ← Close arrow centered on LEFT edge of the right panel */}
        <button
          onClick={() => setRightPanelOpen(false)}
          style={{
            position: 'absolute',
            left: '-18px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            background: 'var(--primary-color, #4f46e5)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px 0 0 10px',
            width: '18px',
            height: '60px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '-4px 0 14px rgba(var(--primary-rgb, 79, 70, 229),0.35)',
            fontSize: '18px',
            fontWeight: '800',
            lineHeight: 1,
          }}
          className="sidebar-toggle-btn right-close-btn"
          title="Close profile panel"
        >
          ›
        </button>

        {/* Inner Scrollable Container Wrapper */}
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 24px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }} className="hidden-scrollbar">
          <div style={S.profileCard}>
            <div style={{ ...S.avatar, background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)' }}>{user.name.charAt(0)}</div>
            <h3 style={S.profileName}>{user.name}</h3>
            <span style={S.roleBadge}>BD Manager</span>
            <div style={S.profileStats}>
              <div style={S.profileStat}><span style={S.profileStatLabel}>Won Deals</span><span style={S.profileStatValue}>{stats.wonLeads || 0}</span></div>
              <div style={S.profileStat}><span style={S.profileStatLabel}>Leads</span><span style={S.profileStatValue}>{stats.totalLeads || 0}</span></div>
            </div>
          </div>
          <div style={S.quickStatsCard}>
            <h4 style={S.quickStatsTitle}>Quick Insights</h4>
            <div style={S.quickStatsList}>
              <div style={S.quickStatItem}><span style={S.quickStatLabel}>Hiring Velocity</span><span style={S.quickStatValue}>High</span></div>
              <div style={S.quickStatItem}><span style={S.quickStatLabel}>Lead Conversion</span><span style={S.quickStatValue}>{stats.totalLeads ? Math.round((stats.wonLeads / stats.totalLeads) * 100) : 0}%</span></div>
              <div style={S.quickStatItem}><span style={S.quickStatLabel}>Platform Health</span><span style={S.quickStatValue}>Optimal</span></div>
            </div>
          </div>
        </div>
      </aside>

      <BDModals 
        showModal={showModal} setShowModal={setShowModal} activeTab={activeTab} editingItem={editingItem} form={form} setForm={setForm} handleSubmit={handleSubmit} LEAD_STATUSES={LEAD_STATUSES} BATCH_STATUSES={BATCH_STATUSES} campuses={globalCampuses} jobs={jobs}
        showReportModal={showReportModal} setShowReportModal={setShowReportModal} selectedReport={selectedReport} reportDetails={reportDetails} isReportDetailsLoading={isReportDetailsLoading} onRefreshReport={() => fetchReportDetails(selectedReport)}
      />
    </div>
  )
}

export default BDDashboard;
