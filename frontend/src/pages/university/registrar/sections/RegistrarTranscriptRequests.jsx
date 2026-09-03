import React, { useState } from 'react';
import { 
  FileText, CheckCircle, Clock, MagnifyingGlass, 
  ArrowSquareOut, Info, Calendar, Gear
} from '@phosphor-icons/react';

const RegistrarTranscriptRequests = ({ transcripts = [], handleProcessTranscript }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Local filtering for instant results
  const filtered = transcripts.filter(t => {
    return (
      String(t.student).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(t.program || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(`TSR-${t.id + 500}`).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Informative Banner explaining the process */}
      <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #edf2f7 100%)', border: '1px solid #e0e7ff', borderRadius: '20px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: '#8b5cf6', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
          <Info size={22} weight="duotone" />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Academic Transcript Queue Workflow</h4>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0, fontWeight: '600' }}>
            Academic transcripts are official records of a student's full course history, credits, and CGPA. When a student submits a request, it enters this queue. Click <strong>Process Request</strong> to generate, seal, and mark the transcript as issued.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="section" style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', margin: 0 }}>
        
        {/* Section Header */}
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Transcript Issuance Queue</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Process and dispatch official student transcripts.</p>
          </div>
          <span className="badge-count" style={{ background: '#f5f3ff', color: '#8b5cf6', fontWeight: '800', fontSize: '12px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #e0e7ff' }}>
            {filtered.length} Requests Awaiting
          </span>
        </div>

        {/* Dynamic Search Bar */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px' }}>
            <MagnifyingGlass size={18} color="#64748b" weight="bold" />
            <input 
              type="text" 
              placeholder="Search by student name, program or TSR ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13.5px', color: '#0f172a', fontWeight: '600' }}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>REQUEST ID</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>STUDENT NAME</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>PROGRAM</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>DATE REQUESTED</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>CURRENT STATUS</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <span className="id-cell" style={{ background: '#f3e8ff', color: '#8b5cf6', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
                      TSR-{t.id + 500}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div className="name-cell" style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{t.student}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                    {t.program || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned Program</span>}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span 
                      className="status-badge" 
                      style={{ 
                        padding: '6px 14px', 
                        borderRadius: '30px', 
                        fontSize: '11px', 
                        fontWeight: '800',
                        background: t.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                        color: t.status === 'Pending' ? '#b45309' : '#b91c1c'
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleProcessTranscript(t.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.2)' }}
                    >
                      <ArrowSquareOut size={16} weight="bold" /> Process Request
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', background: '#f8fafc', borderRadius: '0 0 20px 20px', textAlign: 'center' }}>
                      <div style={{ background: '#f5f3ff', color: '#8b5cf6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.1)' }}>
                        <CheckCircle size={36} weight="duotone" />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Queue is Clear!</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '400px', margin: 0, fontWeight: '600', lineHeight: '1.5' }}>
                        No pending transcript issuance requests. All student applications have been prepared and delivered.
                      </p>
                    </div>
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

export default RegistrarTranscriptRequests;
