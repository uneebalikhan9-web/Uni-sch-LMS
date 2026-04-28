import React from 'react';
import { X, ChartLine, UserCircle, GraduationCap, CheckCircle, WarningCircle, ChartBar, FileText, Users } from "@phosphor-icons/react";
import { S } from './TDStyles';
import API_BASE_URL from '../../../config/api';

export default function TDModals({ 
  showReportModal, 
  setShowReportModal, 
  selectedReport, 
  reportDetails, 
  isReportDetailsLoading, 
  fetchReportDetails,
  showGradeModal,
  setShowGradeModal,
  selectedCourse,
  editingItem,
  setEditingItem,
  newGrade,
  setNewGrade,
  students,
  showToast,
  fetchCourseGrades,
  token,
  showBulkGradeModal,
  setShowBulkGradeModal,
  bulkGradeHeader,
  setBulkGradeHeader,
  bulkGrades,
  setBulkGrades,
  showAddStudentModal,
  setShowAddStudentModal,
  handleAddStudent,
  newStudent,
  setNewStudent,
  showProfileModal,
  setShowProfileModal,
  selectedStudentProfile
}) {
  return (
    <>
      {/* DETAILED REPORT MODAL */}
      {showReportModal && selectedReport && (
        <div style={S.modalOverlay} onClick={() => setShowReportModal(false)} className="modal-overlay">
          <div style={{...S.modal, maxWidth: '800px', width: '95%'}} onClick={e => e.stopPropagation()} className="modal animate-slideUp">
            <div style={S.modalHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{width:'48px', height:'48px', borderRadius:'16px', background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', color:'#7c3aed'}}>
                  <ChartLine size={24} weight="duotone" color="#7c3aed" />
                </div>
                <div>
                  <h2 style={S.modalTitle}>{selectedReport.course_title}</h2>
                  <p style={{margin:0, fontSize:'14px', color:'#64748b'}}>Detailed Academic Performance Report</p>
                </div>
              </div>
              <button style={S.modalClose} onClick={() => setShowReportModal(false)}>×</button>
            </div>
            
            <div style={{padding: '24px', maxHeight: '70vh', overflowY: 'auto'}} className="hidden-scrollbar">
              {isReportDetailsLoading ? (
                <div style={{textAlign:'center', padding:'40px', color:'#64748b'}}>Fetching detailed metrics...</div>
              ) : reportDetails ? (
                <>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'16px', marginBottom:'24px'}}>
                    <div style={{padding:'20px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:600}}>AVERAGE MARKS</span>
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#0f172a'}}>{parseFloat(reportDetails?.teacher_performance?.avg_student_marks || 0).toFixed(1)}%</h3>
                    </div>
                    <div style={{padding:'20px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:600}}>ATTENDANCE</span>
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#0f172a'}}>{parseFloat(reportDetails?.teacher_performance?.avg_attendance || 0).toFixed(1)}%</h3>
                    </div>
                    <div style={{padding:'20px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:600}}>PASS RATE</span>
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#166534'}}>
                        {selectedReport.total_students > 0 ? Math.round((selectedReport.pass_count / selectedReport.total_students) * 100) : 0}%
                      </h3>
                    </div>
                  </div>

                  <div style={{marginBottom:'24px', padding:'20px', borderRadius:'24px', background:'linear-gradient(135deg, #f5f3ff, #fdf4ff)', border:'1px solid #ddd6fe'}}>
                    <h3 style={{margin:'0 0 12px', fontSize:'16px', color:'#5b21b6', display:'flex', alignItems:'center', gap:'8px'}}>
                      <UserCircle size={20} color="#7c3aed" /> Teacher Progress: {selectedReport.teacher_name}
                    </h3>
                    <div style={{display:'flex', gap:'24px', flexWrap: 'wrap'}}>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:600}}>RATING</span>
                        <div style={{display:'flex', alignItems:'center', gap:'4px', marginTop:'4px'}}>
                          <span style={{fontSize:'20px', fontWeight:700, color:'#5b21b6'}}>{reportDetails?.teacher_performance?.rating || "N/A"}</span>
                          <span style={{fontSize:'14px', color:'#a78bfa'}}>/ 5.0</span>
                        </div>
                      </div>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:600}}>FEEDBACKS</span>
                        <div style={{marginTop:'4px', fontSize:'18px', fontWeight:600, color:'#5b21b6'}}>
                          {reportDetails?.teacher_performance?.feedback_count || 0} Students
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 style={{marginBottom:'16px', fontSize:'16px', color:'#1e293b', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <GraduationCap size={20} color="#7c3aed" /> Student-wise Performance
                  </h3>
                  <div style={{border:'1px solid #e2e8f0', borderRadius:'20px', overflow:'hidden'}}>
                    <div style={{overflowX: 'auto'}}>
                      <table style={{width:'100%', borderCollapse:'collapse', minWidth:'500px'}}>
                        <thead>
                          <tr style={{background:'#f8fafc'}}>
                            <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b'}}>STUDENT NAME</th>
                            <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b'}}>MARKS (%)</th>
                            <th style={{padding:'12px 20px', textAlign:'right', fontSize:'12px', color:'#64748b'}}>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(reportDetails?.students || []).map(s => (
                            <tr key={s.id} style={{borderTop:'1px solid #f1f5f9'}}>
                              <td style={{padding:'12px 20px', fontSize:'14px', fontWeight:600, color:'#0f172a'}}>{s.name}</td>
                              <td style={{padding:'12px 20px', fontSize:'14px', color:'#64748b'}}>
                                {s.marks_obtained ? `${s.marks_obtained} / ${s.max_marks} (${s.percentage}%)` : 'Not Graded'}
                              </td>
                              <td style={{padding:'12px 20px', textAlign:'right'}}>
                                {s.status === 'Pass' ? (
                                  <span style={{display:'inline-flex', alignItems:'center', gap:'4px', color:'#166534', fontWeight:700, fontSize:'13px'}}>
                                    <CheckCircle weight="fill" /> PASS
                                  </span>
                                ) : (
                                  <span style={{display:'inline-flex', alignItems:'center', gap:'4px', color:'#ef4444', fontWeight:700, fontSize:'13px'}}>
                                    <WarningCircle weight="fill" /> FAIL
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{...S.emptyState, padding: '40px'}}>
                  <ChartBar size={48} weight="duotone" color="#94a3b8" />
                  <h3 style={{color:'#1e293b', marginBottom:'8px', marginTop: '16px'}}>No detailed records found</h3>
                  <p style={{color:'#64748b', fontSize:'14px', maxWidth:'400px', margin:'0 auto 24px'}}>
                    We couldn't find student-wise breakdowns for this course report.
                  </p>
                  <button onClick={() => fetchReportDetails(selectedReport)} style={{...S.cancelBtn, background:'#f1f5f9', padding:'10px 20px', fontSize:'14px'}}>
                    🔄 Try Refreshing
                  </button>
                </div>
              )}
            </div>
            
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={() => setShowReportModal(false)}>Close Report</button>
              <button style={{...S.submitBtn, background:'#1e293b'}} onClick={() => window.print()}>🖨️ Print PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* GRADE MODAL */}
      {showGradeModal && (
        <div style={S.modalOverlay} onClick={() => { setShowGradeModal(false); setEditingItem(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Record Grade</h3>
            <p style={S.modalSubtitle}>Course: <strong>{selectedCourse?.title}</strong></p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedCourse) { showToast('Please select a course first!', 'warning'); return; }
              try {
                const method = editingItem ? 'PUT' : 'POST';
                const url = editingItem ? `${API_BASE_URL}/api/grades/${editingItem.id}` : `${API_BASE_URL}/api/grades`;
                const response = await fetch(url, {
                  method,
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    student_id: newGrade.student_id, course_id: selectedCourse.id, exam_type: newGrade.exam_type,
                    marks_obtained: newGrade.marks_obtained, max_marks: newGrade.max_marks,
                    exam_date: newGrade.exam_date, remarks: newGrade.remarks
                  })
                });
                const resData = await response.json();
                if (resData.success) {
                  showToast(`Grade ${editingItem ? 'updated' : 'saved'} successfully!`, 'success');
                  setShowGradeModal(false);
                  setNewGrade({ student_id: '', exam_type: 'midterm', marks_obtained: '', max_marks: 100, exam_date: '', remarks: '' });
                  setEditingItem(null);
                  fetchCourseGrades(selectedCourse.id);
                } else { showToast(resData.message || 'Error saving grade', 'error'); }
              } catch (error) { showToast('Error saving grade', 'error'); }
            }} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Student</label>
                <select required value={newGrade.student_id} onChange={e => setNewGrade({...newGrade, student_id: e.target.value})} style={S.input}>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Exam Type</label>
                <select required value={newGrade.exam_type} onChange={e => setNewGrade({...newGrade, exam_type: e.target.value})} style={S.input}>
                  <option value="midterm">Midterm Exam</option>
                  <option value="final">Final Exam</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>
              <div style={S.row}>
                <div style={{flex:1}}>
                  <label style={S.inputLabel}>Marks Obtained</label>
                  <input type="number" required value={newGrade.marks_obtained} onChange={e => setNewGrade({...newGrade, marks_obtained: e.target.value})} style={S.input} />
                </div>
                <div style={{flex:1}}>
                  <label style={S.inputLabel}>Max Marks</label>
                  <input type="number" required value={newGrade.max_marks} onChange={e => setNewGrade({...newGrade, max_marks: e.target.value})} style={S.input} />
                </div>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Exam Date</label>
                <input type="date" required value={newGrade.exam_date} onChange={e => setNewGrade({...newGrade, exam_date: e.target.value})} style={S.input} />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Remarks (Optional)</label>
                <textarea placeholder="Additional comments..." value={newGrade.remarks} onChange={e => setNewGrade({...newGrade, remarks: e.target.value})} style={{...S.input, height:'60px'}} />
              </div>
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowGradeModal(false); setEditingItem(null); }} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK GRADE MODAL */}
      {showBulkGradeModal && (
        <div style={S.modalOverlay} onClick={() => setShowBulkGradeModal(false)}>
          <div style={{...S.modal, width: '900px', maxWidth: '95vw'}} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Bulk Batch Grading</h3>
            <p style={S.modalSubtitle}>Excel-style grading for <strong>{selectedCourse?.title}</strong></p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`${API_BASE_URL}/api/grades/bulk`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    course_id: selectedCourse.id, exam_type: bulkGradeHeader.exam_type,
                    max_marks: bulkGradeHeader.max_marks, exam_date: bulkGradeHeader.exam_date,
                    grades: bulkGrades.filter(g => g.marks_obtained !== '').map(g => ({
                      student_id: g.student_id, marks_obtained: parseFloat(g.marks_obtained), remarks: g.remarks
                    }))
                  })
                });
                const resData = await response.json();
                if (resData.success) {
                  showToast(`Successfully saved ${resData.message}`, 'success');
                  setShowBulkGradeModal(false);
                  fetchCourseGrades(selectedCourse.id);
                } else { showToast(resData.message || 'Error saving bulk grades', 'error'); }
              } catch (err) { showToast('Error saving bulk grades', 'error'); }
            }}>
              <div style={{display:'flex', gap:'20px', marginBottom:'24px', padding:'20px', background:'#f8fafc', borderRadius:'16px', border:'1px solid #e2e8f0'}}>
                <div style={{flex:1}}>
                  <label style={S.inputLabel}>Exam Type</label>
                  <select required value={bulkGradeHeader.exam_type} onChange={e => setBulkGradeHeader({...bulkGradeHeader, exam_type: e.target.value})} style={S.input}>
                    <option value="midterm">Midterm Exam</option>
                    <option value="final">Final Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>
                <div style={{flex:1}}>
                  <label style={S.inputLabel}>Max Marks</label>
                  <input type="number" required value={bulkGradeHeader.max_marks} onChange={e => setBulkGradeHeader({...bulkGradeHeader, max_marks: e.target.value})} style={S.input} />
                </div>
                <div style={{flex:1}}>
                  <label style={S.inputLabel}>Exam Date</label>
                  <input type="date" required value={bulkGradeHeader.exam_date} onChange={e => setBulkGradeHeader({...bulkGradeHeader, exam_date: e.target.value})} style={S.input} />
                </div>
              </div>
              <div style={{maxHeight:'400px', overflowY:'auto', border:'1px solid #e2e8f0', borderRadius:'12px', marginBottom:'24px'}} className="hidden-scrollbar">
                <table style={{width:'100%', borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b'}}>STUDENT NAME</th>
                      <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b', width:'150px'}}>MARKS</th>
                      <th style={{padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b'}}>REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkGrades.map((bg, index) => (
                      <tr key={bg.student_id} style={{borderTop:'1px solid #f1f5f9'}}>
                        <td style={{padding:'12px 20px', fontSize:'14px', fontWeight:600, color:'#0f172a'}}>{bg.student_name}</td>
                        <td style={{padding:'8px 20px'}}>
                          <input type="number" placeholder="Marks" value={bg.marks_obtained} onChange={(e) => {
                            const newList = [...bulkGrades]; newList[index].marks_obtained = e.target.value; setBulkGrades(newList);
                          }} style={{...S.input, padding:'8px 12px', margin:0}} />
                        </td>
                        <td style={{padding:'8px 20px'}}>
                          <input type="text" placeholder="Add remarks..." value={bg.remarks} onChange={(e) => {
                            const newList = [...bulkGrades]; newList[index].remarks = e.target.value; setBulkGrades(newList);
                          }} style={{...S.input, padding:'8px 12px', margin:0}} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowBulkGradeModal(false)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Save All Grades</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && (
        <div style={S.modalOverlay} onClick={() => setShowAddStudentModal(false)}>
          <div style={{...S.modal, width:'600px', padding:'0', overflow:'hidden'}} onClick={e => e.stopPropagation()}>
            <div style={{background: 'linear-gradient(135deg, #0f172a, #334155)', padding: '24px 30px', color: 'white', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <h3 style={{margin:0, fontSize:'1.25rem', fontWeight:'800'}}>Student Enrollment</h3>
                <p style={{margin:'4px 0 0', opacity:0.8, fontSize:'0.85rem'}}>Add individual student or upload bulk list</p>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}><X size={24} /></button>
            </div>

            <div style={{padding:'30px', maxHeight:'70vh', overflowY:'auto'}}>
              {/* Bulk Upload Section */}
              <div style={{marginBottom:'30px', padding:'20px', background:'#f8fafc', border:'2px dashed #e2e8f0', borderRadius:'16px', textAlign:'center'}}>
                <FileText size={32} color="#64748b" style={{marginBottom:'12px'}} />
                <h4 style={{margin:'0 0 8px', color:'#0f172a'}}>Bulk Registration</h4>
                <p style={{margin:'0 0 16px', fontSize:'0.85rem', color:'#64748b'}}>Upload Excel (.xlsx) or CSV file with student details</p>
                <input 
                  type="file" 
                  id="bulk-upload" 
                  hidden 
                  accept=".csv, .xlsx, .xls"
                  onChange={(e) => handleBulkStudentUpload(e.target.files[0])}
                />
                <label htmlFor="bulk-upload" style={{display:'inline-block', padding:'10px 24px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', color:'#0f172a', fontWeight:'700', cursor:'pointer', fontSize:'0.9rem'}}>
                  📁 Choose File
                </label>
              </div>

              <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px'}}>
                <div style={{flex:1, height:'1px', background:'#e2e8f0'}}></div>
                <span style={{fontSize:'0.75rem', fontWeight:'800', color:'#94a3b8', textTransform:'uppercase'}}>OR INDIVIDUAL ADD</span>
                <div style={{flex:1, height:'1px', background:'#e2e8f0'}}></div>
              </div>

              <form onSubmit={handleAddStudent} style={S.modalForm}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Student Name</label>
                    <input type="text" placeholder="Full Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name:e.target.value})} style={S.input} required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Email Address</label>
                    <input type="email" placeholder="student@example.com" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email:e.target.value})} style={S.input} required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Father's Name</label>
                    <input type="text" placeholder="Father's Name" value={newStudent.father_name} onChange={e => setNewStudent({...newStudent, father_name:e.target.value})} style={S.input} required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Father's CNIC</label>
                    <input type="text" placeholder="xxxxx-xxxxxxx-x" value={newStudent.father_cnic} onChange={e => setNewStudent({...newStudent, father_cnic:e.target.value})} style={S.input} required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>B-Form / CNIC</label>
                    <input type="text" placeholder="Student CNIC" value={newStudent.bform_number} onChange={e => setNewStudent({...newStudent, bform_number:e.target.value})} style={S.input} required />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Father's Phone</label>
                    <input type="text" placeholder="03xx-xxxxxxx" value={newStudent.father_number} onChange={e => setNewStudent({...newStudent, father_number:e.target.value})} style={S.input} required />
                  </div>
                  <div style={{...S.inputGroup, gridColumn:'span 2'}}>
                    <label style={S.inputLabel}>Last Education (Optional)</label>
                    <input type="text" placeholder="e.g. Matric / O-Levels" value={newStudent.last_education} onChange={e => setNewStudent({...newStudent, last_education:e.target.value})} style={S.input} />
                  </div>
                  <div style={{...S.inputGroup, gridColumn:'span 2'}}>
                    <label style={S.inputLabel}>Set Password</label>
                    <input type="password" placeholder="••••••••" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password:e.target.value})} style={S.input} />
                  </div>
                </div>

                <div style={{...S.modalActions, marginTop:'30px'}}>
                  <button type="button" onClick={() => setShowAddStudentModal(false)} style={S.cancelBtn}>Cancel</button>
                  <button type="submit" style={{...S.saveBtn, background:'#0f172a'}}>Register Student</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE VIEW MODAL */}
      <StudentProfileModal show={showProfileModal} student={selectedStudentProfile} onClose={() => setShowProfileModal(false)} />
    </>
  );
}

