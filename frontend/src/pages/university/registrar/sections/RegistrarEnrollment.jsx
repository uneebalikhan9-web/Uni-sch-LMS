import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../../config/api';
import {
  Student, MagnifyingGlass, CheckCircle, X, Warning,
  ArrowClockwise, UserPlus, Eye, Trash
} from '@phosphor-icons/react';

const token = () => sessionStorage.getItem('token');
const hdrs = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

function StatusBadge({ status }) {
  const cfg = {
    enrolled: { bg: '#d1fae5', color: '#065f46' },
    waitlisted: { bg: '#fef3c7', color: '#92400e' },
    dropped: { bg: '#fee2e2', color: '#991b1b' },
    completed: { bg: '#dbeafe', color: '#1d4ed8' },
    failed: { bg: '#fce7f3', color: '#9d174d' },
  };
  const c = cfg[status] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: c.bg, color: c.color, textTransform: 'capitalize' }}>
      {status}
    </span>
  );
}

function SectionOccupancyCard({ section }) {
  const pct = section.max_capacity > 0 ? Math.round((section.current_enrolled / section.max_capacity) * 100) : 0;
  const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{section.course_title}</div>
          <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600 }}>{section.course_code} · Sec {section.section_label}</div>
        </div>
        <StatusBadge status={section.status} />
      </div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
        Teacher: {section.teacher_name || 'TBD'} · {section.semester_name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>
        <span>{section.current_enrolled}/{section.max_capacity} enrolled</span>
        {section.waitlist_count > 0 && <span>Waitlist: {section.waitlist_count}</span>}
        <span style={{ fontWeight: 700, color: barColor }}>{pct}%</span>
      </div>
      <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function RegistrarEnrollment() {
  const [activeTab, setActiveTab] = useState('occupancy');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [sections, setSections] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Admin Enroll Modal State
  const [adminModal, setAdminModal] = useState(false);
  const [adminStudentId, setAdminStudentId] = useState('');
  const [adminSectionId, setAdminSectionId] = useState('');
  const [adminType, setAdminType] = useState('regular');
  const [adminSaving, setAdminSaving] = useState(false);

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 5000); };

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/semesters`, { headers: hdrs() }).then(r => {
      if (r.data.success) {
        setSemesters(r.data.semesters || []);
        const active = (r.data.semesters || []).find(s => s.status === 'active') || r.data.semesters?.[0];
        if (active) setSelectedSemester(String(active.id));
      }
    });
  }, []);

  // Load sections from vw_section_occupancy via registrar
  const fetchSections = () => {
    if (!selectedSemester) return;
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/course-sections?semester_id=${selectedSemester}`, { headers: hdrs() })
      .then(r => {
        if (r.data.success) setSections(r.data.courseSections || []);
      }).finally(() => setLoading(false));
  };

  const fetchEnrollments = () => {
    if (!selectedSemester) return;
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/enrollment/semester/${selectedSemester}`, { headers: hdrs() })
      .then(r => {
        if (r.data.success) {
          setEnrollments(r.data.enrollments || []);
          setSummary(r.data.summary || {});
        }
      }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedSemester) { fetchSections(); fetchEnrollments(); }
  }, [selectedSemester]);

  const handleAdminDrop = async (enrollmentId, studentName) => {
    if (!window.confirm(`Drop enrollment for ${studentName}? Waitlist will be promoted.`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/enrollment/drop/${enrollmentId}`, {
        method: 'PUT', headers: hdrs(),
        body: JSON.stringify({ reason: 'Registrar admin drop' })
      });
      const data = await res.json();
      if (data.success) { showMsg('success', 'Enrollment dropped.'); fetchEnrollments(); fetchSections(); }
      else showMsg('error', data.message);
    } catch { showMsg('error', 'Network error'); }
  };

  const handleAdminEnroll = async () => {
    if (!adminStudentId || !adminSectionId) return showMsg('error', 'Student ID and Section ID are required');
    setAdminSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/enrollment/admin-enroll`, {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({ student_id: parseInt(adminStudentId), section_id: parseInt(adminSectionId), enrollment_type: adminType, override_validation: true })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Student enrolled successfully!');
        setAdminModal(false); setAdminStudentId(''); setAdminSectionId('');
        fetchEnrollments(); fetchSections();
      } else { showMsg('error', data.message); }
    } catch { showMsg('error', 'Network error'); }
    finally { setAdminSaving(false); }
  };

  const filteredEnrollments = enrollments.filter(e =>
    !search ||
    e.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.roll_number?.toLowerCase().includes(search.toLowerCase()) ||
    e.course_title?.toLowerCase().includes(search.toLowerCase()) ||
    e.course_code?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'occupancy', label: 'Section Occupancy' },
    { id: 'enrollments', label: `All Enrollments${summary.total ? ` (${summary.total})` : ''}` },
    { id: 'admin-enroll', label: 'Manual Enroll' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Enrollment Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>Monitor section occupancy, manage enrollments, and manually enroll students</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#1e293b', background: '#fff' }}
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}>
            <option value="">Select Semester</option>
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => { fetchSections(); fetchEnrollments(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
            <ArrowClockwise size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary.total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total Enrollments', value: summary.total, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Active (Enrolled)', value: summary.enrolled, color: '#10b981', bg: '#d1fae5' },
            { label: 'Waitlisted', value: summary.waitlisted, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Dropped', value: summary.dropped, color: '#ef4444', bg: '#fee2e2' },
          ].map((c, i) => (
            <div key={i} style={{ background: c.bg, borderRadius: '10px', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>{c.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.value ?? 0}</div>
            </div>
          ))}
        </div>
      )}

      {/* Message */}
      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', background: msg.type === 'success' ? '#d1fae5' : '#fee2e2', color: msg.type === 'success' ? '#065f46' : '#991b1b', fontSize: '0.875rem' }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <Warning size={18} />}
          <span style={{ flex: 1 }}>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}><X size={14} /></button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: activeTab === t.id ? 700 : 500, fontSize: '0.85rem',
            color: activeTab === t.id ? '#4f46e5' : '#64748b',
            borderBottom: activeTab === t.id ? '2px solid #4f46e5' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>}

      {/* TAB: Section Occupancy */}
      {!loading && activeTab === 'occupancy' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {sections.length === 0
            ? <p style={{ color: '#94a3b8', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No sections found. Select a semester.</p>
            : sections.map(s => <SectionOccupancyCard key={s.id} section={s} />)
          }
        </div>
      )}

      {/* TAB: All Enrollments */}
      {!loading && activeTab === 'enrollments' && (
        <div>
          <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '380px' }}>
            <MagnifyingGlass size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Search student, roll no, or course..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Student', 'Roll No', 'Course', 'Section', 'CH', 'Type', 'Status', 'Enrolled At', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.72rem', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{e.student_name}</td>
                    <td style={{ padding: '10px 14px', color: '#6366f1', fontWeight: 600, fontSize: '0.75rem' }}>{e.roll_number}</td>
                    <td style={{ padding: '10px 14px', color: '#334155' }}>{e.course_title} <span style={{ color: '#94a3b8' }}>({e.course_code})</span></td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>Sec {e.section_label}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>{e.credit_hours}</td>
                    <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{e.enrollment_type}</td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge status={e.status} /></td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8', fontSize: '0.72rem' }}>{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      {e.status === 'enrolled' && (
                        <button onClick={() => handleAdminDrop(e.id, e.student_name)}
                          style={{ padding: '4px 10px', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', background: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                          Drop
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredEnrollments.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No enrollments found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Manual Enroll */}
      {!loading && activeTab === 'admin-enroll' && (
        <div style={{ maxWidth: '560px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#eef2ff', borderRadius: '10px', padding: '10px' }}>
                <UserPlus size={22} color="#4f46e5" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a' }}>Admin Manual Enrollment</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Override rules and manually enroll a student into a section</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Student ID *</label>
                <input type="number" placeholder="Enter student database ID"
                  value={adminStudentId} onChange={e => setAdminStudentId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Section ID *</label>
                <input type="number" placeholder="Enter section ID"
                  value={adminSectionId} onChange={e => setAdminSectionId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '6px' }}>Enrollment Type</label>
                <select value={adminType} onChange={e => setAdminType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', background: '#fff' }}>
                  {['regular', 'repeat', 'improvement', 'audit', 'transfer'].map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', fontSize: '0.8rem', color: '#92400e' }}>
                ⚠ This bypasses prerequisite and credit hour validation. Use with care.
              </div>
              <button onClick={handleAdminEnroll} disabled={adminSaving || !adminStudentId || !adminSectionId}
                style={{ padding: '12px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: adminSaving || !adminStudentId || !adminSectionId ? 0.6 : 1 }}>
                {adminSaving ? 'Enrolling...' : 'Enroll Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
