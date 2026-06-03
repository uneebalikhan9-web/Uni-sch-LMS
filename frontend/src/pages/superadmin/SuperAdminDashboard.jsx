import { useState, useEffect } from "react";
import "../../responsive.css";
import { 
  Globe, SignOut, ChartBar, Buildings, UserCircle, IdentificationCard, ChartLine, List, ShieldCheck, UserCirclePlus
} from "@phosphor-icons/react";

import API_BASE_URL from "../../config/api";
import { useToast } from "../../components/Toast";
import ConfirmModal from "../../components/ConfirmModal";

// Section Components
import SAOverview    from "./sections/SAOverview";
import SADepartments from "./sections/SADepartments";
import SAHODs        from "./sections/SAHODs";
import SABDUsers     from "./sections/SABDUsers";
import SAReports     from "./sections/SAReports";
import SAStaffManagement from "./sections/SAStaffManagement";
import { S }         from "./sections/SAStyles";

const API = `${API_BASE_URL}/api`;

// Inject global keyframe styles once
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes float { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(3%,3%) scale(1.05); } }
  @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.1); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  .metric-card:hover { transform:translateY(-5px); box-shadow:0 20px 30px -10px rgba(var(--primary-rgb, 79, 70, 229),0.15); border-color:#cbd5e1; }
  .nav-btn:hover:not(.active) { background:rgba(var(--primary-rgb, 79, 70, 229),0.1)!important; color:#fff!important; }
  .logout-btn:hover { background:rgba(239,68,68,0.2)!important; border-color:rgba(239,68,68,0.3)!important; }
  .add-btn:hover { transform:translateY(-3px); box-shadow:0 15px 25px -8px rgba(var(--primary-rgb, 79, 70, 229),0.6); }
  .edit-btn:hover { background:#e0e7ff; } .delete-btn:hover { background:#fee2e2; }
  input:focus, select:focus { border-color:var(--primary-color, #4f46e5)!important; box-shadow:0 0 0 4px rgba(var(--primary-rgb, 79, 70, 229),0.1)!important; outline:none!important; }
  tr:hover { background:#f8fafc; }
  .hidden-scrollbar::-webkit-scrollbar { display:none; }
  .hidden-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
`;
if (!document.head.querySelector('[data-sa-styles]')) {
  styleTag.setAttribute('data-sa-styles', 'true');
  document.head.appendChild(styleTag);
}

function SuperAdminDashboard({ user = { name: "Main Department" }, onLogout }) {
  const [activeTab, setActiveTab]         = useState("overview");
  const [overview, setOverview]           = useState({});
  const [departmentStats, setDepartmentStats] = useState([]);
  const [departments, setDepartments]     = useState([]);
  const [hods, setHods]                   = useState([]);
  const [bds, setBds]                     = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen]   = useState(true);

  // Add / Edit state
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editingItem, setEditingItem]     = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: "", location: "" });
  const [newHOD, setNewHOD]               = useState({ name: "", email: "", password: "", campus_id: "" });
  const [newBD, setNewBD]                 = useState({ name: "", email: "", password: "", campus_id: "" });
  const [newStaff, setNewStaff]           = useState({ name: "", email: "", password: "", campus_id: "" });
  const [isSubmitting, setIsSubmitting]   = useState(false);

  // Staff lists
  const [staffData, setStaffData]         = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);

  // HOD detail modal
  const [showHODModal, setShowHODModal]         = useState(false);
  const [selectedHODDetails, setSelectedHODDetails] = useState(null);
  const [isHODDetailsLoading, setIsHODDetailsLoading] = useState(false);

  // BD detail modal
  const [showBDModal, setShowBDModal]           = useState(false);
  const [selectedBDDetails, setSelectedBDDetails]   = useState(null);
  const [isBDDetailsLoading, setIsBDDetailsLoading] = useState(false);

  // Reports
  const [reports, setReports]             = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport]   = useState(null);
  const [reportDetails, setReportDetails]     = useState(null);
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false);

  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {}, isDanger: false });
  const token = sessionStorage.getItem("token");

  // ─── Data Fetching ───────────────────────────────────────────
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (activeTab === 'reports') fetchReports(); }, [activeTab]);
  useEffect(() => {
    const staffRoles = {
      rector: 'rector',
      hr: 'hr_manager',
      finance: 'finance_manager',
      exams: 'exam_controller',
      library: 'librarian',
      admissions: 'admission_officer',
      it: 'it_admin',
      registrar: 'registrar'
    };
    if (staffRoles[activeTab]) fetchStaff(staffRoles[activeTab]);
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ov, cp, pr, bdRes, fmRes] = await Promise.all([
        fetch(`${API}/superadmin/overview`, { headers }).then(r => r.json()),
        fetch(`${API}/superadmin/campuses`, { headers }).then(r => r.json()),
        fetch(`${API}/superadmin/principals`, { headers }).then(r => r.json()),
        fetch(`${API}/superadmin/bds`, { headers }).then(r => r.json())
      ]);
      if (ov.success) { setOverview(ov.overview || {}); setDepartmentStats(ov.campusStats || []); }
      if (cp.success) setDepartments(cp.campuses || []);
      if (pr.success) setHods(pr.principals || []);
      if (bdRes.success) setBds(bdRes.bds || []);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const fetchStaff = async (role) => {
    setIsStaffLoading(true);
    try {
      const res = await fetch(`${API}/superadmin/staff/${role}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setStaffData(data.staff || []);
      else setStaffData([]);
    } catch (e) { 
      console.error(e);
      setStaffData([]);
    }
    setIsStaffLoading(false);
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch(`${API}/reports`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setReports(data.reports || []);
    } catch (e) { console.error(e); }
    setReportsLoading(false);
  };

  // ─── CRUD Handlers ───────────────────────────────────────────
  const handleDeleteDepartment = (id) => {
    setConfirmModal({ isOpen: true, title: "Delete Department", message: "Are you sure? All users will be unassigned.",
      onConfirm: async () => {
        setConfirmModal(p => ({...p, isOpen: false}));
        try {
          const res = await fetch(`${API}/superadmin/campuses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          data.success ? (showToast("Department deleted!", "success"), fetchData()) : showToast(data.message || "Error", "error");
        } catch { showToast("Error deleting department", "error"); }
      }, isDanger: true });
  };

  const handleDeleteHOD = (id) => {
    setConfirmModal({ isOpen: true, title: "Delete HOD", message: "Are you sure you want to delete this HOD?",
      onConfirm: async () => {
        setConfirmModal(p => ({...p, isOpen: false}));
        try {
          const res = await fetch(`${API}/superadmin/principals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          data.success ? (showToast("HOD deleted!", "success"), fetchData()) : showToast(data.message || "Error", "error");
        } catch { showToast("Error deleting HOD", "error"); }
      }, isDanger: true });
  };

  const handleDeleteBD = (id) => {
    setConfirmModal({ isOpen: true, title: "Delete BD User", message: "Are you sure you want to delete this BD User?",
      onConfirm: async () => {
        setConfirmModal(p => ({...p, isOpen: false}));
        try {
          const res = await fetch(`${API}/superadmin/bds/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          data.success ? (showToast("BD User deleted!", "success"), fetchData()) : showToast(data.message || "Error", "error");
        } catch { showToast("Error deleting BD User", "error"); }
      }, isDanger: true });
  };

  const handleDeleteStaff = (id) => {
    setConfirmModal({ isOpen: true, title: "Delete Staff Member", message: "Are you sure? This will remove their portal access.",
      onConfirm: async () => {
        setConfirmModal(p => ({...p, isOpen: false}));
        try {
          const res = await fetch(`${API}/superadmin/staff/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json();
          if (data.success) {
            showToast("Staff member removed", "success");
            const staffRoles = { 
              rector: 'rector',
              hr: 'hr_manager', 
              finance: 'finance_manager', 
              exams: 'exam_controller', 
              library: 'librarian', 
              admissions: 'admission_officer', 
              it: 'it_admin', 
              registrar: 'registrar' 
            };
            fetchStaff(staffRoles[activeTab]);
          } else showToast(data.message || "Error", "error");
        } catch { showToast("Error deleting staff", "error"); }
      }, isDanger: true });
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const body = editingItem ? { ...editingItem } : newDepartment;
      const url = editingItem ? `${API}/superadmin/campuses/${editingItem.id}` : `${API}/superadmin/campuses`;
      const res = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { showToast(editingItem ? "Department updated!" : "Department created!", "success"); setShowAddModal(false); setEditingItem(null); setNewDepartment({ name: "", location: "" }); fetchData(); }
      else showToast(data.message || "Error saving department", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddHOD = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const body = editingItem ? { ...editingItem } : newHOD;
      const url = editingItem ? `${API}/superadmin/principals/${editingItem.id}` : `${API}/superadmin/principals`;
      const res = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { showToast(editingItem ? "HOD updated!" : "HOD created!", "success"); setShowAddModal(false); setEditingItem(null); setNewHOD({ name: "", email: "", password: "", campus_id: "" }); fetchData(); }
      else showToast(data.message || "Error saving HOD", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddBD = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const body = editingItem ? { ...editingItem } : newBD;
      const url = editingItem ? `${API}/superadmin/bds/${editingItem.id}` : `${API}/superadmin/bds`;
      const res = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { showToast(editingItem ? "BD User updated!" : "BD User created!", "success"); setShowAddModal(false); setEditingItem(null); setNewBD({ name: "", email: "", password: "", campus_id: "" }); fetchData(); }
      else showToast(data.message || "Error saving BD User", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStaff = async (e, role) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const body = editingItem ? { ...editingItem } : { ...newStaff, role };
      const url = editingItem ? `${API}/superadmin/staff/${editingItem.id}` : `${API}/superadmin/staff`;
      const res = await fetch(url, { 
        method: editingItem ? 'PUT' : 'POST', 
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
      });
      const data = await res.json();
      if (data.success) { 
        showToast(editingItem ? "Staff member updated!" : `${role.replace('_', ' ').toUpperCase()} created!`, "success"); 
        setShowAddModal(false); 
        setEditingItem(null);
        setNewStaff({ name: "", email: "", password: "", campus_id: "" }); 
        fetchStaff(role); 
      }
      else showToast(data.message || "Error saving staff", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewHODDetails = async (id) => {
    setIsHODDetailsLoading(true); setShowHODModal(true);
    try {
      const res = await fetch(`${API}/superadmin/principals/${id}/details`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      data.success ? setSelectedHODDetails(data.details) : (showToast(data.message || "Error", "error"), setShowHODModal(false));
    } catch { showToast("Error fetching HOD details", "error"); setShowHODModal(false); }
    setIsHODDetailsLoading(false);
  };

  const handleViewBDDetails = async (id) => {
    setIsBDDetailsLoading(true); setShowBDModal(true);
    try {
      const res = await fetch(`${API}/superadmin/bds/${id}/details`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      data.success ? setSelectedBDDetails(data.details) : (showToast(data.message || "Error", "error"), setShowBDModal(false));
    } catch { showToast("Error fetching BD details", "error"); setShowBDModal(false); }
    setIsBDDetailsLoading(false);
  };

  const handleViewReportDetails = async (report) => {
    setSelectedReport(report); setShowReportModal(true); setIsReportDetailsLoading(true);
    try {
      const res = await fetch(`${API}/reports/${report.id}/details`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setReportDetails(data);
    } catch (e) { console.error(e); }
    setIsReportDetailsLoading(false);
  };

  // ─── Loading State ───────────────────────────────────────────
  if (isLoading) return (
    <div style={S.loadingContainer}>
      <div style={S.loadingSpinner}></div>
      <p style={S.loadingText}>Loading Global Dashboard...</p>
    </div>
  );

  // ─── Sidebar Nav Items ────────────────────────────────────────
  const isModuleAllowed = (moduleId) => {
    if (['overview', 'campuses', 'reports'].includes(moduleId)) return true;
    if (!user.allowed_modules) return true; // Backward compatibility
    return user.allowed_modules.includes(moduleId);
  };

  const navItems = [
    ['overview',    'VC Overview',       <ChartBar   size={20} />],
    ['rector',      'Rectorate / Pro-VC', <Buildings size={20} />],
    ['campuses',    'Academic Depts',    <Buildings  size={20} />],
    ['principals',  'Dean & HODs',       <UserCircle size={20} />],
    ['bd',          'BD Management',     <IdentificationCard size={20} />],
    ['hr',          'HR & Faculty',      <IdentificationCard size={20} />],
    ['finance',     'Financial Ops',     <ShieldCheck size={20} />],
    ['registrar',   'Registrar Office',  <List size={20} />],
    ['admissions',  'Admissions',        <UserCirclePlus size={20} />],
    ['exams',       'Exams & Grading',   <Globe size={20} />],
    ['library',     'Digital Library',   <List size={20} />],
    ['it',          'IT & Systems',      <ShieldCheck size={20} />],
    ['reports',     'Institutional KPI', <ChartLine  size={20} />],
  ].filter(item => isModuleAllowed(item[0]));

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div style={S.container} className="dashboard-wrapper">
      <ConfirmModal 
        isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message}
        onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(p => ({...p, isOpen: false}))}
        isDanger={confirmModal.isDanger}
      />

      {/* Background Orbs */}
      <div style={S.bgOrb1}></div>
      <div style={S.bgOrb2}></div>

      {/* Mobile Menu Button */}
      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn">
        <List size={24} weight="bold" />
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

      {/* ── Sidebar ── */}
      <aside style={{
        ...S.sidebar,
        transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'visible',
        padding: 0,
      }} className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''} ${leftSidebarOpen ? '' : 'collapsed'}`}>
        
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


          <div style={S.globalBadge}>
            <ShieldCheck size={14} weight="fill" />
            <span>VC Institutional Master</span>
          </div>

          <nav style={S.nav}>
            {navItems.map(([tab, label, icon]) => (
              <button key={tab}
                onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                style={{...S.navBtn, ...(activeTab === tab ? S.navBtnActive : {})}}
                className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
              >
                {icon}
                <span>{label}</span>
                {activeTab === tab && <div style={S.activeIndicator}></div>}
              </button>
            ))}
          </nav>

          <button onClick={onLogout} style={S.logoutBtn} className="logout-btn">
            <SignOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{
        ...S.main,
        marginLeft: leftSidebarOpen ? '280px' : '24px',
        marginRight: rightPanelOpen ? '320px' : '24px',
        transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1), margin-right 0.35s cubic-bezier(0.4,0,0.2,1)',
      }} className="main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>VC Institutional Master</h1>
            <p style={S.subtitle}>University-wide Operations & KPI Monitoring</p>
          </div>
          <div style={S.campusCounter}>
            <Buildings size={16} color="#94a3b8" />
            <span>{overview.totalCampuses || 0} Departments Active</span>
          </div>
        </header>

        {/* ── Tab Sections ── */}
        {activeTab === "overview" && (
          <SAOverview overview={overview} departmentStats={departmentStats} key={`${leftSidebarOpen}-${rightPanelOpen}`} />
        )}

        {activeTab === "campuses" && (
          <SADepartments
            departments={departments}
            editingItem={editingItem} setEditingItem={setEditingItem}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newDepartment={newDepartment} setNewDepartment={setNewDepartment}
            onAdd={handleAddDepartment}
            onDelete={handleDeleteDepartment}
          />
        )}

        {activeTab === "principals" && (
          <SAHODs
            hods={hods} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newHOD={newHOD} setNewHOD={setNewHOD}
            editingItem={editingItem} setEditingItem={setEditingItem}
            onAdd={handleAddHOD}
            onDelete={handleDeleteHOD}
            showHODModal={showHODModal} setShowHODModal={setShowHODModal}
            selectedHODDetails={selectedHODDetails} isHODDetailsLoading={isHODDetailsLoading}
            onViewDetails={handleViewHODDetails}
          />
        )}

        {activeTab === "bd" && (
          <SABDUsers
            bds={bds} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newBD={newBD} setNewBD={setNewBD}
            onAdd={handleAddBD}
            onDelete={handleDeleteBD}
            showBDModal={showBDModal} setShowBDModal={setShowBDModal}
            selectedBDDetails={selectedBDDetails} isBDDetailsLoading={isBDDetailsLoading}
            onViewDetails={handleViewBDDetails}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "rector" && (
          <SAStaffManagement 
            title="Rectorate / Pro-VC" role="rector" icon={Buildings}
            staffList={staffData} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newItem={newStaff} setNewItem={setNewStaff}
            onAdd={handleAddStaff} onDelete={handleDeleteStaff}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "hr" && (
          <SAStaffManagement 
            title="HR Managers" role="hr_manager" icon={IdentificationCard}
            staffList={staffData} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newItem={newStaff} setNewItem={setNewStaff}
            onAdd={handleAddStaff} onDelete={handleDeleteStaff}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "finance" && (
          <SAStaffManagement 
            title="Finance Managers" role="finance_manager" icon={ShieldCheck}
            staffList={staffData} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newItem={newStaff} setNewItem={setNewStaff}
            onAdd={handleAddStaff} onDelete={handleDeleteStaff}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "registrar" && (
          <SAStaffManagement 
            title="Registrars" role="registrar" icon={List}
            staffList={staffData} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newItem={newStaff} setNewItem={setNewStaff}
            onAdd={handleAddStaff} onDelete={handleDeleteStaff}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "admissions" && (
          <SAStaffManagement 
            title="Admission Officers" role="admission_officer" icon={UserCirclePlus}
            staffList={staffData} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newItem={newStaff} setNewItem={setNewStaff}
            onAdd={handleAddStaff} onDelete={handleDeleteStaff}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "exams" && (
          <SAStaffManagement 
            title="Exam Controllers" role="exam_controller" icon={Globe}
            staffList={staffData} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newItem={newStaff} setNewItem={setNewStaff}
            onAdd={handleAddStaff} onDelete={handleDeleteStaff}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "library" && (
          <SAStaffManagement 
            title="Librarians" role="librarian" icon={List}
            staffList={staffData} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newItem={newStaff} setNewItem={setNewStaff}
            onAdd={handleAddStaff} onDelete={handleDeleteStaff}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "it" && (
          <SAStaffManagement 
            title="IT Admins" role="it_admin" icon={ShieldCheck}
            staffList={staffData} departments={departments}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newItem={newStaff} setNewItem={setNewStaff}
            onAdd={handleAddStaff} onDelete={handleDeleteStaff}
            editingItem={editingItem} setEditingItem={setEditingItem}
          />
        )}

        {activeTab === "reports" && (
          <SAReports
            reports={reports} reportsLoading={reportsLoading}
            showReportModal={showReportModal} setShowReportModal={setShowReportModal}
            selectedReport={selectedReport} setSelectedReport={setSelectedReport}
            reportDetails={reportDetails} setReportDetails={setReportDetails}
            isReportDetailsLoading={isReportDetailsLoading}
            onViewDetails={handleViewReportDetails}
          />
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
          title="Open sidebar"
        >
          ‹
        </button>
      )}

      {/* ── Right Panel ── */}
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
          title="Close sidebar"
        >
          ›
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
            <div style={{...S.avatar, background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #7c3aed)'}}>
              {user.name.charAt(0)}
            </div>
            <h3 style={S.profileName}>{user.name}</h3>
            <span style={S.roleBadge}>Vice Chancellor</span>
            <div style={S.profileStats}>
              <div style={S.profileStat}>
                <span style={S.profileStatLabel}>Last Login</span>
                <span style={S.profileStatValue}>Today 09:24</span>
              </div>
              <div style={S.profileStat}>
                <span style={S.profileStatLabel}>Role</span>
                <span style={S.profileStatValue}>Main Department</span>
              </div>
            </div>
          </div>

          <div style={S.platformStats}>
            <h4 style={S.platformStatsTitle}>Platform Stats</h4>
            {[
              ['Departments', overview.totalCampuses  || 0, 'var(--primary-color, #4f46e5)'],
              ['HODs',        overview.totalPrincipals || 0, '#7c3aed'],
              ['BD Users',    overview.totalBds        || 0, '#ec4899'],
              ['Teachers',    overview.totalTeachers   || 0, '#2563eb'],
              ['Students',    overview.totalStudents   || 0, '#0891b2'],
            ].map(([label, val, color]) => (
              <div key={label} style={S.platformStatItem}>
                <span style={S.platformStatLabel}>{label}</span>
                <span style={{...S.platformStatValue, color}}>{val.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div style={{...S.platformStats, marginTop: '20px'}}>
            <h4 style={S.platformStatsTitle}>Security & Health</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  <span>Server Capacity</span>
                  <span style={{ color: 'var(--primary-color, #4f46e5)' }}>32%</span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '32%', height: '100%', background: 'var(--primary-color, #4f46e5)', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  <span>Database Load</span>
                  <span style={{ color: '#10b981' }}>18%</span>
                </div>
                <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '18%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{...S.systemStatus, marginTop: '20px'}}>
            <div style={S.systemStatusDot}></div>
            <span>All systems operational</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default SuperAdminDashboard;
