import React from 'react';
import { Checks, X, FileText, FilePdf, Image, MagnifyingGlass, DownloadSimple } from '@phosphor-icons/react';
import { S } from './ADStyles';

const AdmissionsVerification = ({ documents, onAction }) => {
  const getFileIcon = (type) => {
    if (type?.toLowerCase().includes('pdf')) return <FilePdf size={20} weight="duotone" color="#ef4444" />;
    if (type?.toLowerCase().includes('image') || type?.toLowerCase().includes('photo')) return <Image size={20} weight="duotone" color="#3b82f6" />;
    return <FileText size={20} weight="duotone" color="#64748b" />;
  };

  return (
    <div className="animate-fadeIn">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Verification Center</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Review applicant transcripts and credentials</p>
          </div>
          <div className="status-badge status-pending">
            Pending: {documents.filter(d => d.status === 'pending').length}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Document Type</th>
                <th>Submitted On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => (
                <tr key={doc.id || idx}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4f46e5', fontSize: '0.9rem' }}>
                        {doc.name?.charAt(0)}
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.name}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {getFileIcon(doc.type)}
                      <span style={{ fontWeight: 600, color: '#475569' }}>{doc.type}</span>
                    </div>
                  </td>
                  <td>{doc.date}</td>
                  <td>
                    <span className={`status-badge status-${doc.status?.toLowerCase()}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {doc.status === 'pending' ? (
                        <>
                          <button onClick={() => onAction(doc.id, 'verified')} className="verify-btn">Verify</button>
                          <button onClick={() => onAction(doc.id, 'rejected')} className="reject-btn">Reject</button>
                        </>
                      ) : (
                        <button className="schedule-btn"><DownloadSimple size={14} weight="bold" /> View File</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <FileText size={48} weight="duotone" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: '#64748b', margin: 0 }}>No pending verifications</p>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>Applicants have not submitted any documents yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsVerification;