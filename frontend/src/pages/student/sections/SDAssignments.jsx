import React from 'react';
import { ClipboardText, FileText } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDAssignments({ 
  assignments, 
  setSelectedAssignment, 
  setShowSubmitModal, 
  setSubmissionText 
}) {
  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <h2 style={S.tableTitle}>
          <ClipboardText size={28} weight="duotone" color="#0891b2" style={{verticalAlign:'middle', marginRight:'12px'}} />
          My Assignments
        </h2>
      </div>
      <div style={S.assignmentsList}>
        {assignments.length === 0 ? (
          <div style={S.emptyState}>
            <FileText size={48} weight="duotone" color="#94a3b8" />
            <p>No assignments assigned yet.</p>
          </div>
        ) : (
          assignments.map(a => {
            const isVideoLecture = a.assignment_type === 'Video Lecture';
            let isVideoExpired = false;
            let embedUrl = null;
            
            if (isVideoLecture && a.external_link) {
              const createdDate = new Date(a.created_at);
              const diffHours = (new Date() - createdDate) / (1000 * 60 * 60);
              if (diffHours >= 24) {
                isVideoExpired = true;
              } else {
                const ytMatch = a.external_link.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                if (ytMatch && ytMatch[1]) {
                  embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
                } else {
                  embedUrl = a.external_link;
                }
              }
            }

            return (
            <div key={a.id} style={S.assignmentCard}>
              <div style={S.assignmentHeader}>
                <div>
                  <span style={S.assignmentCourse}>{a.course_title}</span>
                  <span style={S.assignmentDue}>Due: {new Date(a.due_date).toLocaleDateString()}</span>
                </div>
                {a.marks_obtained ? (
                  <span style={S.scoreBadge}>{a.marks_obtained}/{a.max_marks}</span>
                ) : !isVideoLecture ? (
                  <span style={{
                    ...S.statusBadge,
                    background: a.submitted_at ? '#e0e7ff' : '#fee2e2',
                    color: a.submitted_at ? '#4338ca' : '#991b1b'
                  }}>
                    {a.submitted_at ? 'Submitted' : 'Pending'}
                  </span>
                ) : null}
              </div>

              <h3 style={S.assignmentTitle}>{a.title}</h3>
              <p style={S.assignmentDesc}>{a.description}</p>
              
              {a.feedback && (
                <div style={S.feedbackBox}>
                  <p style={S.feedbackLabel}>Teacher Feedback:</p>
                  <p style={S.feedbackText}>{a.feedback}</p>
                </div>
              )}

              {/* External Link / Video Render */}
              {a.external_link && !isVideoLecture && (
                <div style={{ marginTop: '12px' }}>
                  <a 
                    href={a.external_link} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ display: 'inline-block', padding: '6px 14px', background: '#e0e7ff', color: '#4f46e5', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                  >
                    🔗 Open Resource Link
                  </a>
                </div>
              )}

              {isVideoLecture && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '15px' }}>Lecture Video</h4>
                  {isVideoExpired ? (
                    <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
                      This video lecture has expired (exceeded 24 hours).
                    </div>
                  ) : embedUrl ? (
                    <>
                      <div style={{ marginBottom: '8px', fontSize: '13px', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', marginRight: '6px', animation: 'pulse 2s infinite' }}></span>
                        Available for 24 hours
                      </div>
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000' }}>
                        <iframe 
                          src={embedUrl} 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        />
                      </div>
                    </>
                  ) : (
                    <a 
                      href={a.external_link} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ display: 'inline-block', padding: '6px 14px', background: '#e0e7ff', color: '#4f46e5', textDecoration: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                    >
                      Open Video Link
                    </a>
                  )}
                </div>
              )}

              {!a.marks_obtained && !a.submitted_at && !isVideoLecture && (
                <button 
                  onClick={() => { 
                    setSelectedAssignment(a); 
                    setShowSubmitModal(true); 
                    setSubmissionText(a.submission_text || ''); 
                  }}
                  style={{
                    ...S.submitBtn,
                    background: 'var(--primary-color, #4f46e5)',
                    color: '#fff',
                    marginTop: '16px'
                  }}
                >
                  Submit Assignment
                </button>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
