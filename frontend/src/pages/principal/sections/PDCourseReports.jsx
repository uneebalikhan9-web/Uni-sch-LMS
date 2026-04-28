import { ChartBar, Check, X } from "@phosphor-icons/react";
import { S } from "./PDStyles";

const safeFloat = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };

export default function PDCourseReports({ campusReports, reportsLoading, onViewDetails }) {
  return (
    <div style={S.tableCard} className="animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <h2 style={S.tableTitle}>
            <ChartBar size={28} weight="duotone" color="#7c3aed" style={{ verticalAlign:'middle', marginRight:'12px' }} />
            Course Completion Reports
          </h2>
          <p style={S.tableSubtitle}>{campusReports.length} report{campusReports.length !== 1 ? 's' : ''} for your department</p>
        </div>
      </div>

      {reportsLoading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Loading reports...</div>
      ) : campusReports.length === 0 ? (
        <div style={S.emptyState}>
          <ChartBar size={48} weight="duotone" color="#94a3b8" style={{ marginBottom:'12px' }} />
          <p>No reports yet. Reports auto-generate when a teacher marks a course complete.</p>
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>COURSE</th>
                <th style={S.th}>CLASS</th>
                <th style={S.th}>TEACHER</th>
                <th style={S.th}>STUDENTS</th>
                <th style={S.th}>AVG MARKS</th>
                <th style={S.th}>ATTENDANCE</th>
                <th style={S.th}>PASS / FAIL</th>
                <th style={S.th}>ASSIGNMENTS</th>
                <th style={S.th}>COMPLETED ON</th>
              </tr>
            </thead>
            <tbody>
              {campusReports.map(r => (
                <tr key={r.id} style={{ ...S.tableRow, cursor:'pointer' }} onClick={() => onViewDetails(r)}>
                  <td style={S.tdName}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <ChartBar size={18} color="#7c3aed" /> {r.course_title}
                    </div>
                  </td>
                  <td style={S.td}>{r.class_name}</td>
                  <td style={S.td}>{r.teacher_name}</td>
                  <td style={S.td}><strong>{r.total_students}</strong></td>
                  <td style={S.td}>
                    <span style={{ ...S.statusBadge, padding:'4px 10px', background: safeFloat(r.avg_marks) >= 50 ? '#dcfce7' : '#fee2e2', color: safeFloat(r.avg_marks) >= 50 ? '#166534' : '#991b1b' }}>
                      {safeFloat(r.avg_marks).toFixed(1)}%
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ ...S.statusBadge, padding:'4px 10px', background:'#dbeafe', color:'#1e40af' }}>
                      {safeFloat(r.avg_attendance).toFixed(1)}%
                    </span>
                  </td>
                  <td style={S.td}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'13px', fontWeight:700 }}>
                      <span style={{ color:'#166534', display:'flex', alignItems:'center', gap:'4px' }}><Check size={14} weight="bold" /> {r.pass_count}</span>
                      <span style={{ color:'#94a3b8' }}>|</span>
                      <span style={{ color:'#ef4444', display:'flex', alignItems:'center', gap:'4px' }}><X size={14} weight="bold" /> {r.fail_count}</span>
                    </div>
                  </td>
                  <td style={S.td}>{r.total_assignments}</td>
                  <td style={S.td}>{new Date(r.completed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
