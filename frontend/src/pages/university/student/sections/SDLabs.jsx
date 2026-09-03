import React from 'react';
import LabPlayer from '../../../LabPlayer';
import { S } from './SDStyles';

export default function SDLabs({ 
  selectedLab, 
  setSelectedLab, 
  availableLabs, 
  user 
}) {
  return (
    <div className="animate-fadeIn">
      {selectedLab ? (
          <div style={{width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e293b', background: '#000', height: '92vh'}}>
             <LabPlayer 
               labName={selectedLab.name} 
               labId={selectedLab.id} 
               url={selectedLab.url}
               environment={selectedLab.environment}
               user={user} 
               onBack={() => setSelectedLab(null)}
             />
          </div>
      ) : (
        <div>
          <h2 style={S.sectionTitle}>🔬 Cloud Labs</h2>
          <p style={S.subtitle}>Access your virtual environments and hands-on practice labs.</p>
          
          <div style={{...S.coursesGrid, marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px'}}>
             {availableLabs.length === 0 ? (
               <div style={S.emptyState}>No labs assigned yet.</div>
             ) : (
               availableLabs.map(lab => (
                 <div key={lab.id} style={S.courseCard}>
                    <div style={S.courseCardHeader}>
                      <div style={{...S.courseIcon, fontSize: '32px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px'}}>
                        {lab.icon || '🔗'}
                      </div>
                      <span style={S.availableTag}>Ready</span>
                    </div>
                    <h3 style={S.courseTitle}>{lab.name}</h3>
                    <p style={S.courseDesc}>{lab.description}</p>
                    <button 
                      onClick={() => setSelectedLab(lab)}
                      style={{...S.enrollBtn, marginTop: '16px'}}
                    >
                      Start Lab
                    </button>
                 </div>
               ))
             )}
          </div>
        </div>
      )}
    </div>
  );
}
