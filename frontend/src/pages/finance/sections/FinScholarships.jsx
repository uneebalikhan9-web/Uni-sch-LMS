import React, { useState, useEffect } from 'react';
import { 
  Plus, PencilSimple, Trash, Medal, Student, 
  Check, X, CalendarBlank, GraduationCap, Coins, UsersThree
} from "@phosphor-icons/react";
import API_BASE_URL from '../../../config/api';
import { useToast } from '../../../components/Toast';

export default function FinScholarships({ students = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('types'); // 'types' or 'awards'
  const [types, setTypes] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({
    name: '',
    type: 'need_based',
    discount_percentage: 20,
    fixed_amount: '',
    max_family_income: '',
    renewable: 1,
    is_active: 1
  });

  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardForm, setAwardForm] = useState({
    student_id: '',
    scholarship_id: '',
    approved_amount: 0,
    status: 'approved'
  });

  const { showToast } = useToast();
  const token = sessionStorage.getItem('token');
  const headers = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, aRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/finance/scholarships/types`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/scholarships/students`, { headers }).then(r => r.json())
      ]);

      if (tRes.success) setTypes(tRes.types || []);
      if (aRes.success) setAwards(aRes.scholarships || []);
    } catch (e) {
      showToast('Error fetching school concessions data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTypeModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setTypeForm({
        name: type.name,
        type: type.type,
        discount_percentage: type.discount_percentage,
        fixed_amount: type.fixed_amount ?? '',
        max_family_income: type.max_family_income ?? '',
        renewable: type.renewable,
        is_active: type.is_active
      });
    } else {
      setEditingType(null);
      setTypeForm({
        name: '',
        type: 'need_based',
        discount_percentage: 20,
        fixed_amount: '',
        max_family_income: '',
        renewable: 1,
        is_active: 1
      });
    }
    setShowTypeModal(true);
  };

  const handleTypeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTypeForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    try {
      const url = editingType 
        ? `${API_BASE_URL}/api/finance/scholarships/types/${editingType.id}`
        : `${API_BASE_URL}/api/finance/scholarships/types`;
      const method = editingType ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(typeForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Concession policy saved successfully', 'success');
        setShowTypeModal(false);
        fetchData();
      } else {
        showToast(data.message || 'Failed to save', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Are you sure you want to remove this concession policy?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/scholarships/types/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        showToast('Concession policy removed', 'success');
        fetchData();
      } else {
        showToast(data.message, 'error');
      }
    } catch (e) {
      showToast('Error removing policy', 'error');
    }
  };

  const handleOpenAwardModal = () => {
    setAwardForm({
      student_id: students[0]?.id || '',
      scholarship_id: types[0]?.id || '',
      approved_amount: 0,
      status: 'approved'
    });
    setShowAwardModal(true);
  };

  const handleSaveAward = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/scholarships/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify(awardForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Concession awarded to student successfully!', 'success');
        setShowAwardModal(false);
        fetchData();
      } else {
        showToast(data.message || 'Error awarding concession', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleRevokeAward = async (id) => {
    if (!window.confirm('Revoke this concession from student?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/scholarships/students/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'revoked' })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Concession status updated to revoked', 'success');
        fetchData();
      }
    } catch(e) {
      showToast('Error revoking concession', 'error');
    }
  };

  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' };
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', outline: 'none' };

  return (
    <div className="fin-animate">
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            🎁 College Scholarships & Concessions & Sibling Discounts
          </h2>
          <p style={{ color: 'var(--fin-text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
            Manage sibling discount policies (2nd/3rd child), staff child tuition waivers, and need-based financial aid.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setActiveSubTab('types')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: activeSubTab === 'types' ? '#ffffff' : 'transparent',
                color: activeSubTab === 'types' ? '#0f172a' : '#64748b',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                boxShadow: activeSubTab === 'types' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📋 Concession Policies ({types.length})
            </button>
            <button
              onClick={() => setActiveSubTab('awards')}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: activeSubTab === 'awards' ? '#ffffff' : 'transparent',
                color: activeSubTab === 'awards' ? '#0f172a' : '#64748b',
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                boxShadow: activeSubTab === 'awards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🎓 Awarded Students ({awards.length})
            </button>
          </div>

          <button
            onClick={() => activeSubTab === 'types' ? handleOpenTypeModal() : handleOpenAwardModal()}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(var(--primary-rgb, 79, 70, 229), 0.3)'
            }}
          >
            <Plus size={16} weight="bold" /> {activeSubTab === 'types' ? 'Add Concession Policy' : 'Award to Student'}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. CONCESSION TYPES / POLICIES LIST                      */}
      {/* ======================================================== */}
      {activeSubTab === 'types' && (
        <div className="fin-table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Concession Policy Name</th>
                <th>Category</th>
                <th>Discount % / Amount</th>
                <th>Applicability</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.length > 0 ? types.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="fin-name">{t.name}</div>
                    <div className="fin-sub">Policy ID: CON-{t.id}</div>
                  </td>
                  <td>
                    <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', fontWeight: 700, color: '#334155', fontSize: '0.78rem' }}>
                      {t.type === 'merit' ? '⭐ Academic Position' : '👨‍👩‍👧 Sibling / Need-Based'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: '#166534', fontSize: '0.95rem' }}>
                    {t.discount_percentage ? `${t.discount_percentage}% OFF Monthly Fee` : `Rs. ${(parseFloat(t.fixed_amount) || 0).toLocaleString()} Fixed`}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {t.renewable ? '✓ Applies Every Month' : 'One-time only'}
                  </td>
                  <td>
                    <span className={`fin-badge ${t.is_active ? 'fin-badge-paid' : 'fin-badge-pending'}`}>
                      {t.is_active ? 'Active Policy' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleOpenTypeModal(t)}
                        style={{ background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                        title="Edit Policy"
                      >
                        <PencilSimple size={16} weight="duotone" />
                      </button>
                      <button
                        onClick={() => handleDeleteType(t.id)}
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                        title="Delete Policy"
                      >
                        <Trash size={16} weight="duotone" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="fin-empty-row">
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎁</div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>No concession policies configured</div>
                    <div style={{ fontSize: '0.8rem' }}>Click "+ Add Concession Policy" to set up sibling discounts or staff child waivers.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. AWARDED STUDENT CONCESSIONS LIST                      */}
      {/* ======================================================== */}
      {activeSubTab === 'awards' && (
        <div className="fin-table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Concession Applied</th>
                <th>Monthly Waiver</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {awards.length > 0 ? awards.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="fin-name">{a.student_name || 'Enrolled Student'}</div>
                    <div className="fin-sub">{a.email}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{a.roll_number || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{a.scholarship_name || 'Concession'}</span>
                  </td>
                  <td style={{ fontWeight: 800, color: '#166534' }}>
                    {a.discount_percentage ? `${a.discount_percentage}% OFF` : `Rs. ${(parseFloat(a.approved_amount) || 0).toLocaleString()}`}
                  </td>
                  <td>
                    <span className={`fin-badge fin-badge-${a.status}`}>
                      {a.status === 'approved' || a.status === 'active' ? '✓ Active Concession' : a.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      {a.status !== 'revoked' && (
                        <button
                          onClick={() => handleRevokeAward(a.id)}
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr className="fin-empty-row">
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎓</div>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>No student concessions awarded yet</div>
                    <div style={{ fontSize: '0.8rem' }}>Click "+ Award to Student" to apply sibling discount or staff concession to an enrolled student.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD / EDIT CONCESSION POLICY */}
      {showTypeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {editingType ? 'Edit Concession Policy' : 'Create College Concession Policy'}
              </h3>
              <button onClick={() => setShowTypeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleSaveType} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Policy Name *</label>
                <input type="text" name="name" required placeholder="e.g. Sibling Discount (2nd Child - 20%)" style={inputStyle} value={typeForm.name} onChange={handleTypeChange} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select name="type" style={inputStyle} value={typeForm.type} onChange={handleTypeChange}>
                    <option value="need_based">Sibling / Need-Based</option>
                    <option value="merit">Academic Position / Merit</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Discount Percentage (%)</label>
                  <input type="number" name="discount_percentage" min="1" max="100" placeholder="e.g. 20" style={inputStyle} value={typeForm.discount_percentage} onChange={handleTypeChange} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Applicability</label>
                <select name="renewable" style={inputStyle} value={typeForm.renewable} onChange={handleTypeChange}>
                  <option value={1}>Continuous (Applies to all monthly fee bills)</option>
                  <option value={0}>One-time (Single month voucher)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowTypeModal(false)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 22px', background: 'var(--primary-color, #4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Save Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AWARD CONCESSION TO STUDENT */}
      {showAwardModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Award Concession to Student
              </h3>
              <button onClick={() => setShowAwardModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleSaveAward} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Select Enrolled Student *</label>
                <select 
                  name="student_id" 
                  required 
                  style={inputStyle} 
                  value={awardForm.student_id} 
                  onChange={(e) => setAwardForm({ ...awardForm, student_id: e.target.value })}
                >
                  <option value="">Select a student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll: {s.roll_number || s.id})</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Select Concession Policy *</label>
                <select 
                  name="scholarship_id" 
                  required 
                  style={inputStyle} 
                  value={awardForm.scholarship_id} 
                  onChange={(e) => setAwardForm({ ...awardForm, scholarship_id: e.target.value })}
                >
                  <option value="">Select policy...</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.discount_percentage}% OFF)</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAwardModal(false)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 22px', background: 'var(--primary-color, #4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Apply Concession</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
