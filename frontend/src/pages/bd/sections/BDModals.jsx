import React from 'react';
import { X, ChartLine, UserCircle, GraduationCap, CheckCircle, WarningCircle, ChartBar } from "@phosphor-icons/react";
import { S } from './BDStyles';

export default function BDModals({ 
  showModal, setShowModal, activeTab, editingItem, form, setForm, handleSubmit, LEAD_STATUSES, BATCH_STATUSES, campuses, jobs,
  showReportModal, setShowReportModal, selectedReport, reportDetails, isReportDetailsLoading, onRefreshReport
}) {
  return (
    <>
      {showModal && (
        <div style={S.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>
                {editingItem ? 'Edit ' : 'Add New '}
                {activeTab === 'leads' ? 'Lead' : 
                 activeTab === 'jobs' ? 'Job Posting' : 
                 activeTab === 'applicants' ? 'Applicant' : 'Bulk Hire Batch'}
              </h3>
              <button onClick={() => setShowModal(false)} style={S.modalClose}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={S.modalForm}>
              {activeTab === 'leads' && (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Institution Name</label>
                    <input required style={S.input} value={form.institution_name || ''} onChange={e => setForm({...form, institution_name: e.target.value})} />
                  </div>
                  <div style={S.row}>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>City</label>
                      <input style={S.input} value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} />
                    </div>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Deal Value (PKR)</label>
                      <input type="number" style={S.input} value={form.deal_value || ''} onChange={e => setForm({...form, deal_value: e.target.value})} />
                    </div>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Status</label>
                    <select style={S.input} value={form.status || 'prospect'} onChange={e => setForm({...form, status: e.target.value})}>
                      {LEAD_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Contact Person</label>
                    <input style={S.input} value={form.contact_person || ''} onChange={e => setForm({...form, contact_person: e.target.value})} />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Contact Email</label>
                    <input type="email" style={S.input} value={form.contact_email || ''} onChange={e => setForm({...form, contact_email: e.target.value})} />
                  </div>
                </>
              )}

              {activeTab === 'jobs' && (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Job Title</label>
                    <input required style={S.input} value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Subject Area</label>
                    <input style={S.input} value={form.subject || ''} onChange={e => setForm({...form, subject: e.target.value})} />
                  </div>
                  <div style={S.row}>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Slots Available</label>
                      <input type="number" style={S.input} value={form.slots_available || ''} onChange={e => setForm({...form, slots_available: e.target.value})} />
                    </div>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Status</label>
                      <select style={S.input} value={form.status || 'open'} onChange={e => setForm({...form, status: e.target.value})}>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Target Department</label>
                    <select style={S.input} value={form.campus_id || ''} onChange={e => setForm({...form, campus_id: e.target.value})}>
                      <option value="">Any / Global</option>
                      {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'bulkhires' && (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Batch Name</label>
                    <input required style={S.input} value={form.batch_name || ''} onChange={e => setForm({...form, batch_name: e.target.value})} />
                  </div>
                  <div style={S.row}>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Teachers Needed</label>
                      <input type="number" style={S.input} value={form.teacher_count || ''} onChange={e => setForm({...form, teacher_count: e.target.value})} />
                    </div>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Target Date</label>
                      <input type="date" style={S.input} value={form.target_date || ''} onChange={e => setForm({...form, target_date: e.target.value})} />
                    </div>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Subject Areas</label>
                    <input placeholder="e.g. Computer Science, Math" style={S.input} value={form.subject_areas || ''} onChange={e => setForm({...form, subject_areas: e.target.value})} />
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Status</label>
                    <select style={S.input} value={form.status || 'planning'} onChange={e => setForm({...form, status: e.target.value})}>
                      {BATCH_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Department</label>
                    <select style={S.input} value={form.campus_id || ''} onChange={e => setForm({...form, campus_id: e.target.value})}>
                      <option value="">Any / Global</option>
                      {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'applicants' && (
                <>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Applicant Name</label>
                    <input required style={S.input} value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div style={S.row}>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Email</label>
                      <input required type="email" style={S.input} value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Phone</label>
                      <input type="text" style={S.input} value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Job Posting</label>
                    <select required style={S.input} value={form.job_id || ''} onChange={e => setForm({...form, job_id: e.target.value})}>
                      <option value="">Select a Job...</option>
                      {jobs && jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    </select>
                  </div>
                  <div style={S.row}>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Years of Experience</label>
                      <input type="number" style={S.input} value={form.experience_years || ''} onChange={e => setForm({...form, experience_years: e.target.value})} />
                    </div>
                    <div style={{flex:1}}>
                      <label style={S.inputLabel}>Subjects / Expertise</label>
                      <input type="text" style={S.input} value={form.subjects || ''} onChange={e => setForm({...form, subjects: e.target.value})} />
                    </div>
                  </div>
                  <div style={S.inputGroup}>
                    <label style={S.inputLabel}>Notes</label>
                    <textarea style={{...S.input, minHeight: '80px', resize: 'vertical'}} value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                  </div>
                </>
              )}

              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>{editingItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
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
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#0f172a'}}>{parseFloat(reportDetails.teacher_performance.avg_student_marks).toFixed(1)}%</h3>
                    </div>
                    <div style={{padding:'20px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:600}}>ATTENDANCE</span>
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#0f172a'}}>{parseFloat(reportDetails.teacher_performance.avg_attendance).toFixed(1)}%</h3>
                    </div>
                    <div style={{padding:'20px', borderRadius:'24px', background:'#f8fafc', border:'1px solid #e2e8f0'}}>
                      <span style={{fontSize:'12px', color:'#64748b', fontWeight:600}}>PASS RATE</span>
                      <h3 style={{margin:'8px 0 0', fontSize:'24px', color:'#166534'}}>
                        {Math.round((selectedReport.pass_count / selectedReport.total_students) * 100)}%
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
                          <span style={{fontSize:'20px', fontWeight:700, color:'#5b21b6'}}>{reportDetails.teacher_performance.rating}</span>
                          <span style={{fontSize:'14px', color:'#a78bfa'}}>/ 5.0</span>
                        </div>
                      </div>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:600}}>FEEDBACKS</span>
                        <div style={{marginTop:'4px', fontSize:'18px', fontWeight:600, color:'#5b21b6'}}>
                          {reportDetails.teacher_performance.feedback_count} Students
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
                          {reportDetails.students.map(s => (
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
                  <button onClick={onRefreshReport} style={{...S.cancelBtn, background:'#f1f5f9', padding:'10px 20px', fontSize:'14px'}}>
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
    </>
  );
}
