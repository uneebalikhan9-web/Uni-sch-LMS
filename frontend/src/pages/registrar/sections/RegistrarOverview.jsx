import React from 'react';
import { Student, GraduationCap, Certificate, PencilSimple, Eye } from '@phosphor-icons/react';

const RegistrarOverview = ({ stats, recentRecords, getStatusClass, handleEditRecord, handleViewTranscript }) => {
  return (
    <>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-info">
            <h4>Total Enrolled Students</h4>
            <div className="metric-number">{stats.totalEnrolled}</div>
          </div>
          <div className="metric-icon"><Student weight="bold" /></div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <h4>Degrees Issued</h4>
            <div className="metric-number">{stats.degreesIssued}</div>
          </div>
          <div className="metric-icon"><GraduationCap weight="bold" /></div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <h4>Pending Verifications</h4>
            <div className="metric-number">{stats.pendingVerifications}</div>
          </div>
          <div className="metric-icon"><Certificate weight="bold" /></div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Recent Academic Records</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Program</th>
                <th>CGPA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.slice(0, 5).map((record) => (
                <tr key={record.id}>
                  <td className="id-cell">{record.id}</td>
                  <td className="name-cell">{record.name}</td>
                  <td>{record.program}</td>
                  <td className="cgpa-cell">{record.cgpa}</td>
                  <td><span className={`status-badge ${getStatusClass(record.status)}`}>{record.status}</span></td>
                  <td className="actions-cell">
                    <button className="action-icon" onClick={() => handleEditRecord(record.id)}><PencilSimple size={18} /></button>
                    <button className="action-icon" onClick={() => handleViewTranscript(record.id)}><Eye size={18} /></button>
                  </td>
                </tr>
              ))}
              {recentRecords.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RegistrarOverview;
