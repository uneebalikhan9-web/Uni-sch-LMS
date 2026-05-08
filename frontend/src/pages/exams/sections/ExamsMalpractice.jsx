import React from 'react';
import { Gavel, Warning, Eye, Trash, UserCircle, Plus } from '@phosphor-icons/react';

const ExamsMalpractice = () => {
  const incidents = [
    { id: 1, student: 'Ali Ahmed', roll: 'CS-2023-042', incident: 'Possession of Mobile Phone', date: 'May 05, 2026', severity: 'High', action: 'Pending' },
    { id: 2, student: 'Sana Khan', roll: 'EE-2022-115', incident: 'Copying from Neighbor', date: 'May 04, 2026', severity: 'Medium', action: 'Warning Issued' }
  ];

  return (
    <div className="exams-malpractice-section">
      <div className="ex-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Disciplinary Records</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Monitoring examination integrity and malpractice incidents.</p>
          </div>
          <button className="ex-btn-primary" style={{ background: '#ef4444' }}>
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
              {incidents.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <UserCircle size={32} color="#64748b" />
                      <div>
                        <p style={{ fontWeight: 700 }}>{item.student}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.roll}</p>
                      </div>
                    </div>
                  </td>
                  <td>{item.incident}</td>
                  <td>
                    <span style={{ 
                        fontWeight: 800, 
                        color: item.severity === 'High' ? '#ef4444' : '#f59e0b'
                    }}>{item.severity}</span>
                  </td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`ex-badge ${item.action === 'Pending' ? 'ex-badge-pending' : 'ex-badge-published'}`}>
                      {item.action}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button style={{ border: 'none', background: 'transparent', color: '#4f46e5', cursor: 'pointer' }}><Eye size={18} weight="bold" /></button>
                      <button style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><Trash size={18} weight="bold" /></button>
                    </div>
                  </td>
                </tr>
              ))}
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
    </div>
  );
};

export default ExamsMalpractice;
