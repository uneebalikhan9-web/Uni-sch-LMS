import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { 
  Users, CheckCircle, Calendar, Briefcase, 
  UserPlus, Megaphone, Check, X, Pencil, Trash,
  List, Bell, ChartLineUp, EnvelopeSimple, Plus,
  ArrowRight, UserCircle, SignOut, ShieldCheck,
  IdentificationCard, Timer, Money, ChatCircle,
  Eye, ClockCounterClockwise
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useToast } from '../../components/Toast';
import './hr.css';
import HRModals from './HRModals';

const HRDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [stats, setStats] = useState({ totalStaff: 0, activePresent: 0, leaveRequests: 0, openVacancies: 0 });
  const [employees, setEmployees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [payrollData, setPayrollData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'employee', 'job', 'leaveDetails'
  const [editingItem, setEditingItem] = useState(null);
  const [viewLeaveHistory, setViewLeaveHistory] = useState(false);

  const token = sessionStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchDashboardData();
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (chartRef.current && activeTab === 'dashboard' && attendanceTrend.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();
      const rootStyle = getComputedStyle(document.documentElement);
      const primaryRgb = rootStyle.getPropertyValue('--primary-rgb').trim() || '79, 70, 229';

      const ctx = chartRef.current.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 300);
      grad.addColorStop(0, `rgba(${primaryRgb}, 0.85)`);
      grad.addColorStop(1, 'rgba(129, 140, 248, 0.15)');

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'],
          datasets: [{
            label: 'Attendance %',
            data: attendanceTrend,
            backgroundColor: grad,
            borderRadius: 12,
            borderWidth: 0,
            barPercentage: 0.5,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#cbd5e1' }
          },
          scales: {
            y: {
              min: 50,
              max: 100,
              grid: { color: 'rgba(241, 245, 249, 0.8)' },
              ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: 600 } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: 600 } }
            }
          }
        }
      });
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [activeTab, attendanceTrend]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, empRes, annRes, trendRes, leaveRes, jobRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/hr/stats`, config),
        axios.get(`${API_BASE_URL}/api/hr/employees`, config),
        axios.get(`${API_BASE_URL}/api/hr/announcements`, config),
        axios.get(`${API_BASE_URL}/api/hr/attendance-trend`, config),
        axios.get(`${API_BASE_URL}/api/hr/leave-requests`, config),
        axios.get(`${API_BASE_URL}/api/hr/jobs`, config)
      ]);

      setStats(statsRes.data);
      setEmployees(empRes.data);
      setAnnouncements(annRes.data);
      setAttendanceTrend(trendRes.data);
      setLeaveRequests(leaveRes.data);
      setJobPostings(jobRes.data);

      // Fetch real payroll data from Finance
      try {
        const payrollRes = await axios.get(`${API_BASE_URL}/api/finance/payroll`, config);
        setPayrollData(payrollRes.data.payroll || []);
      } catch (e) {
        setPayrollData([]);
      }
    } catch (error) {
      showToast('Error connecting to institutional database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (method, url, body) => {
    try {
      const res = await axios({
        method,
        url: `${API_BASE_URL}/api/hr${url}`,
        headers: config.headers,
        data: body
      });
      if (res.data.success) {
        showToast(res.data.message || 'Action successful', 'success');
        fetchDashboardData();
        return true;
      } else {
        showToast(res.data.message || 'Action failed', 'error');
        return false;
      }
    } catch (e) {
      showToast('Action failed. Check server connection.', 'error');
      return false;
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      await handleAction('DELETE', `/${type === 'employee' ? 'employees' : 'jobs'}/${id}`);
    }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/hr/leave-requests/${id}/status`, { status }, config);
      if (res.data.success) {
        showToast(`Leave request successfully ${status.toLowerCase()}!`, 'success');
        fetchDashboardData();
      } else {
        showToast(res.data.message || 'Action failed', 'error');
      }
    } catch (err) {
      showToast('Failed to update leave request status', 'error');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <ChartLineUp size={20} /> },
    { id: 'employees', label: 'Personnel', icon: <Users size={20} /> },
    { id: 'leave', label: 'Attendance', icon: <Timer size={20} /> },
    { id: 'payroll', label: 'Payroll', icon: <Money size={20} /> },
    { id: 'recruitment', label: 'Recruitment', icon: <Megaphone size={20} /> }
  ];

  const MetricCard = ({ icon, value, label }) => (
    <div className="hr-card">
      <div className="hr-metric-icon-box">{icon}</div>
      <div className="hr-metric-value">{value}</div>
      <div className="hr-metric-label">{label}</div>
    </div>
  );

  return (
    <div 
      className="hr-container dashboard-wrapper"
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: '100vh',
        position: 'relative',
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      {/* Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Floating open button for LEFT sidebar — only visible when left sidebar is CLOSED */}
      {!isMobile && !leftSidebarOpen && (
        <button
          onClick={() => setLeftSidebarOpen(true)}
          style={{
            position: 'fixed',
            left: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2000,
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

      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#e2e8f0',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        left: 0,
        top: 0,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : (leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'),
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',
        padding: 0,
      }} className={`sidebar hr-sidebar ${isMobile && !sidebarOpen ? 'closed' : ''} ${sidebarOpen ? 'open mobile-open' : ''} ${leftSidebarOpen ? '' : 'collapsed'}`}>
        
        {/* ← Close arrow centered on RIGHT edge of the left sidebar */}
        {!isMobile && (
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
          <div className="hr-logo-section">
            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <div className="hr-logo-text">Lancers<span className="hr-logo-accent">Tech</span></div>
            )}
            <div style={{ color: 'var(--hr-text-muted)', fontSize: 11, fontWeight: 700, marginTop: 4, letterSpacing: 1 }}>HR COMMAND CENTER</div>
          </div>
          
          <nav className="hr-nav">
            <div 
              onClick={() => { navigate('/chat'); if (isMobile) setSidebarOpen(false); }} 
              className="hr-nav-item"
            >
              <ChatCircle size={20} /> <span>Chat</span>
            </div>
            {navItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => { setActiveTab(item.id); if (isMobile) setSidebarOpen(false); }} 
                className={`hr-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.icon} <span>{item.label}</span>
              </div>
            ))}
          </nav>

          <div style={{ padding: '0 1.2rem', marginBottom: 30, marginTop: 'auto' }}>
            <button onClick={onLogout} className="hr-nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: '#ef4444', padding: '14px 18px' }}>
              <SignOut size={20} /> <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main style={{
        flex: 1,
        marginLeft: isMobile ? '0' : (leftSidebarOpen ? '304px' : '24px'),
        marginRight: isMobile ? '0' : (rightPanelOpen ? '344px' : '24px'),
        transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1), margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: 0,
        boxSizing: 'border-box',
        padding: isMobile ? '16px' : '32px',
      }} className="hr-main">
        <header className="hr-header">
          <div className="hr-header-left">
            {isMobile && <List size={28} weight="bold" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer', color: 'var(--hr-primary)' }} />}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hr-text-main)' }}>Institutional HR</h1>
          </div>
          
          <div className="hr-header-right">
            <Bell size={24} color="var(--hr-text-muted)" style={{ cursor: 'pointer' }} />
            <div className="hr-user-pill">
              <UserCircle size={24} color="var(--hr-text-muted)" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--hr-text-main)' }}>{user?.name || 'HR Admin'}</span>
            </div>
          </div>
        </header>

        <div className="hr-content">
          {activeTab === 'dashboard' && (
            <>
              <div className="hr-metrics-grid">
                <MetricCard icon={<Users size={28} weight="duotone" />} value={stats.totalStaff} label="Total Staff" />
                <MetricCard icon={<CheckCircle size={28} weight="duotone" />} value={stats.activePresent} label="Active Present" />
                <MetricCard icon={<Calendar size={28} weight="duotone" />} value={stats.leaveRequests} label="Leave Requests" />
                <MetricCard icon={<Briefcase size={28} weight="duotone" />} value={stats.openVacancies} label="Open Vacancies" />
              </div>

              {/* Attendance & Trend Analytics Section */}
              <div className="hr-card animate-fadeIn" style={{ padding: '1.8rem', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ChartLineUp size={22} color="var(--primary-color, #4f46e5)" /> Daily Attendance Analytics & Trend
                </h3>
                <div style={{ height: '280px', position: 'relative' }}>
                  <canvas ref={chartRef} key={`${leftSidebarOpen}-${rightPanelOpen}`} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? '1rem' : '2rem' }}>
                <div className="hr-card" style={{ padding: isMobile ? '1rem' : '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: isMobile ? '1rem' : '1.2rem' }}>Personnel Overview</h3>
                    <button onClick={() => setActiveTab('employees')} style={{ border: 'none', background: '#eef2ff', color: 'var(--primary-color, #4f46e5)', padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>View All</button>
                  </div>
                  <div className="hr-table-container">
                    <table className="hr-table">
                      <thead>
                        <tr><th>Name</th><th>Role</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {employees.slice(0, 5).map((emp, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 700 }}>{emp.name}</td>
                            <td>{emp.department || 'N/A'}</td>
                            <td><span className={`hr-badge ${emp.status === 'active' ? 'hr-badge-active' : 'hr-badge-leave'}`}>{emp.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="hr-card" style={{ padding: isMobile ? '1rem' : '1.8rem' }}>
                   <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: isMobile ? '1rem' : '1.2rem' }}>Announcements</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {announcements.length > 0 ? announcements.map((ann, i) => (
                        <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary-color, #4f46e5)', textTransform: 'uppercase' }}>{ann.type}</span>
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{ann.date}</span>
                           </div>
                           <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>{ann.title}</h4>
                           <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>{ann.msg}</p>
                        </div>
                      )) : <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No recent announcements</p>}
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'employees' && (
            <div className="hr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 800 }}>Employee Management</h2>
                <button 
                  onClick={() => { setEditingItem(null); setModalType('employee'); setShowModal(true); }} 
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #6366f1 100%)',
                    color: '#fff',
                    padding: '10px 24px',
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
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(var(--primary-rgb, 79, 70, 229), 0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(var(--primary-rgb, 79, 70, 229), 0.4)'; }}
                >
                  <Plus size={18} weight="bold" /> Add Employee
                </button>
              </div>
              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{emp.name}</td>
                        <td>{emp.department || 'N/A'}</td>
                        <td>{emp.designation || 'Staff'}</td>
                        <td><span className={`hr-badge ${emp.status === 'active' ? 'hr-badge-active' : 'hr-badge-leave'}`}>{emp.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <Pencil size={18} color="var(--primary-color, #4f46e5)" style={{ cursor: 'pointer' }} onClick={() => { setEditingItem(emp); setModalType('employee'); setShowModal(true); }} />
                            <Trash size={18} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => handleDelete(emp.id, 'employee')} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="hr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 800 }}>Attendance & Leave Requests</h2>
                <button 
                  onClick={() => setViewLeaveHistory(!viewLeaveHistory)} 
                  style={{ 
                    background: viewLeaveHistory ? '#f1f5f9' : 'linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #6366f1 100%)',
                    color: viewLeaveHistory ? '#475569' : '#fff',
                    padding: '10px 24px',
                    borderRadius: '14px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: viewLeaveHistory ? 'none' : '0 8px 20px -6px rgba(var(--primary-rgb, 79, 70, 229), 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {viewLeaveHistory ? (
                    <><Timer size={18} weight="bold" /> View Pending</>
                  ) : (
                    <><ClockCounterClockwise size={18} weight="bold" /> View History</>
                  )}
                </button>
              </div>

              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr><th>Employee</th><th>Leave Period</th><th>Type</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {leaveRequests
                      .filter(req => viewLeaveHistory ? req.status !== 'Pending' : req.status === 'Pending')
                      .map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 700 }}>{req.name}</td>
                        <td>{req.days}</td>
                        <td>{req.type}</td>
                        <td>
                          <span className={`hr-badge ${req.status === 'Approved' ? 'hr-badge-active' : 'hr-badge-leave'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <Eye size={18} color="var(--primary-color, #4f46e5)" weight="bold" style={{ cursor: 'pointer' }} onClick={() => { setEditingItem(req); setModalType('leaveDetails'); setShowModal(true); }} />
                            {!viewLeaveHistory && (
                              <>
                                <Check size={18} color="#10b981" weight="bold" style={{ cursor: 'pointer' }} onClick={() => handleLeaveAction(req.id, 'Approved')} />
                                <X size={18} color="#ef4444" weight="bold" style={{ cursor: 'pointer' }} onClick={() => handleLeaveAction(req.id, 'Rejected')} />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {leaveRequests.filter(req => viewLeaveHistory ? req.status !== 'Pending' : req.status === 'Pending').length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        {viewLeaveHistory ? 'No leave history available.' : 'No pending leave requests.'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="hr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontWeight: 800, margin: 0 }}>Payroll Disbursement</h2>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0', fontWeight: 500 }}>Managed by Finance Department — read-only view</p>
                </div>
              </div>
              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr><th>Employee</th><th>Designation</th><th>Basic Salary</th><th>Net Payable</th><th>Month/Year</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {payrollData.length > 0 ? payrollData.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{p.employee_name || 'N/A'}</td>
                        <td>{p.designation || 'Staff'}</td>
                        <td style={{ fontWeight: 800 }}>Rs. {(p.basic_salary || 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 800, color: '#10b981' }}>Rs. {(p.net_payable || 0).toLocaleString()}</td>
                        <td>{p.month || '-'} {p.year || ''}</td>
                        <td>
                          <span className={`hr-badge ${p.status === 'disbursed' ? 'hr-badge-active' : 'hr-badge-leave'}`}>
                            {p.status === 'disbursed' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💼</div>
                          <div style={{ fontWeight: 700, marginBottom: '4px' }}>No Payroll Records Yet</div>
                          <div style={{ fontSize: '0.8rem' }}>Finance Manager adds salary records from the Finance Portal.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'recruitment' && (
            <div className="hr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 800 }}>Job Postings & Recruitment</h2>
                <button 
                  onClick={() => { setEditingItem(null); setModalType('job'); setShowModal(true); }} 
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #6366f1 100%)',
                    color: '#fff',
                    padding: '10px 24px',
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
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(var(--primary-rgb, 79, 70, 229), 0.5)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(var(--primary-rgb, 79, 70, 229), 0.4)'; }}
                >
                  <Megaphone size={18} weight="bold" /> New Vacancy
                </button>
              </div>
              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr><th>Job Title</th><th>Applicants</th><th>Date Posted</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {jobPostings.map((job) => (
                      <tr key={job.id}>
                        <td style={{ fontWeight: 700 }}>{job.title}</td>
                        <td style={{ fontWeight: 800 }}>{job.applicants || 0} Applied</td>
                        <td>{new Date(job.created_at || Date.now()).toLocaleDateString()}</td>
                        <td><span className="hr-badge hr-badge-active">{job.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <ArrowRight size={18} color="var(--primary-color, #4f46e5)" style={{ cursor: 'pointer' }} />
                            <Trash size={18} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => handleDelete(job.id, 'job')} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {jobPostings.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No active job postings</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating open button for RIGHT panel — only visible when right panel is CLOSED */}
      {!isMobile && !rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          style={{
            position: 'fixed',
            right: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2000,
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
        width: isMobile ? '100%' : '320px',
        background: '#fff',
        borderLeft: isMobile ? 'none' : '1px solid #e2e8f0',
        borderTop: isMobile ? '1px solid #e2e8f0' : 'none',
        position: isMobile ? 'relative' : 'fixed',
        right: 0,
        top: 0,
        height: isMobile ? 'auto' : '100vh',
        zIndex: 10,
        boxShadow: isMobile ? 'none' : '-10px 0 30px -10px rgba(0, 0, 0, 0.05)',
        transform: isMobile ? 'none' : (rightPanelOpen ? 'translateX(0)' : 'translateX(100%)'),
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',
        padding: 0,
      }} className={`right-panel ${isMobile ? '' : (rightPanelOpen ? '' : 'collapsed')}`}>

        {/* ← Close arrow centered on LEFT edge of the right panel */}
        {!isMobile && (
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
        )}

        {/* Inner Scrollable Container Wrapper */}
        <div style={{
          width: '100%',
          height: isMobile ? 'auto' : '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? '24px 16px' : '32px 24px',
          overflowY: isMobile ? 'visible' : 'auto',
          boxSizing: 'border-box',
        }} className="hidden-scrollbar">
          
          {/* HR Admin Profile Card */}
          <div style={{
            textAlign: 'center',
            padding: '28px',
            background: '#f8fafc',
            borderRadius: '32px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #818cf8 100%)',
              color: '#fff',
              borderRadius: '28px',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '800',
              boxShadow: '0 15px 25px -10px rgba(var(--primary-rgb, 79, 70, 229), 0.4)',
            }}>{user?.name ? user.name.charAt(0).toUpperCase() : 'H'}</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{user?.name || 'HR Manager'}</h3>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: '#eef2ff',
              color: 'var(--primary-color, #4f46e5)',
              borderRadius: '30px',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>HR COMMAND CENTER</span>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Active Present</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981' }}>{stats.activePresent || 0}</span>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0' }}></div>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Staff Strength</span>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-color, #4f46e5)' }}>{stats.totalStaff || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="var(--primary-color, #4f46e5)" /> Quick Insights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Hiring Velocity</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary-color, #4f46e5)' }}>High</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Leave Rate</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#eab308' }}>Low</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>System Status</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10b981' }}>Optimal</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div style={{
            background: '#fff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            padding: '24px',
          }}>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Timer size={20} color="var(--primary-color, #4f46e5)" /> HR Actions Log
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {employees.slice(0, 3).map((emp, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', borderBottom: idx < 2 ? '1px solid #f1f5f9' : 'none', paddingBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color, #4f46e5)', marginTop: '6px' }}></div>
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>{emp.name} is Active</p>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Designation: {emp.designation || 'Staff'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </aside>

      <HRModals 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        type={modalType} 
        editingItem={editingItem}
        onAction={handleAction}
      />
    </div>
  );
};

export default HRDashboard;
