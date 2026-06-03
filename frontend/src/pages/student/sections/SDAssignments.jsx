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
          assignments.map(a => (
            <div key={a.id} style={S.assignmentCard}>
              <div style={S.assignmentHeader}>
                <div>
                  <span style={S.assignmentCourse}>{a.course_title}</span>
                  <span style={S.assignmentDue}>Due: {new Date(a.due_date).toLocaleDateString()}</span>
                </div>
                {a.marks_obtained ? (
                  <span style={S.scoreBadge}>{a.marks_obtained}/{a.max_marks}</span>
                ) : (
                  <span style={{
                    ...S.statusBadge,
                    background: a.submitted_at ? '#e0e7ff' : '#fee2e2',
                    color: a.submitted_at ? '#4338ca' : '#991b1b'
                  }}>
                    {a.submitted_at ? 'Submitted' : 'Pending'}
                  </span>
                )}
              </div>

              <h3 style={S.assignmentTitle}>{a.title}</h3>
              <p style={S.assignmentDesc}>{a.description}</p>
              
              {a.feedback && (
                <div style={S.feedbackBox}>
                  <p style={S.feedbackLabel}>Teacher Feedback:</p>
                  <p style={S.feedbackText}>{a.feedback}</p>
                </div>
              )}

              {!a.marks_obtained && (
                <button 
                  onClick={() => { 
                    setSelectedAssignment(a); 
                    setShowSubmitModal(true); 
                    setSubmissionText(a.submission_text || ''); 
                  }}
                  style={{
                    ...S.submitBtn,
                    background: a.submitted_at ? '#cbd5e1' : 'var(--primary-color, #4f46e5)',
                    color: a.submitted_at ? '#475569' : '#fff'
                  }}
                >
                  {a.submitted_at ? 'Update Submission' : 'Submit Assignment'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
