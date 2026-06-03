import React, { useState } from 'react';
import { MagnifyingGlass, Funnel, Pencil, Trash } from '@phosphor-icons/react';

const AdmissionsApplicants = ({ stages, onUpdateStage, onEditCandidate, onDeleteCandidate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  // Flatten the pipeline stages object into a single array of candidates
  const allApplicants = Object.entries(stages || {}).flatMap(([stageName, list]) =>
    (list || []).map(app => ({ ...app, stage: stageName }))
  );

  // Filter candidates based on search term and stage filter
  const filteredApplicants = allApplicants.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toString().includes(searchTerm);
    
    const matchesStage = stageFilter === 'All' || app.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const stageColors = {
    'Lead': { bg: '#f1f5f9', text: '#475569' },
    'Applied': { bg: '#eff6ff', text: '#1d4ed8' },
    'Interview': { bg: '#f5f3ff', text: '#6d28d9' },
    'Merit List': { bg: '#fffbeb', text: '#b45309' },
    'Admitted': { bg: '#ecfdf5', text: '#047857' }
  };

  return (
    <div className="animate-fadeIn">
      {/* Search and Filters bar */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '400px' }}>
          <MagnifyingGlass 
            size={18} 
            color="#94a3b8" 
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input 
            type="text" 
            placeholder="Search by name, email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 16px 12px 48px', 
              borderRadius: '14px', 
              border: '1px solid #e2e8f0', 
              fontSize: '0.9rem', 
              outline: 'none',
              boxSizing: 'border-box',
              background: '#fff'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            <Funnel size={18} />
            <span>Filter Stage:</span>
          </div>
          <select 
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            style={{ 
              padding: '10px 16px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              fontSize: '0.9rem', 
              background: '#fff', 
              outline: 'none',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Stages</option>
            <option value="Lead">Lead</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Merit List">Merit List</option>
            <option value="Admitted">Admitted</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="adm-card" style={{ padding: '24px', overflowX: 'auto' }}>
        <table className="adm-data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Candidate Name</th>
              <th>Program</th>
              <th>Merit Score</th>
              <th>Applied Date</th>
              <th>Current Stage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplicants.map(applicant => {
              const badge = stageColors[applicant.stage] || { bg: '#f1f5f9', text: '#475569' };
              return (
                <tr key={applicant.id}>
                  <td style={{ fontWeight: 700, color: '#64748b' }}>
                    #{applicant.id.toString().padStart(4, '0')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{applicant.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{applicant.email}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#334155' }}>
                    {applicant.program}
                  </td>
                  <td>
                    {applicant.score && applicant.score !== 'N/A' ? (
                      <span style={{ fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        {applicant.score}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                    {applicant.date}
                  </td>
                  <td>
                    <span 
                      style={{ 
                        background: badge.bg, 
                        color: badge.text,
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        display: 'inline-block'
                      }}
                    >
                      {applicant.stage}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {onUpdateStage && (
                        <select 
                          value={applicant.stage}
                          onChange={(e) => onUpdateStage(applicant.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="Lead">Move to Lead</option>
                          <option value="Applied">Move to Applied</option>
                          <option value="Interview">Move to Interview</option>
                          <option value="Merit List">Move to Merit List</option>
                          <option value="Admitted">Move to Admitted</option>
                        </select>
                      )}
                      
                      {onEditCandidate && (
                        <button 
                          onClick={() => onEditCandidate(applicant)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                          onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                          title="Edit Details"
                        >
                          <Pencil size={16} weight="bold" />
                        </button>
                      )}
                      
                      {onDeleteCandidate && (
                        <button 
                          onClick={() => onDeleteCandidate(applicant.id)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                          title="Delete Candidate"
                        >
                          <Trash size={16} weight="bold" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredApplicants.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontWeight: 600 }}>
                  No candidates found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdmissionsApplicants;
