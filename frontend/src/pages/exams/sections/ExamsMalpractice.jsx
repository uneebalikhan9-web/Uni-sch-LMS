import React, { useState, useEffect } from 'react';
import { Gavel, Warning, Eye, Trash, UserCircle, Plus } from '@phosphor-icons/react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { ReportIncidentModal } from '../ExamsModals';

const ExamsMalpractice = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/exams/malpractice`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setIncidents(res.data.logs);
      }
    } catch (err) {
      console.error('Error fetching malpractice logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident record?')) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/exams/malpractice/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      if (res.data.success) {
        fetchIncidents();
      }
    } catch (err) {
      console.error('Error deleting incident:', err);
    }
  };

  return (
    <div className="exams-malpractice-section">
      <div className="ex-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Disciplinary Records</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Monitoring examination integrity and malpractice incidents.</p>
          </div>
          <button className="ex-btn-primary" style={{ background: '#ef4444' }} onClick={() => setShowReportModal(true)}>
            <Plus size={18} weight="bold" /> Report Incident
          </button>
        </div>

        <div className="ex-table-container">
          <table className="ex-table">
            <thead>
              <tr>
                <th>Student Detail</th>
                <th>Incident Description</th>
                <th>Severity</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading records...</td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No malpractice incidents recorded.</td>
                </tr>
              ) : (
                incidents.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <UserCircle size={32} color="#64748b" />
                        <div>
                          <p style={{ fontWeight: 700 }}>{item.student_name}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.roll_number || 'No Roll Number'}</p>
                        </div>
                      </div>
                    </td>
                    <td>{item.incident_description}</td>
                    <td>
                      <span style={{ 
                          fontWeight: 800, 
                          color: item.severity === 'High' ? '#ef4444' : item.severity === 'Medium' ? '#f59e0b' : '#3b82f6'
                      }}>{item.severity}</span>
                    </td>
                    <td>{new Date(item.incident_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`ex-badge ${item.status === 'Pending' ? 'ex-badge-pending' : 'ex-badge-published'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <button style={{ border: 'none', background: 'transparent', color: 'var(--primary-color, #4f46e5)', cursor: 'pointer' }}><Eye size={18} weight="bold" /></button>
                        <button onClick={() => handleDelete(item.id)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><Trash size={18} weight="bold" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: '24px', background: '#fff1f2', borderRadius: 24, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ background: '#ef4444', color: 'white', padding: 12, borderRadius: 16 }}><Gavel size={32} weight="duotone" /></div>
          <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b' }}>Anti-Cheating Protocol Active</h3>
              <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>All examination halls are under active monitoring. AI proctoring logs are reviewed every 30 minutes.</p>
          </div>
      </div>
      
      {showReportModal && (
        <ReportIncidentModal 
          onClose={() => setShowReportModal(false)} 
          onSave={() => {
            setShowReportModal(false);
            fetchIncidents();
          }}
        />
      )}
    </div>
  );
};

export default ExamsMalpractice;
