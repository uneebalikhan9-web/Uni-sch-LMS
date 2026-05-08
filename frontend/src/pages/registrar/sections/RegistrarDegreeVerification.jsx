import React from 'react';
import { CheckCircle, XCircle } from '@phosphor-icons/react';

const RegistrarDegreeVerification = ({ verifications, filterData, handleVerify, handleReject }) => {
  const filtered = filterData(verifications, ['id', 'company', 'student', 'degreeSerial']);

  return (
    <div className="section">
      <div className="section-header">
        <h3>Degree Verification Requests</h3>
        <span className="badge-count">{filtered.length} Pending</span>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Req ID</th>
              <th>Requesting Company</th>
              <th>Student Name</th>
              <th>Degree Serial</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((req) => (
              <tr key={req.id}>
                <td className="id-cell">{req.id}</td>
                <td className="name-cell">{req.company}</td>
                <td>{req.student}</td>
                <td className="serial-cell">{req.degreeSerial}</td>
                <td>{new Date(req.date).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button className="btn-verify" onClick={() => handleVerify(req.id)}><CheckCircle size={18} /> Verify</button>
                  <button className="btn-reject" onClick={() => handleReject(req.id)}><XCircle size={18} /> Reject</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No pending verification requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrarDegreeVerification;
