import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SealCheck, MagnifyingGlass, Funnel, Trophy, Users, TrendUp } from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';

const ExamsResults = ({ exams }) => {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (exams && exams.length > 0) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams]);

  useEffect(() => {
    if (!selectedExamId) return;
    fetchResults();
  }, [selectedExamId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/exams/results/${selectedExamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setResults(res.data.results);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics calculation
  const totalStudents = results.length;
  const averageMarks = totalStudents > 0 
    ? (results.reduce((sum, r) => sum + Number(r.marks_obtained || 0), 0) / totalStudents).toFixed(1)
    : 0;
  const highestMarks = totalStudents > 0
    ? Math.max(...results.map(r => Number(r.marks_obtained || 0)))
    : 0;
  const passRate = totalStudents > 0
    ? ((results.filter(r => Number(r.marks_obtained || 0) >= 50).length / totalStudents) * 100).toFixed(0)
    : 0;

  return (
    <div className="animate-fadeIn">
      <div className="ex-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Academic Grade Ledger</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>Review and filter certified student grade sheets.</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Select Exam:</span>
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                fontWeight: 600,
                color: '#0f172a',
                background: '#f8fafc',
                outline: 'none',
                minWidth: '220px'
              }}
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.course_name} - {ex.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>Loading grade ledger...</div>
      ) : (
        <>
          <div className="ex-metrics" style={{ marginBottom: 24 }}>
            <div className="ex-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#f5f3ff', padding: 12, borderRadius: 12, color: '#4f46e5' }}><Users size={24} weight="bold" /></div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', margin: 0 }}>Enrolled Graded</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{totalStudents} Candidates</p>
              </div>
            </div>
            
            <div className="ex-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 12, color: '#10b981' }}><TrendUp size={24} weight="bold" /></div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', margin: 0 }}>Class Average</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{averageMarks} Marks</p>
              </div>
            </div>

            <div className="ex-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#fffbeb', padding: 12, borderRadius: 12, color: '#f59e0b' }}><Trophy size={24} weight="bold" /></div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', margin: 0 }}>Highest Score</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{highestMarks} Marks</p>
              </div>
            </div>

            <div className="ex-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#edf2f7', padding: 12, borderRadius: 12, color: '#4a5568' }}><SealCheck size={24} weight="bold" /></div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', margin: 0 }}>Passing Rate</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{passRate}% Ratio</p>
              </div>
            </div>
          </div>

          <div className="ex-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
                <MagnifyingGlass size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search student or roll number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 42px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ background: 'transparent', border: '1.5px solid #e2e8f0', padding: '10px 16px', borderRadius: 12, fontWeight: 700, color: '#475569', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Funnel size={16} /> Filters
                </button>
              </div>
            </div>

            <div className="ex-table-container">
              <table className="ex-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll Number</th>
                    <th>Marks</th>
                    <th>Grade</th>
                    <th>GPA</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No processed results found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.student_name}</td>
                        <td style={{ fontWeight: 600, color: '#475569' }}>{item.roll_number}</td>
                        <td style={{ fontWeight: 700, color: item.marks_obtained >= 50 ? '#10b981' : '#ef4444' }}>
                          {item.marks_obtained}
                        </td>
                        <td>
                          <span 
                            className={`ex-badge ${item.grade === 'F' ? 'ex-badge-pending' : 'ex-badge-published'}`}
                            style={{ 
                              background: item.grade === 'A' ? '#dcfce7' : item.grade === 'B' ? '#e0f2fe' : item.grade === 'C' ? '#fef3c7' : '#fee2e2',
                              color: item.grade === 'A' ? '#15803d' : item.grade === 'B' ? '#0369a1' : item.grade === 'C' ? '#b45309' : '#b91c1c'
                            }}
                          >
                            {item.grade}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700 }}>{Number(item.gpa).toFixed(2)}</td>
                        <td style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>{item.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamsResults;
