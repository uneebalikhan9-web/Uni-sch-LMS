import { useState } from "react";
import { Plus, PencilSimple, Trash, Clock, Buildings, ChalkboardTeacher, CalendarBlank, Flask } from "@phosphor-icons/react";
import { S } from "./PDStyles";

export default function PDTimetable({
  timetables, timetableHistory, courses, classes, teachers,
  setShowTimetableModal, setEditingItem, setNewTimetableEntry, onDelete,
}) {
  const [timetableView, setTimetableView] = useState('schedule');
  const [selectedSemester, setSelectedSemester] = useState('all');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredTimetables = selectedSemester === 'all' 
    ? timetables 
    : timetables.filter(t => (t.semester || '').toLowerCase().includes(selectedSemester.toLowerCase()) || (t.academic_year || '').toLowerCase().includes(selectedSemester.toLowerCase()));

  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <h2 style={S.tableTitle}>Semester Time Table & Schedules</h2>
          <p style={S.tableSubtitle}>{filteredTimetables.length} scheduled lectures / lab entries</p>
        </div>
        <div style={S.tableActions}>
          <div style={S.tabToggle}>
            <button onClick={() => setTimetableView('schedule')} style={{ ...S.toggleItem, ...(timetableView === 'schedule' ? S.toggleActive : {}) }}>Weekly Schedule</button>
            <button onClick={() => setTimetableView('history')}  style={{ ...S.toggleItem, ...(timetableView === 'history'  ? S.toggleActive : {}) }}>History</button>
          </div>
          <button onClick={() => {
            setEditingItem(null);
            setNewTimetableEntry({
              course_id: '',
              class_id: '',
              teacher_id: '',
              day_of_week: [],
              start_time: '09:00',
              end_time: '10:30',
              room_number: '',
              academic_year: '2026-2027',
              semester: selectedSemester !== 'all' ? selectedSemester : 'Semester 1'
            });
            setShowTimetableModal(true);
          }} style={S.addBtn} className="add-btn">
            <Plus size={18} weight="bold" /> Add Schedule Entry
          </button>
        </div>
      </div>

      {/* Semester Filter Bar */}
      {timetableView === 'schedule' && (
        <div style={{ display: 'flex', gap: '8px', padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', overflowX: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>Semester:</span>
          {['all', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(sem => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              style={{
                padding: '6px 14px', borderRadius: '12px', border: 'none',
                background: selectedSemester === sem ? '#7c3aed' : '#fff',
                color: selectedSemester === sem ? '#fff' : '#64748b',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                boxShadow: selectedSemester === sem ? '0 2px 8px rgba(124,58,237,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap', transition: 'all 0.2s'
              }}
            >
              {sem === 'all' ? '🌟 All Semesters' : sem}
            </button>
          ))}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        {timetableView === 'schedule' ? (
          <div style={S.timetableMatrixContainer}>
            <div style={S.timetableGrid}>
              {DAYS.map(day => (
                <div key={day} style={S.dayColumn}>
                  <h4 style={S.dayTitle}>{day}</h4>
                  <div style={S.dayEntries}>
                    {filteredTimetables.filter(t => t.day_of_week === day).map(entry => (
                      <div
                        key={entry.id}
                        className="timetable-entry-card"
                        style={{ ...S.timetableEntry, borderLeft: '4px solid #7c3aed', background: '#fff' }}
                      >
                        <div style={S.entryMain}>
                          <p style={S.entryCourse}>{entry.course_title}</p>
                          <p style={S.entryMeta}>
                            <Clock size={12} weight="fill" color="#7c3aed" /> {entry.start_time} - {entry.end_time}
                          </p>
                          <div style={S.entryBadgeContainer}>
                            <span style={S.entryMiniBadge}><Buildings size={10} /> {entry.class_name}</span>
                            <span style={S.entryMiniBadge}><ChalkboardTeacher size={10} /> {entry.teacher_name}</span>
                          </div>
                          <p style={{ ...S.entryDetail, marginTop: '4px' }}>Room: {entry.room_number || 'TBD'}</p>
                        </div>

                        {/* Hover actions overlay */}
                        <div style={{ position:'absolute', top:'12px', right:'12px', display:'flex', gap:'4px', opacity:0, transform:'translateY(-10px)', transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)' }} className="entry-actions-overlay">
                          <button
                            style={{ ...S.entryDelete, position:'static', opacity:1, background:'#f0f9ff', color:'#0369a1' }}
                            onClick={() => {
                              setEditingItem(entry);
                              setNewTimetableEntry({
                                course_id:     entry.course_id,
                                class_id:      entry.class_id,
                                teacher_id:    entry.teacher_id,
                                day_of_week:   entry.day_of_week,
                                start_time:    entry.start_time,
                                end_time:      entry.end_time,
                                room_number:   entry.room_number || '',
                                academic_year: entry.academic_year || '2024-2025',
                                semester:      entry.semester || 'Fall',
                              });
                              setShowTimetableModal(true);
                            }}
                          >
                            <PencilSimple size={14} />
                          </button>
                          <button style={{ ...S.entryDelete, position:'static', opacity:1 }} onClick={() => onDelete(entry.id)}>
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {timetables.filter(t => t.day_of_week === day).length === 0 && (
                      <p style={S.noEntries}>Free Day</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={S.historyLogContainer}>
            {timetableHistory.length > 0 ? (
              <div style={S.historyList}>
                {timetableHistory.map((h, i) => (
                  <div key={i} style={S.historyItem}>
                    <div style={S.historyDateBadge}>
                      <span style={S.hDateDay}>{new Date(h.date).getDate()}</span>
                      <span style={S.hDateMonth}>{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div style={S.historyContent}>
                      <div style={S.hRow}>
                        <h4 style={S.hTitle}>{h.course_title}</h4>
                        <span style={S.hStatusBadge}>COMPLETED</span>
                      </div>
                      <p style={S.hSub}>Class: <strong>{h.class_name} ({h.section})</strong> • Instructor: <strong>{h.teacher_name}</strong></p>
                      <div style={S.hMeta}>
                        <span style={S.hMetaItem}><Clock size={14} /> Session logged on {new Date(h.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={S.emptyState}>
                <Clock size={48} weight="duotone" />
                <p style={{ marginTop: '12px' }}>No class history found. History is generated when teachers mark attendance.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
