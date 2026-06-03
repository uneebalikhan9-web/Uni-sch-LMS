import React from 'react';
import { User, Student, CheckCircle, Briefcase, GraduationCap, Pencil, Trash } from '@phosphor-icons/react';

const AdmissionsPipeline = ({ stages, onUpdateStage, onEditCandidate, onDeleteCandidate }) => {
  const currentStages = stages || {
    Lead: [],
    Applied: [],
    Interview: [],
    'Merit List': [],
    Admitted: [],
  };

  const stageColors = {
    'Lead': '#94a3b8',
    'Applied': '#3b82f6',
    'Interview': '#8b5cf6',
    'Merit List': '#f59e0b',
    'Admitted': '#10b981'
  };

  const getStageIcon = (stage) => {
    switch (stage.toLowerCase()) {
      case 'lead': return <User size={18} weight="duotone" />;
      case 'applied': return <Briefcase size={18} weight="duotone" />;
      case 'interview': return <Student size={18} weight="duotone" />;
      case 'merit list': return <CheckCircle size={18} weight="duotone" />;
      case 'admitted': return <GraduationCap size={18} weight="duotone" />;
      default: return <User size={18} weight="duotone" />;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="adm-pipeline-stages hidden-scrollbar">
        {Object.entries(currentStages).map(([stageName, applicants]) => {
          const color = stageColors[stageName] || '#64748b';
          
          return (
            <div key={stageName} className="adm-stage-column">
              <div className="adm-stage-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ color: color }}>{getStageIcon(stageName)}</div>
                  <span>{stageName}</span>
                </div>
                <span className="adm-stage-count">{applicants.length}</span>
              </div>
              
              <div className="applicant-list">
                {applicants.map(applicant => (
                  <div key={applicant.id} className="adm-applicant-card" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="adm-applicant-name" style={{ paddingRight: '40px' }}>{applicant.name}</div>
                      <div style={{ display: 'flex', gap: '6px', position: 'absolute', top: '18px', right: '18px' }}>
                        {onEditCandidate && (
                          <button 
                            onClick={() => onEditCandidate(applicant)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b', transition: 'color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                            title="Edit Details"
                          >
                            <Pencil size={14} weight="bold" />
                          </button>
                        )}
                        {onDeleteCandidate && (
                          <button 
                            onClick={() => onDeleteCandidate(applicant.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#64748b', transition: 'color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                            title="Delete Candidate"
                          >
                            <Trash size={14} weight="bold" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="adm-applicant-detail">#{applicant.id.toString().padStart(4, '0')} • {applicant.program}</div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{applicant.date || 'N/A'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {applicant.score && applicant.score !== 'N/A' && (
                          <div style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontWeight: 800 }}>{applicant.score}</div>
                        )}
                        {onUpdateStage && (
                          <select
                            value={stageName}
                            onChange={(e) => onUpdateStage(applicant.id, e.target.value)}
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              color: '#475569',
                              fontWeight: 700,
                              cursor: 'pointer',
                              outline: 'none',
                              transition: 'all 0.2s'
                            }}
                          >
                            <option value="Lead">Lead</option>
                            <option value="Applied">Applied</option>
                            <option value="Interview">Interview</option>
                            <option value="Merit List">Merit List</option>
                            <option value="Admitted">Admitted</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {applicants.length === 0 && (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdmissionsPipeline;