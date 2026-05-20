import React from 'react';
import { PencilSimple, Trash } from "@phosphor-icons/react";
import { S } from './BDStyles';

export default function BDJobs({ jobs, openEdit, handleDelete, showToast }) {
  return (
    <div style={S.jobsContainer} className="animate-fadeIn">
      {/* Share Link Banner - Indigo gradient */}
      <div style={S.shareBanner}>
        <div>
          <p style={S.bannerTitle}>🔗 Public Application Link</p>
          <p style={S.bannerSubtitle}>Share this link so candidates can apply directly</p>
        </div>
        <div style={S.bannerActions}>
          <code style={S.bannerCode}>{window.location.origin}/apply</code>
          <button
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/apply`); showToast('Link copied to clipboard!', 'success'); }}
            style={S.bannerCopyBtn}
          >
            Copy
          </button>
          <button
            onClick={() => { window.open(`${window.location.origin}/apply`, '_blank'); }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '12px 24px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              marginLeft: '8px'
            }}
          >
            Open
          </button>
        </div>
      </div>

      <div style={S.tableCard}>
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>TITLE</th>
                <th style={S.th}>SUBJECT</th>
                <th style={S.th}>DEPARTMENT</th>
                <th style={S.th}>SLOTS</th>
                <th style={S.th}>APPLICANTS</th>
                <th style={S.th}>STATUS</th>
                <th style={{ ...S.th, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} style={S.tableRow}>
                  <td style={S.tdName}>
                    {j.title}
                    <button
                      onClick={() => { window.open(`${window.location.origin}/apply/${j.invite_token || j.id}`, '_blank'); }}
                      style={S.copyLinkBtn}
                    >
                      🔗 Open Apply Page
                    </button>
                  </td>
                  <td style={S.td}>{j.subject || '—'}</td>
                  <td style={S.td}>{j.campus_name || 'Any'}</td>
                  <td style={S.td}>
                    <span style={S.slotsBadge}>{j.slots_filled}/{j.slots_available}</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.applicantCount}>{j.applicant_count || 0}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{...S.statusBadge, background: j.status === 'open' ? '#dcfce7' : '#f1f5f9', color: j.status === 'open' ? '#166534' : '#64748b'}}>
                      {j.status}
                    </span>
                  </td>
                  <td style={{ ...S.td, textAlign: 'right' }}>
                    <div style={S.actionGroup}>
                      <button style={S.iconBtn} onClick={() => openEdit(j)}><PencilSimple size={16} /></button>
                      <button style={S.deleteBtn} onClick={() => handleDelete(j.id)}><Trash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan="7" style={S.emptyTableCell}>No job postings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
