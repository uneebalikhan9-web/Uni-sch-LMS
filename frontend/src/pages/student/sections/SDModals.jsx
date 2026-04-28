import React from 'react';
import { Upload } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDModals({ 
  showSubmitModal, 
  setShowSubmitModal, 
  selectedAssignment, 
  handleSubmitAssignment, 
  submissionText, 
  setSubmissionText, 
  submissionFile, 
  setSubmissionFile 
}) {
  if (!showSubmitModal || !selectedAssignment) return null;

  return (
    <div style={S.modalOverlay} onClick={() => setShowSubmitModal(false)}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>Submit Assignment</h3>
          <button onClick={() => setShowSubmitModal(false)} style={S.modalClose}>×</button>
        </div>
        
        <p style={S.modalSubtitle}>{selectedAssignment.title}</p>
        
        <form onSubmit={handleSubmitAssignment} style={S.modalForm}>
          <div style={S.inputGroup}>
            <label style={S.inputLabel}>Your Submission</label>
            <textarea 
              placeholder="Type your answer here..." 
              value={submissionText} 
              onChange={e => setSubmissionText(e.target.value)} 
              style={S.textarea}
            />
          </div>
          
          <div style={S.fileUpload} onClick={() => document.getElementById('fileUpload').click()}>
            <Upload size={24} color="#64748b" />
            <p style={S.uploadText}>
              {submissionFile ? submissionFile.name : 'Click to upload file (optional)'}
            </p>
            <input 
              type="file" 
              id="fileUpload" 
              style={{display:'none'}} 
              onChange={e => setSubmissionFile(e.target.files[0])} 
            />
          </div>

          <div style={S.modalActions}>
            <button type="button" onClick={() => setShowSubmitModal(false)} style={S.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={S.saveBtn}>
              Submit Work
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
