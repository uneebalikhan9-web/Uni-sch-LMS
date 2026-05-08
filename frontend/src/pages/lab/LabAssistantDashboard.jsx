import React, { useState, useEffect } from 'react';
import { 
  Flask, Calendar, Users, ClipboardText, MagnifyingGlass, 
  Warning, ChartBar, HardDrive, House, Package, ShieldCheck,
  ChatCircle
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useToast } from '../../components/Toast';
import LabInventory from './sections/LabInventory';
import LabSafety from './sections/LabSafety';
import './lab.css';

const LabAssistantDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [usage, setUsage] = useState([]);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usageRes, labsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/labs/usage/all`, { headers }),
        axios.get(`${API_BASE_URL}/api/labs`, { headers })
      ]);

      if (usageRes.data.success) setUsage(usageRes.data.usage);
      if (labsRes.data.success) setLabs(labsRes.data.labs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab-container">
      {/* Sidebar */}
      <aside className="lab-sidebar">
        <div className="lab-logo-area">
          <div className="lab-logo">LT</div>
          <div className="lab-logo-text">
            <span className="brand">Lancers Tech</span>
            <span className="portal">LAB COMMAND</span>
          </div>
        </div>

        <nav className="lab-nav">
          <NavItem active={false} onClick={() => navigate('/chat')} icon={<ChatCircle size={20} weight="bold" />} label="Chat" />
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<House size={20} weight="bold" />} label="Dashboard" />
          <NavItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={20} weight="bold" />} label="Lab Inventory" />
          <NavItem active={activeTab === 'usage'} onClick={() => setActiveTab('usage')} icon={<ClipboardText size={20} weight="bold" />} label="Usage Reports" />
          <NavItem active={activeTab === 'safety'} onClick={() => setActiveTab('safety')} icon={<ShieldCheck size={20} weight="bold" />} label="Safety & Compliance" />
        </nav>

        <div className="lab-sidebar-footer">
          <button onClick={onLogout} className="lab-logout-btn">
            <SignOut size={20} weight="bold" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lab-main">
        <header className="lab-header">
          <div className="header-left">
            <h1>Scientific Operations</h1>
            <p>Managing {labs.length} Active Laboratories</p>
          </div>

          <div className="header-right">
            <div className="search-bar">
              <MagnifyingGlass size={18} weight="bold" />
              <input type="text" placeholder="Search resources..." />
            </div>
            <div className="icon-actions">
              <div className="icon-badge"><Bell size={22} weight="bold" /></div>
              <div className="user-profile">
                <UserCircle size={32} weight="bold" color="var(--lab-primary)" />
                <div className="user-info">
                  <span className="user-name">{user?.name || 'Lab Incharge'}</span>
                  <span className="user-role">Lab Assistant</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="lab-content">
          <div className="lab-stats-grid">
            <StatCard icon={<Users size={28} weight="duotone" />} value={usage.length} label="Daily Sessions" color="#4f46e5" />
            <StatCard icon={<Clock size={28} weight="duotone" />} value="84%" label="Avg. Utilization" color="#10b981" />
            <StatCard icon={<HardDrive size={28} weight="duotone" />} value={labs.length} label="Active Nodes" color="#f59e0b" />
            <StatCard icon={<CheckCircle size={28} weight="duotone" />} value="100%" label="Compliance" color="#6366f1" />
          </div>

          {activeTab === 'overview' && (
            <div className="lab-grid">
              <div className="lab-card" style={{ gridColumn: 'span 2' }}>
                <div className="card-header">
                  <h3>Recent Laboratory Activity</h3>
                  <button className="lab-btn-sm">View All</button>
                </div>
                <div className="lab-table-container">
                  <table className="lab-table">
                    <thead>
                      <tr><th>Student</th><th>Lab Name</th><th>Time Spent</th><th>Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {usage.slice(0, 8).map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="student-cell">
                              <div className="avatar">{u.student_name.charAt(0)}</div>
                              <div>
                                <p className="name">{u.student_name}</p>
                                <p className="roll">{u.roll_number}</p>
                              </div>
                            </div>
                          </td>
                          <td><span className="lab-name-tag">{u.lab_name}</span></td>
                          <td>{u.time_spent} mins</td>
                          <td>{new Date(u.date).toLocaleDateString()}</td>
                          <td><span className="status-dot online">Active</span></td>
                        </tr>
                      ))}
                      {usage.length === 0 && (
                          <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No recent lab sessions logged.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lab-card">
                <div className="card-header">
                  <h3>Maintenance Status</h3>
                </div>
                <div className="maintenance-list">
                  <MaintenanceItem label="Chemistry Lab 01" status="Ready" progress={100} color="#10b981" />
                  <MaintenanceItem label="Physics Optics Lab" status="In Progress" progress={45} color="#f59e0b" />
                  <MaintenanceItem label="Bio-Tech Research" status="Ready" progress={100} color="#10b981" />
                  <MaintenanceItem label="Computer Science Lab 3" status="Scheduled" progress={0} color="#64748b" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && <LabInventory />}
          {activeTab === 'safety' && <LabSafety />}

          {(activeTab !== 'overview' && activeTab !== 'inventory' && activeTab !== 'safety') && (
              <div className="lab-card" style={{ textAlign: 'center', padding: '100px 40px' }}>
                  <Flask size={64} weight="duotone" color="var(--lab-primary)" style={{ marginBottom: 20 }} />
                  <h2>Laboratory Operations</h2>
                  <p style={{ color: '#64748b', maxWidth: 400, margin: '12px auto' }}>This specialized scientific module is currently being calibrated for department-specific workflows.</p>
              </div>
          )}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }) => (
  <div onClick={onClick} className={`lab-nav-item ${active ? 'active' : ''}`}>
    {icon}
    <span>{label}</span>
  </div>
);

const StatCard = ({ icon, value, label, color }) => (
  <div className="lab-stat-card">
    <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>{icon}</div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

const MaintenanceItem = ({ label, status, progress, color }) => (
  <div className="maintenance-item">
    <div className="m-info">
      <span className="m-label">{label}</span>
      <span className="m-status" style={{ color }}>{status}</span>
    </div>
    <div className="progress-bg">
      <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: color }}></div>
    </div>
  </div>
);

export default LabAssistantDashboard;
