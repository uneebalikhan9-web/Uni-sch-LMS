import React from 'react';
import { S } from './BDStyles';

export default function BDGlobalData({ type, data }) {
  if (type === 'campuses') {
    return (
      <div style={S.tableCard} className="animate-fadeIn">
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>DEPARTMENT NAME</th>
                <th style={S.th}>LOCATION</th>
                <th style={S.th}>HOD</th>
                <th style={S.th}>TEACHERS</th>
                <th style={S.th}>STUDENTS</th>
                <th style={S.th}>CLASSES</th>
              </tr>
            </thead>
            <tbody>
              {data.map(c => (
                <tr key={c.id} style={S.tableRow}>
                  <td style={S.tdName}>{c.name}</td>
                  <td style={S.td}>{c.location || '—'}</td>
                  <td style={S.td}>{c.hod_name || '—'}</td>
                  <td style={S.td}>{c.teacher_count}</td>
                  <td style={S.td}>{c.student_count}</td>
                  <td style={S.td}>
                    <span style={S.teacherCount}>{c.class_count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'teachers') {
    return (
      <div style={S.tableCard} className="animate-fadeIn">
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>NAME</th>
                <th style={S.th}>EMAIL</th>
                <th style={S.th}>DEPARTMENT</th>
                <th style={S.th}>JOINED</th>
              </tr>
            </thead>
            <tbody>
              {data.map(t => (
                <tr key={t.id} style={S.tableRow}>
                  <td style={S.tdName}>{t.name}</td>
                  <td style={S.td}>{t.email}</td>
                  <td style={S.td}>{t.campus_name || '—'}</td>
                  <td style={S.td}>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'students') {
    return (
      <div style={S.tableCard} className="animate-fadeIn">
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>NAME</th>
                <th style={S.th}>EMAIL</th>
                <th style={S.th}>DEPARTMENT</th>
                <th style={S.th}>JOINED</th>
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.id} style={S.tableRow}>
                  <td style={S.tdName}>{s.name}</td>
                  <td style={S.td}>{s.email}</td>
                  <td style={S.td}>{s.campus_name || '—'}</td>
                  <td style={S.td}>{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'classes') {
    return (
      <div style={S.tableCard} className="animate-fadeIn">
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>CLASS NAME</th>
                <th style={S.th}>SECTION</th>
                <th style={S.th}>TEACHER</th>
                <th style={S.th}>DEPARTMENT</th>
                <th style={S.th}>YEAR</th>
              </tr>
            </thead>
            <tbody>
              {data.map(cl => (
                <tr key={cl.id} style={S.tableRow}>
                  <td style={S.tdName}>{cl.name}</td>
                  <td style={S.td}>{cl.section}</td>
                  <td style={S.td}>{cl.teacher_name || '—'}</td>
                  <td style={S.td}>{cl.campus_name || '—'}</td>
                  <td style={S.td}>{cl.academic_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (type === 'lab_usage') {
    return (
      <div style={S.tableCard} className="animate-fadeIn">
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>STUDENT</th>
                <th style={S.th}>LAB NAME</th>
                <th style={S.th}>DATE</th>
                <th style={S.th}>DURATION</th>
                <th style={S.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((usage, idx) => (
                <tr key={idx} style={S.tableRow}>
                  <td style={S.tdName}>
                    {usage.student_name} <br/>
                    <span style={S.tdSub}>{usage.roll_number}</span>
                  </td>
                  <td style={S.td}>{usage.lab_name}</td>
                  <td style={S.td}>{new Date(usage.date).toLocaleDateString()}</td>
                  <td style={S.td}>{usage.time_spent} mins</td>
                  <td style={S.td}>
                    <span style={{
                      ...S.statusBadge,
                      background: usage.end_time ? '#dcfce7' : '#fef3c7',
                      color: usage.end_time ? '#166534' : '#92400e'
                    }}>
                      {usage.end_time ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
