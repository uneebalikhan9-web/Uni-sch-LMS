import React from 'react';
import { CalendarBlank, Clock } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDTimetable({ groupTimetableByDay }) {
  const timetableGrouped = groupTimetableByDay();
  const hasEntries = Object.values(timetableGrouped).some(entries => entries.length > 0);

  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <h2 style={S.tableTitle}>
          <CalendarBlank size={28} weight="duotone" color="#3b82f6" style={{verticalAlign:'middle', marginRight:'12px'}} />
          Class Schedule
        </h2>
      </div>
      <div style={S.timetableContainer}>
        {hasEntries ? (
          Object.entries(timetableGrouped).map(([day, entries]) => (
            entries.length > 0 && (
              <div key={day} style={S.daySection}>
                <h4 style={S.dayHeading}>{day}</h4>
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
            <p>No timetable entries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
