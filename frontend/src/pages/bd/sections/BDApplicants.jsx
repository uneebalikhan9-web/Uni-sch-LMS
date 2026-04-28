import React from 'react';
import { Trash } from "@phosphor-icons/react";
import { S } from './BDStyles';

export default function BDApplicants({ applicants, handleApplicantStatus, handleDelete, APPLICANT_STATUSES }) {
  return (
    <div style={S.tableCard} className="animate-fadeIn">
      <div style={S.tableContainer} className="table-container">
        <table style={S.table}>
          <thead>
            <tr style={S.tableHeadRow}>
              <th style={S.th}>NAME</th>
              <th style={S.th}>EMAIL</th>
              <th style={S.th}>JOB</th>
              <th style={S.th}>EXP (YRS)</th>
              <th style={S.th}>STATUS</th>
              <th style={{ ...S.th, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map(a => (
              <tr key={a.id} style={S.tableRow}>
                <td style={S.tdName}>{a.name}</td>
                <td style={S.td}>{a.email}</td>
                <td style={S.td}>{a.job_title || '—'}</td>
                <td style={S.td}>{a.experience_years} yrs</td>
                <td style={S.td}>
                  <select
                    value={a.status}
                    onChange={e => handleApplicantStatus(a.id, e.target.value)}
                    style={{...S.statusSelect, background: a.status === 'hired' ? '#dcfce7' : a.status === 'rejected' ? '#fee2e2' : '#f8fafc', color: a.status === 'hired' ? '#166534' : a.status === 'rejected' ? '#991b1b' : '#374151'}}
                  >
                    {APPLICANT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <button style={S.deleteBtn} onClick={() => handleDelete(a.id)}><Trash size={16} /></button>
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr><td colSpan="6" style={S.emptyTableCell}>No applicants yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
