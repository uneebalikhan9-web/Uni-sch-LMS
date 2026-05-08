import React from 'react';

const RegistrarTranscriptRequests = ({ transcripts, filterData, handleProcessTranscript }) => {
  const filtered = filterData(transcripts, ['student', 'program']);

  return (
    <div className="section">
      <div className="section-header">
        <h3>Transcript Issuance Queue</h3>
        <span className="badge-count">{filtered.length} Requests</span>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Student Name</th>
              <th>Program</th>
              <th>Date Requested</th>
              <th>Current Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td className="id-cell">TSR-{t.id + 500}</td>
                <td className="name-cell">{t.student}</td>
                <td>{t.program}</td>
                <td>{new Date(t.date).toLocaleDateString()}</td>
                <td><span className="status-badge status-warning">{t.status}</span></td>
                <td><button className="btn-verify" onClick={() => handleProcessTranscript(t.id)}>Process</button></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No transcript requests in queue</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrarTranscriptRequests;
