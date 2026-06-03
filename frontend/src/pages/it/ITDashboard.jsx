import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Users, 
  Ticket, 
  Gear, 
  ShieldCheck, 
  Database, 
  Bell, 
  List, 
  X,
  SignOut,
  ChartBar,
  HardDrive,
  ChatCircle
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useToast } from '../../components/Toast';
import './it.css';

import { BulkImportModal, NewTicketModal, DeleteConfirmModal, EditUserModal } from './ITModals';
import ITOverview from './sections/ITOverview';
import UserAccess from './sections/UserAccess';
import ITTickets from './sections/ITTickets';
import SystemConfig from './sections/SystemConfig';
import AuditLogs from './sections/AuditLogs';
import ITInfrastructure from './sections/ITInfrastructure';
import ITSecurity from './sections/ITSecurity';

const ITDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, activeTickets: 0, systemHealth: 100, serverUptime: '0d' });
  const [tickets, setTickets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({});
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleBulkImport = async (users) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/it/users/bulk`, { users }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setShowBulkImport(false);
        fetchAllData();
      }
    } catch (err) { showToast('Error importing users', 'error'); }
  };

  const handleCreateTicket = async (data) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/it/tickets`, { ...data, user_id: user.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Ticket created successfully!', 'success');
        setShowNewTicket(false);
        fetchAllData();
      }
    } catch (err) { showToast('Error creating ticket', 'error'); }
  };

  const handleEditUser = async (data) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/it/users/${selectedMember.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('User updated successfully!', 'success');
      setShowEditUser(false);
      fetchAllData();
    } catch (err) { showToast('Error updating user', 'error'); }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, ticketsRes, logsRes, configRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/it/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/it/tickets`, { headers }),
        axios.get(`${API_BASE_URL}/api/it/logs`, { headers }),
        axios.get(`${API_BASE_URL}/api/it/config`, { headers })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (ticketsRes.data.success) setTickets(ticketsRes.data.tickets || []);
      if (logsRes.data.success) setLogs(logsRes.data.logs || []);
      if (configRes.data.success) setConfig(configRes.data.config || {});

    } catch (err) {
      console.error('Error fetching IT data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (newConfig) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/it/config`, { config: newConfig }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('System configuration updated!', 'success');
      fetchAllData();
    } catch (err) { showToast('Error updating configuration', 'error'); }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <ChartBar size={22} weight="bold" /> },
    { id: 'users', label: 'User Access', icon: <Users size={22} weight="bold" /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <HardDrive size={22} weight="bold" /> },
    { id: 'security', label: 'Security & Backup', icon: <ShieldCheck size={22} weight="bold" /> },
    { id: 'tickets', label: 'Helpdesk', icon: <Ticket size={22} weight="bold" /> },
    { id: 'config', label: 'Platform Settings', icon: <Gear size={22} weight="bold" /> },
    { id: 'logs', label: 'Audit Logs', icon: <Database size={22} weight="bold" /> },
  ];

  return (
    <div className="it-dashboard-container">
      {/* Sidebar */}
      <aside className={`it-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="it-sidebar-header">
          <div className="it-logo-area">
            {user?.logo_url ? (
              <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <>
                <div className="it-logo-icon">
                  <Cpu size={24} weight="bold" color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>IT Nexus</h2>
                  <p style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 700 }}>SYSTEM ADMINISTRATION</p>
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="it-nav-links">
          <div 
            className="it-nav-item"
            onClick={() => { navigate('/chat'); setSidebarOpen(false); }}
          >
            <ChatCircle size={22} weight="bold" />
            <span>Chat</span>
          </div>
          {navItems.map(item => (
            <div 
              key={item.id}
              className={`it-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="it-nav-links" style={{ marginTop: 'auto', marginBottom: '24px' }}>
          <div className="it-nav-item" onClick={onLogout} style={{ color: '#f87171' }}>
            <SignOut size={22} weight="bold" />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="it-main-content">
        <header className="it-header">
          <div className="it-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <List size={24} />
              </button>
              <h1>{navItems.find(n => n.id === activeTab)?.label}</h1>
            </div>
            <p style={{ color: 'var(--it-text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
              System Status: <span style={{ color: 'var(--it-success)', fontWeight: 700 }}>Operational</span>
            </p>
          </div>

          <div className="it-header-right" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="it-search" style={{ position: 'relative' }}>
              <Bell size={24} color="var(--it-text-muted)" style={{ cursor: 'pointer' }} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'red', borderRadius: '50%' }}></div>
            </div>
            <div className="user-profile-it" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '6px 16px', borderRadius: 100, border: '1px solid var(--it-border)' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'IT Admin'}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--it-text-muted)' }}>Super User</p>
              </div>
              <div style={{ width: 36, height: 36, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
                <Users size={20} weight="bold" color="#64748b" style={{ margin: '0 auto' }} />
              </div>
            </div>
          </div>
        </header>

        <div className="it-content-wrapper">
          {activeTab === 'overview' && <ITOverview stats={stats} logs={logs} />}
          {activeTab === 'users' && <UserAccess onBulkImport={() => setShowBulkImport(true)} onRefresh={fetchAllData} onEdit={(user) => { setSelectedMember(user); setShowEditUser(true); }} />}
          {activeTab === 'tickets' && <ITTickets tickets={tickets} onRefresh={fetchAllData} onAdd={() => setShowNewTicket(true)} />}
          {activeTab === 'config' && <SystemConfig config={config} onSave={handleUpdateConfig} />}
          {activeTab === 'logs' && <AuditLogs logs={logs} />}
          {activeTab === 'infrastructure' && <ITInfrastructure />}
          {activeTab === 'security' && <ITSecurity />}
        </div>

        {showBulkImport && <BulkImportModal onClose={() => setShowBulkImport(false)} onSave={handleBulkImport} />}
        {showNewTicket && <NewTicketModal onClose={() => setShowNewTicket(false)} onSave={handleCreateTicket} />}
        {showEditUser && <EditUserModal onClose={() => setShowEditUser(false)} user={selectedMember} onSave={handleEditUser} />}
      </main>
    </div>
  );
};

export default ITDashboard;
