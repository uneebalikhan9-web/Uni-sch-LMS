import React from 'react';
import { S } from './SDStyles';

export default function SDAttendance({ attendanceStats, attendanceLogs }) {
  return (
    <div className="animate-fadeIn">
      {/* Stats Cards */}
      <div style={S.attendanceStatsGrid}>
        <div style={S.attendanceStatCard}>
          <div style={S.statLabel}>TOTAL CLASSES</div>
          <div style={S.statValue}>{attendanceStats.total || 0}</div>
        </div>
        <div style={S.attendanceStatCard}>
          <div style={{...S.statLabel, color: '#10b981'}}>PRESENT</div>
          <div style={{...S.statValue, color: '#10b981'}}>{attendanceStats.present || 0}</div>
        </div>
        <div style={S.attendanceStatCard}>
          <div style={{...S.statLabel, color: '#ef4444'}}>ABSENT</div>
          <div style={{...S.statValue, color: '#ef4444'}}>{attendanceStats.absent || 0}</div>
        </div>
        <div style={S.attendanceStatCard}>
          <div style={{...S.statLabel, color: '#3b82f6'}}>PERCENTAGE</div>
          <div style={{...S.statValue, color: '#3b82f6'}}>{attendanceStats.percentage || 0}%</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <h3 style={S.tableTitle}>Attendance Records</h3>
        </div>
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>DATE</th>
                <th style={S.th}>COURSE</th>
                <th style={S.th}>CLASS</th>
                <th style={{...S.th, textAlign: 'right'}}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLogs.length === 0 ? (
                <tr><td colSpan="4" style={S.emptyTableCell}>No attendance records found</td></tr>
              ) : (
                attendanceLogs.map((log, i) => (
                  <tr key={i} style={S.tableRow}>
                    <td style={S.tdName}>{new Date(log.attendance_date).toLocaleDateString()}</td>
                    <td style={S.td}>{log.course_name}</td>
                    <td style={S.td}>{log.class_name}</td>
                    <td style={{...S.td, textAlign: 'right'}}>
                      <span style={{
                        ...S.statusBadge,
                        background: log.status === 'present' ? '#dcfce7' : log.status === 'late' ? '#fed7aa' : '#fee2e2',
                        color: log.status === 'present' ? '#166534' : log.status === 'late' ? '#9a3412' : '#991b1b'
                      }}>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
