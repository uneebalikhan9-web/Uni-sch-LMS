import React, { useState, useEffect } from 'react';
import { ChalkboardTeacher, Warning, ArrowClockwise, CaretDown, CaretUp } from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';

const hdrs = () => ({ Authorization: `Bearer ${sessionStorage.getItem('token')}` });

function WorkloadBadge({ status }) {
  return status === 'OVERLOADED'
    ? <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#fee2e2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Warning size={12} />OVERLOADED</span>
    : <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#d1fae5', color: '#065f46', fontSize: '0.72rem', fontWeight: 700 }}>✓ OK</span>;
}

export default function RegistrarTeacherWorkload() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTeacher, setExpandedTeacher] = useState(null);
  const [teacherSections, setTeacherSections] = useState({});
  const [loadingSections, setLoadingSections] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/semesters`, { headers: hdrs() })
      .then(r => r.json()).then(d => {
        if (d.success) {
          setSemesters(d.semesters || []);
          const active = (d.semesters || []).find(s => s.status === 'active') || d.semesters?.[0];
          if (active) setSelectedSemester(String(active.id));
        }
      });
  }, []);

  const fetchWorkload = () => {
    if (!selectedSemester) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/teacher-workload/workload-summary?semester_id=${selectedSemester}`, { headers: hdrs() })
      .then(r => r.json()).then(d => {
        if (d.success) setWorkload(d.workload || []);
      }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWorkload(); }, [selectedSemester]);

  const toggleTeacher = async (teacherId) => {
    if (expandedTeacher === teacherId) { setExpandedTeacher(null); return; }
    setExpandedTeacher(teacherId);
    if (teacherSections[teacherId]) return;
    setLoadingSections(true);
    fetch(`${API_BASE_URL}/api/teacher-workload/section-assignments/${teacherId}`, { headers: hdrs() })
      .then(r => r.json()).then(d => {
        if (d.success) setTeacherSections(prev => ({ ...prev, [teacherId]: d.assignments || [] }));
      }).finally(() => setLoadingSections(false));
  };

  // Summary stats
  const totalOverloaded = workload.filter(w => w.workload_status === 'OVERLOADED').length;
  const avgCH = workload.length > 0 ? (workload.reduce((s, w) => s + parseFloat(w.total_credit_hours || 0), 0) / workload.length).toFixed(1) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#f5f3ff', borderRadius: '12px', padding: '10px' }}>
            <ChalkboardTeacher size={24} color="#7c3aed" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Teacher Workload Monitor</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Track credit hours assigned per teacher and detect overloads</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', background: '#fff' }}>
            <option value="">Select Semester</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={fetchWorkload}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
            <ArrowClockwise size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {workload.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total Teachers', value: workload.length, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Avg Credit Hours', value: `${avgCH} CH`, color: '#0891b2', bg: '#e0f2fe' },
            { label: 'Overloaded', value: totalOverloaded, color: '#ef4444', bg: '#fee2e2' },
            { label: 'In Good Standing', value: workload.length - totalOverloaded, color: '#10b981', bg: '#d1fae5' },
          ].map((c, i) => (
            <div key={i} style={{ background: c.bg, borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>{c.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Overload Warning Banner */}
      {totalOverloaded > 0 && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#991b1b', fontSize: '0.85rem' }}>
          <Warning size={18} weight="fill" />
          <strong>{totalOverloaded} teacher(s) are overloaded</strong> — exceeding max credit hours per semester. Please review and reassign sections.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading workload data...</div>
      ) : workload.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <ChalkboardTeacher size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
          <p>No teacher workload data for this semester. Select an active semester.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Teacher', 'Email', 'Employment', 'Sections', 'Total CH', 'Max Allowed', 'Utilization', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workload.map(w => {
                const isOver = w.workload_status === 'OVERLOADED';
                const pct = w.max_allowed > 0 ? Math.round((w.total_credit_hours / w.max_allowed) * 100) : 0;
                const barColor = pct > 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';
                const isExpanded = expandedTeacher === w.teacher_id;

                return (
                  <React.Fragment key={w.teacher_id}>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: isOver ? '#fff5f5' : 'white' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>{w.teacher_name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.78rem' }}>{w.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'capitalize' }}>
                          {w.employment_type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#6366f1' }}>{w.sections_assigned}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: isOver ? '#ef4444' : '#1e293b' }}>{w.total_credit_hours}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>{w.max_allowed || '—'}</td>
                      <td style={{ padding: '12px 16px', minWidth: '120px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor, borderRadius: '4px' }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: barColor, minWidth: '32px' }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}><WorkloadBadge status={w.workload_status} /></td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => toggleTeacher(w.teacher_id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: isExpanded ? '#f5f3ff' : '#fff', color: isExpanded ? '#7c3aed' : '#475569', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                          {isExpanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
                          Sections
                        </button>
                      </td>
                    </tr>
                    {/* Expanded: Teacher's Sections */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} style={{ padding: '0', background: '#fafbff' }}>
                          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
                            {loadingSections && !teacherSections[w.teacher_id] ? (
                              <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '8px 0' }}>Loading sections...</div>
                            ) : (teacherSections[w.teacher_id] || []).length === 0 ? (
                              <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '8px 0' }}>No sections assigned for this semester.</div>
                            ) : (
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {(teacherSections[w.teacher_id] || []).map(sec => (
                                  <div key={sec.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', fontSize: '0.78rem' }}>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{sec.course_title || `Section ${sec.section_id}`}</div>
                                    <div style={{ color: '#64748b', marginTop: '2px' }}>Role: <strong style={{ textTransform: 'capitalize' }}>{sec.role}</strong></div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
