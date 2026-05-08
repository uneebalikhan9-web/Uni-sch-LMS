import React, { useState, useEffect } from 'react';
import { Medal, CheckCircle, Trophy, UserList, ArrowBendRightUp, ShareNetwork } from '@phosphor-icons/react';
import { S } from './ADStyles';

const AdmissionsMeritList = ({ meritList }) => {
  const [list, setList] = useState(meritList || []);

  useEffect(() => {
    if (meritList) setList(meritList);
  }, [meritList]);

  const handleGenerate = () => {
    alert('Generating new merit list based on latest scores...');
  };

  const handlePublish = () => {
    alert('Merit list published to student portal!');
  };

  return (
    <div className="animate-fadeIn">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Merit & Rankings</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Official candidate standing based on aggregate performance</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleGenerate} className="secondary-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowBendRightUp size={18} weight="bold" /> Generate
            </button>
            <button onClick={handlePublish} className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShareNetwork size={18} weight="bold" /> Publish
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Applicant</th>
                <th>Program</th>
                <th>Aggregate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((student, idx) => (
                <tr key={student.id || idx}>
                  <td>
                    <div className="rank-badge">#{idx + 1}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{student.name}</div>
                  </td>
                  <td>
                    <div style={{ color: '#475569', fontWeight: 600 }}>{student.program}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 900, color: '#4f46e5', fontSize: '1.1rem' }}>{student.score}%</div>
                  </td>
                  <td>
                    <span className="status-badge status-verified">
                      {student.status || 'Selected'}
                    </span>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <UserList size={48} weight="duotone" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: '#64748b', margin: 0 }}>No Rankings Available</p>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>Click "Generate List" to process scores.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsMeritList;