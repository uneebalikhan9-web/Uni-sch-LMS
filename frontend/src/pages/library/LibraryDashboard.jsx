  import React, { useState, useEffect } from 'react';
import { 
  Books, 
  ChartLineUp, 
  ArrowUDownRight, 
  Users, 
  Money, 
  SignOut, 
  List, 
  X, 
  Bell, 
  UserCircle,
  BookmarkSimple,
  ChatCircle,
  ShieldCheck
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useToast } from '../../components/Toast';
import './library.css';

// Import Modular Sections
import LibraryOverview from './sections/LibraryOverview';
import BookCatalog from './sections/BookCatalog';
import IssueReturn from './sections/IssueReturn';
import LibraryMembers from './sections/LibraryMembers';
import FineTracking from './sections/FineTracking';
import { AddBookModal, IssueBookModal, MemberModal, HistoryModal } from './LibraryModals';

const LibraryDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showToast } = useToast();
  
  // States for Library Data
  const [stats, setStats] = useState({ totalBooks: 0, issuedBooks: 0, members: 0, overdue: 0 });
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fines, setFines] = useState([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueBook, setShowIssueBook] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberHistory, setMemberHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddBook = async (data) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/library/books`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Book added successfully!', 'success');
        setShowAddBook(false);
        fetchAllData();
      }
    } catch (err) { showToast('Error adding book', 'error'); }
  };

  const handleIssueBook = async (data) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/library/issue`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Book issued successfully!', 'success');
        setShowIssueBook(false);
        fetchAllData();
      }
    } catch (err) { showToast('Error issuing book', 'error'); }
  };

  const handleAddMember = async (data) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/library/members`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Member registered successfully!', 'success');
        setShowAddMember(false);
        fetchAllData();
      }
    } catch (err) { showToast('Error registering member', 'error'); }
  };

  const handleViewHistory = async (member) => {
    try {
      setSelectedMember(member);
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/library/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const history = res.data.transactions.filter(t => t.member_id === member.id);
        setMemberHistory(history);
        setShowHistory(true);
      }
    } catch (err) { showToast('Error fetching history', 'error'); }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, booksRes, membersRes, transRes, finesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/library/stats`, { headers }),
        axios.get(`${API_BASE_URL}/api/library/books`, { headers }),
        axios.get(`${API_BASE_URL}/api/library/members`, { headers }),
        axios.get(`${API_BASE_URL}/api/library/transactions`, { headers }),
        axios.get(`${API_BASE_URL}/api/library/fines`, { headers })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (booksRes.data.success) setBooks(booksRes.data.books);
      if (membersRes.data.success) setMembers(membersRes.data.members);
      if (transRes.data.success) setTransactions(transRes.data.transactions);
      if (finesRes.data.success) setFines(finesRes.data.fines);

    } catch (error) {
      console.error('Error fetching library data:', error);
      showToast('Failed to load library data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: ChartLineUp },
    { id: 'catalog', label: 'Book Catalog', icon: Books },
    { id: 'issuance', label: 'Issue / Return', icon: ArrowUDownRight },
    { id: 'members', label: 'Library Members', icon: Users },
    { id: 'fines', label: 'Fine Tracking', icon: Money },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="lib-container">
      {/* Sidebar */}
      <aside className={`lib-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-brand">
            <div className="logo-icon">
              <Books size={24} weight="fill" color="white" />
            </div>
            <div className="brand-text">
              <span className="brand-lancers">LANCERS</span>
              <span className="brand-tech">TECH</span>
            </div>
          </div>
          
          <div className="portal-pill">
            <div className="portal-pill-content">
              <ShieldCheck size={18} weight="bold" />
              <span>Digital Library Command Center</span>
            </div>
            <div className="status-dot"></div>
          </div>
        </div>

        <nav className="nav-links">
          <div 
            className="nav-item"
            onClick={() => { navigate('/chat'); setSidebarOpen(false); }}
          >
            <ChatCircle size={22} weight="regular" />
            <span>Chat</span>
          </div>
          {navItems.map((item) => (
            <div 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              <item.icon size={22} weight={activeTab === item.id ? "fill" : "regular"} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          <SignOut size={22} weight="bold" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="lib-main">
        <header className="top-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <List size={24} />}
            </button>
            <div className="header-title">
              <h1>{navItems.find(i => i.id === activeTab)?.label}</h1>
              <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem', marginTop: -5 }}>Library Nexus • Command Center</p>
            </div>
          </div>

          <div className="header-right">
            <div className="notification-bell">
              <Bell size={24} weight="duotone" />
              <span className="dot"></span>
            </div>
            <div className="user-pill">
              <UserCircle size={28} weight="fill" color="#0891b2" />
              <div className="user-info">
                <span className="user-name">{user?.name || 'Rehan'}</span>
                <span className="user-role">System Curator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="tab-content">
          {activeTab === 'overview' && <LibraryOverview stats={stats} transactions={transactions} />}
          {activeTab === 'catalog' && <BookCatalog books={books} onAdd={() => setShowAddBook(true)} />}
          {activeTab === 'issuance' && <IssueReturn transactions={transactions} onIssue={() => setShowIssueBook(true)} />}
          {activeTab === 'members' && <LibraryMembers members={members} onAdd={() => setShowAddMember(true)} onViewHistory={handleViewHistory} />}
          {activeTab === 'fines' && <FineTracking fines={fines} onRefresh={fetchAllData} />}
        </div>

        {showAddBook && <AddBookModal onClose={() => setShowAddBook(false)} onSave={handleAddBook} />}
        {showIssueBook && <IssueBookModal onClose={() => setShowIssueBook(false)} onSave={handleIssueBook} members={members} books={books} />}
        {showAddMember && <MemberModal onClose={() => setShowAddMember(false)} onSave={handleAddMember} />}
        {showHistory && <HistoryModal onClose={() => setShowHistory(false)} member={selectedMember} history={memberHistory} />}
      </main>
    </div>
  );
};

export default LibraryDashboard;
