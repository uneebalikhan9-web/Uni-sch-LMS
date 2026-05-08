import React from 'react';
import { Calendar, Clock, User, UserCircle, MapPin, Plus, ArrowsLeftRight } from '@phosphor-icons/react';
import { S } from './ADStyles';

const AdmissionsInterviews = ({ interviews }) => {
  const currentInterviews = interviews || [];

  const handleSchedule = () => {
    alert('Opening interview scheduler...');
  };

  return (
    <div className="animate-fadeIn">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Upcoming Interviews</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Assessments and panel discussions for new candidates</p>
          </div>
          <button onClick={handleSchedule} className="primary-btn">
            <Plus size={18} weight="bold" /> New Schedule
          </button>
        </div>

        <div className="interview-list">
          {currentInterviews.map(interview => (
            <div key={interview.id} className="interview-card">
              <div className="interview-info">
                <h4>{interview.name}</h4>
                <div className="interview-date">
                  <Calendar size={16} weight="bold" />
                  {new Date(interview.interview_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {interview.interview_time}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', marginTop: 4, fontWeight: 600 }}>
                  <User size={14} /> Panel: {interview.interviewer}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="status-badge status-pending" style={{ padding: '4px 10px' }}>
                  {interview.program || 'General'}
                </div>
                <button className="schedule-btn">
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