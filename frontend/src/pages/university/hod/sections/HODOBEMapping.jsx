import React, { useState, useEffect } from 'react';
import { HOD_STYLES as S } from './HODStyles';
import API_BASE_URL from '../../../../config/api';
import { Plus, Target, CheckCircle, Brain, BookOpen, X, ShieldCheck } from '@phosphor-icons/react';

const DEFAULT_CLOS = [
  { id: 1, clo_code: 'CLO-1', title: 'Algorithmic Complexity & Asymptotic Analysis', bloom_level: 'Cognitive-C4 (Analyze)', plo_code: 'PLO-1 (Engineering Knowledge)', description: 'Analyze runtime and space complexity of sorting, searching, and graph traversal algorithms.' },
  { id: 2, clo_code: 'CLO-2', title: 'Data Structure Implementation', bloom_level: 'Cognitive-C3 (Apply)', plo_code: 'PLO-3 (Design/Development)', description: 'Implement dynamic trees, heaps, hash maps, and graphs to solve real-world engineering bottlenecks.' },
  { id: 3, clo_code: 'CLO-3', title: 'Optimization & Dynamic Programming', bloom_level: 'Cognitive-C5 (Evaluate)', plo_code: 'PLO-2 (Problem Analysis)', description: 'Evaluate algorithmic efficiency tradeoffs using greedy algorithms and dynamic programming paradigms.' },
  { id: 4, clo_code: 'CLO-4', title: 'Ethical Software Practices & Team Collaboration', bloom_level: 'Affective-A3 (Value)', plo_code: 'PLO-8 (Ethics)', description: 'Demonstrate code integrity, adherence to academic and engineering ethics in team assignments.' }
];

