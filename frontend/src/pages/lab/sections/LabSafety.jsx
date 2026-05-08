import React from 'react';
import { Warning, ShieldCheck, FileText, Plus, UserCircle, CheckCircle } from '@phosphor-icons/react';

const LabSafety = () => {
  const incidents = [
    { id: 1, type: 'Chemical Spill', location: 'Lab 03', date: 'May 05, 2026', severity: 'Low', status: 'Resolved' },
    { id: 2, type: 'Equipment Overheating', location: 'Electronics Lab', date: 'May 04, 2026', severity: 'Medium', status: 'Under Review' }
  ];

  return (
    <div className="lab-safety-section">
      <div className="lab-grid">
        <div className="lab-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header" style={{ marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Safety Incident Logs</h2>
              <p style={{ color: 'var(--lab-text-muted)', fontSize: '0.9rem' }}>Tracking laboratory hazards and safety protocols.</p>
            </div>
            <button className="lab-logout-btn" style={{ background: '#ef4444', color: 'white', width: 'auto', padding: '10px 20px' }}>
              <Plus size={18} weight="bold" /> Report Hazard
            </button>
          </div>

          <div className="lab-table-container">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Incident Type</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(inc => (
                  <tr key={inc.id}>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Warning size={18} color={inc.severity === 'Low' ? '#f59e0b' : '#ef4444'} weight="bold" />
                        {inc.type}
                      </div>
                    </td>
                    <td>{inc.location}</td>
                    <td style={{ fontWeight: 800, color: inc.severity === 'Low' ? '#f59e0b' : '#ef4444' }}>{inc.severity}</td>
                    <td>{inc.date}</td>
                    <td>
                        <span style={{ 
                            fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                            background: inc.status === 'Resolved' ? '#dcfce7' : '#fef3c7',
                            color: inc.status === 'Resolved' ? '#15803d' : '#b45309'
                        }}>{inc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lab-card">
          <div className="card-header">
            <h3>Compliance Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SafetyCheck label="Fire Extinguisher" status="Inspected" date="Exp: Dec 2026" color="#10b981" />
            <SafetyCheck label="First Aid Kit" status="Stocked" date="Refill: June 2026" color="#10b981" />
            <SafetyCheck label="Ventilation System" status="Operational" date="Last Check: 2d ago" color="#10b981" />
            <SafetyCheck label="PPE Compliance" status="Warning" date="Gloves Stock Low" color="#ef4444" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SafetyCheck = ({ label, status, date, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ padding: 10, background: `${color}15`, color: color, borderRadius: 10 }}>
          {status === 'Operational' || status === 'Inspected' || status === 'Stocked' ? <ShieldCheck size={20} weight="bold" /> : <Warning size={20} weight="bold" />}
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</p>
        <p style={{ fontSize: '0.7rem', color: 'var(--lab-text-muted)', fontWeight: 600 }}>{date}</p>
      </div>
    </div>
    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: color }}>{status}</span>
  </div>
);

export default LabSafety;
