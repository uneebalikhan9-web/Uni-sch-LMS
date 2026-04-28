import { Flask } from "@phosphor-icons/react";
import { S } from "./TDStyles";

export default function TDLabUsage({ labUsage, loadingLabs }) {
  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <h2 style={S.tableTitle}><Flask size={28} weight="duotone" color="#4f46e5" style={{ verticalAlign:'middle', marginRight:'12px' }} />Cloud Lab Analytics</h2>
          <p style={S.tableSubtitle}>Track student engagement in cloud labs</p>
        </div>
      </div>
      {loadingLabs ? (
        <p style={{ ...S.emptyState, padding:'40px' }}>Loading lab data...</p>
      ) : (
        <table style={S.table}>
          <thead>
            <tr style={S.tableHeadRow}>
              <th style={S.th}>STUDENT</th>
              <th style={S.th}>LAB NAME</th>
              <th style={S.th}>DATE</th>
              <th style={S.th}>TIME SPENT</th>
              <th style={S.th}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {labUsage.map((usage, idx) => (
              <tr key={idx} style={S.tableRow}>
                <td style={S.tdName}>{usage.student_name}<br /><span style={{ fontSize:'11px', color:'#64748b' }}>{usage.roll_number}</span></td>
                <td style={S.td}>{usage.lab_name}</td>
                <td style={S.td}>{new Date(usage.date).toLocaleDateString()}</td>
                <td style={S.td}>{usage.time_spent} mins</td>
                <td style={S.td}>
                  <span style={{ ...S.statusBadge, background: usage.end_time ? '#dcfce7' : '#fef3c7', color: usage.end_time ? '#166534' : '#92400e' }}>
                    {usage.end_time ? 'Completed' : 'In Progress'}
                  </span>
                </td>
              </tr>
            ))}
            {labUsage.length === 0 && <tr><td colSpan="5" style={S.emptyTableCell}>No lab usage history found.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