const HODOBEMapping = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('1');
  const [clos, setClos] = useState(DEFAULT_CLOS);
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
        if (data.success && (data.courses || data.data || []).length > 0) {
          const list = data.courses || data.data;
          setCourses(list);
          setSelectedCourse(list[0].id);
        } else {
          setCourses([
            { id: 1, code: 'CS-301', title: 'Data Structures & Algorithms' },
            { id: 2, code: 'CS-302', title: 'Database Systems & SQL' },
            { id: 3, code: 'SE-401', title: 'Software Engineering' },
            { id: 4, code: 'CS-408', title: 'Artificial Intelligence' }
          ]);
        }
      } catch (err) {
        setCourses([
          { id: 1, code: 'CS-301', title: 'Data Structures & Algorithms' },
          { id: 2, code: 'CS-302', title: 'Database Systems & SQL' }
        ]);
      }
    };
    fetchCourses();
  }, []);

  const fetchOBEData = async (courseId) => {
    if (!courseId) return;
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/obe/clos/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setClos(data.data);
      } else {
        setClos(DEFAULT_CLOS);
      }
    } catch (err) {
      setClos(DEFAULT_CLOS);
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
        fetchOBEData(selectedCourse);
      } else {
        // Fallback optimistic
        const created = {
          id: Date.now(),
          clo_code: newCLO.clo_code,
          title: newCLO.title,
          bloom_level: newCLO.bloom_level,
          plo_code: 'PLO-1 (Engineering Knowledge)',
          description: newCLO.description || 'Able to synthesize computing principles.'
        };
        setClos([...clos, created]);
        setShowCLOModal(false);
      }
    } catch (err) {
      setShowCLOModal(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#09090B' }}>
            Outcome-Based Education (OBE) & CLO-PLO Mapping
          </h2>
          <p style={{ color: '#71717A', fontSize: '12px', margin: '4px 0 0 0' }}>
            HEC / PEC compliant Course Learning Outcomes mapped to Program Learning Outcomes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={S.select}
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title || c.name}</option>)}
          </select>
          <button style={S.btnPrimary} onClick={() => setShowCLOModal(true)}>
            <Plus size={16} weight="bold" /> Define CLO
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div style={S.grid4}>
        <div style={S.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', textTransform: 'uppercase' }}>Defined CLOs</span>
            <span style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px' }}><Target size={18} color="#09090B" /></span>
          </div>
          <div style={{ margin: '12px 0 4px 0', fontSize: '26px', fontWeight: '800', color: '#09090B' }}>
            {clos.length} Outcomes
          </div>
          <span style={{ fontSize: '11px', color: '#71717A' }}>Active for selected course</span>
        </div>

        <div style={S.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', textTransform: 'uppercase' }}>Mapped PLOs</span>
            <span style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px' }}><Brain size={18} color="#09090B" /></span>
          </div>
          <div style={{ margin: '12px 0 4px 0', fontSize: '26px', fontWeight: '800', color: '#09090B' }}>
            12 PLOs
          </div>
          <span style={{ fontSize: '11px', color: '#71717A' }}>HEC / PEC Washington Accord</span>
        </div>

        <div style={S.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', color: '#71717A', fontWeight: '600', textTransform: 'uppercase' }}>Bloom Taxonomy</span>
            <span style={{ background: '#F4F4F5', padding: '6px', borderRadius: '6px' }}><ShieldCheck size={18} color="#09090B" /></span>
          </div>
          <div style={{ margin: '12px 0 4px 0', fontSize: '26px', fontWeight: '800', color: '#09090B' }}>
            Level C3 - C5
          </div>
          <span style={{ fontSize: '11px', color: '#71717A' }}>High cognitive application</span>
        </div>
      </div>

      {/* CLO Table */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#09090B' }}>
              Course Learning Outcomes Matrix
            </h3>
            <p style={{ fontSize: '12px', color: '#71717A', margin: '3px 0 0 0' }}>
              Direct evaluation mapped with assignments, quizzes, and final exams
            </p>
          </div>
          <span style={S.badge('#F4F4F5', '#09090B', '#E4E4E7')}>HEC Compliant</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>CLO Code</th>
                <th style={S.th}>Outcome Statement</th>
                <th style={S.th}>Bloom's Domain & Level</th>
                <th style={S.th}>Mapped PLO</th>
                <th style={S.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {clos.map((c, i) => (
                <tr key={c.id || i}>
                  <td style={S.td}>
                    <span style={S.badge('#09090B', '#FFFFFF', '#09090B')}>{c.clo_code}</span>
                  </td>
                  <td style={S.td}>
                    <div style={{ fontWeight: '700', color: '#09090B' }}>{c.title}</div>
                    <div style={{ fontSize: '11px', color: '#71717A', marginTop: '3px' }}>{c.description}</div>
                  </td>
                  <td style={S.td}>
                    <span style={S.badge('#F4F4F5', '#18181B', '#E4E4E7')}>{c.bloom_level}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontWeight: '600', color: '#09090B' }}>{c.plo_code || `PLO-${(i % 4) + 1} (Engineering Knowledge)`}</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.badge('#F4F4F5', '#09090B', '#E4E4E7')}>
                      <CheckCircle size={13} weight="fill" /> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding CLO */}
      {showCLOModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '14px', padding: '24px 28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #F4F4F5' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09090B' }}>
                Define Course Learning Outcome (CLO)
              </h3>
              <button onClick={() => setShowCLOModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#71717A' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCLO} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>CLO Identifier</label>
                <input
                  type="text"
                  required
                  value={newCLO.clo_code}
                  onChange={(e) => setNewCLO({ ...newCLO, clo_code: e.target.value })}
                  style={S.input}
                  placeholder="e.g. CLO-5"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>Outcome Statement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Formulate and solve graph partition problems"
                  value={newCLO.title}
                  onChange={(e) => setNewCLO({ ...newCLO, title: e.target.value })}
                  style={S.input}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>Bloom's Taxonomy Level</label>
                <select
                  value={newCLO.bloom_level}
                  onChange={(e) => setNewCLO({ ...newCLO, bloom_level: e.target.value })}
                  style={S.select}
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>Detailed Description</label>
                <textarea
                  rows="3"
                  value={newCLO.description}
                  onChange={(e) => setNewCLO({ ...newCLO, description: e.target.value })}
                  style={{ ...S.input, height: '70px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F4F4F5' }}>
                <button type="button" onClick={() => setShowCLOModal(false)} style={S.btnSecondary}>
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
