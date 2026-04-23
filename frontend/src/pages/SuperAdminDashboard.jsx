import { useState, useEffect, useRef } from "react";
import "../responsive.css";
import { Chart } from "chart.js/auto";
import { 
  House, Buildings, UserCircle, SignOut, Plus, Trash, PencilSimple, Globe, ChartLine, Users, 
  Calendar, ShieldCheck, ChartBar, PlusCircle, NotePencil, List, IdentificationCard, X, 
  CheckCircle, WarningCircle, Download, Check, ArrowsCounterClockwise, Eye, EyeSlash, 
  Gear, Bell, Warning, Star, ChatCircle, ArrowLeft
} from "@phosphor-icons/react";

import API_BASE_URL from "../config/api";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

const API = `${API_BASE_URL}/api`;

function SuperAdminDashboard({ user = { name: "Main Department" }, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState({});
  const [departmentStats, setDepartmentStats] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hods, setHods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newDepartment, setNewDepartment] = useState({ name: "", location: "" });
  const [newHOD, setNewHOD] = useState({ name: "", email: "", password: "", campus_id: "" });
  const [bds, setBds] = useState([]);
  const [newBD, setNewBD] = useState({ name: "", email: "", password: "", campus_id: "" });
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHODModal, setShowHODModal] = useState(false);
  const [selectedHODDetails, setSelectedHODDetails] = useState(null);
  const [isHODDetailsLoading, setIsHODDetailsLoading] = useState(false);
  const [showBDModal, setShowBDModal] = useState(false);
  const [selectedBDDetails, setSelectedBDDetails] = useState(null);
  const [isBDDetailsLoading, setIsBDDetailsLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState(null);
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false);
  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false
  });
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const token = sessionStorage.getItem("token");

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

  const fetchReportDetails = async (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
    setIsReportDetailsLoading(true);
    try {
      const res = await fetch(`${API}/reports/${report.id}/details`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.success) setReportDetails(data);
    } catch (e) { console.error(e); }
    setIsReportDetailsLoading(false);
  };

  useEffect(() => {
    if (chartRef.current && activeTab === "overview" && departmentStats.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: departmentStats.map(c => c.campus_name),
          datasets: [
            { 
              label: 'Students', 
              data: departmentStats.map(c => c.students), 
              backgroundColor: 'rgba(79, 70, 229, 0.8)',
              borderRadius: 8,
              barPercentage: 0.6,
            },
            { 
              label: 'Teachers', 
              data: departmentStats.map(c => c.teachers), 
              backgroundColor: 'rgba(124, 58, 237, 0.8)',
              borderRadius: 8,
              barPercentage: 0.6,
            },
          ]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { 
            legend: { 
              position: 'top',
              labels: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: 600 } }
            } 
          }, 
          scales: { 
            y: { 
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.03)' }
            },
            x: {
              grid: { display: false }
            }
          } 
        }
      });
    }
  }, [activeTab, departmentStats]);

  const handleDeleteDepartment = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Department",
      message: "Are you sure you want to delete this department? All users will be unassigned.",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`${API}/superadmin/campuses/${id}`, { 
            method: 'DELETE', 
            headers: { Authorization: `Bearer ${token}` } 
          });
          const data = await res.json();
          if (data.success) {
            showToast("Department deleted successfully!", "success");
            fetchData();
          } else {
            showToast(data.message || "Error deleting department", "error");
          }
        } catch (e) {
          showToast("Error deleting department", "error");
        }
      },
      isDanger: true
    });
  };

  const handleDeleteHOD = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete HOD",
      message: "Are you sure you want to delete this HOD?",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`${API}/superadmin/principals/${id}`, { 
            method: 'DELETE', 
            headers: { Authorization: `Bearer ${token}` } 
          });
          const data = await res.json();
          if (data.success) {
            showToast("HOD deleted successfully!", "success");
            fetchData();
          } else {
            showToast(data.message || "Error deleting HOD", "error");
          }
        } catch (e) {
          showToast("Error deleting HOD", "error");
        }
      },
      isDanger: true
    });
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    const body = editingItem ? { ...editingItem } : newDepartment;
    const url = editingItem ? `${API}/superadmin/campuses/${editingItem.id}` : `${API}/superadmin/campuses`;
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) { 
      showToast(editingItem ? "Department updated!" : "Department created!", "success");
      setShowAddModal(false); 
      setEditingItem(null); 
      setNewDepartment({ name: "", location: "" }); 
      fetchData(); 
    }
    else showToast(data.message || "Error saving department", "error");
  };

  const handleAddHOD = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/superadmin/principals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newHOD)
    });
    const data = await res.json();
    if (data.success) { 
      showToast("HOD created successfully!", "success");
      setShowAddModal(false); 
      setNewHOD({ name: "", email: "", password: "", campus_id: "" }); 
      fetchData(); 
    }
    else showToast(data.message || "Error creating HOD", "error");
  };

  const handleDeleteBD = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete BD User",
      message: "Are you sure you want to delete this BD User?",
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await fetch(`${API}/superadmin/bds/${id}`, { 
            method: 'DELETE', 
            headers: { Authorization: `Bearer ${token}` } 
          });
          const data = await res.json();
          if (data.success) {
            showToast("BD User deleted successfully!", "success");
            fetchData();
          } else {
            showToast(data.message || "Error deleting BD User", "error");
          }
        } catch (e) {
          showToast("Error deleting BD User", "error");
        }
      },
      isDanger: true
    });
  };

  const handleAddBD = async (e) => {
    e.preventDefault();
    const body = editingItem ? { ...editingItem } : newBD;
    const url = editingItem ? `${API}/superadmin/bds/${editingItem.id}` : `${API}/superadmin/bds`;
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) { 
      showToast(editingItem ? "BD User updated!" : "BD User created!", "success");
      setShowAddModal(false); 
      setEditingItem(null); 
      setNewBD({ name: "", email: "", password: "", campus_id: "" }); 
      fetchData(); 
    }
    else showToast(data.message || "Error saving BD User", "error");
  };

  const handleViewHODDetails = async (id) => {
    setIsHODDetailsLoading(true);
    setShowHODModal(true);
    try {
      const res = await fetch(`${API}/superadmin/principals/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedHODDetails(data.details);
      } else {
        showToast(data.message || "Error fetching details", "error");
        setShowHODModal(false);
      }
    } catch (e) {
      showToast("Error fetching HOD details", "error");
      setShowHODModal(false);
    }
    setIsHODDetailsLoading(false);
  };

  const handleViewBDDetails = async (id) => {
    setIsBDDetailsLoading(true);
    setShowBDModal(true);
    try {
      const res = await fetch(`${API}/superadmin/bds/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedBDDetails(data.details);
      } else {
        showToast(data.message || "Error fetching details", "error");
        setShowBDModal(false);
      }
    } catch (e) {
      showToast("Error fetching BD details", "error");
      setShowBDModal(false);
    }
    setIsBDDetailsLoading(false);
  };

  if (isLoading) return (
    <div style={S.loadingContainer}>
      <div style={S.loadingSpinner}></div>
      <p style={S.loadingText}>Loading Global Dashboard...</p>
    </div>
  );

  return (
    <div style={S.container}>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={confirmModal.isDanger}
      />
      {/* Animated Background Elements */}
      <div style={S.bgOrb1}></div>
      <div style={S.bgOrb2}></div>
      
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-menu-btn"
      >
        <List size={24} weight="bold" />
      </button>

      {/* Sidebar */}
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
          {[
            ['overview', 'Platform Overview', <ChartBar size={20} weight={activeTab === 'overview' ? 'fill' : 'regular'} />],
            ['campuses', 'Departments', <Buildings size={20} weight={activeTab === 'campuses' ? 'fill' : 'regular'} />],
            ['principals', 'HOD/Principal', <UserCircle size={20} weight={activeTab === 'principals' ? 'fill' : 'regular'} />],
            ['bds', 'BD Users', <IdentificationCard size={20} weight={activeTab === 'bds' ? 'fill' : 'regular'} />],
            ['reports', 'Course Reports', <ChartLine size={20} weight={activeTab === 'reports' ? 'fill' : 'duotone'} />]
          ].map(([tab, label, icon]) => (
            <button 
              key={tab} 
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
          <SignOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
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

        {activeTab === "overview" && (
          <div style={S.overviewContainer}>
            {/* Stats Grid */}
            <div style={S.statsGrid} className="stats-grid">
              {[
                ['Total Departments', overview.totalCampuses || 0, '#4f46e5', <Buildings size={24} weight="duotone" />],
                ['Total HODs', overview.totalPrincipals || 0, '#7c3aed', <UserCircle size={24} weight="duotone" />],
                ['Total BDs', overview.totalBds || 0, '#ec4899', <IdentificationCard size={24} weight="duotone" />],
                ['Total Teachers', overview.totalTeachers || 0, '#2563eb', <UserCircle size={24} weight="duotone" />],
                ['Total Courses', overview.totalCourses || 0, '#0891b2', <ChartLine size={24} weight="duotone" />],
              ].map(([label, val, color, icon], idx) => (
                <div key={label} style={S.metricCard} className="metric-card">
                  <div style={S.metricIconWrapper( color)}>
                    {icon}
                  </div>
                  <div>
                    <p style={S.metricLabel}>{label}</p>
                    <h2 style={{...S.metricValue, color}}>{val.toLocaleString()}</h2>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={S.chartCard}>
              <div style={S.chartHeader}>
                <h3 style={S.chartTitle}>Students & Teachers per Department</h3>
                <div style={S.chartLegend}>
                  <span style={S.legendItem}><span style={{...S.legendDot, background: '#4f46e5'}}></span> Students</span>
                  <span style={S.legendItem}><span style={{...S.legendDot, background: '#7c3aed'}}></span> Teachers</span>
                </div>
              </div>
              <div style={{ height: '300px', position: 'relative' }}>
                <canvas ref={chartRef}></canvas>
              </div>
            </div>

            {/* Department Breakdown Table */}
            <div style={S.tableCard}>
              <div style={S.tableHeader}>
                <h3 style={S.tableTitle}>Department Breakdown</h3>
                <div style={S.tableBadge}>
                  <Calendar size={14} />
                  <span>Real-time stats</span>
                </div>
              </div>
              <div style={S.tableContainer} className="table-container">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>DEPARTMENT</th>
                      <th style={S.th}>STUDENTS</th>
                      <th style={S.th}>TEACHERS</th>
                      <th style={S.th}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentStats.map(c => (
                      <tr key={c.id} style={S.tr}>
                        <td style={S.tdName}>{c.campus_name}</td>
                        <td style={S.td}>{c.students}</td>
                        <td style={S.td}>{c.teachers}</td>
                        <td style={S.td}>
                          <span style={{...S.statusBadge, 
                            background: c.is_active ? '#dcfce7' : '#fee2e2',
                            color: c.is_active ? '#166534' : '#991b1b'
                          }}>
                            {c.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "campuses" && (
          <div style={S.tableCard}>
            <div style={S.tableHeader}>
              <h2 style={S.tableTitle}>Departments</h2>
              <button 
                onClick={() => { setEditingItem(null); setShowAddModal(true); }} 
                style={S.addBtn}
                className="add-btn"
              >
                <Plus size={18} weight="bold" />
                <span>Add Department</span>
              </button>
            </div>
            <div style={S.tableContainer} className="table-container">
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>NAME</th>
                    <th style={S.th}>LOCATION</th>
                    <th style={S.th}>STUDENTS</th>
                    <th style={S.th}>TEACHERS</th>
                    <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(c => (
                    <tr key={c.id} style={S.tr}>
                      <td style={S.tdName}>{c.name}</td>
                      <td style={S.td}>{c.location || '—'}</td>
                      <td style={S.td}>{c.student_count || 0}</td>
                      <td style={S.td}>{c.teacher_count || 0}</td>
                      <td style={{...S.td, textAlign: 'right'}}>
                        <div style={S.actionButtons}>
                          <button 
                            style={S.editBtn} 
                            className="edit-btn"
                            onClick={() => { setEditingItem({...c}); setShowAddModal(true); }}
                            title="Edit Department"
                          >
                            <PencilSimple size={16} />
                          </button>
                          <button 
                            style={S.deleteBtn} 
                            className="delete-btn"
                            onClick={() => handleDeleteDepartment(c.id)}
                            title="Delete Department"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "principals" && (
          <div style={S.tableCard}>
            <div style={S.tableHeader}>
              <h2 style={S.tableTitle}>HOD/Principals</h2>
              <button 
                onClick={() => setShowAddModal(true)} 
                style={S.addBtn}
                className="add-btn"
              >
                <Plus size={18} weight="bold" />
                <span>Add HOD</span>
              </button>
            </div>
            <div style={S.tableContainer} className="table-container">
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>NAME</th>
                    <th style={S.th}>EMAIL</th>
                    <th style={S.th}>DEPARTMENT</th>
                    <th style={S.th}>JOINED</th>
                    <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                    {hods.map(p => (
                      <tr key={p.id} style={S.tr}>
                        <td style={S.tdName}>{p.name}</td>
                        <td style={S.td}>{p.email}</td>
                        <td style={S.td}>
                          <span style={S.campusTag}>{p.campus_name || '—'}</span>
                        </td>
                        <td style={S.td}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td style={{...S.td, textAlign: 'right'}}>
                          <div style={S.actionButtons}>
                            <button 
                              style={{...S.editBtn, background: '#f1f5f9', color: '#4f46e5'}} 
                              className="view-btn"
                              onClick={() => handleViewHODDetails(p.id)}
                              title="View Details"
                            >
                              <ChartLine size={16} weight="bold" />
                            </button>
                            <button 
                              style={S.deleteBtn} 
                              className="delete-btn"
                              onClick={() => handleDeleteHOD(p.id)}
                              title="Delete HOD"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {activeTab === "bds" && (
            <div style={S.tableCard}>
              <div style={S.tableHeader}>
                <h2 style={S.tableTitle}>BD Users</h2>
                <button 
                  onClick={() => { setEditingItem(null); setShowAddModal(true); }} 
                  style={S.addBtn}
                  className="add-btn"
                >
                  <Plus size={18} weight="bold" />
                  <span>Add BD User</span>
                </button>
              </div>
              <div style={S.tableContainer} className="table-container">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>NAME</th>
                      <th style={S.th}>DEPARTMENT</th>
                      <th style={S.th}>EMAIL</th>
                      <th style={S.th}>JOINED</th>
                      <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bds.map(bd => (
                      <tr key={bd.id} style={S.tr}>
                        <td style={S.tdName}>{bd.name}</td>
                        <td style={S.td}>
                          <span style={{...S.planBadge, background: '#f1f5f9', color: '#475569'}}>
                            {bd.campus_name || "Global / Multi-Campus"}
                          </span>
                        </td>
                        <td style={S.td}>{bd.email}</td>
                        <td style={S.td}>{new Date(bd.created_at).toLocaleDateString()}</td>
                        <td style={{...S.td, textAlign: 'right'}}>
                          <div style={S.actionButtons}>
                            <button 
                              style={{...S.editBtn, background: '#f1f5f9', color: '#4f46e5'}} 
                              className="view-btn"
                              onClick={() => handleViewBDDetails(bd.id)}
                              title="View Details"
                            >
                              <ChartLine size={16} weight="bold" />
                            </button>
                            <button 
                              style={S.editBtn} 
                              onClick={() => { setEditingItem(bd); setNewBD({ name: bd.name, email: bd.email, password: "", campus_id: bd.campus_id || "" }); setShowAddModal(true); }}
                              title="Edit BD User"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button 
                              style={S.deleteBtn} 
                              onClick={() => handleDeleteBD(bd.id)}
                              title="Delete BD User"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {activeTab === "reports" && (
          <div style={S.tableCard}>
            <div style={S.tableHeader}>
                <h2 style={S.tableTitle}>
                  <ChartBar size={28} weight="duotone" color="#6366f1" style={{verticalAlign:'middle', marginRight:'12px'}} />
                  Course Completion Reports
                </h2>
              <span style={{fontSize:'13px', color:'#64748b'}}>{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
            </div>
            {reportsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading reports...</div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                <div style={{ marginBottom: '16px' }}>
                  <ChartBar size={64} weight="duotone" color="#94a3b8" />
                </div>
                <p>No course reports yet. Reports are auto-generated when a teacher marks a course as complete.</p>
              </div>
            ) : (
              <div style={S.tableContainer} className="table-container">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>COURSE</th>
                      <th style={S.th}>CLASS</th>
                      <th style={S.th}>CAMPUS</th>
                      <th style={S.th}>TEACHER</th>
                      <th style={S.th}>STUDENTS</th>
                      <th style={S.th}>AVG MARKS</th>
                      <th style={S.th}>ATTENDANCE</th>
                      <th style={S.th}>PASS/FAIL</th>
                      <th style={S.th}>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr 
                        key={r.id} 
                        style={{...S.tr, cursor: 'pointer'}} 
                        onClick={() => fetchReportDetails(r)}
                      >
                        <td style={S.tdName}>
                          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                            <ChartBar size={18} color="#6366f1" />
                            {r.course_title}
                          </div>
                        </td>
                        <td style={S.td}>{r.class_name}</td>
                        <td style={S.td}><span style={S.campusTag}>{r.campus_name}</span></td>
                        <td style={S.td}>{r.teacher_name}</td>
                        <td style={S.td}><strong>{r.total_students}</strong></td>
                        <td style={S.td}>
                          <span style={{...S.planBadge, padding:'4px 10px', background: r.avg_marks >= 50 ? '#dcfce7' : '#fee2e2', color: r.avg_marks >= 50 ? '#166534' : '#991b1b'}}>
                            {parseFloat(r.avg_marks).toFixed(1)}%
                          </span>
                        </td>
                        <td style={S.td}>
                          <span style={{...S.planBadge, padding:'4px 10px', background: '#dbeafe', color: '#1e40af'}}>
                            {parseFloat(r.avg_attendance).toFixed(1)}%
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                            <span style={{color:'#166534', fontWeight:700}}>{r.pass_count}✓</span>
                            <span style={{color:'#94a3b8'}}>|</span>
                            <span style={{color:'#ef4444', fontWeight:700}}>{r.fail_count}✗</span>
                          </div>
                        </td>
                        <td style={S.td}>{new Date(r.completed_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Right Panel */}
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
            ['Departments', overview.totalCampuses || 0, '#4f46e5'],
            ['HODs', overview.totalPrincipals || 0, '#7c3aed'],
            ['BD Users', overview.totalBds || 0, '#ec4899'],
            ['Teachers', overview.totalTeachers || 0, '#2563eb'],
            ['Students', overview.totalStudents || 0, '#0891b2']
          ].map(([label, val, color], idx) => (
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

      {/* DETAILED REPORT MODAL */}
      {showReportModal && selectedReport && (
        <div style={S.overlay} onClick={() => { setShowReportModal(false); setReportDetails(null); }}>
          <div style={{...S.modal, maxWidth: '1000px', width: '95%', padding: 0}} onClick={e => e.stopPropagation()} className="animate-slideUp">
            <div style={S.modalHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                <div style={{width:'56px', height:'56px', borderRadius:'18px', background:'linear-gradient(135deg, #f5f3ff, #ede9fe)', display:'flex', alignItems:'center', justifyContent:'center', color:'#4f46e5', boxShadow:'0 8px 15px -5px rgba(79, 70, 229, 0.2)'}}>
                  <ChartLine size={28} weight="duotone" />
                </div>
                <div>
                  <h2 style={{...S.modalTitle, marginBottom: '4px', textAlign: 'left', fontSize: '1.4rem'}}>{selectedReport.course_title}</h2>
                  <p style={{margin:0, fontSize:'14px', color:'#64748b', fontWeight: 500}}>Detailed Academic Performance Report</p>
                </div>
              </div>
              <button style={S.modalClose} onClick={() => { setShowReportModal(false); setReportDetails(null); }} className="modal-close">
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <div style={{padding: '32px', maxHeight: '70vh', overflowY: 'auto'}} className="hidden-scrollbar">
              {isReportDetailsLoading ? (
                <div style={{textAlign:'center', padding:'60px', color:'#64748b'}}>
                   <div className="loading-spinner" style={{marginBottom: '16px'}}></div>
                   <p style={{fontWeight: 600}}>Generating comprehensive report analytics...</p>
                </div>
              ) : reportDetails ? (
                <>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'20px', marginBottom:'32px'}}>
                    <div style={{padding:'24px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0', transition: 'all 0.3s ease'}} className="metric-card">
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>AVERAGE MARKS</span>
                      <h3 style={{margin:'10px 0 0', fontSize:'32px', color:'#0f172a', fontWeight:800}}>
                        {parseFloat(reportDetails.teacher_performance.avg_student_marks).toFixed(1)}%
                      </h3>
                    </div>
                    <div style={{padding:'24px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0', transition: 'all 0.3s ease'}} className="metric-card">
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>ATTENDANCE</span>
                      <h3 style={{margin:'10px 0 0', fontSize:'32px', color:'#0f172a', fontWeight:800}}>
                        {parseFloat(reportDetails.teacher_performance.avg_attendance).toFixed(1)}%
                      </h3>
                    </div>
                    <div style={{padding:'24px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0', transition: 'all 0.3s ease'}} className="metric-card">
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>PASS RATE</span>
                      <h3 style={{margin:'10px 0 0', fontSize:'32px', color:'#166534', fontWeight:800}}>
                        {Math.round((selectedReport.pass_count / selectedReport.total_students) * 100)}%
                      </h3>
                    </div>
                  </div>

                  <div style={{marginBottom:'32px', padding:'28px', borderRadius:'28px', background:'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)', border:'1px solid #ddd6fe', boxShadow: '0 10px 30px -10px rgba(79, 70, 229, 0.1)'}}>
                    <h3 style={{margin:'0 0 20px', fontSize:'18px', color:'#4f46e5', display:'flex', alignItems:'center', gap:'12px', fontWeight:800}}>
                      <UserCircle size={24} weight="duotone" /> Teacher Insights: {selectedReport.teacher_name}
                    </h3>
                    <div style={{display:'flex', gap:'40px', flexWrap: 'wrap', alignItems:'center'}}>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>RATING</span>
                        <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'6px'}}>
                          <span style={{fontSize:'28px', fontWeight:800, color:'#5b21b6'}}>{reportDetails.teacher_performance.rating}</span>
                          <span style={{fontSize:'18px', color:'#a78bfa', fontWeight: 600}}>/ 5.0</span>
                        </div>
                      </div>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>FEEDBACK COUNT</span>
                        <div style={{marginTop:'6px', fontSize:'22px', fontWeight:800, color:'#5b21b6'}}>
                          {reportDetails.teacher_performance.feedback_count} <span style={{fontSize: '14px', color: '#7c3aed', fontWeight: 600}}>Students</span>
                        </div>
                      </div>
                      <div style={{flex:1, textAlign:'right', minWidth:'220px'}}>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>STATUS</span>
                        <div style={{marginTop:'10px'}}>
                          <span style={{padding:'8px 24px', borderRadius:'30px', background:'#4f46e5', color:'#fff', fontSize:'14px', fontWeight:800, boxShadow:'0 10px 20px -5px rgba(79, 70, 229, 0.4)'}}>
                            ACCOMPLISHED
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <h3 style={{fontSize:'18px', color:'#1e293b', fontWeight:800, display:'flex', alignItems:'center', gap:'12px'}}>
                      <Users size={22} weight="duotone" /> Student-wise Performance
                    </h3>
                    <div style={{fontSize: '13px', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '6px 14px', borderRadius: '30px'}}>
                      Total Students: {reportDetails.students.length}
                    </div>
                  </div>

                  <div style={{border:'1px solid #e2e8f0', borderRadius:'24px', overflow:'hidden', boxShadow:'0 15px 30px -10px rgba(0,0,0,0.05)', background:'#fff'}}>
                    <div style={{overflowX: 'auto'}} className="hidden-scrollbar">
                      <table style={{width:'100%', borderCollapse:'collapse', minWidth:'700px'}}>
                        <thead>
                          <tr style={{background:'#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                            <th style={{padding:'20px 28px', textAlign:'left', fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>STUDENT NAME</th>
                            <th style={{padding:'20px 28px', textAlign:'left', fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>MARKS (%)</th>
                            <th style={{padding:'20px 28px', textAlign:'right', fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportDetails.students.map(s => (
                            <tr key={s.id} style={{borderBottom:'1px solid #f1f5f9', transition: 'background 0.2s ease'}} className="tr-hover">
                              <td style={{padding:'20px 28px', fontSize:'15px', fontWeight:700, color:'#0f172a'}}>{s.name}</td>
                              <td style={{padding:'20px 28px', fontSize:'14px', color:'#475569', fontWeight:500}}>
                                {s.marks_obtained ? (
                                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <span style={{color:'#0f172a', fontWeight:800, fontSize: '16px'}}>{s.marks_obtained}</span>
                                    <span style={{color:'#cbd5e1', fontSize: '18px'}}>/</span>
                                    <span style={{color: '#64748b', fontWeight: 600}}>{s.max_marks}</span>
                                    <span style={{marginLeft:'auto', padding:'4px 10px', borderRadius:'10px', background:'#e0e7ff', color:'#4f46e5', fontWeight:800, fontSize:'12px'}}>
                                      {s.percentage}%
                                    </span>
                                  </div>
                                ) : (
                                  <span style={{color:'#94a3b8', fontStyle:'italic', fontWeight: 500}}>No Evaluation</span>
                                )}
                              </td>
                              <td style={{padding:'20px 28px', textAlign:'right'}}>
                                {s.status === 'Pass' ? (
                                  <span style={{display:'inline-flex', alignItems:'center', gap:'6px', color:'#166534', fontWeight:800, fontSize:'13px', padding:'6px 14px', background:'#f0fdf4', borderRadius:'30px', border: '1px solid #dcfce7'}}>
                                    <Check size={14} weight="bold" /> PASS
                                  </span>
                                ) : (
                                  <span style={{display:'inline-flex', alignItems:'center', gap:'6px', color:'#ef4444', fontWeight:800, fontSize:'13px', padding:'6px 14px', background:'#fef2f2', borderRadius:'30px', border: '1px solid #fee2e2'}}>
                                    <Warning size={14} weight="bold" /> FAIL
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
                <div style={{textAlign:'center', padding:'80px 20px'}}>
                  <div style={{fontSize:'64px', marginBottom:'24px', animation: 'float 3s infinite alternate'}}>📊</div>
                  <h3 style={{color:'#0f172a', marginBottom:'12px', fontSize: '1.5rem', fontWeight: 800}}>Performance Analytics Partially Unavailable</h3>
                  <p style={{color:'#64748b', fontSize:'15px', maxWidth:'450px', margin:'0 auto 32px', lineHeight: 1.6}}>
                    We couldn't retrieve the full student-wise breakdown or teacher feedback for this course report at this moment.
                  </p>
                  <button 
                    onClick={() => fetchReportDetails(selectedReport)}
                    style={{...S.cancelBtn, background:'#fff', border: '2px solid #e2e8f0', padding:'14px 28px', fontSize:'15px', display: 'inline-flex', alignItems:'center', gap: '8px'}}
                  >
                    <ArrowsCounterClockwise size={18} weight="bold" /> Refresh Analytics
                  </button>
                </div>
              )}
            </div>
            
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={() => { setShowReportModal(false); setReportDetails(null); }}>Close Report</button>
              <button style={{...S.submitBtn, background:'#0f172a', display: 'flex', alignItems:'center', gap:'8px'}} onClick={() => window.print()}>
                <Download size={18} weight="bold" /> Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Department Modal */}
      {showAddModal && activeTab === "campuses" && (
        <div style={S.overlay} onClick={() => { setShowAddModal(false); setEditingItem(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>{editingItem ? 'Edit Department' : 'Add New Department'}</h3>
            <form onSubmit={handleAddDepartment} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Department Name</label>
                <input 
                  placeholder="e.g., Main Department" 
                  required 
                  value={editingItem ? editingItem.name : newDepartment.name} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewDepartment({...newDepartment, name: e.target.value})} 
                  style={S.input}
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Location</label>
                <input 
                  placeholder="e.g., New York" 
                  value={editingItem ? editingItem.location : newDepartment.location} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, location: e.target.value}) : setNewDepartment({...newDepartment, location: e.target.value})} 
                  style={S.input}
                />
              </div>
              
              {editingItem && (
                <div style={S.checkboxGroup}>
                  <input 
                    type="checkbox" 
                    id="activeCheckbox"
                    checked={editingItem.is_active} 
                    onChange={e => setEditingItem({...editingItem, is_active: e.target.checked})} 
                    style={S.checkbox}
                  />
                  <label htmlFor="activeCheckbox" style={S.checkboxLabel}>Active Department</label>
                </div>
              )}
              
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={S.saveBtn}>
                  {editingItem ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add HOD Modal */}
      {showAddModal && activeTab === "principals" && (
        <div style={S.overlay} onClick={() => setShowAddModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Add New HOD</h3>
            <form onSubmit={handleAddHOD} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Full Name</label>
                <input 
                  placeholder="e.g., Prof. Ahmed" 
                  required 
                  value={newHOD.name} 
                  onChange={e => setNewHOD({...newHOD, name: e.target.value})} 
                  style={S.input}
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Email Address</label>
                <input 
                  placeholder="hod@department.edu" 
                  required 
                  type="email" 
                  value={newHOD.email} 
                  onChange={e => setNewHOD({...newHOD, email: e.target.value})} 
                  style={S.input}
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Password</label>
                <input 
                  placeholder="••••••••" 
                  required 
                  type="password" 
                  value={newHOD.password} 
                  onChange={e => setNewHOD({...newHOD, password: e.target.value})} 
                  style={S.input}
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Assign to Department</label>
                <select 
                  required 
                  value={newHOD.campus_id} 
                  onChange={e => setNewHOD({...newHOD, campus_id: e.target.value})} 
                  style={S.input}
                >
                  <option value="">Select Department...</option>
                  {departments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} style={S.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={S.saveBtn}>
                  Create HOD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit BD Modal */}
      {showAddModal && activeTab === "bds" && (
        <div style={S.overlay} onClick={() => { setShowAddModal(false); setEditingItem(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>{editingItem ? 'Edit BD User' : 'Add New BD User'}</h3>
            <form onSubmit={handleAddBD} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Full Name</label>
                <input 
                  placeholder="e.g., John Doe" 
                  required 
                  value={editingItem ? editingItem.name : newBD.name} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewBD({...newBD, name: e.target.value})} 
                  style={S.input}
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Email Address</label>
                <input 
                  placeholder="bd@example.com" 
                  required 
                  type="email" 
                  value={editingItem ? editingItem.email : newBD.email} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, email: e.target.value}) : setNewBD({...newBD, email: e.target.value})} 
                  style={S.input}
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Password {editingItem && "(leave blank to keep current)"}</label>
                <input 
                  placeholder="••••••••" 
                  required={!editingItem}
                  type="password" 
                  value={editingItem ? editingItem.password : newBD.password} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, password: e.target.value}) : setNewBD({...newBD, password: e.target.value})} 
                  style={S.input}
                />
              </div>

              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Assign to Department (Optional for Global)</label>
                <select 
                  value={editingItem ? (editingItem.campus_id || "") : newBD.campus_id} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, campus_id: e.target.value}) : setNewBD({...newBD, campus_id: e.target.value})} 
                  style={S.input}
                >
                  <option value="">Global / No Specific Department</option>
                  {departments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={S.saveBtn}>
                  {editingItem ? 'Update BD' : 'Create BD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* HOD Details Modal */}
      {showHODModal && (
        <div style={S.overlay} onClick={() => { setShowHODModal(false); setSelectedHODDetails(null); }}>
          <div style={{...S.modal, maxWidth: '600px', padding: '0', overflow: 'hidden'}} onClick={e => e.stopPropagation()}>
            {isHODDetailsLoading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={S.loadingSpinner}></div>
                <p style={{ marginTop: '16px', color: '#64748b' }}>Fetching real-time stats...</p>
              </div>
            ) : selectedHODDetails ? (
              <div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                  padding: '30px', 
                  color: 'white',
                  position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px', 
                    cursor: 'pointer',
                    opacity: 0.8
                  }} onClick={() => setShowHODModal(false)}>
                    <Plus size={24} weight="bold" style={{ transform: 'rotate(45deg)' }} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '20px', 
                      background: 'rgba(255,255,255,0.2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: '800',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                      {selectedHODDetails.name.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>{selectedHODDetails.name}</h2>
                      <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>{selectedHODDetails.email}</p>
                      <div style={{ 
                        marginTop: '10px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: 'rgba(255,255,255,0.2)', 
                        padding: '4px 12px', 
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        <Buildings size={14} weight="fill" />
                        {selectedHODDetails.campus_name}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '30px', background: '#fff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
                    <div>
                      <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HOD Information</h4>
                      <div style={S.infoItem}>
                        <Calendar size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>Member Since</p>
                          <p style={S.infoValue}>{new Date(selectedHODDetails.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div style={S.infoItem}>
                        <ShieldCheck size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>System Role</p>
                          <p style={S.infoValue}>Departmental Head (HOD)</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department Context</h4>
                      <div style={S.infoItem}>
                        <Globe size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>Location</p>
                          <p style={S.infoValue}>{selectedHODDetails.campus_location || 'Not Set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Live Operational Stats
                  </h4>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '12px' 
                  }}>
                    {[
                      { label: 'Students', val: selectedHODDetails.stats.students, color: '#4f46e5', icon: <Users size={20} /> },
                      { label: 'Teachers', val: selectedHODDetails.stats.teachers, color: '#7c3aed', icon: <UserCircle size={20} /> },
                      { label: 'Classes', val: selectedHODDetails.stats.classes, color: '#0891b2', icon: <Buildings size={20} /> },
                      { label: 'Courses', val: selectedHODDetails.stats.courses, color: '#2563eb', icon: <ChartLine size={20} /> },
                      { label: 'Labs', val: selectedHODDetails.stats.labs, color: '#ec4899', icon: <Globe size={20} /> },
                    ].map(stat => (
                      <div key={stat.label} style={{ 
                        background: '#f8fafc', 
                        padding: '20px', 
                        borderRadius: '16px',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ color: stat.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                          {stat.icon}
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>{stat.val}</h3>
                        <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ 
                    marginTop: '24px', 
                    padding: '16px', 
                    background: '#f1f5f9', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <ShieldCheck size={20} color="#10b981" />
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>
                      This HOD has full operational control over the <strong style={{ color: '#0f172a' }}>{selectedHODDetails.campus_name}</strong> department.
                    </span>
                  </div>
                </div>
                
                <div style={{ padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setShowHODModal(false)}
                    style={{ 
                      padding: '10px 24px', 
                      background: '#0f172a', 
                      color: 'white', 
                      borderRadius: '10px', 
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* BD Details Modal */}
      {showBDModal && (
        <div style={S.overlay} onClick={() => { setShowBDModal(false); setSelectedBDDetails(null); }}>
          <div style={{...S.modal, maxWidth: '600px', padding: '0', overflow: 'hidden'}} onClick={e => e.stopPropagation()}>
            {isBDDetailsLoading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={S.loadingSpinner}></div>
                <p style={{ marginTop: '16px', color: '#64748b' }}>Fetching BD performance stats...</p>
              </div>
            ) : selectedBDDetails ? (
              <div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #0e7490, #0891b2)', 
                  padding: '30px', 
                  color: 'white',
                  position: 'relative'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    right: '20px', 
                    cursor: 'pointer',
                    opacity: 0.8
                  }} onClick={() => setShowBDModal(false)}>
                    <Plus size={24} weight="bold" style={{ transform: 'rotate(45deg)' }} />
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '20px', 
                      background: 'rgba(255,255,255,0.2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: '800',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}>
                      {selectedBDDetails.name.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>{selectedBDDetails.name}</h2>
                      <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>{selectedBDDetails.email}</p>
                      <div style={{ 
                        marginTop: '10px', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: 'rgba(255,255,255,0.2)', 
                        padding: '4px 12px', 
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        <IdentificationCard size={14} weight="fill" />
                        {selectedBDDetails.role === 'bd_agent' ? 'BD Agent' : 'Business Developer'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '30px', background: '#fff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
                    <div>
                      <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BD Information</h4>
                      <div style={S.infoItem}>
                        <Calendar size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>Member Since</p>
                          <p style={S.infoValue}>{new Date(selectedBDDetails.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div style={S.infoItem}>
                        <ShieldCheck size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>Account Status</p>
                          <p style={S.infoValue}>{selectedBDDetails.is_approved ? 'Verified' : 'Pending'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Focus</h4>
                      <div style={S.infoItem}>
                        <Buildings size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>Primary Metric</p>
                          <p style={S.infoValue}>Campus Acquisitions</p>
                        </div>
                      </div>
                      <div style={S.infoItem}>
                        <Globe size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>Region</p>
                          <p style={S.infoValue}>Multi-Campus</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sales & Growth Metrics
                  </h4>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    {[
                      { label: 'Total Leads', val: selectedBDDetails.stats.totalLeads, color: '#0891b2', icon: <House size={20} /> },
                      { label: 'Closed Deals', val: selectedBDDetails.stats.closedLeads, color: '#10b981', icon: <ShieldCheck size={20} /> },
                      { label: 'Shortlisted', val: selectedBDDetails.stats.shortlistedApplicants, color: '#4f46e5', icon: <UserCircle size={20} /> },
                    ].map(stat => (
                      <div key={stat.label} style={{ 
                        background: '#f8fafc', 
                        padding: '20px', 
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ color: stat.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                          {stat.icon}
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>{stat.val}</h3>
                        <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px' 
                  }}>
                     {[
                      { label: 'Active Job Postings', val: selectedBDDetails.stats.activePostings, color: '#f59e0b', icon: <PlusCircle size={20} /> },
                      { label: 'Total Applicants', val: selectedBDDetails.stats.totalApplicants, color: '#ec4899', icon: <Users size={20} /> },
                    ].map(stat => (
                      <div key={stat.label} style={{ 
                        background: '#f8fafc', 
                        padding: '16px', 
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ color: stat.color }}>{stat.icon}</div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0' }}>{stat.val}</h3>
                          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => setShowBDModal(false)}
                    style={{ 
                      padding: '10px 24px', 
                      background: '#0f172a', 
                      color: 'white', 
                      borderRadius: '10px', 
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ADVANCED STYLES ====================
const S = {
  // Container & Background
  container: { 
    display: 'flex', 
    minHeight: '100vh', 
    backgroundColor: '#f8fafc', 
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  
  bgOrb1: {
    position: 'fixed',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(79, 70, 229, 0.15), transparent 70%)',
    top: '-200px',
    left: '-200px',
    zIndex: 0,
    animation: 'float 20s infinite alternate ease-in-out',
  },
  
  bgOrb2: {
    position: 'fixed',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 70% 70%, rgba(124, 58, 237, 0.15), transparent 70%)',
    bottom: '-150px',
    right: '-150px',
    zIndex: 0,
    animation: 'float 25s infinite alternate ease-in-out',
  },

  // Sidebar Styles
  sidebar: { 
    width: '280px', 
    background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
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
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    padding: '10px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.4)',
  },
  
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  
  logoAccent: {
    color: '#818cf8',
    marginLeft: '2px',
  },
  
  globalBadge: {
    background: 'rgba(79, 70, 229, 0.2)',
    borderRadius: '30px',
    padding: '8px 16px',
    margin: '0 8px 24px 8px',
    fontSize: '12px',
    color: '#a5b4fc',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
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
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'left',
    fontSize: '15px',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  
  navBtnActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    color: '#fff',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
  },
  
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    width: '4px',
    height: '50%',
    background: 'linear-gradient(180deg, #4f46e5, #818cf8)',
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

  // Main Content
  main: { 
    flex: 1, 
    padding: '48px', 
    marginLeft: '280px', 
    marginRight: '320px', 
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
  
  title: { 
    fontSize: '2.2rem', 
    fontWeight: '800', 
    margin: 0,
    background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
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
  
  campusCounter: {
    background: '#fff',
    padding: '12px 24px',
    borderRadius: '30px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 10px -2px rgba(0,0,0,0.05)',
  },

  // Overview Section
  overviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },
  
  metricCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '28px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -2px rgba(0,0,0,0.05)',
  },
  
  metricIconWrapper: (color) => ({
    width: '56px',
    height: '56px',
    borderRadius: '20px',
    background: `${color}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
  }),
  
  metricLabel: { 
    margin: 0, 
    fontSize: '0.9rem', 
    fontWeight: '600', 
    color: '#64748b',
    letterSpacing: '0.02em',
  },
  
  metricValue: { 
    margin: '4px 0 0', 
    fontSize: '2rem', 
    fontWeight: '800',
  },
  
  chartCard: {
    backgroundColor: '#fff',
    padding: '28px',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
  },
  
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  
  chartTitle: {
    margin: 0,
    fontWeight: '700',
    fontSize: '1.2rem',
    color: '#0f172a',
  },
  
  chartLegend: {
    display: 'flex',
    gap: '16px',
  },
  
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#475569',
  },
  
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '4px',
  },
  
  tableCard: {
    backgroundColor: '#fff',
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
  
  tableBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: '#f1f5f9',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#475569',
  },
  
  tableContainer: {
    overflowX: 'auto',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '700px',
  },
  
  th: {
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontSize: '0.7rem',
    fontWeight: '800',
    letterSpacing: '0.05em',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
  },
  
  tr: {
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
    padding: '16px 20px',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  
  planBadge: {
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  
  campusTag: {
    padding: '4px 12px',
    borderRadius: '30px',
    background: '#f0fdf4',
    color: '#166534',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  
  editBtn: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  
  addBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
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

  // Right Panel
  rightPanel: {
    width: '320px',
    backgroundColor: '#fff',
    borderLeft: '1px solid #e2e8f0',
    padding: '40px 24px',
    position: 'fixed',
    right: 0,
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '-10px 0 30px -10px rgba(0,0,0,0.05)',
  },
  
  profileCard: {
    textAlign: 'center',
    background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
    padding: '32px 20px',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    marginBottom: '32px',
  },
  
  avatar: {
    width: '80px',
    height: '80px',
    color: '#fff',
    borderRadius: '28px',
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '800',
    boxShadow: '0 15px 30px -10px rgba(79, 70, 229, 0.3)',
  },
  
  profileName: {
    margin: '0 0 8px',
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  
  roleBadge: {
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '700',
    background: '#e0e7ff',
    color: '#3730a3',
    display: 'inline-block',
  },
  
  profileStats: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
  },
  
  profileStat: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  
  profileStatLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '600',
  },
  
  profileStatValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  
  platformStats: {
    marginTop: '32px',
  },
  
  platformStatsTitle: {
    fontWeight: '700',
    marginBottom: '20px',
    fontSize: '1rem',
    color: '#0f172a',
  },
  
  platformStatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  
  platformStatLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '600',
  },
  
  platformStatValue: {
    fontWeight: '800',
    fontSize: '1rem',
  },
  
  systemStatus: {
    marginTop: '32px',
    padding: '16px',
    background: '#f0fdf4',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#166534',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  
  systemStatusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    animation: 'pulse 2s infinite',
  },

  // Modal Styles
  overlay: { 
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
    width: '480px', 
    maxHeight: '90vh', 
    overflowY: 'auto',
    boxShadow: '0 50px 70px -20px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease',
  },
  
  modalHeader: {
    padding: '24px 32px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  modalClose: {
    background: '#f1f5f9',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    fontSize: '1.2rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    transition: 'all 0.2s ease',
  },
  
  modalTitle: {
    fontWeight: '800',
    fontSize: '1.5rem',
    marginBottom: '28px',
    color: '#0f172a',
    letterSpacing: '-0.02em',
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
  },
  
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
  },
  
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#4f46e5',
  },
  
  checkboxLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#0f172a',
    cursor: 'pointer',
  },
  
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  
  cancelBtn: { 
    padding: '12px 24px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '16px', 
    cursor: 'pointer', 
    fontWeight: '700', 
    color: '#64748b',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },
  
  saveBtn: { 
    flex: 2, 
    padding: '14px', 
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 10px 20px -8px rgba(79, 70, 229, 0.5)',
  },

  // Info items in modal
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '8px',
    border: '1px solid #e2e8f0'
  },
  infoLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '2px'
  },
  infoValue: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#0f172a'
  },

  // Loading State
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    background: '#f8fafc',
  },
  
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  loadingText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4f46e5',
  },
  modalFooter: {
    padding: '20px 32px',
    background: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderRadius: '0 0 32px 32px'
  },
  submitBtn: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 20px -8px rgba(0,0,0,0.2)'
  }
};

// Add global keyframes
const style = document.createElement('style');
style.textContent = `
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
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .metric-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px -10px rgba(79, 70, 229, 0.15);
    border-color: #cbd5e1;
  }
  
  .nav-btn:hover:not(.active) {
    background: rgba(79, 70, 229, 0.1) !important;
    color: #fff !important;
  }
  
  .logout-btn:hover {
    background: rgba(239, 68, 68, 0.2) !important;
    border-color: rgba(239, 68, 68, 0.3) !important;
  }
  
  .add-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px -8px rgba(79, 70, 229, 0.6);
  }
  
  .edit-btn:hover {
    background: #e0e7ff;
  }
  
  .delete-btn:hover {
    background: #fee2e2;
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

  .metric-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px -10px rgba(79, 70, 229, 0.15);
    border-color: #cbd5e1;
  }

  tr:hover {
    background: #f8fafc;
  }

  .add-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px -8px rgba(79, 70, 229, 0.6);
  }

  .save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 25px -8px rgba(79, 70, 229, 0.6);
  }

  .logout-btn:hover {
    background: rgba(239, 68, 68, 0.2) !important;
  }

  .nav-btn:hover:not(.active) {
    background: rgba(79, 70, 229, 0.1) !important;
  }
`;
document.head.appendChild(style);

export default SuperAdminDashboard;
