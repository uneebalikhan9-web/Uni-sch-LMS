import React, { useState } from 'react';
import { 
  Books, BookOpen, Users, Clock, Bell, 
  SignOut, List, Plus, MagnifyingGlass, ChartLineUp, UserCircle, 
  Bookmark, ArrowUUpLeft, ArrowUDownRight, BookBookmark
} from '@phosphor-icons/react';
import { useToast } from '../../components/Toast';
import './library.css';

const LibraryDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { showToast } = useToast();

  const [books, setBooks] = useState([
    { id: 1, title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', status: 'Available' },
    { id: 2, title: 'Clean Code', author: 'Robert C. Martin', status: 'Issued' },
    { id: 3, title: 'Introduction to Algorithms', author: 'Cormen et al.', status: 'Available' },
  ]);

  return (
    <div className="lib-container">
      {/* Sidebar */}
      <aside className="lib-sidebar">
        <div style={{ padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Lancers<span style={{ color: '#a5b4fc' }}>Tech</span></div>
          <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600, marginTop: 4 }}>DIGITAL LIBRARY</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 1rem' }}>
          <div onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'overview' ? 'white' : '#cbd5e1', background: activeTab === 'overview' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <ChartLineUp size={20} /> <span>Dashboard</span>
          </div>
          <div onClick={() => setActiveTab('catalog')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'catalog' ? 'white' : '#cbd5e1', background: activeTab === 'catalog' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Books size={20} /> <span>Catalog</span>
          </div>
          <div onClick={() => setActiveTab('issuance')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'issuance' ? 'white' : '#cbd5e1', background: activeTab === 'issuance' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <ArrowUDownRight size={20} /> <span>Issue/Return</span>
          </div>
        </nav>

        <div style={{ position: 'absolute', bottom: 30, width: '100%', padding: '0 1rem' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: 'none', background: 'transparent', color: '#fca5a5', cursor: 'pointer' }}>
            <SignOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lib-main">
        <header className="lib-header">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Library Command Center</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Bell size={22} color="#64748b" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: '8px 18px', borderRadius: 40, border: '1px solid #e2e8f0' }}>
              <UserCircle size={28} color="#4f46e5" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'Librarian'}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Resource Curator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="lib-content">
          <div className="lib-metrics">
            <MetricCard icon={<Books size={26} weight="duotone" />} value="12,450" label="Total Books" />
            <MetricCard icon={<ArrowUDownRight size={26} weight="duotone" />} value="420" label="Books Issued" />
            <MetricCard icon={<ArrowUUpLeft size={26} weight="duotone" />} value="85" label="Returns Today" />
            <MetricCard icon={<Clock size={26} weight="duotone" />} value="12" label="Overdue Items" />
          </div>

          {activeTab === 'overview' && (
            <div className="lib-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Library Catalog</h3>
                <button className="lib-btn-primary"><Plus size={18} weight="bold" /> Add New Book</button>
              </div>
              <table className="lib-table">
                <thead>
                  <tr><th>Book Title</th><th>Author</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td style={{ fontWeight: 700 }}>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        <span className={`lib-badge ${book.status === 'Available' ? 'lib-badge-available' : 'lib-badge-issued'}`}>
                          {book.status}
                        </span>
                      </td>
                      <td>
                        <button style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }}>Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(activeTab === 'catalog' || activeTab === 'issuance') && (
            <div className="lib-card" style={{ textAlign: 'center', padding: '50px' }}>
              <BookBookmark size={64} weight="duotone" color="#4f46e5" style={{ margin: '0 auto 20px' }} />
              <h3>Digital Catalog Synchronization</h3>
              <p style={{ color: '#64748b' }}>Connecting with the Global Library Database for real-time indexing.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, value, label }) => (
  <div className="lib-card">
    <div style={{ background: '#f5f3ff', width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#4f46e5' }}>{icon}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
  </div>
);

export default LibraryDashboard;
