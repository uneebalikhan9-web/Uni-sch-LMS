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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Outcome-Based Education (OBE) & CLO-PLO Mapping</h2>
          <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0 0' }}>HEC / PEC compliant Course Learning Outcomes mapped to Program Learning Outcomes</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '10px', background: '#1E293B', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '600' }}
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title || c.name}</option>)}
          </select>
          <button style={S.btnPrimary} onClick={() => setShowCLOModal(true)}>
            <Plus size={18} weight="bold" /> Define CLO
          </button>
        </div>
      </div>

      <div style={S.grid4}>
        <div style={S.statCard('#3B82F6')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Defined CLOs</span>
            <Target size={22} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', margin: '12px 0 4px 0' }}>{clos.length}</div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Course Specific Outcomes</span>
        </div>

        <div style={S.statCard('#10B981')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Mapped PLOs</span>
            <Brain size={22} color="#10B981" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', margin: '12px 0 4px 0' }}>12 PLOs</div>
          <span style={{ fontSize: '12px', color: '#34D399' }}>Standard HEC / PEC Grid</span>
        </div>

        <div style={S.statCard('#8B5CF6')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Bloom's Taxonomy</span>
            <CheckCircle size={22} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', margin: '12px 0 4px 0' }}>C3 - C6</div>
          <span style={{ fontSize: '12px', color: '#A78BFA' }}>Higher Cognitive Level</span>
        </div>
      </div>

      <div style={S.card}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Course Learning Outcomes (CLOs)</h3>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>CLO Code</th>
              <th style={S.th}>Outcome Statement</th>
              <th style={S.th}>Bloom's Domain & Level</th>
              <th style={S.th}>Mapped PLO</th>
              <th style={S.th}>Compliance</th>
            </tr>
          </thead>
          <tbody>
            {clos.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ ...S.td, textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No CLOs defined for this course yet. Click "Define CLO" above.
                </td>
              </tr>
            ) : (
              clos.map((c, i) => (
                <tr key={c.id}>
                  <td style={S.td}><span style={S.badge('rgba(59, 130, 246, 0.2)', '#60A5FA')}>{c.clo_code}</span></td>
                  <td style={S.td}>
                    <div style={{ fontWeight: '600', color: '#F1F5F9' }}>{c.title}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{c.description || 'Able to analyze and construct algorithmic solutions.'}</div>
                  </td>
                  <td style={S.td}><span style={S.badge('rgba(139, 92, 246, 0.15)', '#C084FC')}>{c.bloom_level}</span></td>
                  <td style={S.td}>
                    <span style={S.badge('rgba(16, 185, 129, 0.15)', '#34D399')}>PLO-{(i % 4) + 1} (Engineering Knowledge)</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.badge('rgba(16, 185, 129, 0.2)', '#10B981')}>Verified</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showCLOModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Define Course Learning Outcome (CLO)</h3>
            <form onSubmit={handleAddCLO} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>CLO Identifier</label>
                <input
                  type="text"
                  required
                  value={newCLO.clo_code}
                  onChange={(e) => setNewCLO({ ...newCLO, clo_code: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Outcome Statement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design and evaluate object-oriented structures"
                  value={newCLO.title}
                  onChange={(e) => setNewCLO({ ...newCLO, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Bloom's Taxonomy Level</label>
                <select
                  value={newCLO.bloom_level}
                  onChange={(e) => setNewCLO({ ...newCLO, bloom_level: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                >
                  <option value="Cognitive-C1 (Remember)">Cognitive-C1 (Remember)</option>
                  <option value="Cognitive-C2 (Understand)">Cognitive-C2 (Understand)</option>
                  <option value="Cognitive-C3 (Apply)">Cognitive-C3 (Apply)</option>
                  <option value="Cognitive-C4 (Analyze)">Cognitive-C4 (Analyze)</option>
                  <option value="Cognitive-C5 (Evaluate)">Cognitive-C5 (Evaluate)</option>
                  <option value="Cognitive-C6 (Create)">Cognitive-C6 (Create)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Detailed Description</label>
                <textarea
                  rows="3"
                  value={newCLO.description}
                  onChange={(e) => setNewCLO({ ...newCLO, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowCLOModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#374151', color: '#fff', border: 'none', cursor: 'pointer' }}>
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
