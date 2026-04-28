import React from 'react';
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { S } from './BDStyles';

export default function BDLeads({ leads, openEdit, handleDelete, LEAD_COLORS }) {
  return (
    <div style={S.tableCard} className="animate-fadeIn">
      <div style={S.tableContainer} className="table-container">
        <table style={S.table}>
          <thead>
            <tr style={S.tableHeadRow}>
              <th style={S.th}>INSTITUTION</th>
              <th style={S.th}>CONTACT</th>
              <th style={S.th}>CITY</th>
              <th style={S.th}>DEAL VALUE</th>
              <th style={S.th}>STATUS</th>
              <th style={{ ...S.th, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} style={S.tableRow}>
                <td style={S.tdName}>{l.institution_name}</td>
                <td style={S.td}>
                  {l.contact_person || '—'}<br />
                  <span style={S.tdSub}>{l.contact_email}</span>
                </td>
                <td style={S.td}>{l.city || '—'}</td>
                <td style={S.td}>
                  <span style={S.dealValue}>PKR {Number(l.deal_value || 0).toLocaleString()}</span>
                </td>
                <td style={S.td}>
                  <span style={{...S.statusBadge, background: LEAD_COLORS[l.status] + '22', color: LEAD_COLORS[l.status]}}>
                    {l.status?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <div style={S.actionGroup}>
                    <button style={S.iconBtn} className="icon-btn" onClick={() => openEdit(l)} title="Edit"><PencilSimple size={16} /></button>
                    <button style={S.deleteBtn} className="delete-btn" onClick={() => handleDelete(l.id)} title="Delete"><Trash size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan="6" style={S.emptyTableCell}>No leads yet. Add your first department lead!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
