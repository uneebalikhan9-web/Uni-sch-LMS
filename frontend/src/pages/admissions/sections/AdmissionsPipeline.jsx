import React from 'react';
import { User, Student, MapPin, CheckCircle, DotsThree, Briefcase, GraduationCap, Calendar, ArrowRight } from '@phosphor-icons/react';
import { S } from './ADStyles';

const AdmissionsPipeline = ({ stages }) => {
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
      <div className="pipeline-stages hidden-scrollbar">
        {Object.entries(currentStages).map(([stageName, applicants]) => {
          const color = stageColors[stageName] || '#64748b';
          
          return (
            <div key={stageName} className="stage-column">
              <div className="stage-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ color: color }}>{getStageIcon(stageName)}</div>
                  <span>{stageName}</span>
                </div>
                <span className="stage-count">{applicants.length}</span>
              </div>
              
              <div className="applicant-list">
                {applicants.map(applicant => (
                  <div key={applicant.id} className="applicant-card">
                    <div className="applicant-name">{applicant.name}</div>
                    <div className="applicant-detail">#{applicant.id.toString().padStart(4, '0')} • {applicant.program}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{applicant.date || 'N/A'}</div>
                      {applicant.score && (
                        <div style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontWeight: 800 }}>{applicant.score}</div>
                      )}
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