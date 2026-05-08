import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { 
  Users, CheckCircle, Calendar, Briefcase, 
  UserPlus, Megaphone, Check, X, Pencil, Trash,
  List, Bell, ChartLineUp, EnvelopeSimple, Plus,
  ArrowRight, UserCircle, SignOut, ShieldCheck,
  IdentificationCard, Timer, Money, ChatCircle
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [stats, setStats] = useState({ totalStaff: 0, activePresent: 0, leaveRequests: 0, openVacancies: 0 });
  const [employees, setEmployees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'employee', 'job'
  const [editingItem, setEditingItem] = useState(null);

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
    <div className="hr-container">
      {/* Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div className="hr-sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`hr-sidebar ${isMobile && !sidebarOpen ? 'closed' : ''} ${sidebarOpen ? 'open' : ''}`}>
        <div className="hr-logo-section">
          <div className="hr-logo-text">Lancers<span className="hr-logo-accent">Tech</span></div>
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

        <div style={{ padding: '0 1.2rem', marginBottom: 30 }}>
          <button onClick={onLogout} className="hr-nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: '#ef4444' }}>
            <SignOut size={20} /> <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`hr-main ${isMobile ? 'full-width' : ''}`}>
        <header className="hr-header">
          <div className="hr-header-left">
            {isMobile && <List size={28} weight="bold" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer', color: 'var(--hr-primary)' }} />}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hr-text-main)' }}>Institutional HR</h1>
          </div>
          
          <div className="hr-header-right">
            <Bell size={24} color="var(--hr-text-muted)" />
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? '1rem' : '2rem' }}>
                <div className="hr-card" style={{ padding: isMobile ? '1rem' : '1.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: isMobile ? '1rem' : '1.2rem' }}>Personnel Overview</h3>
                    <button onClick={() => setActiveTab('employees')} style={{ border: 'none', background: '#eef2ff', color: '#4f46e5', padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700 }}>View All</button>
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
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>{ann.type}</span>
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
                <button onClick={() => { setEditingItem(null); setModalType('employee'); setShowModal(true); }} className="hr-nav-item active" style={{ padding: '8px 20px', borderRadius: 12, fontSize: '0.9rem' }}><Plus size={18} weight="bold" /> Add Employee</button>
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
                            <Pencil size={18} color="#4f46e5" style={{ cursor: 'pointer' }} onClick={() => { setEditingItem(emp); setModalType('employee'); setShowModal(true); }} />
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
              <h2 style={{ fontWeight: 800, marginBottom: '2rem' }}>Attendance & Leave Requests</h2>
              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr><th>Employee</th><th>Leave Period</th><th>Type</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {leaveRequests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontWeight: 700 }}>{req.name}</td>
                        <td>{req.days}</td>
                        <td>{req.type}</td>
                        <td><span className="hr-badge hr-badge-leave">{req.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <Check size={18} color="#10b981" weight="bold" style={{ cursor: 'pointer' }} />
                            <X size={18} color="#ef4444" weight="bold" style={{ cursor: 'pointer' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {leaveRequests.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No pending leave requests</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="hr-card">
              <h2 style={{ fontWeight: 800, marginBottom: '2rem' }}>Payroll Disbursement</h2>
              <div className="hr-table-container">
                <table className="hr-table">
                  <thead>
                    <tr><th>Employee</th><th>Department</th><th>Salary</th><th>Month</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{emp.name}</td>
                        <td>{emp.department || 'N/A'}</td>
                        <td style={{ fontWeight: 800 }}>₹{(45000 + (i * 2000)).toLocaleString()}</td>
                        <td>May 2024</td>
                        <td><span className="hr-badge hr-badge-active">Paid</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'recruitment' && (
            <div className="hr-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 800 }}>Job Postings & Recruitment</h2>
                <button onClick={() => { setEditingItem(null); setModalType('job'); setShowModal(true); }} className="hr-nav-item active" style={{ padding: '8px 20px', borderRadius: 12, fontSize: '0.9rem' }}><Megaphone size={18} weight="bold" /> New Vacancy</button>
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
                            <ArrowRight size={18} color="#4f46e5" style={{ cursor: 'pointer' }} />
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
