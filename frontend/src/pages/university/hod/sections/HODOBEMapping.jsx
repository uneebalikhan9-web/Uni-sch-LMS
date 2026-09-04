import React, { useState, useEffect } from 'react';
import { HOD_STYLES as S } from './HODStyles';
import API_BASE_URL from '../../../../config/api';
import { Plus, Target, CheckCircle, Brain, BookOpen } from '@phosphor-icons/react';

const HODOBEMapping = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [clos, setClos] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCLOModal, setShowCLOModal] = useState(false);
  const [newCLO, setNewCLO] = useState({
    clo_code: 'CLO-1',
    title: '',
    bloom_level: 'Cognitive-C3 (Apply)',
    description: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const list = data.courses || data.data || [];
          setCourses(list);
          if (list.length > 0) setSelectedCourse(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const fetchOBEData = async (courseId) => {
    if (!courseId) return;
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [cloRes, mapRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/obe/clos/${courseId}`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/obe/mappings/${courseId}`, { headers }).then(r => r.json())
      ]);

      if (cloRes.success) setClos(cloRes.data || []);
      if (mapRes.success) setMappings(mapRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourse) fetchOBEData(selectedCourse);
  }, [selectedCourse]);

  const handleAddCLO = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/obe/clos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newCLO, course_id: selectedCourse })
      });
      const data = await res.json();
      if (data.success) {
        setShowCLOModal(false);
        setNewCLO({ clo_code: `CLO-${clos.length + 2}`, title: '', bloom_level: 'Cognitive-C3 (Apply)', description: '' });
        fetchOBEData(selectedCourse);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Outcome-Based Education (OBE) & CLO-PLO Mapping</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>HEC / PEC compliant Course Learning Outcomes mapped to Program Learning Outcomes</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '12px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: '700', outline: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title || c.name}</option>)}
          </select>
          <button style={S.btnPrimary} onClick={() => setShowCLOModal(true)}>
            <Plus size={18} weight="bold" /> Define CLO
          </button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Target size={22} weight="bold" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Active Course Learning Outcomes (CLOs)</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Bloom's Taxonomy taxonomy mapping for chosen syllabus</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>CLO Code</th>
                <th style={S.th}>Title / Outcome Statement</th>
                <th style={S.th}>Bloom's Domain & Level</th>
                <th style={S.th}>Target Attainment</th>
                <th style={S.th}>Mapped PLO</th>
              </tr>
            </thead>
            <tbody>
              {clos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ ...S.td, textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No CLOs configured for this course yet. Click "+ Define CLO" above to add.
                  </td>
                </tr>
              ) : (
                clos.map((clo) => (
                  <tr key={clo.id}>
                    <td style={S.td}>
                      <span style={{ fontWeight: '800', color: '#4f46e5' }}>{clo.clo_code}</span>
                    </td>
                    <td style={S.td}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{clo.title}</div>
                      {clo.description && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{clo.description}</div>}
                    </td>
                    <td style={S.td}>
                      <span style={S.badge('#eff6ff', '#2563eb')}>{clo.bloom_level || 'Cognitive-C3'}</span>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontWeight: '700', color: '#16a34a' }}>{clo.target_percentage || 65}%</span> passing
                    </td>
                    <td style={S.td}>
                      <span style={S.badge('#f5f3ff', '#7c3aed')}>PLO-1 (Engineering Knowledge)</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLO Modal */}
      {showCLOModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Define Course Learning Outcome (CLO)</h3>
            <form onSubmit={handleAddCLO} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>CLO Identifier</label>
                <input
                  type="text"
                  required
                  value={newCLO.clo_code}
                  onChange={(e) => setNewCLO({ ...newCLO, clo_code: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Learning Outcome Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design object-oriented software architectures..."
                  value={newCLO.title}
                  onChange={(e) => setNewCLO({ ...newCLO, title: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Bloom's Taxonomy Level</label>
                <select
                  value={newCLO.bloom_level}
                  onChange={(e) => setNewCLO({ ...newCLO, bloom_level: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: '600', outline: 'none' }}
                >
                  <option value="Cognitive-C1 (Remember)">Cognitive - C1 (Remember)</option>
                  <option value="Cognitive-C2 (Understand)">Cognitive - C2 (Understand)</option>
                  <option value="Cognitive-C3 (Apply)">Cognitive - C3 (Apply)</option>
                  <option value="Cognitive-C4 (Analyze)">Cognitive - C4 (Analyze)</option>
                  <option value="Cognitive-C5 (Evaluate)">Cognitive - C5 (Evaluate)</option>
                  <option value="Cognitive-C6 (Create)">Cognitive - C6 (Create)</option>
                  <option value="Psychomotor-P3 (Precision)">Psychomotor - P3 (Precision Lab)</option>
                  <option value="Affective-A3 (Valuing)">Affective - A3 (Valuing & Ethics)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowCLOModal(false)} style={{ padding: '12px 20px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
                <button type="submit" style={S.btnPrimary}>
                  Save CLO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODOBEMapping;
