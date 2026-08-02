import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretDown, CaretUp, IdentificationBadge, SignOut, BookOpen, Clock, PresentationChart, CheckCircle, ChatCircle } from '@phosphor-icons/react';
import { S } from './sections/PDStyles';
import PDSummary from './sections/PDSummary';
import PDAttendance from './sections/PDAttendance';
import PDFees from './sections/PDFees';
import PDDiary from './sections/PDDiary';
import API_BASE_URL from '../../config/api';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetch(`${API_BASE_URL}/api/parent/children`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.children.length > 0) {
          setChildren(d.children);
          setSelectedChildId(d.children[0].student_id.toString());
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [navigate, token]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const selectedChild = children.find(c => c.student_id.toString() === selectedChildId);

  const tabs = [
    { id: 'summary', label: 'Overview', icon: <PresentationChart size={20} /> },
    { id: 'attendance', label: 'Attendance', icon: <CheckCircle size={20} /> },
    { id: 'fees', label: 'Fee Challans', icon: <Clock size={20} /> },
    { id: 'diary', label: 'Digital Diary', icon: <BookOpen size={20} /> },
    { id: 'chat', label: 'Teacher Chat', icon: <ChatCircle size={20} /> }
  ];

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f4f7fe' }}>
      <div style={{ padding: '40px', textAlign: 'center', color: '#6366f1', fontSize: '18px', fontWeight: 600 }}>Loading Portal...</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        .hover-lift:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={S.container}>
        {/* Sidebar */}
        <div style={S.sidebar}>
          <div style={S.sidebarDecoration}></div>
          <div style={S.sidebarHeader}>
            <div style={S.logo}>P</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>Parent Portal</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#818cf8', fontWeight: 600 }}>Lancers Tech</p>
            </div>
          </div>

        <div style={{ padding: '24px 0', flex: 1 }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => {
                if (tab.id === 'chat') {
                  navigate('/chat');
                } else {
                  setActiveTab(tab.id);
                }
              }}
              style={{ ...S.navItem, ...(activeTab === tab.id ? S.navItemActive : {}) }}
            >
              {tab.icon} {tab.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div onClick={handleLogout} style={{ ...S.navItem, color: '#ef4444', padding: '10px 0', cursor: 'pointer' }}>
            <SignOut size={20} /> Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={S.main}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {children.length > 0 && (
              <div style={S.childSelector}>
                <IdentificationBadge size={20} color="#6366f1" />
                <select
                  style={S.select}
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                >
                  {children.map(c => (
                    <option key={c.student_id} value={c.student_id}>
                      {c.student_name} ({c.roll_number})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IdentificationBadge size={24} color="#64748b" />
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div style={S.content}>
          {children.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <h3>No children linked to this account.</h3>
              <p>Please contact the administration to link your children.</p>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && <PDSummary student={selectedChild} />}
              {activeTab === 'attendance' && <PDAttendance student={selectedChild} />}
              {activeTab === 'fees' && <PDFees student={selectedChild} />}
              {activeTab === 'diary' && <PDDiary student={selectedChild} />}
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
