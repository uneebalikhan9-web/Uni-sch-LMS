import React, { useState, useEffect } from 'react';
import { S } from './PDStyles';
import API_BASE_URL from '../../../config/api';
import { CheckCircle, WarningCircle, CalendarBlank } from '@phosphor-icons/react';

export default function PDAttendance({ student }) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const token = sessionStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/parent/attendance/${student.student_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setAttendance(d.attendance || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [student]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading attendance...</div>;

  return (
    <div className="animate-fadeIn">
      <div style={{ ...S.card, padding: '35px', background: 'linear-gradient(145deg, #ffffff, #f8fafc)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarBlank size={24} color="#6366f1" weight="duotone" /> Attendance History
        </h3>
        
        {attendance.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <CalendarBlank size={48} weight="duotone" />
            <p style={{ marginTop: '12px', fontWeight: 600 }}>No attendance records found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Course</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, idx) => (
                  <tr key={idx} className="hover-lift" style={{ cursor: 'default' }}>
                    <td style={{ ...S.td, ...S.tdFirst }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <CalendarBlank size={20} />
                        </div>
                        <span style={{ fontWeight: 700 }}>{new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 700 }}>
                        {record.course_title}
                      </span>
                    </td>
                    <td style={{ ...S.td, ...S.tdLast }}>
                      {record.status === 'present' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', ...S.badge, background: '#dcfce7', color: '#166534' }}>
                          <CheckCircle weight="fill" size={16} /> Present
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', ...S.badge, background: '#fee2e2', color: '#991b1b' }}>
                          <WarningCircle weight="fill" size={16} /> Absent
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
