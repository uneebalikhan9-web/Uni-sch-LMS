import React, { useState, useEffect } from 'react';
import { 
  ChartPie, CreditCard, Users, Buildings, 
  FileText, SignOut, List, CalendarBlank, 
  Download, Plus, ChatCircle, Wrench, GraduationCap
} from "@phosphor-icons/react";
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import API_BASE_URL from '../../config/api';
import './finance.css';

// Section Imports
import FinOverview from './sections/FinOverview';
import FinFees from './sections/FinFees';
import FinPayroll from './sections/FinPayroll';
import FinExpenses from './sections/FinExpenses';
import FinReports from './sections/FinReports';
import FinModals from './sections/FinModals';
import FinFeeStructures from './sections/FinFeeStructures';
import FinScholarships from './sections/FinScholarships';

const NavItem = ({ active, icon, label, count, onClick }) => (
  <button 
    onClick={onClick} 
    className={`fin-nav-btn ${active ? 'active' : ''}`}
  >
    {icon}
    <span>{label}</span>
    {count > 0 && <span className="fin-nav-badge">{count}</span>}
    {active && <div className="fin-active-indicator"></div>}
  </button>
);

const FinanceDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [trend, setTrend] = useState({ revenue: [], expenses: [] });
  const [challans, setChallans] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [students, setStudents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'challan', 'payroll', 'expense'
  const [editingItem, setEditingItem] = useState(null);
  
  const { showToast } = useToast();
  const token = sessionStorage.getItem('token');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchAllData();
    const handleResize = () => {
      const mobile = window.innerWidth < 1100;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, pRes, eRes, stdRes, empRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/finance/overview`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/challans`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/payroll`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/expenses`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/students-list`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/employees-list`, { headers }).then(r => r.json()),
      ]);

      if (sRes.success) {
        setStats(sRes.stats);
        if (sRes.trend) setTrend(sRes.trend);
      }
      if (cRes.success) setChallans(cRes.challans);
      if (pRes.success) setPayroll(pRes.payroll);
      if (eRes.success) setExpenses(eRes.expenses);
      if (stdRes.success) setStudents(stdRes.students);
      if (empRes.success) setEmployees(empRes.employees);
      
    } catch (error) {
      showToast('Error fetching finance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (method, url, body) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance${url}`, {
        method,
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Action successful', 'success');
        fetchAllData();
        return true;
      } else {
        showToast(data.message || 'Action failed', 'error');
        return false;
      }
    } catch (e) {
      showToast('Network error', 'error');
      return false;
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading Financial Data..." />;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <FinOverview stats={stats} challans={challans} expenses={expenses} trend={trend} setActiveTab={setActiveTab} />;
      case 'fees': return <FinFees challans={challans} onAction={handleAction} onEdit={(item) => { setEditingItem(item); setModalType('challan'); setShowModal(true); }} />;
      case 'payroll': return <FinPayroll payroll={payroll} onAction={handleAction} onEdit={(item) => { setEditingItem(item); setModalType('payroll'); setShowModal(true); }} />;
      case 'expenses': return <FinExpenses expenses={expenses} onAction={handleAction} onEdit={(item) => { setEditingItem(item); setModalType('expense'); setShowModal(true); }} />;
      case 'fee-structures': return <FinFeeStructures />;
      case 'scholarships': return <FinScholarships students={students} />;
      case 'reports': return <FinReports stats={stats} challans={challans} payroll={payroll} expenses={expenses} />;
      default: return <FinOverview stats={stats} trend={trend} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="finance-dashboard">
      <div className="fin-orb fin-orb-1"></div>
      <div className="fin-orb fin-orb-2"></div>

      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="fin-mobile-toggle">
        <List size={24} weight="bold" />
      </button>

      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
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
            background: 'var(--fin-primary)',
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

      <aside 
        style={{
          transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : (leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'),
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={`sidebar fin-sidebar ${mobileMenuOpen ? 'open mobile-open' : ''} ${leftSidebarOpen ? '' : 'collapsed'}`}
      >
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
              background: 'var(--fin-primary)',
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

        <div className="fin-logo-wrapper">
          {user?.logo_url ? (
            <img src={user.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
          ) : (
            <>
              <div className="fin-logo-icon"><Buildings size={24} weight="fill" /></div>
              <span className="fin-logo-text">LANCERS <span className="fin-logo-accent">TECH</span></span>
            </>
          )}
        </div>


        <div className="fin-role-badge">
          <Buildings size={18} weight="duotone" />
          <span>Finance Portal</span>
          <div className="fin-live-dot"></div>
        </div>

         <nav className="fin-nav">
          <NavItem active={false} onClick={() => { navigate('/chat'); setMobileMenuOpen(false); }} icon={<ChatCircle size={20} />} label="Chat" />
          <NavItem active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }} icon={<ChartPie size={20} />} label="Overview" />
          <NavItem active={activeTab === 'fees'} onClick={() => { setActiveTab('fees'); setMobileMenuOpen(false); }} icon={<CreditCard size={20} />} label="Fee Management" count={challans.filter(c => c.status === 'overdue').length} />
          <NavItem active={activeTab === 'fee-structures'} onClick={() => { setActiveTab('fee-structures'); setMobileMenuOpen(false); }} icon={<Wrench size={20} />} label="Fee Structures" />
          <NavItem active={activeTab === 'scholarships'} onClick={() => { setActiveTab('scholarships'); setMobileMenuOpen(false); }} icon={<GraduationCap size={20} />} label="Scholarships" />
          <NavItem active={activeTab === 'payroll'} onClick={() => { setActiveTab('payroll'); setMobileMenuOpen(false); }} icon={<Users size={20} />} label="Payroll" count={payroll.filter(p => p.status === 'pending').length} />
          <NavItem active={activeTab === 'expenses'} onClick={() => { setActiveTab('expenses'); setMobileMenuOpen(false); }} icon={<Buildings size={20} />} label="Expenses" />
          <NavItem active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }} icon={<FileText size={20} />} label="Reports" />
        </nav>

        <button onClick={onLogout} className="fin-logout-btn">
          <SignOut size={20} weight="bold" />
          <span>Sign Out</span>
        </button>
      </aside>

      <main 
        style={{
          marginLeft: isMobile ? '0' : (leftSidebarOpen ? 'var(--sidebar-width)' : '24px'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: isMobile ? '24px 16px' : '40px',
          paddingTop: isMobile ? '80px' : '40px',
        }}
        className="fin-main"
      >
        <header className="fin-header">
          <div>
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
            <p>Welcome back, <span className="fin-user-name">{user.name}</span></p>
          </div>
          <div className="fin-header-actions">
            <div className="fin-date-badge">
              <CalendarBlank size={18} weight="duotone" />
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {['fees', 'payroll', 'expenses'].includes(activeTab) && (
              <button className="fin-add-btn" onClick={() => { setEditingItem(null); setModalType(activeTab === 'fees' ? 'challan' : activeTab === 'payroll' ? 'payroll' : 'expense'); setShowModal(true); }}>
                <Plus size={18} weight="bold" /> Add New
              </button>
            )}
          </div>
        </header>

        <div className="fin-content-body">
          {renderContent()}
        </div>
      </main>

      <FinModals 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        type={modalType} 
        editingItem={editingItem}
        students={students}
        employees={employees}
        onAction={handleAction}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default FinanceDashboard;
