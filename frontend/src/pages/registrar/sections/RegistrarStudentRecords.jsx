import React from 'react';
import { PencilSimple, Eye } from '@phosphor-icons/react';

const RegistrarStudentRecords = ({ records, filterData, getStatusClass, handleEditRecord, handleViewTranscript }) => {
  const filtered = filterData(records, ['id', 'name', 'program']);

  return (
    <div className="section">
      <div className="section-header">
        <h3>Master Student Directory</h3>
        <span className="badge-count">{filtered.length} Total Records</span>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Program</th>
              <th>Academic Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((record) => (
              <tr key={record.id}>
                <td className="id-cell">{record.id}</td>
                <td className="name-cell">{record.name}</td>
                <td>{record.program}</td>
                <td><span className={`status-badge ${getStatusClass(record.status)}`}>{record.status}</span></td>
                <td className="actions-cell">
                  <button className="action-icon" onClick={() => handleEditRecord(record.id)} title="Edit Record"><PencilSimple size={18} /></button>
                  <button className="action-icon" onClick={() => handleViewTranscript(record.id)} title="View Transcript"><Eye size={18} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No students found match your search</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrarStudentRecords;
