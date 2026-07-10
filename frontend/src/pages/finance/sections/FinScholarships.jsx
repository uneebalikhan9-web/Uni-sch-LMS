import React, { useState, useEffect } from 'react';
import { 
  Plus, PencilSimple, Trash, Medal, Student, 
  Check, X, CalendarBlank, GraduationCap, Coins
} from "@phosphor-icons/react";
import API_BASE_URL from '../../../config/api';
import { useToast } from '../../../components/Toast';

export default function FinScholarships({ students }) {
  const [activeSubTab, setActiveSubTab] = useState('types'); // 'types' or 'awards'
  const [types, setTypes] = useState([]);
  const [awards, setAwards] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({
    name: '',
    type: 'merit',
    discount_percentage: 0,
    fixed_amount: '',
    min_cgpa_required: '',
    max_family_income: '',
    renewable: 1,
    is_active: 1
  });

  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardForm, setAwardForm] = useState({
    student_id: '',
    scholarship_id: '',
    semester_id: '',
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
      const [tRes, aRes, semRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/finance/scholarships/types`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/scholarships/students`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/semesters`, { headers }).then(r => r.json())
      ]);

      if (tRes.success) setTypes(tRes.types);
      if (aRes.success) setAwards(aRes.scholarships);
      if (semRes.success) setSemesters(semRes.semesters);
    } catch (error) {
      showToast('Error loading scholarship data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Scholarship Types Handlers ---
  const handleOpenTypeModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setTypeForm({
        name: type.name,
        type: type.type,
        discount_percentage: type.discount_percentage,
        fixed_amount: type.fixed_amount ?? '',
        min_cgpa_required: type.min_cgpa_required ?? '',
        max_family_income: type.max_family_income ?? '',
        renewable: type.renewable,
        is_active: type.is_active
      });
    } else {
      setEditingType(null);
      setTypeForm({
        name: '',
        type: 'merit',
        discount_percentage: 0,
        fixed_amount: '',
        min_cgpa_required: '',
        max_family_income: '',
        renewable: 1,
        is_active: 1
      });
    }
    setShowTypeModal(true);
  };

  const handleTypeChange = (e) => {
    const { name, value } = e.target;
    setTypeForm(prev => ({
      ...prev,
      [name]: ['discount_percentage', 'fixed_amount', 'min_cgpa_required', 'max_family_income', 'renewable', 'is_active'].includes(name)
        ? (value === '' ? '' : parseFloat(value))
        : value
    }));
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    const url = editingType 
      ? `${API_BASE_URL}/api/finance/scholarships/types/${editingType.id}` 
      : `${API_BASE_URL}/api/finance/scholarships/types`;
    const method = editingType ? 'PUT' : 'POST';

    const body = { ...typeForm };
    if (body.fixed_amount === '') body.fixed_amount = null;
    if (body.min_cgpa_required === '') body.min_cgpa_required = null;
    if (body.max_family_income === '') body.max_family_income = null;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingType ? 'Scholarship type updated!' : 'Scholarship type created!', 'success');
        setShowTypeModal(false);
        fetchData();
      } else {
        showToast(data.message || 'Action failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleTypeDelete = async (id) => {
    if (!window.confirm('Delete this scholarship type? This will affect existing awards.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/scholarships/types/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        showToast('Scholarship type deleted', 'success');
        fetchData();
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  // --- Student Scholarship Awards Handlers ---
  const handleOpenAwardModal = () => {
    setAwardForm({
      student_id: '',
      scholarship_id: '',
      semester_id: semesters[0]?.id || '',
      approved_amount: 0,
      status: 'approved'
    });
    setShowAwardModal(true);
  };

  const handleAwardChange = (e) => {
    const { name, value } = e.target;
    setAwardForm(prev => ({
      ...prev,
      [name]: ['student_id', 'scholarship_id', 'semester_id', 'approved_amount'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleAwardSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/scholarships/students`, {
        method: 'POST',
        headers,
        body: JSON.stringify(awardForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Scholarship successfully assigned!', 'success');
        setShowAwardModal(false);
        fetchData();
      } else {
        showToast(data.message || 'Assign failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleAwardStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/scholarships/students/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Scholarship marked as ${status}!`, 'success');
        fetchData();
      } else {
        showToast(data.message || 'Status update failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleAwardDelete = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this student scholarship award?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/scholarships/students/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        showToast('Scholarship award revoked', 'success');
        fetchData();
      } else {
        showToast(data.message || 'Revoke failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s' };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading scholarship portal...</div>;

  return (
    <div className="fin-animate">
      
      {/* Sub Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', marginBottom: '2rem', gap: '2rem' }}>
        <button 
          onClick={() => setActiveSubTab('types')}
          style={{
            padding: '12px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'types' ? '2px solid var(--fin-primary, #4f46e5)' : 'none',
            color: activeSubTab === 'types' ? 'var(--fin-primary, #4f46e5)' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Medal size={20} weight={activeSubTab === 'types' ? 'fill' : 'bold'} />
          Scholarship Categories
        </button>
        <button 
          onClick={() => setActiveSubTab('awards')}
          style={{
            padding: '12px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeSubTab === 'awards' ? '2px solid var(--fin-primary, #4f46e5)' : 'none',
            color: activeSubTab === 'awards' ? 'var(--fin-primary, #4f46e5)' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Student size={20} weight={activeSubTab === 'awards' ? 'fill' : 'bold'} />
          Student Awards Dashboard
        </button>
      </div>

      {activeSubTab === 'types' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Scholarship Categories Configuration</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>Manage discount percentages or fixed fee cuts for merit, need-based, sports, or external scholarships.</p>
            </div>
            <button className="fin-add-btn" onClick={() => handleOpenTypeModal(null)}>
              <Plus size={18} weight="bold" /> Add Category
            </button>
          </div>

          <div className="fin-table-wrap">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Classification</th>
                  <th>Discount Rate (%)</th>
                  <th>Fixed Value (PKR)</th>
                  <th>Min CGPA Requirement</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GraduationCap size={18} color="var(--fin-primary)" />
                        {t.name}
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{t.type}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{t.discount_percentage}%</td>
                    <td>{t.fixed_amount ? `Rs. ${t.fixed_amount.toLocaleString()}` : 'N/A'}</td>
                    <td style={{ fontWeight: 600 }}>{t.min_cgpa_required ? `≥ ${t.min_cgpa_required}` : 'No CGPA limit'}</td>
                    <td>
                      <span className={`fin-badge ${t.is_active ? 'fin-badge-paid' : 'fin-badge-waived'}`}>
                        {t.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button 
                          style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                          title="Edit" 
                          onClick={() => handleOpenTypeModal(t)}
                        >
                          <PencilSimple size={18} weight="duotone" />
                        </button>
                        <button 
                          style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                          title="Delete" 
                          onClick={() => handleTypeDelete(t.id)}
                        >
                          <Trash size={18} weight="duotone" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {types.length === 0 && (
                  <tr className="fin-empty-row">
                    <td colSpan="7">No scholarship types configured.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Student Scholarship Grants</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>Assign scholarship policies to students and manage active approvals.</p>
            </div>
            <button className="fin-add-btn" onClick={handleOpenAwardModal}>
              <Plus size={18} weight="bold" /> Grant Scholarship
            </button>
          </div>

          <div className="fin-table-wrap">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Assigned Scholarship</th>
                  <th>Semester Term</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {awards.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>
                        {a.student_name}
                      </div>
                    </td>
                    <td>{a.roll_number}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--fin-primary)' }}>
                        <Coins size={16} />
                        {a.scholarship_name}
                      </div>
                    </td>
                    <td>{a.semester_name}</td>
                    <td>
                      <span className={`fin-badge fin-badge-${a.status === 'approved' ? 'paid' : a.status === 'pending' ? 'pending' : 'overdue'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {a.status === 'pending' && (
                          <button 
                            style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                            title="Approve" 
                            onClick={() => handleAwardStatus(a.id, 'approved')}
                          >
                            <Check size={18} weight="bold" />
                          </button>
                        )}
                        {a.status === 'pending' && (
                          <button 
                            style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                            title="Reject" 
                            onClick={() => handleAwardStatus(a.id, 'rejected')}
                          >
                            <X size={18} weight="bold" />
                          </button>
                        )}
                        <button 
                          style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                          title="Revoke / Delete" 
                          onClick={() => handleAwardDelete(a.id)}
                        >
                          <Trash size={18} weight="duotone" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {awards.length === 0 && (
                  <tr className="fin-empty-row">
                    <td colSpan="6">No student scholarship awards found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Type Modal */}
      {showTypeModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowTypeModal(false)}>
          <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0' }}>
              {editingType ? 'Edit Scholarship Category' : 'Add Scholarship Category'}
            </h3>
            
            <form onSubmit={handleTypeSubmit}>
              <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Category Name *</label>
                  <input type="text" name="name" required style={inputStyle} value={typeForm.name} onChange={handleTypeChange} placeholder="e.g. 50% High-Achievers Merit Scholarship" />
                </div>
                <div>
                  <label style={labelStyle}>Scholarship Type *</label>
                  <select name="type" style={inputStyle} value={typeForm.type} onChange={handleTypeChange}>
                    <option value="merit">Merit-Based</option>
                    <option value="need">Need-Based</option>
                    <option value="sports">Sports</option>
                    <option value="hafiz">Hafiz-e-Quran</option>
                    <option value="hec">HEC Sponsored</option>
                    <option value="disability">Disability support</option>
                    <option value="sibling">Sibling discount</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Discount Percentage (%)</label>
                  <input type="number" name="discount_percentage" min="0" max="100" style={inputStyle} value={typeForm.discount_percentage} onChange={handleTypeChange} />
                </div>
                <div>
                  <label style={labelStyle}>Fixed Discount Amount (Rs.)</label>
                  <input type="number" name="fixed_amount" min="0" style={inputStyle} value={typeForm.fixed_amount} onChange={handleTypeChange} placeholder="N/A" />
                </div>
                <div>
                  <label style={labelStyle}>Min CGPA Required</label>
                  <input type="number" name="min_cgpa_required" step="0.01" min="0" max="4" style={inputStyle} value={typeForm.min_cgpa_required} onChange={handleTypeChange} placeholder="e.g. 3.50" />
                </div>
                <div>
                  <label style={labelStyle}>Max Annual Family Income (Rs.)</label>
                  <input type="number" name="max_family_income" style={inputStyle} value={typeForm.max_family_income} onChange={handleTypeChange} placeholder="N/A" />
                </div>
                <div>
                  <label style={labelStyle}>Renewable Status</label>
                  <select name="renewable" style={inputStyle} value={typeForm.renewable} onChange={handleTypeChange}>
                    <option value={1}>Yes (Every Semester)</option>
                    <option value={0}>No (One-time)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Category Status</label>
                  <select name="is_active" style={inputStyle} value={typeForm.is_active} onChange={handleTypeChange}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowTypeModal(false)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--fin-primary, #4f46e5)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Scholarship Modal */}
      {showAwardModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowAwardModal(false)}>
          <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', width: '90%', maxWidth: '550px', boxHighlight: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0' }}>Assign Scholarship to Student</h3>
            
            <form onSubmit={handleAwardSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Select Student *</label>
                  <select name="student_id" required style={inputStyle} value={awardForm.student_id} onChange={handleAwardChange}>
                    <option value="">Choose student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Scholarship Category *</label>
                  <select name="scholarship_id" required style={inputStyle} value={awardForm.scholarship_id} onChange={handleAwardChange}>
                    <option value="">Choose category...</option>
                    {types.filter(t => t.is_active).map(t => <option key={t.id} value={t.id}>{t.name} ({t.discount_percentage ? `${t.discount_percentage}% discount` : `Rs. ${t.fixed_amount}`})</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Semester Term *</label>
                  <select name="semester_id" required style={inputStyle} value={awardForm.semester_id} onChange={handleAwardChange}>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Initial Award Status</label>
                  <select name="status" style={inputStyle} value={awardForm.status} onChange={handleAwardChange}>
                    <option value="approved">Approved / Confirmed</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowAwardModal(false)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--fin-primary, #4f46e5)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Award Scholarship</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
