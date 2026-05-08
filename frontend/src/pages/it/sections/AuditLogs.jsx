import React from 'react';
import { ShieldCheck, Calendar, DownloadSimple, Info } from '@phosphor-icons/react';

const AuditLogs = ({ logs }) => {
  return (
    <div className="audit-logs-section">
      <div className="it-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>System Audit Trails</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--it-text-muted)' }}>Historical logs of all administrative actions and system events.</p>
        </div>
        <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '10px 20px', borderRadius: 12, border: '1px solid var(--it-border)', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>
          <DownloadSimple size={18} /> Export PDF
        </button>
      </div>

      <div className="it-card">
        <div className="it-table-container">
          <table className="it-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Action Type</th>
                <th>Administrator</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {(logs || []).map((log, index) => (
                <tr key={log.id || index}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--it-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      background: log.action?.includes('Delete') ? '#fef2f2' : '#eff6ff',
                      color: log.action?.includes('Delete') ? '#ef4444' : '#3b82f6',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {log.action?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{log.user_id ? `Admin #${log.user_id}` : 'System Auto'}</td>
                  <td>{log.details?.resource || 'N/A'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.ip_address || '127.0.0.1'}</td>
                  <td>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--it-primary)', cursor: 'pointer' }}>
                      <Info size={20} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '80px', color: 'var(--it-text-muted)' }}>No audit trails found in the system.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
