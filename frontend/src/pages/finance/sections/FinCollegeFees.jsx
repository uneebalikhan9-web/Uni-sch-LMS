import React, { useState, useEffect } from 'react';
import { Plus, Trash, PencilSimple, FloppyDisk, X, Buildings } from "@phosphor-icons/react";
import API_BASE_URL from '../../../config/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const FinCollegeFees = ({ isCollege }) => {
  const token = sessionStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    class_name: '', tuition_fee: '', transport_fee: '',
    activity_fee: '', computer_fee: '', other_fee: '',
    late_fine_per_day: '50', due_day: '10'
  });

  // Monthly generation state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchStructures(); }, []);

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/school-fee-structures`, { headers });
      const data = await res.json();
      if (data.success) setStructures(data.structures || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEdit = (s) => {
    setForm({
      class_name: s.class_name,
      tuition_fee: s.tuition_fee,
      transport_fee: s.transport_fee,
      activity_fee: s.activity_fee,
      computer_fee: s.computer_fee,
      other_fee: s.other_fee,
      late_fine_per_day: s.late_fine_per_day,
      due_day: s.due_day,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee structure?')) return;
    await fetch(`${API_BASE_URL}/api/finance/school-fee-structures/${id}`, { method: 'DELETE', headers });
    fetchStructures();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/school-fee-structures`, {
        method: 'POST', headers,
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setEditingId(null);
        setForm({ class_name: '', tuition_fee: '', transport_fee: '', activity_fee: '', computer_fee: '', other_fee: '', late_fine_per_day: '50', due_day: '10' });
        fetchStructures();
      } else {
        alert(data.message || 'Failed to save');
      }
    } catch(e) { alert('Network error'); }
    finally { setSaving(false); }
  };

  const handleGenerateMonthly = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/challans/generate-monthly`, {
        method: 'POST', headers,
        body: JSON.stringify({ month: genMonth, year: genYear })
      });
      const data = await res.json();
      alert(data.message || (data.success ? 'Generated!' : 'Failed'));
      if (data.success) setShowGenModal(false);
    } catch(e) { alert('Network error'); }
    finally { setGenerating(false); }
  };

  const totalFee = (s) =>
    (+s.tuition_fee||0) + (+s.transport_fee||0) + (+s.activity_fee||0) + (+s.computer_fee||0) + (+s.other_fee||0);

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid #e2e8f0', fontSize: '0.9rem', color: '#0f172a',
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box', fontWeight: 600
  };
  const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div className="fin-animate">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            📚 Class Fee Structures
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Set monthly fee amounts per class. These are used when generating monthly fee challans.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowGenModal(true)}
            style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
          >
            📅 Generate Monthly Fees
          </button>
          <button
            onClick={() => { setEditingId(null); setForm({ class_name: '', tuition_fee: '', transport_fee: '', activity_fee: '', computer_fee: '', other_fee: '', late_fine_per_day: '50', due_day: '10' }); setShowForm(true); }}
            style={{ padding: '10px 18px', background: 'var(--fin-primary, #4f46e5)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}
          >
            <Plus size={16} weight="bold" /> Add Class Fee
          </button>
        </div>
      </div>

      {/* Fee Structures Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '0.95rem' }}>Loading fee structures...</div>
      ) : structures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <Buildings size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>No fee structures defined yet</p>
          <p style={{ fontSize: '0.85rem' }}>Click "Add Class Fee" to set up your first class fee structure.</p>
        </div>
      ) : (
        <div className="fin-table-wrap">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Class / Grade</th>
                <th style={{ textAlign: 'right' }}>Tuition</th>
                <th style={{ textAlign: 'right' }}>Transport</th>
                <th style={{ textAlign: 'right' }}>Activity</th>
                <th style={{ textAlign: 'right' }}>Computer Lab</th>
                <th style={{ textAlign: 'right' }}>Other</th>
                <th style={{ textAlign: 'right' }}>Total / Month</th>
                <th style={{ textAlign: 'right' }}>Due Day</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {structures.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800, color: '#4f46e5' }}>{s.class_name}</td>
                  <td style={{ textAlign: 'right' }}>Rs. {Number(s.tuition_fee||0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>Rs. {Number(s.transport_fee||0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>Rs. {Number(s.activity_fee||0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>Rs. {Number(s.computer_fee||0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>Rs. {Number(s.other_fee||0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                    Rs. {totalFee(s).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>{s.due_day}th</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button onClick={() => handleEdit(s)} style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PencilSimple size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(s.id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }} onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: 24, padding: '2rem', width: '90%', maxWidth: '560px', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {editingId ? 'Edit' : 'Add'} Class Fee Structure
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={22} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={labelStyle}>Class / Grade Name *</label>
                <input style={inputStyle} placeholder="e.g. Class 1, Grade 5, Montessori" value={form.class_name} onChange={e => setForm({...form, class_name: e.target.value})} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                {[
                  { key: 'tuition_fee', label: 'Tuition Fee (Rs.)' },
                  { key: 'transport_fee', label: 'Transport Fee (Rs.)' },
                  { key: 'activity_fee', label: 'Activity Fee (Rs.)' },
                  { key: 'computer_fee', label: 'Computer Lab Fee (Rs.)' },
                  { key: 'other_fee', label: 'Other Fee (Rs.)' },
                  { key: 'late_fine_per_day', label: 'Late Fine / Day (Rs.)' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input style={inputStyle} type="number" min="0" placeholder="0" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Fee Due Day (day of month)</label>
                <input style={{ ...inputStyle, maxWidth: '120px' }} type="number" min="1" max="28" value={form.due_day} onChange={e => setForm({...form, due_day: e.target.value})} />
                <span style={{ marginLeft: '10px', fontSize: '0.82rem', color: '#64748b' }}>e.g. 10 means due on 10th of every month</span>
              </div>

              {/* Total Preview */}
              <div style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: '14px', padding: '16px', marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 700, marginBottom: '4px' }}>TOTAL MONTHLY FEE</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4f46e5' }}>
                  Rs. {[form.tuition_fee, form.transport_fee, form.activity_fee, form.computer_fee, form.other_fee].reduce((sum, v) => sum + (+v||0), 0).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: 'var(--fin-primary, #4f46e5)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FloppyDisk size={16} /> {saving ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Monthly Generation Modal */}
      {showGenModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }} onClick={() => setShowGenModal(false)}>
          <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', width: '90%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>📅 Generate Monthly Fee Challans</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
              This will create one fee challan per student based on their class fee structure.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Month</label>
                <select value={genMonth} onChange={e => setGenMonth(Number(e.target.value))} style={{ ...inputStyle }}>
                  {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Year</label>
                <input type="number" value={genYear} onChange={e => setGenYear(Number(e.target.value))} style={inputStyle} min="2020" max="2035" />
              </div>
            </div>

            <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
              ✅ Challans will be generated for: <strong>{MONTHS[genMonth-1]} {genYear}</strong>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowGenModal(false)} style={{ padding: '10px 20px', background: 'white', border: '1.5px solid #e2e8f0', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleGenerateMonthly} disabled={generating} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                {generating ? 'Generating...' : '🚀 Generate Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinCollegeFees;
