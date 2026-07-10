import React, { useState, useEffect } from 'react';
import { 
  Plus, PencilSimple, Trash, BookOpen, Clock, 
  CurrencyCircleDollar, Wrench, CalendarBlank
} from "@phosphor-icons/react";
import API_BASE_URL from '../../../config/api';
import { useToast } from '../../../components/Toast';

export default function FinFeeStructures() {
  const [structures, setStructures] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    program_id: '',
    semester_id: '',
    per_credit_hour_fee: 5000,
    registration_fee: 2000,
    exam_fee: 1000,
    lab_fee_per_credit: 1500,
    security_deposit: 0,
    late_fee_per_day: 100,
    effective_from: '',
    is_active: 1
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
      const [fsRes, pRes, semRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/finance/fee-structures`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/programs`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/finance/semesters`, { headers }).then(r => r.json())
      ]);

      if (fsRes.success) setStructures(fsRes.structures);
      if (pRes.success) setPrograms(pRes.programs);
      if (semRes.success) setSemesters(semRes.semesters);
    } catch (error) {
      showToast('Error loading fee configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      const effFromDate = item.effective_from ? new Date(item.effective_from).toISOString().split('T')[0] : '';
      setFormData({
        program_id: item.program_id ?? '',
        semester_id: item.semester_id ?? '',
        per_credit_hour_fee: item.per_credit_hour_fee,
        registration_fee: item.registration_fee,
        exam_fee: item.exam_fee,
        lab_fee_per_credit: item.lab_fee_per_credit,
        security_deposit: item.security_deposit,
        late_fee_per_day: item.late_fee_per_day,
        effective_from: effFromDate,
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({
        program_id: '',
        semester_id: '',
        per_credit_hour_fee: 5000,
        registration_fee: 2000,
        exam_fee: 1000,
        lab_fee_per_credit: 1500,
        security_deposit: 0,
        late_fee_per_day: 100,
        effective_from: '',
        is_active: 1
      });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['per_credit_hour_fee', 'registration_fee', 'exam_fee', 'lab_fee_per_credit', 'security_deposit', 'late_fee_per_day', 'is_active'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingItem 
      ? `${API_BASE_URL}/api/finance/fee-structures/${editingItem.id}` 
      : `${API_BASE_URL}/api/finance/fee-structures`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingItem ? 'Fee structure updated!' : 'Fee structure created!', 'success');
        setShowModal(false);
        fetchData();
      } else {
        showToast(data.message || 'Action failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee configuration?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/fee-structures/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        showToast('Fee structure deleted successfully', 'success');
        fetchData();
      } else {
        showToast(data.message || 'Delete failed', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
  };

  const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s' };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading fee policies...</div>;

  return (
    <div className="fin-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Fee Structures Configuration</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>Configure default rates for credit hours, registration, lab courses, and late fees.</p>
        </div>
        <button className="fin-add-btn" onClick={() => handleOpenModal(null)}>
          <Plus size={18} weight="bold" /> Add Structure
        </button>
      </div>

      <div className="fin-table-wrap">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Target Scope</th>
              <th>Semester Constraint</th>
              <th>Per CH fee</th>
              <th>Registration fee</th>
              <th>Lab fee (per CH)</th>
              <th>Late fee (per day)</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {structures.map(fs => (
              <tr key={fs.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#334155' }}>
                    {fs.program_name ? fs.program_name : 'Global / Campus Default'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Campus ID: {fs.campus_id} {fs.campus_name && `(${fs.campus_name})`}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 500, color: '#475569' }}>
                    {fs.semester_name ? fs.semester_name : 'All Semesters'}
                  </div>
                </td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>Rs. {fs.per_credit_hour_fee.toLocaleString()}</td>
                <td>Rs. {fs.registration_fee.toLocaleString()}</td>
                <td>Rs. {fs.lab_fee_per_credit.toLocaleString()}</td>
                <td style={{ color: '#b91c1c', fontWeight: 600 }}>Rs. {fs.late_fee_per_day}/day</td>
                <td>
                  <span className={`fin-badge ${fs.is_active ? 'fin-badge-paid' : 'fin-badge-waived'}`}>
                    {fs.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    <button 
                      style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                      title="Edit" 
                      onClick={() => handleOpenModal(fs)}
                    >
                      <PencilSimple size={18} weight="duotone" />
                    </button>
                    <button 
                      style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                      title="Delete" 
                      onClick={() => handleDelete(fs.id)}
                    >
                      <Trash size={18} weight="duotone" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {structures.length === 0 && (
              <tr className="fin-empty-row">
                <td colSpan="8">No fee structures configured. Add one to apply rules.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0' }}>
              {editingItem ? 'Edit Fee Configuration' : 'Add Fee Configuration'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: '1fr 1fr' }}>
                
                <div>
                  <label style={labelStyle}>Program Scope</label>
                  <select name="program_id" style={inputStyle} value={formData.program_id} onChange={handleChange}>
                    <option value="">Global (All Programs)</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Semester Scope</label>
                  <select name="semester_id" style={inputStyle} value={formData.semester_id} onChange={handleChange}>
                    <option value="">All Semesters</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Per Credit Hour Fee (Rs.) *</label>
                  <input type="number" name="per_credit_hour_fee" required style={inputStyle} value={formData.per_credit_hour_fee} onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>Lab Fee Per Credit Hour (Rs.) *</label>
                  <input type="number" name="lab_fee_per_credit" required style={inputStyle} value={formData.lab_fee_per_credit} onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>Registration Fee (Rs.) *</label>
                  <input type="number" name="registration_fee" required style={inputStyle} value={formData.registration_fee} onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>Exam Fee (Rs.) *</label>
                  <input type="number" name="exam_fee" required style={inputStyle} value={formData.exam_fee} onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>Security Deposit (Refundable) *</label>
                  <input type="number" name="security_deposit" required style={inputStyle} value={formData.security_deposit} onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>Late Fee Surcharge (Rs. / Day) *</label>
                  <input type="number" name="late_fee_per_day" required style={inputStyle} value={formData.late_fee_per_day} onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>Effective From Date</label>
                  <input type="date" name="effective_from" style={inputStyle} value={formData.effective_from} onChange={handleChange} />
                </div>

                <div>
                  <label style={labelStyle}>Structure Status</label>
                  <select name="is_active" style={inputStyle} value={formData.is_active} onChange={handleChange}>
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', background: 'var(--fin-primary, #4f46e5)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
