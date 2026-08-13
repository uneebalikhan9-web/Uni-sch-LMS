import React, { useState, useEffect } from 'react';
import { CalendarBlank, CheckCircle, XCircle, Clock, AirplaneTilt, FloppyDisk, UserCircle } from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';
import { useToast } from '../../../components/Toast';
import { S } from './PDStyles';

export default function PDStaffAttendance({ leftSidebarOpen }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/principal/staff-attendance?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff || []);
      } else {
        showToast(data.message || 'Error fetching staff attendance', 'error');
      }
    } catch (err) {
      showToast('Error connecting to server', 'error');
    }
    setIsLoading(false);
  };

  const handleStatusChange = (userId, newStatus) => {
    setStaff(prev => prev.map(s => s.user_id === userId ? { ...s, status: newStatus } : s));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const attendanceData = staff.map(s => ({ user_id: s.user_id, status: s.status }));
      const res = await fetch(`${API_BASE_URL}/api/principal/staff-attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, attendance: attendanceData })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Attendance saved successfully!', 'success');
      } else {
        showToast(data.message || 'Error saving attendance', 'error');
      }
    } catch (err) {
      showToast('Error saving attendance', 'error');
    }
    setIsSaving(false);
  };

  const stats = {
    present: staff.filter(s => s.status === 'Present').length,
    absent: staff.filter(s => s.status === 'Absent').length,
    late: staff.filter(s => s.status === 'Late').length,
    leave: staff.filter(s => s.status === 'Leave').length,
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fadeIn">
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Staff Attendance</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Manage daily attendance for teachers and staff</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <CalendarBlank size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
            <input 
              type="date" 
              value={date} 
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: '10px 16px 10px 40px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                outline: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: '#334155',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            />
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving || staff.length === 0}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: (isSaving || staff.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (isSaving || staff.length === 0) ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
              transition: 'all 0.2s'
            }}
            className="action-btn-hover"
          >
            <FloppyDisk size={18} weight={isSaving ? "regular" : "bold"} className={isSaving ? "animate-spin" : ""} />
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {!isLoading && staff.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Present', val: stats.present, color: '#10b981', bg: '#d1fae5', icon: <CheckCircle size={24} weight="fill" /> },
            { label: 'Absent', val: stats.absent, color: '#ef4444', bg: '#fee2e2', icon: <XCircle size={24} weight="fill" /> },
            { label: 'Late', val: stats.late, color: '#f59e0b', bg: '#fef3c7', icon: <Clock size={24} weight="fill" /> },
            { label: 'On Leave', val: stats.leave, color: '#3b82f6', bg: '#dbeafe', icon: <AirplaneTilt size={24} weight="fill" /> }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance List */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
            Fetching staff list...
          </div>
        ) : staff.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b' }}>
            No active staff found for attendance.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Staff Member</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s, index) => (
                  <tr key={s.user_id} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#fff' : '#fafaf9' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                          <UserCircle size={24} weight="duotone" />
                        </div>
                        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ padding: '4px 12px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' }}>
                        {s.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['Present', 'Absent', 'Leave', 'Late'].map(status => {
                          const isSelected = s.status === status;
                          let colors = {};
                          if (status === 'Present') colors = { bg: isSelected ? '#10b981' : '#f1f5f9', text: isSelected ? '#fff' : '#64748b', border: isSelected ? '#10b981' : '#cbd5e1' };
                          if (status === 'Absent') colors = { bg: isSelected ? '#ef4444' : '#f1f5f9', text: isSelected ? '#fff' : '#64748b', border: isSelected ? '#ef4444' : '#cbd5e1' };
                          if (status === 'Late') colors = { bg: isSelected ? '#f59e0b' : '#f1f5f9', text: isSelected ? '#fff' : '#64748b', border: isSelected ? '#f59e0b' : '#cbd5e1' };
                          if (status === 'Leave') colors = { bg: isSelected ? '#3b82f6' : '#f1f5f9', text: isSelected ? '#fff' : '#64748b', border: isSelected ? '#3b82f6' : '#cbd5e1' };
                          
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(s.user_id, status)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 700,
                                background: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                              }}
                            >
                              {status}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .action-btn-hover:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
