import React from 'react';
import { FileText, PlusCircle, PencilSimple, Circle, CalendarBlank, ArrowLeft, Flask, Download, List } from "@phosphor-icons/react";
import { S } from './TDStyles';
import API_BASE_URL from '../../../config/api';

export default function TDAssignments({ 
  assignmentViewMode, 
  setAssignmentViewMode, 
  assignments, 
  assignmentFilter, 
  setAssignmentFilter, 
  setSelectedAssignment, 
  fetchSubmissions, 
  setNewAssignment, 
  setEditingItem, 
  handleBackToAssignments, 
  selectedAssignment, 
  assignmentSubmissions, 
  selectedSubmissionStudent, 
  setSelectedSubmissionStudent, 
  gradeData, 
  setGradeData, 
  setGradingSubmission, 
  handleGradeSubmission, 
  editingItem, 
  courses, 
  newAssignment, 
  showToast 
}) {
  const token = sessionStorage.getItem('token');

  if (assignmentViewMode === 'list') {
    return (
      <div className="animate-fadeIn" style={{ padding: '0 24px' }}>
        <div style={S.tableCard} className="table-container">
          <div style={S.tableHeader}>
            <div>
              <h2 style={S.tableTitle}>
                <FileText size={28} weight="duotone" color="var(--primary-color, #4f46e5)" style={{verticalAlign:'middle', marginRight:'12px'}} />
                Assignments
              </h2>
              <p style={S.tableSubtitle}>Manage and track your course assignments</p>
            </div>
            <button 
              onClick={() => {
                setNewAssignment({ 
                  title: '', description: '', course_id: '', due_date: '', max_marks: 100, 
                  status: 'draft', assignment_type: 'Homework', academic_period: '2026-2027', external_link: '' 
                });
                setEditingItem(null);
                setAssignmentViewMode('create');
              }} 
              style={S.addBtn} 
              className="add-btn"
            >
              <PlusCircle size={18} /> Create Assignment
            </button>
          </div>

          {/* Tabs Filter */}
          <div style={{ padding: '0 28px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid #f1f5f9' }}>
            {['all', 'draft', 'published', 'closed'].map(tab => (
              <button 
                key={tab}
                onClick={() => setAssignmentFilter(tab)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: assignmentFilter === tab ? 'var(--primary-color, #4f46e5)' : 'transparent',
                  color: assignmentFilter === tab ? '#fff' : '#64748b',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={S.assignmentGrid}>
            {assignments
              .filter(a => {
                if (assignmentFilter === 'all') return true;
                if (assignmentFilter === 'draft') return a.status === 'draft';
                if (assignmentFilter === 'published') return a.status === 'published';
                if (assignmentFilter === 'closed') {
                  const dueDate = new Date(a.due_date);
                  const now = new Date();
                  return dueDate < now;
                }
                return true;
              })
              .map(a => {
              const dueDate = new Date(a.due_date);
              const today = new Date();
              const isOverdue = dueDate < today;
              
              return (
                <div key={a.id} style={S.assignmentCard} className="metric-card" onClick={() => { setSelectedAssignment(a); fetchSubmissions(a.id); }}>
                  <div style={S.assignmentCardHeader}>
                    <div style={S.assignmentTags}>
                      <div style={S.tagHomework}>
                        <PencilSimple size={14} weight="bold" /> {a.assignment_type || 'Homework'}
                      </div>
                      <div style={{
                        ...S.tagPublished,
                        background: a.status === 'draft' ? '#f1f5f9' : '#dcfce7',
                        color: a.status === 'draft' ? '#64748b' : '#166534'
                      }}>
                        <Circle size={8} weight="fill" color={a.status === 'draft' ? '#94a3b8' : '#22c55e'} /> 
                        {(a.status || 'published').toUpperCase()}
                      </div>
                    </div>
                    <h3 style={S.assignmentCardTitle}>{a.title}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                      Course: {a.course_title}
                    </p>
                  </div>

                  <div style={S.assignmentCardInfo}>
                    <div style={S.dueInfo}>
                      <div style={S.dueIconWrapper}>
                        <CalendarBlank size={16} weight="bold" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>
                          {isOverdue ? "Overdue" : "Due Date"}
                        </p>
                        <strong style={{ color: isOverdue ? '#ef4444' : '#1e293b' }}>
                          {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </strong>
                      </div>
                    </div>

                    <div style={S.submissionCounterBox}>
                      {a.submission_count || 0} Submissions
                    </div>
                  </div>

                  <div style={S.assignmentCardActions}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedAssignment(a); fetchSubmissions(a.id); }}
                      style={S.viewSubBtn}
                    >
                      <FileText size={18} /> View Submissions
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(a);
                        setNewAssignment({
                          title: a.title,
                          description: a.description || '',
                          course_id: a.course_id,
                          due_date: new Date(a.due_date).toISOString().split('T')[0],
                          max_marks: a.max_marks,
                          status: a.status || 'published',
                          assignment_type: a.assignment_type || 'Homework',
                          academic_period: a.academic_period || '2026-2027',
                          external_link: a.external_link || ''
                        });
                        setAssignmentViewMode('create');
                      }}
                      style={S.editAssignBtn}
                    >
                      <PencilSimple size={18} /> Edit
                    </button>
                  </div>
                </div>
              );
            })}
            
            {assignments.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                <p style={{ color: '#94a3b8' }}>No assignments found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (assignmentViewMode === 'submissions') {
    return (
      <div className="animate-fadeIn">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button 
            onClick={handleBackToAssignments}
            style={{ ...S.iconBtn, background: '#fff', border: '1px solid #e2e8f0', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} weight="bold" />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Assignment Submissions</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', margin: 0 }}>{selectedAssignment?.title}</p>
          </div>
        </div>

        <div style={S.submissionSplitView}>
          {/* Left Pane: Student List */}
          <div style={S.studentListPane} className="hidden-scrollbar">
            <div style={S.paneHeader}>
              <h3 style={S.paneTitle}>Students ({assignmentSubmissions.length})</h3>
            </div>
            
            <div style={S.studentList}>
              {assignmentSubmissions.map(sub => (
                <div 
                  key={sub.id} 
                  style={S.studentItem(selectedSubmissionStudent?.id === sub.id)}
                  onClick={() => {
                    setSelectedSubmissionStudent(sub);
                    setGradeData({
                      marks_obtained: sub.marks_obtained || '',
                      feedback: sub.feedback || ''
                    });
                  }}
                >
                  <div style={S.studentItemInfo}>
                    <span style={S.studentItemName}>{sub.student_name}</span>
                    <span style={S.studentItemId}>{sub.student_id_number || sub.student_email.split('@')[0]}</span>
                    <span style={S.studentItemDate}>
                      {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <span style={{
                    ...S.statusBadge,
                    background: sub.marks_obtained ? '#dcfce7' : '#fef3c7',
                    color: sub.marks_obtained ? '#166534' : '#92400e',
                    padding: '4px 8px',
                    fontSize: '10px'
                  }}>
                    {sub.marks_obtained ? 'Graded' : 'Pending'}
                  </span>
                </div>
              ))}
              {assignmentSubmissions.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No submissions yet</p>
              )}
            </div>
          </div>

          {/* Right Pane: Grading Details */}
          <div style={S.gradingPane} className="hidden-scrollbar">
            {selectedSubmissionStudent ? (
              <div style={S.submissionContent}>
                <div style={S.gradingHeader}>
                  <div style={S.gradableInfo}>
                    <h2 style={S.gradableName}>{selectedSubmissionStudent.student_name}</h2>
                    <p style={S.gradableSubText}>
                      Student ID: {selectedSubmissionStudent.student_id_number || "LT-" + selectedSubmissionStudent.student_id} • {selectedSubmissionStudent.student_email}
                    </p>
                  </div>
                  <div style={S.statusText}>
                    Submitted<br/>
                    {new Date(selectedSubmissionStudent.submitted_at).toLocaleString('en-GB', { 
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>

                {selectedAssignment?.assignment_type === 'Video Lecture' && (
                  <div style={S.contentSection}>
                    <label style={S.sectionLabel}><Clock size={18} /> Video Watch Time</label>
                    <div style={{ ...S.textSubmission, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color, #4f46e5)' }}>
                      {selectedSubmissionStudent.watch_time_seconds ? 
                        `${Math.floor(selectedSubmissionStudent.watch_time_seconds / 60)} minutes ${selectedSubmissionStudent.watch_time_seconds % 60} seconds` : 
                        '0 minutes 0 seconds'
                      }
                    </div>
                  </div>
                )}

                {selectedSubmissionStudent.submission_text && (
                  <div style={S.contentSection}>
                    <label style={S.sectionLabel}><FileText size={18} /> Student Submission</label>
                    <div style={S.textSubmission}>{selectedSubmissionStudent.submission_text}</div>
                  </div>
                )}

                {selectedSubmissionStudent.file_path && (
                  <div style={S.contentSection}>
                    <label style={S.sectionLabel}><Flask size={18} /> Attachments</label>
                    <div style={S.attachmentCard}>
                      <div style={S.fileIcon}>
                        <FileText size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>{selectedSubmissionStudent.submitted_file_name || "Attachment"}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Submission File</p>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch(`${API_BASE_URL}/api/submissions/${selectedSubmissionStudent.id}/download`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = selectedSubmissionStudent.submitted_file_name || 'submission';
                            a.click();
                          } catch (err) { showToast('Download failed', 'error'); }
                        }}
                        style={{ ...S.iconBtn, color: 'var(--primary-color, #4f46e5)' }}
                      >
                        <Download size={18} />
                      </button>
                    </div>

                    {/* Image Preview */}
                    {(selectedSubmissionStudent.file_path.toLowerCase().endsWith('.png') || 
                      selectedSubmissionStudent.file_path.toLowerCase().endsWith('.jpg') || 
                      selectedSubmissionStudent.file_path.toLowerCase().endsWith('.jpeg')) && (
                      <div style={S.filePreview}>
                        <img 
                          src={`${API_BASE_URL}/${selectedSubmissionStudent.file_path.replace(/\\/g, '/')}`} 
                          alt="Submission Preview" 
                          style={S.previewImg} 
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Grading Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setGradingSubmission(selectedSubmissionStudent);
                  handleGradeSubmission(e);
                }} style={S.gradingForm}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>Grade Submission</h4>
                  <div style={S.row}>
                    <div style={{ ...S.inputGroup, flex: 1 }}>
                      <label style={S.inputLabel}>Score (out of {selectedAssignment?.max_marks || 100})</label>
                      <input 
                        type="number" 
                        placeholder="Enter score" 
                        style={S.input}
                        value={gradeData.marks_obtained}
                        onChange={(e) => setGradeData({ ...gradeData, marks_obtained: e.target.value })}
                        max={selectedAssignment?.max_marks}
                        min={0}
                        required
                      />
                    </div>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Feedback</label>
                    <textarea 
                      placeholder="Enter feedback for the student..." 
                      style={{ ...S.input, minHeight: '120px', resize: 'vertical' }}
                      value={gradeData.feedback}
                      onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="submit" style={S.saveBtn} className="save-btn">Submit Grade</button>
                    <button type="button" onClick={handleBackToAssignments} style={S.cancelBtn} className="cancel-btn">Back to List</button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 40px', color: '#94a3b8' }}>
                <FileText size={64} weight="duotone" />
                <p style={{ marginTop: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Select a student from the left to view and grade their submission.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* CREATE / EDIT ASSIGNMENT PAGE */
  return (
    <div className="animate-fadeIn" style={{ padding: '0 24px' }}>
      <button 
        onClick={() => setAssignmentViewMode('list')}
        style={S.backToLink}
      >
        <ArrowLeft size={16} /> Back to Assignments
      </button>
      
      <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
        {editingItem ? 'Edit Assignment' : 'Create New Assignment'}
      </h2>
      <p style={{ color: '#64748b', marginBottom: '32px', fontWeight: '500' }}>
        Fill in the details below to {editingItem ? 'update your' : 'create a new'} assignment
      </p>

      <div style={S.createFormContainer}>
        {/* Course Selection */}
        <div style={S.formSection}>
          <h3 style={S.sectionTitle}><Flask size={20} weight="fill" color="var(--primary-color, #4f46e5)" /> Course Selection</h3>
          <div style={S.inputGroup}>
            <label style={S.inputLabel}>Select Course</label>
            <select 
              style={S.input}
              value={newAssignment.course_id}
              onChange={(e) => setNewAssignment({ ...newAssignment, course_id: e.target.value })}
              required
            >
              <option value="">Select a course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Basic Information */}
        <div style={S.formSection}>
          <h3 style={S.sectionTitle}><FileText size={20} weight="fill" color="var(--primary-color, #4f46e5)" /> Basic Information</h3>
          <div style={S.formGrid}>
            <div style={{ ...S.inputGroup, ...S.fullWidth }}>
              <label style={S.inputLabel}>Assignment Name *</label>
              <input 
                type="text" 
                placeholder="Enter assignment name" 
                style={S.input}
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                required
              />
            </div>
            
            <div style={S.inputGroup}>
              <label style={S.inputLabel}>Assignment Type *</label>
              <select 
                style={S.input}
                value={newAssignment.assignment_type}
                onChange={(e) => setNewAssignment({ ...newAssignment, assignment_type: e.target.value })}
              >
                <option value="Homework">Homework</option>
                <option value="Project">Project</option>
                <option value="Quiz">Quiz</option>
                <option value="Lab">Lab</option>
                <option value="Video Lecture">Video Lecture</option>
              </select>
            </div>

            <div style={{ ...S.inputGroup, ...S.fullWidth }}>
              <label style={S.inputLabel}>External URL / YouTube Link {newAssignment.assignment_type === 'Video Lecture' && '*'}</label>
              <input 
                type="url" 
                placeholder="https://..." 
                style={S.input}
                value={newAssignment.external_link || ''}
                onChange={(e) => setNewAssignment({ ...newAssignment, external_link: e.target.value })}
                required={newAssignment.assignment_type === 'Video Lecture'}
              />
              {newAssignment.assignment_type === 'Video Lecture' && (
                <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: '600' }}>
                  Video Lectures will automatically expire 24 hours after creation.
                </span>
              )}
            </div>

            <div style={S.inputGroup}>
              <label style={S.inputLabel}>Status *</label>
              <select 
                style={S.input}
                value={newAssignment.status}
                onChange={(e) => setNewAssignment({ ...newAssignment, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div style={S.inputGroup}>
              <label style={S.inputLabel}>Academic Period *</label>
              <select 
                style={S.input}
                value={newAssignment.academic_period}
                onChange={(e) => setNewAssignment({ ...newAssignment, academic_period: e.target.value })}
              >
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>

            <div style={S.inputGroup}>
              <label style={S.inputLabel}>Maximum Marks *</label>
              <input 
                type="number" 
                style={S.input}
                value={newAssignment.max_marks}
                onChange={(e) => setNewAssignment({ ...newAssignment, max_marks: e.target.value })}
              />
            </div>

            <div style={S.inputGroup}>
              <label style={S.inputLabel}>Due Date & Time *</label>
              <input 
                type="datetime-local" 
                style={S.input}
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={S.formSection}>
          <h3 style={S.sectionTitle}><List size={20} weight="fill" color="var(--primary-color, #4f46e5)" /> Description</h3>
          <div style={S.inputGroup}>
            <label style={S.inputLabel}>Text Description *</label>
            <textarea 
              placeholder="Enter description and details..." 
              style={S.richTextPlaceholder}
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <button 
            onClick={(e) => { e.preventDefault(); handleGradeSubmission(e); }} 
            style={S.saveBtn} 
            className="save-btn"
          >
            {editingItem ? 'Update Assignment' : 'Create Assignment'}
          </button>
          <button 
            onClick={() => setAssignmentViewMode('list')} 
            style={{ ...S.cancelBtn, flex: 1 }} 
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