// ─── Student Profile View Modal ───────────────────────────────────────────────
export function StudentProfileModal({ show, student, onClose }) {
  if (!show || !student) return null;
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modal, width:'650px', padding:0, borderRadius:'32px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.2)', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()} className="animate-slideUp">
        
        {/* Header Section with Gradient & Avatar */}
        <div style={{ background:'linear-gradient(135deg, #4f46e5, #818cf8)', padding:'40px 30px', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'24px', position:'relative', zIndex:1 }}>
            <div style={{ width:'80px', height:'80px', borderRadius:'28px', background:'rgba(255,255,255,0.2)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:800, color:'#fff', border:'2px solid rgba(255,255,255,0.3)', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' }}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ ...S.modalTitle, color:'#fff', fontSize:'1.8rem', marginBottom:'8px', letterSpacing:'-0.02em' }}>{student.name}</h2>
              <div style={{ display:'flex', gap:'10px' }}>
                <span style={{ padding:'6px 14px', borderRadius:'14px', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(5px)', fontSize:'12px', fontWeight:700, color:'#fff', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <Users size={14} style={{ marginRight:'6px', verticalAlign:'middle' }} /> {student.roll_number}
                </span>
                <span style={{ padding:'6px 14px', borderRadius:'14px', background:'rgba(255,255,255,0.15)', backdropFilter:'blur(5px)', fontSize:'12px', fontWeight:700, color:'#fff', border:'1px solid rgba(255,255,255,0.1)' }}>
                   Semester {student.semester}
                </span>
              </div>
            </div>
          </div>
          <button style={{ ...S.modalClose, color:'#fff', top:'20px', right:'20px', background:'rgba(255,255,255,0.1)', borderRadius:'50%', width:'36px', height:'36px', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
            <X size={20} weight="bold" />
          </button>
        </div>
        
        <div style={{ padding:'35px', background:'#fff' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px' }}>
            
            {/* Left Column: Academic & Personal */}
            <div>
              <h4 style={{ fontSize:'12px', color:'#94a3b8', fontWeight:800, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}>
                <UserCircle size={18} weight="duotone" color="#4f46e5" /> Student Profile
              </h4>
              <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                <InfoRow label="Email Address" value={student.email} icon={<FileText size={16} />} />
                <InfoRow label="B-Form / CNIC" value={student.bform_number || 'Not Provided'} icon={<Users size={16} />} />
                <InfoRow label="Last Education" value={student.last_education || 'N/A'} icon={<GraduationCap size={16} />} />
              </div>
            </div>

            {/* Right Column: Family & Guardian */}
            <div>
              <h4 style={{ fontSize:'12px', color:'#94a3b8', fontWeight:800, textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}>
                <Users size={18} weight="duotone" color="#818cf8" /> Guardian Info
              </h4>
              <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                <InfoRow label="Father's Name" value={student.father_name || 'N/A'} icon={<UserCircle size={16} />} />
                <InfoRow label="Father's CNIC" value={student.father_cnic || 'N/A'} icon={<Users size={16} />} />
                <InfoRow label="Guardian Phone" value={student.father_number || 'N/A'} icon={<GraduationCap size={16} />} isLink={`tel:${student.father_number}`} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding:'25px 35px', background:'#f8fafc', borderTop:'1px solid #f1f5f9' }}>
          <button style={{ ...S.saveBtn, width:'100%', height:'54px', borderRadius:'18px', fontSize:'15px', fontWeight:700, background:'#0f172a', boxShadow:'0 10px 20px rgba(0,0,0,0.1)' }} onClick={onClose}>
            Close Profile View
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for info rows
function InfoRow({ label, value, icon, isLink }) {
  return (
    <div style={{ display:'flex', gap:'14px' }}>
      <div style={{ width:'36px', height:'36px', borderRadius:'12px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin:0, fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase' }}>{label}</p>
        {isLink ? (
          <a href={isLink} style={{ margin:'2px 0 0', fontSize:'14px', color:'#4f46e5', fontWeight:600, textDecoration:'none', display:'block' }}>{value}</a>
        ) : (
          <p style={{ margin:'2px 0 0', fontSize:'14px', color:'#1e293b', fontWeight:600 }}>{value}</p>
        )}
      </div>
    </div>
  );
}

function GraduationCap({ size, style }) {
  return <GraduationCapIcon size={size} style={style} />;
}
const GraduationCapIcon = ({ size, style }) => <FileText size={size} style={style} />;

export default TDModals;
