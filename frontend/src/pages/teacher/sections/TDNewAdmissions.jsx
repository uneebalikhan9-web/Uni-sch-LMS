import React, { useState, useEffect } from 'react';
import { User, FileText, Spinner, CheckCircle, Student } from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';

export default function TDNewAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/teachers/new-admissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdmissions(data.admissions);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', minHeight: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Student size={24} weight="fill" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Newly Approved Admissions</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>Students who have recently been approved by the Principal.</p>
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><Spinner size={32} weight="bold" className="spin" color="#4f46e5" /></div>
      ) : admissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', background: '#f8fafc', borderRadius: '16px' }}>
          <FileText size={48} weight="duotone" color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3>No new admissions</h3>
          <p>There are no newly approved students to display right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {admissions.map(student => (
            <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                  <User size={24} weight="fill" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#0f172a', fontWeight: 700 }}>{student.full_name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    <strong>Program:</strong> <span style={{ color: '#4f46e5', fontWeight: 600 }}>{student.program}</span> &nbsp;•&nbsp; 
                    <strong>Shift:</strong> {student.preferred_shift || 'N/A'} &nbsp;•&nbsp; 
                    <strong>Date:</strong> {new Date(student.created_at).toLocaleDateString()}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    <strong>Prev. Edu:</strong> {student.last_qualification} ({student.marks_gpa} marks)
                  </p>
                </div>
              </div>
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} weight="bold" /> Approved
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
