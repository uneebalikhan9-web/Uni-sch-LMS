import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, ShieldCheck, Info, MagnifyingGlass, 
  BuildingOffice, Certificate, Calendar, Funnel
} from '@phosphor-icons/react';

const RegistrarDegreeVerification = ({ verifications = [], handleVerify, handleReject }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Local filtering for instant results
  const filtered = verifications.filter(req => {
    return (
      String(req.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(req.company).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(req.student).toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(req.degreeSerial).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Informative Banner explaining the process */}
      <div style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)', border: '1px solid #e0e7ff', borderRadius: '20px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: '#4f46e5', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
          <Info size={22} weight="duotone" />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Where do these requests originate?</h4>
          <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0, fontWeight: '600' }}>
            External employers, corporate recruitment agencies, or background-checking organizations submit these verification forms. They cross-reference official graduates' <strong>Degree Serial Numbers</strong> to prevent academic fraud. Review the match, then click <strong>Approve Verification</strong> to release official confirmation, or <strong>Flag & Reject</strong> if the record is unrecognized.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="section" style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', margin: 0 }}>
        
        {/* Section Header */}
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Degree Verification Requests</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Manage corporate degree validation auditing workflows.</p>
          </div>
          <span className="badge-count" style={{ background: verifications.length > 0 ? '#fffbeb' : '#f8fafc', color: verifications.length > 0 ? '#d97706' : '#64748b', fontWeight: '800', fontSize: '12px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
            {verifications.length} Pending Audit
          </span>
        </div>

        {/* Dynamic Search Bar */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px' }}>
            <MagnifyingGlass size={18} color="#64748b" weight="bold" />
            <input 
              type="text" 
              placeholder="Search verifications by student, company, request ID or degree serial..." 
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
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>REQ ID</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>REQUESTING COMPANY</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>STUDENT NAME</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>DEGREE SERIAL</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>DATE</th>
                <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <span className="id-cell" style={{ background: '#fef3c7', color: '#d97706', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
                      {req.id}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BuildingOffice size={16} color="#64748b" />
                      <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{req.company}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: '600', color: '#475569', fontSize: '14px' }}>
                    {req.student}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace', fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                      <Certificate size={15} color="#4f46e5" />
                      <span>{req.degreeSerial}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span>{new Date(req.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleVerify(req.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <CheckCircle size={16} weight="bold" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(req.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <XCircle size={16} weight="bold" /> Flag
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', background: '#f8fafc', borderRadius: '0 0 20px 20px', textAlign: 'center' }}>
                      <div style={{ background: '#ecfdf5', color: '#10b981', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.1)' }}>
                        <ShieldCheck size={36} weight="duotone" />
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>All Caught Up!</h4>
                      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '400px', margin: 0, fontWeight: '600', lineHeight: '1.5' }}>
                        No pending degree verification requests. External employer claims are fully audited and synchronized.
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

export default RegistrarDegreeVerification;
