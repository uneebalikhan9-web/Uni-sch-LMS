import React, { useState, useEffect } from 'react';
import { Scales, CheckCircle, Warning, X, PencilSimple, FloppyDisk } from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';

const hdrs = () => ({ Authorization: `Bearer ${sessionStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const PROGRAM_LEVELS = ['Undergraduate', 'Postgraduate', 'PhD'];
const FIELD_META = [
  { key: 'min_credit_hours', label: 'Min Credit Hours / Semester', hint: 'Minimum CH a student must take per semester (HEC: 9 CH)' },
  { key: 'max_credit_hours', label: 'Max Credit Hours / Semester', hint: 'Standard maximum CH per semester (HEC: 21 CH)' },
  { key: 'max_credit_hours_good_standing', label: 'Max CH (Good Standing ≥ 3.5 CGPA)', hint: 'Exceptional students with CGPA ≥ 3.5 can take overload' },
  { key: 'min_cgpa_for_overload', label: 'Min CGPA for Overload', hint: 'CGPA threshold required to take more than standard max CH', step: 0.01, max: 4.0 },
  { key: 'summer_max_credit_hours', label: 'Max CH (Summer Semester)', hint: 'HEC allows max 9 CH in summer' },
  { key: 'probation_cgpa_threshold', label: 'Probation CGPA Threshold', hint: 'Students below this CGPA are placed on academic probation', step: 0.01, max: 4.0 },
  { key: 'dismissal_cgpa_threshold', label: 'Dismissal CGPA Threshold', hint: 'Students below this CGPA face academic dismissal', step: 0.01, max: 4.0 },
];

const LEVEL_CONFIG = {
  Undergraduate: { color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', icon: '🎓' },
  Postgraduate: { color: '#0891b2', bg: '#e0f2fe', border: '#bae6fd', icon: '📚' },
  PhD: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: '🔬' },
};

export default function RegistrarEnrollmentRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 5000); };

  const fetchRules = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/enrollment-rules`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => { if (d.success) setRules(d.rules || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRules(); }, []);

  const startEdit = (rule) => {
    setEditingId(rule.id);
    setEditForm({ ...rule });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/enrollment-rules/${editForm.id}`, {
        method: 'PUT', headers: hdrs(),
        body: JSON.stringify({
          program_level: editForm.program_level,
          semester_type: editForm.semester_type,
          ...FIELD_META.reduce((acc, f) => ({ ...acc, [f.key]: editForm[f.key] }), {})
        })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Enrollment rules updated successfully!');
        setEditingId(null);
        fetchRules();
      } else {
        showMsg('error', data.message || 'Update failed');
      }
    } catch { showMsg('error', 'Network error. Please try again.'); }
    finally { setSaving(false); }
  };

  // Group by program level
  const grouped = PROGRAM_LEVELS.reduce((acc, level) => {
    acc[level] = rules.filter(r => r.program_level === level && r.semester_type === 'regular');
    return acc;
  }, {});

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading enrollment rules...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
          <div style={{ background: '#eef2ff', borderRadius: '12px', padding: '10px' }}>
            <Scales size={24} color="#4f46e5" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>HEC Enrollment Rules</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Configure credit hour limits, CGPA thresholds, and probation policies per program level</p>
          </div>
        </div>
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 16px', fontSize: '0.8rem', color: '#92400e', marginTop: '12px' }}>
          ⚠ These values are enforced during student enrollment and GPA calculations. Changes apply to the next enrollment cycle.
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: msg.type === 'success' ? '#d1fae5' : '#fee2e2', color: msg.type === 'success' ? '#065f46' : '#991b1b', fontSize: '0.875rem' }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <Warning size={18} />}
          <span style={{ flex: 1 }}>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}><X size={14} /></button>
        </div>
      )}

      {/* Cards per Program Level */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {PROGRAM_LEVELS.map(level => {
          const levelRules = grouped[level];
          const cfg = LEVEL_CONFIG[level];

          if (levelRules.length === 0) return (
            <div key={level} style={{ background: '#f8fafc', borderRadius: '14px', padding: '24px', border: '1px dashed #e2e8f0', color: '#94a3b8', textAlign: 'center' }}>
              {cfg.icon} No rules configured for {level} yet.
            </div>
          );

          return levelRules.map(rule => {
            const isEditing = editingId === rule.id;
            const data = isEditing ? editForm : rule;

            return (
              <div key={rule.id} style={{ background: '#fff', borderRadius: '16px', border: `1px solid ${cfg.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                {/* Card Header */}
                <div style={{ background: cfg.bg, padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${cfg.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{cfg.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: cfg.color }}>{level}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Regular Semester Rules · Campus: {rule.campus_id}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => setEditingId(null)}
                          style={{ padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                          Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving}
                          style={{ padding: '7px 16px', border: 'none', borderRadius: '8px', background: cfg.color, color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.6 : 1 }}>
                          <FloppyDisk size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(rule)}
                        style={{ padding: '7px 16px', border: `1px solid ${cfg.color}`, borderRadius: '8px', background: '#fff', color: cfg.color, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PencilSimple size={14} /> Edit Rules
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields Grid */}
                <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {FIELD_META.map(field => (
                    <div key={field.key} style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {field.label}
                      </div>
                      {isEditing ? (
                        <input
                          type="number"
                          step={field.step || 1}
                          max={field.max}
                          min={0}
                          value={editForm[field.key] ?? ''}
                          onChange={e => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          style={{ width: '100%', padding: '8px 10px', border: `2px solid ${cfg.color}40`, borderRadius: '7px', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', background: '#fff', boxSizing: 'border-box' }}
                        />
                      ) : (
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: cfg.color }}>
                          {data[field.key] ?? '—'}
                          {field.step ? '' : ' CH'}
                        </div>
                      )}
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>{field.hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          });
        })}
      </div>

      {rules.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <Scales size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No enrollment rules found. Run the Phase 2-5 schema to seed default HEC rules.</p>
        </div>
      )}
    </div>
  );
}
