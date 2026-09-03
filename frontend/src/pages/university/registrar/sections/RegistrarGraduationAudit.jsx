import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../../config/api';
import { 
  CheckCircle, FileText, XCircle, Clock, MagnifyingGlass, 
  Download, ArrowSquareOut, Info, ShieldCheck, GraduationCap, X
} from '@phosphor-icons/react';

const RegistrarGraduationAudit = () => {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [auditModal, setAuditModal] = useState({ isOpen: false, studentId: null, appId: null, auditData: null, loading: false });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/graduation/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRunAudit = async (studentId, appId) => {
    setAuditModal({ isOpen: true, studentId, appId, auditData: null, loading: true });
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/graduation/audit/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAuditModal({ isOpen: true, studentId, appId, auditData: res.data.audit, loading: false });
      }
    } catch (err) {
      alert('Error running audit');
      setAuditModal({ isOpen: false, studentId: null, appId: null, auditData: null, loading: false });
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/graduation/applications/${auditModal.appId}`, 
        { 
          status, 
          remarks: `Audit run. Result: ${auditModal.auditData?.audit_message}`,
          audit_data: auditModal.auditData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAuditModal({ isOpen: false, studentId: null, appId: null, auditData: null, loading: false });
      fetchApplications();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleHecExport = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/graduation/hec-export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.export_data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "hec_graduates_export.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    } catch (err) {
      alert('Failed to export HEC data');
    }
  };

  const filteredApps = applications.filter(a => 
    String(a.student_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(a.roll_number).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Informative Banner */}
      <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', borderRadius: '20px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: '#22c55e', color: 'white', padding: '10px', borderRadius: '12px', display: 'flex' }}>
          <ShieldCheck size={22} weight="duotone" />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#14532d', margin: '0 0 6px 0' }}>Graduation Audit & HEC Compliance</h4>
          <p style={{ fontSize: '13px', color: '#166534', lineHeight: '1.6', margin: 0, fontWeight: '600' }}>
            Run real-time graduation audits to ensure students meet credit hour requirements, minimum CGPA, and hold no financial dues. 
            Once approved, you can export the compliance data directly to HEC format.
          </p>
        </div>
        <button 
          onClick={handleHecExport}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          <Download size={18} /> Export HEC Compliance Data
        </button>
      </div>

      <div className="section" style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', margin: 0 }}>
        
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Student Graduation Applications</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Review and audit final year students.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px' }}>
            <MagnifyingGlass size={18} color="#64748b" weight="bold" />
            <input 
              type="text" 
              placeholder="Search by student name or roll number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13.5px', color: '#0f172a', fontWeight: '600' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading applications...</div>
        ) : (
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>STUDENT</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>PROGRAM</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'left', borderBottom: '1px solid #edf2f7' }}>CGPA</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'center', borderBottom: '1px solid #edf2f7' }}>STATUS</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'center', borderBottom: '1px solid #edf2f7' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{a.student_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{a.roll_number}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>{a.program_name}</td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>{a.current_gpa}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: '800',
                        background: a.status === 'pending' ? '#fef3c7' : (a.status === 'approved' ? '#dcfce7' : '#fee2e2'),
                        color: a.status === 'pending' ? '#b45309' : (a.status === 'approved' ? '#166534' : '#b91c1c')
                      }}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleRunAudit(a.student_id, a.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}
                      >
                        <GraduationCap size={16} weight="bold" /> Run Audit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No applications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Modal */}
      {auditModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Graduation Audit Results</h3>
              <button onClick={() => setAuditModal({ isOpen: false, studentId: null, appId: null, auditData: null, loading: false })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>
            
            {auditModal.loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Running comprehensive audit...</div>
            ) : auditModal.auditData ? (
              <div>
                <div style={{ padding: '16px', borderRadius: '12px', marginBottom: '20px', background: auditModal.auditData.is_eligible ? '#dcfce7' : '#fee2e2', color: auditModal.auditData.is_eligible ? '#166534' : '#b91c1c' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px' }}>
                    {auditModal.auditData.is_eligible ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    {auditModal.auditData.audit_message}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>EARNED CREDITS</div>
                    <div style={{ fontSize: '20px', color: '#0f172a', fontWeight: 800 }}>{auditModal.auditData.earned_credits} / {auditModal.auditData.required_credits}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>CGPA</div>
                    <div style={{ fontSize: '20px', color: '#0f172a', fontWeight: 800 }}>{auditModal.auditData.current_cgpa} <span style={{fontSize:'14px', color:'#64748b'}}>(Min {auditModal.auditData.minimum_cgpa})</span></div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>UNPAID DUES</div>
                    <div style={{ fontSize: '20px', color: '#ef4444', fontWeight: 800 }}>Rs. {auditModal.auditData.unpaid_fees}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleStatusUpdate('rejected')} style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: '700', color: '#b91c1c', background: '#fee2e2', border: 'none', cursor: 'pointer' }}>Reject</button>
                  <button onClick={() => handleStatusUpdate('on_hold')} style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: '700', color: '#b45309', background: '#fef3c7', border: 'none', cursor: 'pointer' }}>Hold</button>
                  <button 
                    onClick={() => handleStatusUpdate('approved')} 
                    disabled={!auditModal.auditData.is_eligible}
                    style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: '700', color: 'white', background: auditModal.auditData.is_eligible ? '#22c55e' : '#94a3b8', border: 'none', cursor: auditModal.auditData.is_eligible ? 'pointer' : 'not-allowed' }}
                  >
                    Approve Graduation
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Error retrieving audit data.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarGraduationAudit;
