import React from 'react';
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { S } from './BDStyles';

export default function BDBulkHires({ batches, openEdit, handleDelete }) {
  return (
    <div style={S.tableCard} className="animate-fadeIn">
      <div style={S.tableContainer} className="table-container">
        <table style={S.table}>
          <thead>
            <tr style={S.tableHeadRow}>
              <th style={S.th}>BATCH NAME</th>
              <th style={S.th}>DEPARTMENT</th>
              <th style={S.th}>TEACHERS NEEDED</th>
              <th style={S.th}>SUBJECTS</th>
              <th style={S.th}>TARGET DATE</th>
              <th style={S.th}>STATUS</th>
              <th style={{ ...S.th, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {batches.map(b => (
              <tr key={b.id} style={S.tableRow}>
                <td style={S.tdName}>{b.batch_name}</td>
                <td style={S.td}>{b.campus_name || 'Any'}</td>
                <td style={S.td}>
                  <span style={S.teacherCount}>{b.teacher_count}</span>
                </td>
                <td style={S.td}>{b.subject_areas || '—'}</td>
                <td style={S.td}>{b.target_date ? new Date(b.target_date).toLocaleDateString() : '—'}</td>
                <td style={S.td}>
                  <span style={{...S.statusBadge,
                    background: b.status === 'completed' ? '#dcfce7' : b.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                    color: b.status === 'completed' ? '#166534' : b.status === 'cancelled' ? '#991b1b' : '#92400e'
                  }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <div style={S.actionGroup}>
                    <button style={S.iconBtn} onClick={() => openEdit(b)}><PencilSimple size={16} /></button>
                    <button style={S.deleteBtn} onClick={() => handleDelete(b.id)}><Trash size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {batches.length === 0 && (
              <tr><td colSpan="7" style={S.emptyTableCell}>No bulk hire batches yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
