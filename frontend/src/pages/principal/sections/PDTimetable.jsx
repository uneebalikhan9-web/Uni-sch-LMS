import { useState } from "react";
import { Plus, PencilSimple, Trash, Clock, Buildings, ChalkboardTeacher, CalendarBlank, Flask } from "@phosphor-icons/react";
import { S } from "./PDStyles";

export default function PDTimetable({
  timetables, timetableHistory, courses, classes, teachers,
  setShowTimetableModal, setEditingItem, setNewTimetableEntry, onDelete,
}) {
  const [timetableView, setTimetableView] = useState('schedule');

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <h2 style={S.tableTitle}>Time Table</h2>
          <p style={S.tableSubtitle}>{timetables.length} schedule entries</p>
        </div>
        <div style={S.tableActions}>
          <div style={S.tabToggle}>
            <button onClick={() => setTimetableView('schedule')} style={{ ...S.toggleItem, ...(timetableView === 'schedule' ? S.toggleActive : {}) }}>Schedule</button>
            <button onClick={() => setTimetableView('history')}  style={{ ...S.toggleItem, ...(timetableView === 'history'  ? S.toggleActive : {}) }}>History</button>
          </div>
          <button onClick={() => setShowTimetableModal(true)} style={S.addBtn} className="add-btn">
            <Plus size={18} weight="bold" /> Add Entry
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {timetableView === 'schedule' ? (
          <div style={S.timetableMatrixContainer}>
            <div style={S.timetableGrid}>
              {DAYS.map(day => (
                <div key={day} style={S.dayColumn}>
                  <h4 style={S.dayTitle}>{day}</h4>
                  <div style={S.dayEntries}>
                    {timetables.filter(t => t.day_of_week === day).map(entry => (
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
