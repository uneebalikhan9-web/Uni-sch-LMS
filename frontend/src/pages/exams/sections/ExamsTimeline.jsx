import React from 'react';
import { Calendar, Clock, MapPin, Notebook, Plus, Info } from '@phosphor-icons/react';

const ExamsTimeline = ({ exams, onScheduleNew }) => {
  // Sort exams by date ascending
  const sortedExams = [...exams].sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));

  return (
    <div className="animate-fadeIn">
      <div className="ex-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Examination Timeline & Schedules</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>Chronological roadmap of all faculty assessments across academic sectors.</p>
          </div>
          <button className="ex-btn-primary" onClick={onScheduleNew}>
            <Plus size={18} weight="bold" /> Schedule Exam
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Timeline Track */}
        <div className="ex-card" style={{ padding: '2rem' }}>
          {sortedExams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Calendar size={48} weight="duotone" style={{ color: 'var(--primary-color, #4f46e5)', opacity: 0.5, marginBottom: 16 }} />
              <h3>No Scheduled Exams</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: 4 }}>Schedule a new examination session to populate this timeline track.</p>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              {/* Vertical line track */}
              <div style={{
                position: 'absolute',
                left: 7,
                top: 8,
                bottom: 8,
                width: 2,
                background: 'linear-gradient(to bottom, var(--primary-color, #4f46e5) 0%, #cbd5e1 100%)',
              }} />

              {sortedExams.map((ex, idx) => {
                const isPast = new Date(ex.exam_date) < new Date();
                return (
                  <div key={ex.id} style={{ position: 'relative', marginBottom: 32, paddingLeft: 16 }}>
                    {/* Circle Node */}
                    <div style={{
                      position: 'absolute',
                      left: -24,
                      top: 4,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: isPast ? '#10b981' : 'var(--primary-color, #4f46e5)',
                      border: '4px solid white',
                      boxShadow: '0 0 0 3px rgba(var(--primary-rgb, 79, 70, 229), 0.15)',
                    }} />

                    {/* Timeline Event Card */}
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      border: '1.5px solid #e2e8f0',
                      transition: 'all 0.2s',
                    }}
                    className="timeline-event-card"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: 'var(--primary-color, #4f46e5)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            {ex.course_name}
                          </span>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px' }}>
                            {ex.name}
                          </h3>
                        </div>

                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '40px',
                          background: isPast ? '#dcfce7' : '#e0f2fe',
                          color: isPast ? '#15803d' : '#0369a1'
                        }}>
                          {isPast ? 'Concluded' : 'Upcoming'}
                        </span>
                      </div>

                      {/* Detail row */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', marginTop: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                          <Calendar size={16} weight="bold" color="#64748b" />
                          {new Date(ex.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                          <MapPin size={16} weight="bold" color="#64748b" />
                          {ex.room_number || 'Room TBD'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                          <Notebook size={16} weight="bold" color="#64748b" />
                          {ex.max_marks || 100} Maximum Marks
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="ex-card" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 12px' }}>Assurance Protocols</h3>
            <p style={{ fontSize: '0.82rem', color: '#a5b4fc', lineHeight: 1.5, margin: 0 }}>
              Timeline events are finalized in sync with HEC standard regulatory practices. Rescheduling requires Chancellor/Pro-VC quality board mandate approvals.
            </p>
          </div>

          <div className="ex-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <Info size={24} color="#15803d" style={{ marginTop: 2 }} />
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#14532d', margin: '0 0 6px' }}>Proctor Allocation</h4>
              <p style={{ fontSize: '0.8rem', color: '#166534', margin: 0, lineHeight: 1.4 }}>
                Rooms and proctor sheets are assigned dynamically based on absolute candidate density.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExamsTimeline;
