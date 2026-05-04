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
  IdentificationCard, Timer, Money
} from '@phosphor-icons/react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useToast } from '../../components/Toast';
import './hr.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HRDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Real Data states
  const [stats, setStats] = useState({ totalStaff: 0, activePresent: 0, leaveRequests: 0, openVacancies: 0 });
  const [employees, setEmployees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([85, 78, 92, 88, 95, 90]);
  
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 101, name: 'David Kim', days: 'Mar 20-22', type: 'Sick', status: 'Pending' }
  ]);
  const [jobPostings, setJobPostings] = useState([
    { id: 201, title: 'Senior Frontend Engineer', applicants: 12, status: 'Active' }
  ]);

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
      const token = sessionStorage.getItem('token');
      if (!token) {
        showToast('Session expired. Please login again.', 'error');
        onLogout();
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [statsRes, empRes, annRes, trendRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/hr/stats`, config),
        axios.get(`${API_BASE_URL}/api/hr/employees`, config),
        axios.get(`${API_BASE_URL}/api/hr/announcements`, config),
        axios.get(`${API_BASE_URL}/api/hr/attendance-trend`, config)
      ]);

      setStats(statsRes.data);
      setEmployees(empRes.data);
      setAnnouncements(annRes.data);
      setAttendanceTrend(trendRes.data);
    } catch (error) {
      console.error('Error fetching HR data:', error);
      showToast('Error connecting to institutional database', 'error');
    } finally {
      setLoading(false);
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
      {/* Sidebar */}
      <aside className={`hr-sidebar ${isMobile && !sidebarOpen ? 'closed' : ''} ${sidebarOpen ? 'open' : ''}`}>
        <div className="hr-logo-section">
          <div className="hr-logo-text">Lancers<span className="hr-logo-accent">Tech</span></div>
          <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600, marginTop: 4, letterSpacing: 1 }}>HR COMMAND CENTER</div>
        </div>
        
        <nav className="hr-nav">
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

        <div style={{ position: 'absolute', bottom: 30, width: '100%', padding: '0 1rem' }}>
          <button onClick={onLogout} className="hr-nav-item" style={{ width: '100%', border: 'none', background: 'transparent', color: '#fca5a5' }}>
            <SignOut size={20} /> <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`hr-main ${isMobile ? 'full-width' : ''}`}>
        <header className="hr-header">
          <div className="hr-header-left">
            {isMobile && <List size={24} weight="bold" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ cursor: 'pointer' }} />}
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>HR Command Center</h1>
          </div>
          
          <div className="hr-header-right">
            <Bell size={24} color="#64748b" />
            <div className="hr-user-pill">
              <UserCircle size={24} color="#4f46e5" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name || 'HR Admin'}</span>
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

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '2rem' }}>
                <div className="hr-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 800 }}>Personnel Overview</h3>
                    <button style={{ border: 'none', background: '#eef2ff', color: '#4f46e5', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700 }}>View All</button>
                  </div>
                  <div className="hr-table-container">
                    <table className="hr-table">
                      <thead>
                        <tr><th>Name</th><th>Role</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {employees.map((emp, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 700 }}>{emp.name}</td>
                            <td>{emp.dept}</td>
                            <td><span className={`hr-badge ${emp.status === 'active' ? 'hr-badge-active' : 'hr-badge-leave'}`}>{emp.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="hr-card">
                   <h3 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Announcements</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {announcements.map((ann, i) => (
                        <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>{ann.type}</span>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{ann.date}</span>
                           </div>
                           <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 4 }}>{ann.title}</h4>
                           <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{ann.msg}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
