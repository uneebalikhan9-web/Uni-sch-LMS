import { ChartBar, ChartLine, Check } from "@phosphor-icons/react";
import { S } from "./TDStyles";

const X = ({ size, weight }) => <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor"><path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"/></svg>;

export default function TDReports({ myReports, reportsLoading, onViewDetails }) {
  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <h2 style={S.tableTitle}><ChartBar size={28} weight="duotone" color="#7c3aed" style={{ verticalAlign:'middle', marginRight:'12px' }} />My Course Reports</h2>
          <p style={S.tableSubtitle}>{myReports.length} completed course{myReports.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      {reportsLoading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Loading reports...</div>
      ) : myReports.length === 0 ? (
        <div style={S.emptyState}>
          <ChartLine size={48} weight="duotone" />
          <p style={{ marginTop:'12px' }}>No reports yet. Go to My Classes, open a course, and click "Complete" to generate your first report.</p>
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>COURSE</th><th style={S.th}>CLASS</th><th style={S.th}>STUDENTS</th>
                <th style={S.th}>AVG MARKS</th><th style={S.th}>ATTENDANCE</th>
                <th style={S.th}>PASS / FAIL</th><th style={S.th}>ASSIGNMENTS</th><th style={S.th}>COMPLETED ON</th>
              </tr>
            </thead>
            <tbody>
              {myReports.map(r => (
                <tr key={r.id} style={{ ...S.tableRow, cursor:'pointer' }} onClick={() => onViewDetails(r)}>
                  <td style={S.tdName}><div style={{ display:'flex', alignItems:'center', gap:'10px' }}><ChartBar size={18} color="#7c3aed" />{r.course_title}</div></td>
                  <td style={S.td}>{r.class_name}</td>
                  <td style={S.td}><strong>{r.total_students}</strong></td>
                  <td style={S.td}>
                    <span style={{ ...S.statusBadge, padding:'4px 10px', background: r.avg_marks >= 50 ? '#dcfce7' : '#fee2e2', color: r.avg_marks >= 50 ? '#166534' : '#991b1b' }}>
                      {parseFloat(r.avg_marks).toFixed(1)}%
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ ...S.statusBadge, padding:'4px 10px', background:'#dbeafe', color:'#1e40af' }}>{parseFloat(r.avg_attendance).toFixed(1)}%</span>
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
