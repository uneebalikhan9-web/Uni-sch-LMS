import React, { useState, useEffect, useCallback } from 'react';
import { DownloadSimple, ArrowClockwise, MagnifyingGlass, ScanSmiley, Users, CheckCircle, ChartBar, UserFocus, Clock, FileText } from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';

export default function PDFaceAttendance({ token }) {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const authH = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchLog = useCallback(async (targetDate = date) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/face-attendance/today?date=${targetDate}`, { headers: authH });
      const data = await res.json();
      setLog(data.attendance || []);
    } catch {
      console.error('Face attendance fetch error');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchLog(); }, []);

  const filtered = log.filter(r =>
    r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    if (log.length === 0) return;
    const headers = ['#', 'Student Name', 'Roll Number', 'Date', 'Time In', 'Method', 'Status'];
    const rows = log.map((r, i) => [
      i + 1, r.student_name, r.roll_number, r.date, r.time, 'Face AI', 'Present'
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Campus_FaceAttendance_${date}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

  const attendancePercent = log.length > 0 ? Math.round((log.length / Math.max(log.length + 5, 1)) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .fa-row:hover { background: #f8fafc !important; }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ScanSmiley size={32} weight="duotone" color="#4f46e5" />
              Campus Face Attendance
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Real-time AI face recognition attendance — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                fetchLog(e.target.value);
              }}
              max={new Date().toISOString().split('T')[0]}
              style={{ padding: '9px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '13px', color: '#334155', background: '#fff', fontFamily: 'inherit' }}
            />
            <button onClick={() => fetchLog(date)} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
              <ArrowClockwise size={16} weight={loading ? "bold" : "regular"} /> {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={exportExcel} disabled={log.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', cursor: log.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px', opacity: log.length === 0 ? 0.6 : 1, boxShadow: '0 4px 12px rgba(16,185,129,0.3)', fontFamily: 'inherit' }}>
              <DownloadSimple size={16} /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px', animation: 'fadeIn 0.4s ease' }}>
        {[
          {
            icon: <Users size={28} weight="duotone" color="#4f46e5" />,
            label: 'Present Today',
            value: log.length,
            sub: 'via Face Recognition',
            bg: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
            border: 'rgba(79,70,229,0.15)',
            valColor: '#4f46e5',
          },
          {
            icon: <CheckCircle size={28} weight="duotone" color="#10b981" />,
            label: 'Face Verified',
            value: log.length,
            sub: '100% AI authenticated',
            bg: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
            border: 'rgba(16,185,129,0.15)',
            valColor: '#10b981',
          },
          {
            icon: <ChartBar size={28} weight="duotone" color="#f59e0b" />,
            label: "Today's Date",
            value: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            sub: new Date().toLocaleDateString('en-GB', { weekday: 'long' }),
            bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
            border: 'rgba(245,158,11,0.15)',
            valColor: '#d97706',
          },
          {
            icon: <ScanSmiley size={28} weight="duotone" color="#8b5cf6" />,
            label: 'Last Updated',
            value: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
            sub: 'Live sync',
            bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
            border: 'rgba(139,92,246,0.15)',
            valColor: '#7c3aed',
          },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: s.valColor, lineHeight: 1, margin: '0 0 4px' }}>{s.value}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>{s.label}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live Table */}
      <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', animation: 'fadeIn 0.5s ease' }}>
        {/* Table Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Today's Attendance Log</h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{filtered.length} student{filtered.length !== 1 ? 's' : ''} present</p>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <MagnifyingGlass size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Search by name or roll no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', paddingRight: '16px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', color: '#334155', outline: 'none', background: '#f8fafc', width: '260px', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px', color: '#64748b' }}>
            <div style={{ width: '44px', height: '44px', border: '4px solid #e2e8f0', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ fontWeight: 700, fontSize: '15px', margin: '0 0 4px' }}>Loading attendance...</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Fetching today's face recognition data</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FileText size={48} color="#94a3b8" weight="duotone" style={{ marginBottom: '16px' }} />
            <p style={{ fontWeight: 800, fontSize: '18px', margin: '0 0 8px', color: '#475569' }}>
              {search ? 'No matching records' : 'No attendance recorded yet today'}
            </p>
            <p style={{ fontSize: '14px', margin: '0 0 24px' }}>
              {search ? 'Try a different search term.' : 'Students must mark attendance via Face AI from their student portal.'}
            </p>
            {!search && (
              <button onClick={fetchLog} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: 'inherit' }}>
                Check Again
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['#', 'Student Name', 'Roll Number', 'Time In', 'Method', 'Status'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id} className="fa-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s', cursor: 'default' }}>
                    <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
                          {row.student_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{row.student_name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '14px', fontFamily: 'monospace', fontWeight: 600 }}>{row.roll_number}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }}></div>
                        <span style={{ color: '#334155', fontSize: '14px', fontWeight: 600 }}>{row.time}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79,70,229,0.08)', color: '#4338ca', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                        <UserFocus size={14} /> Face AI
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', color: '#065f46', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                        <CheckCircle size={13} weight="bold" /> Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Showing {filtered.length} of {log.length} records</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>All attendance verified by AI Face Recognition</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
