import { CalendarBlank, Clock } from "@phosphor-icons/react";
import { S } from "./TDStyles";

export default function TDTimetable({ timetable }) {
  const groupByDay = () => {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const grouped = {}; days.forEach(d => grouped[d] = []);
    timetable.forEach(e => { if (grouped[e.day_of_week]) grouped[e.day_of_week].push(e); });
    return grouped;
  };

  const grouped = groupByDay();
  const hasEntries = Object.values(grouped).some(v => v.length > 0);

  const daySection = { marginBottom:'24px' };
  const dayHeading = { fontSize:'1rem', fontWeight:'800', color:'#1e293b', marginBottom:'12px', display:'flex', alignItems:'center', gap:'8px' };
  const timetableSlot = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px', background:'#fff', borderRadius:'16px', border:'1px solid #e2e8f0', marginBottom:'8px', boxShadow:'0 2px 8px rgba(0,0,0,0.03)', borderLeft:'4px solid #4f46e5' };
  const courseTitle = { fontSize:'1rem', fontWeight:'700', color:'#0f172a' };
  const roomInfo = { display:'flex', alignItems:'center', gap:'4px', fontSize:'0.8rem', color:'#64748b', marginTop:'4px' };
  const classBadge = { padding:'4px 12px', borderRadius:'20px', background:'#ede9fe', color:'#5b21b6', fontSize:'0.8rem', fontWeight:'700' };

  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <h2 style={S.tableTitle}><CalendarBlank size={28} weight="duotone" color="#4f46e5" style={{ verticalAlign:'middle', marginRight:'12px' }} />Academic Schedule</h2>
          <p style={S.tableSubtitle}>Your weekly class timetable</p>
        </div>
      </div>
      <div style={{ padding:'24px' }}>
        {hasEntries ? (
          Object.entries(grouped).map(([day, entries]) => entries.length > 0 && (
            <div key={day} style={daySection}>
              <h4 style={dayHeading}>📅 {day}</h4>
              {entries.map(entry => (
                <div key={entry.id} style={timetableSlot}>
                  <div>
                    <span style={courseTitle}>{entry.course_title}</span>
                    <div style={roomInfo}><Clock size={12} /> {entry.start_time} - {entry.end_time} • Room {entry.room_number || 'TBD'}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={classBadge}>{entry.class_name}</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div style={S.emptyState}>
            <Clock size={48} weight="duotone" />
            <p>No timetable entries found. Contact your HOD to schedule classes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
