import React, { useState, useEffect } from 'react';
import { User, CheckCircle, XCircle, FileText, Spinner, Eye } from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';

export default function PDAdmissionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/public-admissions/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/public-admissions/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== id));
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason) {
      alert('Please enter a rejection reason');
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/public-admissions/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id, reason: rejectReason })
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== id));
        setSelectedRequest(null);
        setRejectReason('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', minHeight: '600px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Admission Requests</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><Spinner size={32} weight="bold" className="spin" color="#4f46e5" /></div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <FileText size={48} weight="duotone" color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3>No pending requests</h3>
          <p>You have no new admission requests at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {requests.map(req => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <User size={24} weight="fill" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{req.full_name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{req.program} • {req.marks_gpa} marks</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRequest(req)}
                style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '12px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <Eye size={18} /> View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Applicant Details</h3>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Full Name</span><div style={{ fontWeight: 600, marginTop: '4px' }}>{selectedRequest.full_name}</div></div>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Father's Name</span><div style={{ fontWeight: 600, marginTop: '4px' }}>{selectedRequest.father_name}</div></div>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Phone</span><div style={{ fontWeight: 600, marginTop: '4px' }}>{selectedRequest.phone}</div></div>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Email</span><div style={{ fontWeight: 600, marginTop: '4px' }}>{selectedRequest.email}</div></div>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Program</span><div style={{ fontWeight: 600, marginTop: '4px', color: '#4f46e5' }}>{selectedRequest.program}</div></div>
                <div><span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Marks/GPA</span><div style={{ fontWeight: 600, marginTop: '4px' }}>{selectedRequest.marks_gpa}</div></div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Last Qualification</span><div style={{ fontWeight: 600, marginTop: '4px' }}>{selectedRequest.last_qualification} ({selectedRequest.board_university} - {selectedRequest.passing_year})</div></div>
                <div style={{ gridColumn: 'span 2' }}><span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Address</span><div style={{ fontWeight: 600, marginTop: '4px' }}>{selectedRequest.address}, {selectedRequest.city}</div></div>
              </div>
            </div>

            <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => handleApprove(selectedRequest.id)} style={{ flex: 1, padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle size={20} /> Approve
                </button>
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Reason..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ flex: 1, padding: '0 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <button onClick={() => handleReject(selectedRequest.id)} style={{ padding: '0 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={20} /> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
