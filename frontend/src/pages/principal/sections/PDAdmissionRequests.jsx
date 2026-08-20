import React, { useState, useEffect } from 'react';
import { 
  User, Eye, CheckCircle, XCircle, FileText, Spinner, 
  GraduationCap, Buildings, IdentificationCard, Phone, CurrencyDollar, Check
} from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';

export default function PDAdmissionRequests() {
  const [requests, setRequests] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [enrollForm, setEnrollForm] = useState({ class_id: '', section: 'Section A', roll_number: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [reqRes, clsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/public-admissions/pending`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/admissions/classes/1`, { headers }).then(r => r.json()).catch(() => ({ classes: [] }))
      ]);

      if (reqRes.success) setRequests(reqRes.data || []);
      if (clsRes.success) setClasses(clsRes.classes || []);
    } catch (err) {
      console.error('Error fetching admission requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEnrollModal = (req) => {
    setSelectedRequest(req);
    const suggestedRoll = `STU-${Date.now().toString().slice(-4)}`;
    setEnrollForm({
      class_id: classes.length > 0 ? classes[0].id : '',
      section: req.target_class ? `${req.target_class} - Section A` : 'Section A',
      roll_number: suggestedRoll
    });
  };

  const handleFinalAdmit = async () => {
    if (!selectedRequest) return;
    try {
      setSubmitting(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admissions/${selectedRequest.id}/principal-admit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(enrollForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Student officially admitted and enrolled in class!');
        setRequests(requests.filter(r => r.id !== selectedRequest.id));
        setSelectedRequest(null);
      } else {
        alert(data.message || 'Error admitting student');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to admit student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert('Please enter a rejection reason');
      return;
    }
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/public-admissions/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: selectedRequest.id, reason: rejectReason })
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== selectedRequest.id));
        setSelectedRequest(null);
        setRejectReason('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', minHeight: '600px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Admission Requests & Class Allotment
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Review applicants, verify finance clearance, and assign class section & roll number.
          </p>
        </div>
        <span style={{ padding: '6px 14px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.85rem' }}>
          {requests.length} Pending Approval(s)
        </span>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spinner size={32} weight="bold" className="spin" color="#4f46e5" />
          <p style={{ marginTop: '12px', color: '#64748b' }}>Loading applicants...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          <FileText size={48} weight="duotone" color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a' }}>No Pending Admission Requests</h3>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>All student admission queries have been processed and enrolled.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {requests.map(req => (
            <div key={req.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 22px',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  fontWeight: '800', fontSize: '1.1rem'
                }}>
                  {req.full_name?.charAt(0) || 'S'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                      {req.full_name}
                    </h4>
                    {req.fee_status === 'paid' || req.status === 'fee_verified' ? (
                      <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontSize: '0.72rem', fontWeight: '800' }}>
                        ✓ Fee Paid (Rs. {req.admission_fee || 5000})
                      </span>
                    ) : (
                      <span style={{ padding: '2px 8px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: '800' }}>
                        ● Fee Pending
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Grade: <strong>{req.target_class || req.program || 'Class 1'}</strong> • Father: {req.father_name || '—'} • Phone: {req.phone || '—'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleOpenEnrollModal(req)}
                  style={{
                    background: 'var(--primary-color, #4f46e5)',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(var(--primary-rgb, 79, 70, 229), 0.3)'
                  }}
                >
                  <GraduationCap size={18} weight="bold" /> Admit & Enroll in Class
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENROLLMENT & SECTION ASSIGNMENT MODAL */}
      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '650px', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Finalize Admission & Assign Class
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#c7d2fe' }}>
                  Student: {selectedRequest.full_name} (Target Grade: {selectedRequest.target_class || selectedRequest.program})
                </p>
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', padding: '6px', cursor: 'pointer' }}>✕</button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Student Overview Card */}
              <div style={{ padding: '14px 18px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                <div><span style={{ color: '#64748b' }}>Father Name:</span> <strong>{selectedRequest.father_name || '—'}</strong></div>
                <div><span style={{ color: '#64748b' }}>B-Form / CNIC:</span> <strong>{selectedRequest.bform_number || selectedRequest.cnic || '—'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Contact:</span> <strong>{selectedRequest.phone || '—'}</strong></div>
                <div>
                  <span style={{ color: '#64748b' }}>Finance Status:</span> 
                  <strong style={{ color: '#166534', marginLeft: '6px' }}>✓ Fee Verified</strong>
                </div>
              </div>

              {/* Assignment Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Classroom Assignment
                </h4>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Select Class / Course
                  </label>
                  <select
                    value={enrollForm.class_id}
                    onChange={e => setEnrollForm({ ...enrollForm, class_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.section ? `(${c.section})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Class Section *
                    </label>
                    <input 
                      type="text" 
                      value={enrollForm.section}
                      onChange={e => setEnrollForm({ ...enrollForm, section: e.target.value })}
                      placeholder="e.g. Section A / Rose"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Assigned Roll Number *
                    </label>
                    <input 
                      type="text" 
                      value={enrollForm.roll_number}
                      onChange={e => setEnrollForm({ ...enrollForm, roll_number: e.target.value })}
                      placeholder="e.g. STU-101"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '18px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '280px' }}>
                <input 
                  type="text" 
                  placeholder="Reject reason..." 
                  value={rejectReason} 
                  onChange={e => setRejectReason(e.target.value)} 
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} 
                />
                <button 
                  onClick={handleReject} 
                  style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Reject
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  style={{ padding: '10px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFinalAdmit}
                  disabled={submitting}
                  style={{
                    padding: '10px 22px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
                  }}
                >
                  <Check size={16} weight="bold" /> {submitting ? 'Enrolling...' : 'Approve & Enroll Student'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
