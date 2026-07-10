import React, { useState, useEffect } from 'react';
import {
  BookOpen, ClipboardText, Clock, Student, Buildings,
  CheckCircle, Warning, X, CaretDown, CaretUp, MagnifyingGlass,
  ArrowClockwise, Queue, ListChecks, ChalkboardTeacher, Users
} from "@phosphor-icons/react";
import { S } from './SDStyles';
import API_BASE_URL from '../../../config/api';

const API = `${API_BASE_URL}/api`;

function CreditBar({ used, min, max }) {
  const pct = Math.min((used / max) * 100, 100);
  const color = used < min ? '#f59e0b' : used > max ? '#ef4444' : '#10b981';
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
        <span>Credit Hours: <strong style={{ color }}>{used} CH</strong></span>
        <span>HEC Limit: {min}–{max} CH</span>
      </div>
      <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '6px', transition: 'width 0.5s ease' }} />
      </div>
      {used < min && <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '4px' }}>⚠ Below minimum credit hours</div>}
      {used > max && <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px' }}>⛔ Exceeds maximum credit hours</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    enrolled: { bg: '#d1fae5', color: '#065f46', label: 'Enrolled' },
    waitlisted: { bg: '#fef3c7', color: '#92400e', label: 'Waitlisted' },
    dropped: { bg: '#fee2e2', color: '#991b1b', label: 'Dropped' },
    open: { bg: '#dbeafe', color: '#1d4ed8', label: 'Open' },
    full: { bg: '#fee2e2', color: '#991b1b', label: 'Full' },
    waitlist: { bg: '#fef3c7', color: '#92400e', label: 'Waitlist Open' },
  };
  const c = cfg[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
  return (
    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function SDRegistration() {
  const token = sessionStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState('my-enrollments');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [sections, setSections] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [search, setSearch] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);
  const [droppingId, setDroppingId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load semesters
  useEffect(() => {
    fetch(`${API}/semesters`, { headers }).then(r => r.json()).then(d => {
      if (d.success) {
        setSemesters(d.semesters || []);
        // Auto-select active/latest semester
        const active = (d.semesters || []).find(s => s.status === 'active') || (d.semesters || [])[0];
        if (active) setSelectedSemester(String(active.id));
      }
    });
  }, []);

  // Load my enrollments
  const fetchEnrollments = () => {
    if (!selectedSemester) return;
    fetch(`${API}/enrollment/my-enrollments?semester_id=${selectedSemester}`, { headers })
      .then(r => r.json()).then(d => {
        if (d.success) {
          setEnrollments(d.enrollments || []);
          setTotalCredits(d.total_enrolled_credits || 0);
        }
      });
  };

  // Load available sections
  const fetchSections = () => {
    if (!selectedSemester) return;
    setLoading(true);
    fetch(`${API}/enrollment/available-sections?semester_id=${selectedSemester}`, { headers })
      .then(r => r.json()).then(d => {
        if (d.success) setSections(d.sections || []);
      }).finally(() => setLoading(false));
  };

  // Load waitlist
  const fetchWaitlist = () => {
    fetch(`${API}/enrollment/my-waitlist`, { headers })
      .then(r => r.json()).then(d => {
        if (d.success) setWaitlist(d.waitlist || []);
      });
  };

  useEffect(() => {
    if (selectedSemester) {
      fetchEnrollments();
      fetchSections();
      fetchWaitlist();
    }
  }, [selectedSemester]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 5000);
  };

  const handleEnroll = async (sectionId) => {
    setEnrollingId(sectionId);
    try {
      const res = await fetch(`${API}/enrollment/enroll`, {
        method: 'POST', headers,
        body: JSON.stringify({ section_id: sectionId })
      });
      const data = await res.json();
      if (data.success) {
        if (data.waitlisted) {
          showMsg('warning', `Section full — you're #${data.position} on the waitlist!`);
        } else {
          showMsg('success', 'Enrolled successfully!');
        }
        fetchEnrollments();
        fetchSections();
        fetchWaitlist();
      } else {
        showMsg('error', data.message || 'Enrollment failed');
      }
    } catch { showMsg('error', 'Network error. Please try again.'); }
    finally { setEnrollingId(null); }
  };

  const handleDrop = async (enrollmentId, courseTitle) => {
    if (!window.confirm(`Drop "${courseTitle}"? This cannot be undone easily.`)) return;
    setDroppingId(enrollmentId);
    try {
      const res = await fetch(`${API}/enrollment/drop/${enrollmentId}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ reason: 'Student request' })
      });
      const data = await res.json();
      if (data.success) {
        showMsg('success', 'Course dropped successfully.');
        fetchEnrollments();
        fetchSections();
        fetchWaitlist();
      } else {
        showMsg('error', data.message || 'Drop failed');
      }
    } catch { showMsg('error', 'Network error.'); }
    finally { setDroppingId(null); }
  };

  const filteredSections = sections.filter(s =>
    !search ||
    s.course_title?.toLowerCase().includes(search.toLowerCase()) ||
    s.course_code?.toLowerCase().includes(search.toLowerCase()) ||
    s.teacher_name?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'my-enrollments', label: 'My Enrollments', icon: <ListChecks size={16} /> },
    { id: 'browse', label: 'Browse Sections', icon: <MagnifyingGlass size={16} /> },
    { id: 'waitlist', label: `My Waitlist${waitlist.length > 0 ? ` (${waitlist.length})` : ''}`, icon: <Queue size={16} /> },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ ...S.sectionTitle, marginBottom: '4px' }}>
          <BookOpen size={28} weight="duotone" color="var(--primary-color, #4f46e5)" style={{ verticalAlign: 'middle', marginRight: '12px' }} />
          Course Registration
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
          Enroll in course sections, manage your schedule, and view your waitlist positions.
        </p>
      </div>

      {/* Semester Selector */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select
          style={{ ...S.modernSelect, minWidth: '220px' }}
          value={selectedSemester}
          onChange={e => setSelectedSemester(e.target.value)}>
          <option value="">Select Semester</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} {s.status === 'active' ? '(Active)' : ''}
            </option>
          ))}
        </select>
        <button
          onClick={() => { fetchEnrollments(); fetchSections(); fetchWaitlist(); }}
          style={{ ...S.iconBtn, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
          <ArrowClockwise size={16} /> Refresh
        </button>

        {/* Credit Bar Summary */}
        {activeTab === 'my-enrollments' && enrollments.filter(e => e.status === 'enrolled').length > 0 && (
          <div style={{ flex: 1, minWidth: '260px' }}>
            <CreditBar used={totalCredits} min={9} max={21} />
          </div>
        )}
      </div>

      {/* Alert Message */}
      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px',
          background: msg.type === 'success' ? '#d1fae5' : msg.type === 'warning' ? '#fef3c7' : '#fee2e2',
          color: msg.type === 'success' ? '#065f46' : msg.type === 'warning' ? '#92400e' : '#991b1b',
          fontSize: '0.875rem', fontWeight: 500
        }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <Warning size={18} />}
          <span style={{ flex: 1 }}>{msg.text}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}><X size={14} /></button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 18px', border: 'none', cursor: 'pointer',
            background: 'none', fontWeight: activeTab === tab.id ? 700 : 500,
            fontSize: '0.85rem', color: activeTab === tab.id ? 'var(--primary-color, #4f46e5)' : '#64748b',
            borderBottom: activeTab === tab.id ? '2px solid var(--primary-color, #4f46e5)' : '2px solid transparent',
            marginBottom: '-2px', transition: 'all 0.2s'
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════ TAB 1: MY ENROLLMENTS ═══════════ */}
      {activeTab === 'my-enrollments' && (
        <div>
          {enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <ClipboardText size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ fontSize: '1rem', marginBottom: '4px' }}>No enrollments for this semester</p>
              <p style={{ fontSize: '0.8rem' }}>Go to "Browse Sections" to enroll in courses</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {enrollments.map(e => (
                <div key={e.id} style={{
                  background: '#fff', borderRadius: '12px', padding: '18px 20px',
                  border: `1px solid ${e.status === 'enrolled' ? '#e2e8f0' : e.status === 'dropped' ? '#fee2e2' : '#fef3c7'}`,
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>{e.course_title}</span>
                      <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, background: '#eef2ff', padding: '2px 8px', borderRadius: '6px' }}>{e.course_code}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span>Section {e.section_label}</span>
                      <span>{e.credit_hours} Credit Hours</span>
                      {e.teacher_name && <span>👤 {e.teacher_name}</span>}
                      {e.schedule && <span>🕐 {e.schedule}</span>}
                    </div>
                  </div>
                  {e.status === 'enrolled' && (
                    <button
                      onClick={() => handleDrop(e.id, e.course_title)}
                      disabled={droppingId === e.id}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #ef4444',
                        color: '#ef4444', background: '#fff', cursor: 'pointer', fontSize: '0.78rem',
                        fontWeight: 600, whiteSpace: 'nowrap',
                        opacity: droppingId === e.id ? 0.5 : 1
                      }}>
                      {droppingId === e.id ? 'Dropping...' : 'Drop Course'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TAB 2: BROWSE SECTIONS ═══════════ */}
      {activeTab === 'browse' && (
        <div>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '420px' }}>
            <MagnifyingGlass size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search course name, code, or teacher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...S.modernSelect, paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading sections...</div>
          ) : filteredSections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <Buildings size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p>{selectedSemester ? 'No open sections found for this semester.' : 'Select a semester to browse sections.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredSections.map(sec => {
                const fillPct = Math.round((sec.current_enrolled / sec.max_capacity) * 100);
                const isEnrolled = sec.already_enrolled;
                const onWait = sec.on_waitlist;
                const isFull = sec.status === 'full';

                return (
                  <div key={sec.section_id} style={{
                    background: '#fff', borderRadius: '16px', padding: '24px',
                    border: isEnrolled ? '2px solid #10b981' : '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    opacity: sec.status === 'closed' || sec.status === 'cancelled' ? 0.5 : 1,
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    {/* Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.3px' }}>{sec.course_title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700, display: 'inline-block', padding: '4px 10px', background: '#eef2ff', borderRadius: '6px' }}>{sec.course_code} · Sec {sec.section_label}</div>
                      </div>
                      <StatusBadge status={sec.status} />
                    </div>

                    {/* Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} weight="duotone" color="#64748b" /> {sec.credit_hours} CH · {sec.course_type || 'Theory'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sec.teacher_name || 'TBD'}><ChalkboardTeacher size={16} weight="duotone" color="#64748b" /> {sec.teacher_name || 'TBD'}</span>
                      {sec.schedule && <span style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} weight="duotone" color="#64748b" /> {sec.schedule}</span>}
                    </div>

                    {/* Capacity Bar */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} weight="bold" /> {sec.current_enrolled}/{sec.max_capacity} Enrolled</span>
                        <span style={{ color: fillPct >= 100 ? '#ef4444' : fillPct >= 80 ? '#f59e0b' : '#10b981' }}>{fillPct}% Full</span>
                      </div>
                      <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${fillPct}%`, height: '100%', borderRadius: '6px', background: fillPct >= 100 ? 'linear-gradient(90deg, #f87171, #ef4444)' : fillPct >= 80 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #34d399, #10b981)', transition: 'width 0.5s ease-out' }} />
                      </div>
                      {isFull && sec.waitlist_count > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Queue size={14} weight="bold" /> Waitlist: {sec.waitlist_count}/{sec.waitlist_capacity}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div style={{ marginTop: 'auto' }}>
                      {isEnrolled ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                          <CheckCircle size={20} weight="fill" /> Already Enrolled
                        </div>
                      ) : onWait ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, padding: '12px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                          <Queue size={20} weight="fill" /> On Waitlist
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnroll(sec.section_id)}
                          disabled={enrollingId === sec.section_id || sec.status === 'closed'}
                          style={{
                            width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: sec.status === 'closed' ? 'not-allowed' : 'pointer',
                            fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            background: isFull ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #4f46e5, #4338ca)',
                            color: '#fff',
                            boxShadow: isFull ? '0 4px 12px rgba(245,158,11,0.25)' : '0 4px 12px rgba(79,70,229,0.25)',
                            opacity: enrollingId === sec.section_id ? 0.7 : 1
                          }}>
                          {enrollingId === sec.section_id ? (
                            <><ArrowClockwise size={18} className="spin" /> Processing...</>
                          ) : isFull ? (
                            <><Queue size={18} weight="bold" /> Join Waitlist</>
                          ) : (
                            <><CheckCircle size={18} weight="bold" /> Enroll Now</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TAB 3: MY WAITLIST ═══════════ */}
      {activeTab === 'waitlist' && (
        <div>
          {waitlist.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <Queue size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p>You are not on any waitlists</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {waitlist.map(w => (
                <div key={w.id} style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '4px' }}>{w.course_title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {w.course_code} · Section {w.section_label} · {w.credit_hours} CH · 👤 {w.teacher_name || 'TBD'} · {w.semester_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                      Waitlisted: {new Date(w.waitlisted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#fef3c7', borderRadius: '12px', padding: '10px 18px', minWidth: '80px' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#92400e', lineHeight: 1 }}>#{w.position}</div>
                    <div style={{ fontSize: '0.65rem', color: '#b45309', fontWeight: 600, marginTop: '2px' }}>POSITION</div>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
                You will be automatically enrolled when a spot opens up.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
