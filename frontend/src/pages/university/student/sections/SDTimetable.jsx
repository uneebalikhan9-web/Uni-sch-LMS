import React, { useState } from 'react';
import { CalendarBlank, Clock, Notebook, MapPin, Trophy } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDTimetable({ groupTimetableByDay, exams = [] }) {
  const [activeTab, setActiveTab] = useState('class'); // 'class' or 'exams'
  const timetableGrouped = groupTimetableByDay();
  const hasEntries = Object.values(timetableGrouped).some(entries => entries.length > 0);

  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      {/* Redesigned Tab Header for Light Theme */}
      <div style={{
        ...S.tableHeader,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 20,
        borderBottom: '1px solid #f1f5f9'
      }}>
        <h2 style={{ ...S.tableTitle, margin: 0, display: 'flex', alignItems: 'center', gap: 12, fontSize: '1.25rem', fontWeight: 800 }}>
          <CalendarBlank size={28} weight="duotone" color="#3b82f6" />
          Academic Schedule
        </h2>

        {/* Premium Light-Theme Pill Tabs */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: 4,
          borderRadius: 12,
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setActiveTab('class')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: activeTab === 'class' ? '#3b82f6' : 'transparent',
              color: activeTab === 'class' ? '#fff' : '#64748b'
            }}
          >
            Class Timetable
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s',
              background: activeTab === 'exams' ? '#7c3aed' : 'transparent',
              color: activeTab === 'exams' ? '#fff' : '#64748b'
            }}
          >
            Exam Dates & Rooms
          </button>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        
        {/* CASE 1: CLASS TIMETABLE */}
        {activeTab === 'class' && (
          <div style={S.timetableContainer}>
            {hasEntries ? (
              Object.entries(timetableGrouped).map(([day, entries]) => (
                entries.length > 0 && (
                  <div key={day} style={S.daySection}>
                    <h4 style={{ ...S.dayHeading, color: '#3b82f6', fontWeight: 800 }}>{day}</h4>
                    {entries.map(entry => (
                      <div key={entry.id} style={S.timetableSlot}>
                        <div>
                          <span style={S.timetableCourseTitle}>{entry.course_title}</span>
                          <div style={S.roomInfo}>
                            <Clock size={12} /> {entry.start_time} - {entry.end_time}
                          </div>
                        </div>
                        <span style={S.roomBadge}>Room {entry.room_number || 'TBD'}</span>
                      </div>
                    ))}
                  </div>
                )
              ))
            ) : (
              <div style={S.emptyState}>
                <CalendarBlank size={48} weight="duotone" color="#94a3b8" />
                <p style={{ color: '#64748b', marginTop: 12 }}>No timetable entries found.</p>
              </div>
            )}
          </div>
        )}

        {/* CASE 2: EXAM SCHEDULE ROADMAP (LIGHT-THEME OPTIMIZED) */}
        {activeTab === 'exams' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {exams.length === 0 ? (
              <div style={{ ...S.emptyState, background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <Notebook size={48} weight="duotone" color="#a78bfa" />
                <p style={{ margin: '12px 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>No Exams Scheduled</p>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Your courses do not have active exam schedules currently.</p>
              </div>
            ) : (
              exams.map(ex => {
                const isPast = new Date(ex.exam_date) < new Date();
                return (
                  <div key={ex.id} style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  className="student-exam-card"
                  >
                    <div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#7c3aed',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {ex.course_name}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 12px' }}>
                        {ex.name}
                      </h3>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                          <CalendarBlank size={16} color="#7c3aed" weight="bold" />
                          <span>
                            {new Date(ex.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                          <MapPin size={16} color="#7c3aed" weight="bold" />
                          Room: <strong style={{ color: '#0f172a' }}>{ex.room_number || 'Room TBD'}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                          <Trophy size={16} color="#7c3aed" weight="bold" />
                          Max Score: <strong style={{ color: '#0f172a' }}>{ex.max_marks || 100} Marks</strong>
                        </div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '6px 14px',
                      borderRadius: 30,
                      background: isPast ? '#dcfce7' : '#f5f3ff',
                      color: isPast ? '#15803d' : '#7c3aed',
                      border: `1px solid ${isPast ? '#bbf7d0' : '#ddd6fe'}`
                    }}>
                      {isPast ? 'Concluded' : 'Upcoming'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}
