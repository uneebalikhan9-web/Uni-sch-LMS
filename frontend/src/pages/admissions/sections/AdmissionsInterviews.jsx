import React from 'react';
import { Calendar, User, Plus } from '@phosphor-icons/react';

const AdmissionsInterviews = ({ interviews }) => {
  const currentInterviews = interviews || [];

  const handleSchedule = () => {
    alert('Opening interview scheduler...');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <div className="animate-fadeIn">
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <h2 className="adm-card-title">Upcoming Interviews</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Assessments and panel discussions for new candidates</p>
          </div>
          <button onClick={handleSchedule} className="adm-primary-btn">
            <Plus size={18} weight="bold" /> New Schedule
          </button>
        </div>

        <div className="adm-interview-list">
          {currentInterviews.map(interview => (
            <div key={interview.id} className="adm-interview-card">
              <div className="adm-interview-info">
                <h4>{interview.name}</h4>
                <div className="adm-interview-date">
                  <Calendar size={16} weight="bold" />
                  {new Date(interview.interview_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {formatTime(interview.interview_time)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', marginTop: 4, fontWeight: 600 }}>
                  <User size={14} /> Panel: {interview.interviewer}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="adm-status-badge adm-status-pending" style={{ padding: '4px 10px' }}>
                  {interview.program || 'General'}
                </div>
                <button className="adm-schedule-btn">
                  Reschedule
                </button>
              </div>
            </div>
          ))}
          {currentInterviews.length === 0 && (
            <div style={{ padding: '60px 40px', textAlign: 'center', background: '#f8fafc', borderRadius: '32px' }}>
              <Calendar size={48} weight="duotone" style={{ margin: '0 auto 16px', opacity: 0.3, color: '#8b5cf6' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#475569', margin: 0 }}>Clear Schedule</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 6, fontWeight: 500 }}>No upcoming interviews recorded in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdmissionsInterviews;