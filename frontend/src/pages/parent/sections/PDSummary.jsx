import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, GraduationCap, IdentificationCard, TrendUp } from '@phosphor-icons/react';
import { S } from './PDStyles';
import API_BASE_URL from '../../../config/api';

export default function PDSummary({ student }) {
  const [data, setData] = useState({ attendance: [], fees: [], diary: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE_URL}/api/parent/attendance/${student.student_id}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/parent/fees/${student.student_id}`, { headers }).then(r => r.json()),
      fetch(`${API_BASE_URL}/api/parent/diary/${student.student_id}`, { headers }).then(r => r.json())
    ]).then(([attRes, feeRes, diaryRes]) => {
      setData({
        attendance: attRes.attendance || [],
        fees: feeRes.challans || [],
        diary: diaryRes.diary || []
      });
    }).catch(e => console.error("Error fetching summary:", e)).finally(() => setLoading(false));
  }, [student]);

  if (!student) return <div>Please select a child.</div>;
  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Fetching live metrics...</div>;

  const totalClasses = data.attendance.length;
  const presentClasses = data.attendance.filter(a => a.status === 'present').length;
  const attPercentage = totalClasses ? Math.round((presentClasses / totalClasses) * 100) : 0;
  
  const unpaidFees = data.fees.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + Number(f.amount), 0);
  const pendingAssignments = data.diary.filter(d => new Date(d.due_date) > new Date()).length;

  return (
    <div className="animate-fadeIn">
      {/* Student Overview Profile Card */}
      <div style={{ ...S.card, marginBottom: '32px', display: 'flex', gap: '28px', alignItems: 'center', background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)', border: '1px solid #ede9fe', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>

        <div style={{ width: '90px', height: '90px', borderRadius: '24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#fff', fontWeight: 800, boxShadow: '0 12px 24px rgba(139, 92, 246, 0.3)', border: '2px solid rgba(255,255,255,0.5)' }}>
          {student.student_name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#1e1b4b', fontWeight: 800, letterSpacing: '-0.5px' }}>{student.student_name}</h2>
          <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
            <span style={{ fontSize: '14px', color: '#4c1d95', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, background: 'rgba(139,92,246,0.1)', padding: '6px 14px', borderRadius: '10px' }}><IdentificationCard size={18} weight="duotone" /> {student.roll_number}</span>
            <span style={{ fontSize: '14px', color: '#4c1d95', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, background: 'rgba(139,92,246,0.1)', padding: '6px 14px', borderRadius: '10px' }}><GraduationCap size={18} weight="duotone" /> Semester {student.semester}</span>
            <span style={{ fontSize: '14px', color: '#4c1d95', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, background: 'rgba(139,92,246,0.1)', padding: '6px 14px', borderRadius: '10px' }}><BookOpen size={18} weight="duotone" /> {student.program_name || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', marginBottom: '32px' }}>
        <div style={{ ...S.statCard, cursor: 'pointer' }} className="hover-lift">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ ...S.iconBox, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.3)' }}>
              <CheckCircle weight="fill" />
            </div>
            <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>LIVE</span>
          </div>
          <div style={{ marginTop: '12px' }}>
            <h3 style={S.statValue}>{attPercentage}%</h3>
            <p style={S.statLabel}>Attendance Rate</p>
          </div>
        </div>

        <div style={{ ...S.statCard, cursor: 'pointer', background: unpaidFees > 0 ? 'linear-gradient(145deg, #fff, #fef2f2)' : S.statCard.background, border: unpaidFees > 0 ? '1px solid #fecaca' : S.statCard.border }} className="hover-lift">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ ...S.iconBox, background: unpaidFees > 0 ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', color: '#fff', boxShadow: unpaidFees > 0 ? '0 8px 20px rgba(239, 68, 68, 0.3)' : '0 8px 20px rgba(100, 116, 139, 0.2)' }}>
              <Clock weight="fill" />
            </div>
            {unpaidFees > 0 && <span style={{ padding: '4px 10px', background: '#fee2e2', color: '#991b1b', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>ACTION REQUIRED</span>}
          </div>
          <div style={{ marginTop: '12px' }}>
            <h3 style={{ ...S.statValue, color: unpaidFees > 0 ? '#b91c1c' : '#0f172a' }}>Rs. {unpaidFees.toLocaleString()}</h3>
            <p style={S.statLabel}>Unpaid Dues</p>
          </div>
        </div>

        <div style={{ ...S.statCard, cursor: 'pointer' }} className="hover-lift">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ ...S.iconBox, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}>
              <BookOpen weight="fill" />
            </div>
            <TrendUp size={20} color="#3b82f6" weight="bold" />
          </div>
          <div style={{ marginTop: '12px' }}>
            <h3 style={S.statValue}>{pendingAssignments} Tasks</h3>
            <p style={S.statLabel}>Pending Assignments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
