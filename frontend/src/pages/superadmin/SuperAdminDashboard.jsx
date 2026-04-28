import { useState, useEffect } from "react";
import "../../responsive.css";
import { 
  Globe, SignOut, ChartBar, Buildings, UserCircle, IdentificationCard, ChartLine, List, ShieldCheck
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
  .metric-card:hover { transform:translateY(-5px); box-shadow:0 20px 30px -10px rgba(79,70,229,0.15); border-color:#cbd5e1; }
  .nav-btn:hover:not(.active) { background:rgba(79,70,229,0.1)!important; color:#fff!important; }
  .logout-btn:hover { background:rgba(239,68,68,0.2)!important; border-color:rgba(239,68,68,0.3)!important; }
  .add-btn:hover { transform:translateY(-3px); box-shadow:0 15px 25px -8px rgba(79,70,229,0.6); }
  .edit-btn:hover { background:#e0e7ff; } .delete-btn:hover { background:#fee2e2; }
  input:focus, select:focus { border-color:#4f46e5!important; box-shadow:0 0 0 4px rgba(79,70,229,0.1)!important; outline:none!important; }
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

  // Add / Edit state
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editingItem, setEditingItem]     = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: "", location: "" });
  const [newHOD, setNewHOD]               = useState({ name: "", email: "", password: "", campus_id: "" });
  const [newBD, setNewBD]                 = useState({ name: "", email: "", password: "", campus_id: "" });

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ov, cp, pr, bdRes] = await Promise.all([
        fetch(`${API}/superadmin/overview`, { headers }).then(r => r.json()),
        fetch(`${API}/superadmin/campuses`, { headers }).then(r => r.json()),
        fetch(`${API}/superadmin/principals`, { headers }).then(r => r.json()),
        fetch(`${API}/superadmin/bds`, { headers }).then(r => r.json()),
      ]);
      if (ov.success) { setOverview(ov.overview || {}); setDepartmentStats(ov.campusStats || []); }
      if (cp.success) setDepartments(cp.campuses || []);
      if (pr.success) setHods(pr.principals || []);
      if (bdRes.success) setBds(bdRes.bds || []);
    } catch (e) { console.error(e); }
    setIsLoading(false);
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

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    const body = editingItem ? { ...editingItem } : newDepartment;
    const url = editingItem ? `${API}/superadmin/campuses/${editingItem.id}` : `${API}/superadmin/campuses`;
    const res = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) { showToast(editingItem ? "Department updated!" : "Department created!", "success"); setShowAddModal(false); setEditingItem(null); setNewDepartment({ name: "", location: "" }); fetchData(); }
    else showToast(data.message || "Error saving department", "error");
  };

  const handleAddHOD = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/superadmin/principals`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(newHOD) });
    const data = await res.json();
    if (data.success) { showToast("HOD created!", "success"); setShowAddModal(false); setNewHOD({ name: "", email: "", password: "", campus_id: "" }); fetchData(); }
    else showToast(data.message || "Error creating HOD", "error");
  };

  const handleAddBD = async (e) => {
    e.preventDefault();
    const body = editingItem ? { ...editingItem } : newBD;
    const url = editingItem ? `${API}/superadmin/bds/${editingItem.id}` : `${API}/superadmin/bds`;
    const res = await fetch(url, { method: editingItem ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) { showToast(editingItem ? "BD User updated!" : "BD User created!", "success"); setShowAddModal(false); setEditingItem(null); setNewBD({ name: "", email: "", password: "", campus_id: "" }); fetchData(); }
    else showToast(data.message || "Error saving BD User", "error");
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
  const navItems = [
    ['overview',    'Platform Overview', <ChartBar   size={20} />],
    ['campuses',    'Departments',       <Buildings  size={20} />],
    ['principals',  'Principals',        <UserCircle size={20} />],
    // ['bds',         'BD Users',          <IdentificationCard size={20} />],
    ['reports',     'Course Reports',    <ChartLine  size={20} />],
  ];

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div style={S.container}>
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

      {/* ── Sidebar ── */}
      <aside style={S.sidebar} className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div style={S.logoWrapper}>
          <div style={S.logoIcon}><Globe size={24} weight="fill" /></div>
          <span style={S.logoText}>Lancers<span style={S.logoAccent}>Tech</span></span>
        </div>

        <div style={S.globalBadge}>
          <ShieldCheck size={14} weight="fill" />
          <span>Global Platform Control</span>
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
      </aside>

      {/* ── Main Content ── */}
      <main style={S.main} className="main-content">
        <header style={S.header}>
          <div>
            <h1 style={S.title}>Global Control Center</h1>
            <p style={S.subtitle}>Platform-wide management — all departments</p>
          </div>
          <div style={S.campusCounter}>
            <Buildings size={16} color="#94a3b8" />
            <span>{overview.totalCampuses || 0} Departments Active</span>
          </div>
        </header>

        {/* ── Tab Sections ── */}
        {activeTab === "overview" && (
          <SAOverview overview={overview} departmentStats={departmentStats} />
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
            onAdd={handleAddHOD}
            onDelete={handleDeleteHOD}
            showHODModal={showHODModal} setShowHODModal={setShowHODModal}
            selectedHODDetails={selectedHODDetails} isHODDetailsLoading={isHODDetailsLoading}
            onViewDetails={handleViewHODDetails}
          />
        )}


        {/* {activeTab === "bds" && (
          <SABDUsers
            bds={bds} departments={departments}
            editingItem={editingItem} setEditingItem={setEditingItem}
            showAddModal={showAddModal} setShowAddModal={setShowAddModal}
            newBD={newBD} setNewBD={setNewBD}
            onAdd={handleAddBD}
            onDelete={handleDeleteBD}
            showBDModal={showBDModal} setShowBDModal={setShowBDModal}
            selectedBDDetails={selectedBDDetails} isBDDetailsLoading={isBDDetailsLoading}
            onViewDetails={handleViewBDDetails}
          />
        )} */}

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

      {/* ── Right Panel ── */}
      <aside style={S.rightPanel} className="right-panel">
        <div style={S.profileCard}>
          <div style={{...S.avatar, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)'}}>
            {user.name.charAt(0)}
          </div>
          <h3 style={S.profileName}>{user.name}</h3>
          <span style={S.roleBadge}>Super Admin</span>
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
            ['Departments', overview.totalCampuses  || 0, '#4f46e5'],
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

        <div style={S.systemStatus}>
          <div style={S.systemStatusDot}></div>
          <span>All systems operational</span>
        </div>
      </aside>
    </div>
  );
}

export default SuperAdminDashboard;
