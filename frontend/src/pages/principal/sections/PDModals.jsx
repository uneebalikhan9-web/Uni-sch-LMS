import {
  Buildings, BookOpen, ChalkboardTeacher, CalendarBlank,
  Clock, UserCircle, ChartLine, ChartBar, CheckCircle, WarningCircle, Flask, X
} from "@phosphor-icons/react";
import { S } from "./PDStyles";

const safeFloat = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const safePercent = (num, den) => (!den || den === 0) ? 0 : Math.round((num / den) * 100);

// ─── Report Detail Modal ─────────────────────────────────────────────────────
export function ReportModal({ showReportModal, setShowReportModal, selectedReport, setReportDetails, reportDetails, isReportDetailsLoading, onRefresh }) {
  if (!showReportModal || !selectedReport) return null;
  return (
    <div style={S.modalOverlay} onClick={() => { setShowReportModal(false); setReportDetails(null); }}>
      <div style={{ ...S.modal, maxWidth:'800px', width:'95%', padding:0 }} onClick={e => e.stopPropagation()} className="animate-slideUp">
        <div style={{ ...S.modalHeader, padding:'24px 28px', borderBottom:'1px solid #f1f5f9', marginBottom:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', color:'#7c3aed' }}>
              <ChartLine size={24} weight="duotone" />
            </div>
            <div>
              <h2 style={{ ...S.modalTitle, fontSize:'1.3rem', marginBottom:'2px' }}>{selectedReport.course_title}</h2>
              <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Detailed Academic Performance Report</p>
            </div>
          </div>
          <button style={S.modalClose} onClick={() => { setShowReportModal(false); setReportDetails(null); }}>×</button>
        </div>

        <div style={{ padding:'24px', maxHeight:'70vh', overflowY:'auto' }}>
          {isReportDetailsLoading ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Fetching detailed metrics...</div>
          ) : reportDetails ? (
            <>
              {/* Summary cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'16px', marginBottom:'24px' }}>
                {[
                  { label:'AVERAGE MARKS', val:`${safeFloat(reportDetails.teacher_performance?.avg_student_marks).toFixed(1)}%`, bg:'#f5f7ff', border:'#e0e7ff', color:'#1e1b4b' },
                  { label:'ATTENDANCE',    val:`${safeFloat(reportDetails.teacher_performance?.avg_attendance).toFixed(1)}%`,    bg:'#f0f9ff', border:'#e0f2fe', color:'#075985' },
                  { label:'PASS RATE',     val:`${safePercent(selectedReport.pass_count, selectedReport.total_students)}%`,      bg:'#f0fdf4', border:'#dcfce7', color:'#166534' },
                ].map(c => (
                  <div key={c.label} style={{ padding:'20px', borderRadius:'20px', background:`linear-gradient(135deg, ${c.bg}, #fff)`, border:`1px solid ${c.border}` }}>
                    <span style={{ fontSize:'11px', color:'#64748b', fontWeight:700, letterSpacing:'0.05em' }}>{c.label}</span>
                    <h3 style={{ margin:'8px 0 0', fontSize:'26px', color:c.color, fontWeight:800 }}>{c.val}</h3>
                  </div>
                ))}
              </div>

              {/* Teacher insights */}
              <div style={{ marginBottom:'24px', padding:'20px', borderRadius:'20px', background:'linear-gradient(135deg, #f5f3ff, #fdf4ff)', border:'1px solid #ddd6fe' }}>
                <h3 style={{ margin:'0 0 12px', fontSize:'16px', color:'#5b21b6', display:'flex', alignItems:'center', gap:'8px' }}>
                  <UserCircle size={20} /> Teacher Progress: {selectedReport.teacher_name}
                </h3>
                <div style={{ display:'flex', gap:'24px', flexWrap:'wrap', alignItems:'center' }}>
                  <div>
                    <span style={{ fontSize:'12px', color:'#7c3aed', fontWeight:600 }}>RATING</span>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'4px' }}>
                      <span style={{ fontSize:'20px', fontWeight:700, color:'#5b21b6' }}>{reportDetails.teacher_performance?.rating}</span>
                      <span style={{ fontSize:'14px', color:'#a78bfa' }}>/ 5.0</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize:'12px', color:'#7c3aed', fontWeight:600 }}>FEEDBACKS</span>
                    <div style={{ marginTop:'4px', fontSize:'18px', fontWeight:600, color:'#5b21b6' }}>{reportDetails.teacher_performance?.feedback_count} Students</div>
                  </div>
                  <div style={{ flex:1, textAlign:'right', minWidth:'150px' }}>
                    <span style={{ fontSize:'12px', color:'#7c3aed', fontWeight:600 }}>OVERALL STATUS</span>
                    <div style={{ marginTop:'4px' }}>
                      <span style={{ padding:'4px 12px', borderRadius:'20px', background:'#fff', color:'#7c3aed', fontSize:'13px', fontWeight:700, border:'1px solid #ddd6fe' }}>ACCOMPLISHED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student table */}
              <h3 style={{ marginBottom:'12px', fontSize:'16px', color:'#1e293b' }}>🎓 Student-wise Performance</h3>
              <div style={{ border:'1px solid #e2e8f0', borderRadius:'16px', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'500px' }}>
                  <thead>
                    <tr style={{ background:'#f8fafc' }}>
                      <th style={{ padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b', fontWeight:700 }}>STUDENT NAME</th>
                      <th style={{ padding:'12px 20px', textAlign:'left', fontSize:'12px', color:'#64748b', fontWeight:700 }}>MARKS (%)</th>
                      <th style={{ padding:'12px 20px', textAlign:'right', fontSize:'12px', color:'#64748b', fontWeight:700 }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportDetails.students.map(s => (
                      <tr key={s.id} style={{ borderTop:'1px solid #f1f5f9' }}>
                        <td style={{ padding:'12px 20px', fontSize:'14px', fontWeight:600, color:'#0f172a' }}>{s.name}</td>
                        <td style={{ padding:'12px 20px', fontSize:'14px', color:'#64748b' }}>
                          {s.marks_obtained ? `${s.marks_obtained} / ${s.max_marks} (${s.percentage}%)` : 'Not Graded'}
                        </td>
                        <td style={{ padding:'12px 20px', textAlign:'right' }}>
                          {s.status === 'Pass'
                            ? <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#166534', fontWeight:700, fontSize:'13px' }}><CheckCircle weight="fill" /> PASS</span>
                            : <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#ef4444', fontWeight:700, fontSize:'13px' }}><WarningCircle weight="fill" /> FAIL</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>
              <ChartBar size={48} weight="duotone" style={{ marginBottom:'16px' }} />
              <h3 style={{ color:'#1e293b', marginBottom:'8px' }}>No detailed records found</h3>
              <button onClick={onRefresh} style={{ ...S.cancelBtn, background:'#f1f5f9', padding:'10px 20px', fontSize:'14px', flex:'none' }}>🔄 Try Refreshing</button>
            </div>
          )}
        </div>
        <div style={S.modalFooter}>
          <button style={S.cancelBtn} onClick={() => { setShowReportModal(false); setReportDetails(null); }}>Close Report</button>
          <button style={{ ...S.submitBtn, background:'#4f46e5', boxShadow:'0 4px 12px rgba(79,70,229,0.3)' }} onClick={() => window.print()}>🖨️ Export as PDF</button>
        </div>
      </div>
    </div>
  );
}

// ─── Class Courses Popup ─────────────────────────────────────────────────────
export function ClassCoursesModal({ show, selectedClass, onClose, courses }) {
  if (!show || !selectedClass) return null;
  const classCourses = courses.filter(c => c.class_id === selectedClass.id);
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modal, width:'550px' }} onClick={e => e.stopPropagation()} className="animate-slideUp">
        <div style={S.modalHeader}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'16px', background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', color:'#7c3aed' }}>
              <Buildings size={24} weight="duotone" />
            </div>
            <div>
              <h2 style={{ ...S.modalTitle, fontSize:'1.3rem', marginBottom:'2px' }}>{selectedClass.name}</h2>
              <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>{selectedClass.section} • Active Courses</p>
            </div>
          </div>
          <button style={S.modalClose} onClick={onClose}>×</button>
        </div>
        <div style={{ padding:'24px', maxHeight:'60vh', overflowY:'auto' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {classCourses.length > 0 ? classCourses.map(course => (
              <div key={course.id} style={{ padding:'16px', borderRadius:'20px', background:'#fff', border:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.02)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(124,58,237,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#7c3aed' }}>
                    <BookOpen size={20} weight="duotone" />
                  </div>
                  <div>
                    <h4 style={{ margin:0, fontSize:'15px', color:'#0f172a', fontWeight:700 }}>{course.title}</h4>
                    <p style={{ margin:'2px 0 0', fontSize:'13px', color:'#64748b' }}>Teacher: <strong>{course.teacher_name || 'Not assigned'}</strong></p>
                  </div>
                </div>
                <span style={{ ...S.statusBadge, background: course.status === 'active' ? '#dcfce7' : '#fee2e2', color: course.status === 'active' ? '#166534' : '#991b1b', fontSize:'11px', padding:'4px 10px' }}>
                  {course.status.toUpperCase()}
                </span>
              </div>
            )) : (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'#94a3b8' }}>
                <BookOpen size={48} weight="duotone" color="#94a3b8" />
                <p style={{ marginTop:'12px' }}>No courses assigned to this class yet.</p>
              </div>
            )}
          </div>
        </div>
        <div style={S.modalFooter}>
          <button style={{ ...S.saveBtn, width:'100%', height:'48px' }} onClick={onClose}>Close View</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
export function AddEditModal({ show, onClose, activeTab, editingItem, setEditingItem, newPerson, setNewPerson, newClass, setNewClass, newCourse, setNewCourse, newLab, setNewLab, teachers, classes, onSubmit, handleBulkStudentUpload }) {
  if (!show) return null;
  const singularTab = (tab) => {
    if (tab === 'classes') return 'class';
    if (tab === 'pending') return 'student';
    if (tab === 'labs')    return 'lab';
    if (tab === 'history') return 'course';
    return tab.slice(0, -1);
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()} className="animate-slideUp">
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>{editingItem ? 'Edit' : 'Add New'} {singularTab(activeTab)}</h3>
          <button onClick={onClose} style={S.modalClose}>×</button>
        </div>
        <form onSubmit={onSubmit} style={S.modalForm}>
          {activeTab === 'classes' ? (
            <>
              <div style={S.inputGroup}><label style={S.inputLabel}>Class Name</label><input placeholder="e.g., Grade 10" required value={editingItem ? editingItem.name : newClass.name} onChange={e => editingItem ? setEditingItem({...editingItem, name:e.target.value}) : setNewClass({...newClass, name:e.target.value})} style={S.input} /></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Section</label><input placeholder="e.g., A" required value={editingItem ? editingItem.section : newClass.section} onChange={e => editingItem ? setEditingItem({...editingItem, section:e.target.value}) : setNewClass({...newClass, section:e.target.value})} style={S.input} /></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Academic Year</label><input placeholder="2024-2025" value={editingItem ? editingItem.academic_year : newClass.academic_year} onChange={e => editingItem ? setEditingItem({...editingItem, academic_year:e.target.value}) : setNewClass({...newClass, academic_year:e.target.value})} style={S.input} /></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Assign Teacher</label><select value={editingItem ? editingItem.teacher_id : newClass.teacher_id} onChange={e => editingItem ? setEditingItem({...editingItem, teacher_id:e.target.value}) : setNewClass({...newClass, teacher_id:e.target.value})} style={S.input}><option value="">No Teacher</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            </>
          ) : activeTab === 'labs' ? (
            <>
              <div style={S.inputGroup}><label style={S.inputLabel}>Lab Name</label><input placeholder="e.g. Linux Fundamentals" required value={editingItem ? editingItem.name : newLab.name} onChange={e => editingItem ? setEditingItem({...editingItem, name:e.target.value}) : setNewLab({...newLab, name:e.target.value})} style={S.input} /></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Lab Environment</label>
                <select required value={editingItem ? editingItem.environment : newLab.environment} onChange={e => editingItem ? setEditingItem({...editingItem, environment:e.target.value}) : setNewLab({...newLab, environment:e.target.value})} style={S.input}>
                  {['Python','Node.js','MySQL','React','Custom'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              {((editingItem ? editingItem.environment : newLab.environment) || '').toLowerCase() === 'custom' && (
                <div style={S.inputGroup}><label style={S.inputLabel}>Lab Link / URL</label><input placeholder="https://..." required value={editingItem ? editingItem.url : newLab.url} onChange={e => editingItem ? setEditingItem({...editingItem, url:e.target.value}) : setNewLab({...newLab, url:e.target.value})} style={S.input} /></div>
              )}
              <div style={S.inputGroup}><label style={S.inputLabel}>Assign to Class</label><select required value={editingItem ? editingItem.class_id : newLab.classId} onChange={e => editingItem ? setEditingItem({...editingItem, class_id:e.target.value}) : setNewLab({...newLab, classId:e.target.value})} style={S.input}><option value="">Select a Class...</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}</select></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Select Icon</label><select value={editingItem ? editingItem.icon : newLab.icon} onChange={e => editingItem ? setEditingItem({...editingItem, icon:e.target.value}) : setNewLab({...newLab, icon:e.target.value})} style={S.input}><option value="Flask">🧪 Chemistry Lab</option><option value="Pulse">⚡ Physics Lab</option><option value="Code">💻 Programming</option><option value="Database">🗄️ Database Lab</option><option value="Shield">🛡️ Security Lab</option><option value="Globe">🌍 Web Tech</option><option value="Layout">⚛️ UI/UX Lab</option></select></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Description</label><textarea placeholder="What students will learn..." value={editingItem ? editingItem.description : newLab.description} onChange={e => editingItem ? setEditingItem({...editingItem, description:e.target.value}) : setNewLab({...newLab, description:e.target.value})} style={{...S.input, height:'80px', resize:'vertical'}} /></div>
            </>
          ) : activeTab === 'courses' ? (
            <>
              <div style={S.inputGroup}><label style={S.inputLabel}>Course Title</label><input placeholder="e.g., Mathematics 101" required value={editingItem ? editingItem.title : newCourse.title} onChange={e => editingItem ? setEditingItem({...editingItem, title:e.target.value}) : setNewCourse({...newCourse, title:e.target.value})} style={S.input} /></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Description</label><textarea placeholder="Course description..." value={editingItem ? editingItem.description : newCourse.description} onChange={e => editingItem ? setEditingItem({...editingItem, description:e.target.value}) : setNewCourse({...newCourse, description:e.target.value})} style={{...S.input, height:'100px', resize:'vertical'}} /></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Class (Required)</label><select required value={editingItem ? editingItem.class_id : newCourse.class_id} onChange={e => editingItem ? setEditingItem({...editingItem, class_id:e.target.value}) : setNewCourse({...newCourse, class_id:e.target.value})} style={S.input}><option value="">Select a Class...</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}</select></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Assign Teacher</label><select value={editingItem ? editingItem.teacher_id : newCourse.teacher_id} onChange={e => editingItem ? setEditingItem({...editingItem, teacher_id:e.target.value}) : setNewCourse({...newCourse, teacher_id:e.target.value})} style={S.input}><option value="">No Teacher</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            </>
          ) : activeTab === 'students' ? (
            <div style={{maxHeight:'50vh', overflowY:'auto', paddingRight:'10px', marginBottom:'20px'}}>
              {!editingItem && (
                <div style={{marginBottom:'24px', padding:'20px', background:'#f8fafc', border:'2px dashed #e2e8f0', borderRadius:'16px', textAlign:'center'}}>
                  <h4 style={{margin:'0 0 8px', color:'#0f172a'}}>Bulk Upload Students</h4>
                  <input type="file" id="bulk-pd" hidden accept=".csv, .xlsx, .xls" onChange={(e) => handleBulkStudentUpload(e.target.files[0])} />
                  <label htmlFor="bulk-pd" style={{display:'inline-block', padding:'8px 20px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', color:'#0f172a', fontWeight:'700', cursor:'pointer', fontSize:'0.85rem'}}>📁 Upload Excel/CSV</label>
                </div>
              )}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                <div style={S.inputGroup}><label style={S.inputLabel}>Full Name</label><input placeholder="Student Name" required value={editingItem ? editingItem.name : newPerson.name} onChange={e => editingItem ? setEditingItem({...editingItem, name:e.target.value}) : setNewPerson({...newPerson, name:e.target.value})} style={S.input} /></div>
                <div style={S.inputGroup}><label style={S.inputLabel}>Email Address</label><input placeholder="email@example.com" required type="email" value={editingItem ? editingItem.email : newPerson.email} onChange={e => editingItem ? setEditingItem({...editingItem, email:e.target.value}) : setNewPerson({...newPerson, email:e.target.value})} style={S.input} /></div>
                <div style={S.inputGroup}><label style={S.inputLabel}>Father's Name</label><input placeholder="Father's Name" required value={editingItem ? editingItem.father_name : newPerson.father_name} onChange={e => editingItem ? setEditingItem({...editingItem, father_name:e.target.value}) : setNewPerson({...newPerson, father_name:e.target.value})} style={S.input} /></div>
                <div style={S.inputGroup}><label style={S.inputLabel}>Father's CNIC</label><input placeholder="xxxxx-xxxxxxx-x" required value={editingItem ? editingItem.father_cnic : newPerson.father_cnic} onChange={e => editingItem ? setEditingItem({...editingItem, father_cnic:e.target.value}) : setNewPerson({...newPerson, father_cnic:e.target.value})} style={S.input} /></div>
                <div style={S.inputGroup}><label style={S.inputLabel}>B-Form / CNIC</label><input placeholder="Student CNIC" required value={editingItem ? editingItem.bform_number : newPerson.bform_number} onChange={e => editingItem ? setEditingItem({...editingItem, bform_number:e.target.value}) : setNewPerson({...newPerson, bform_number:e.target.value})} style={S.input} /></div>
                <div style={S.inputGroup}><label style={S.inputLabel}>Father's Phone</label><input placeholder="03xx-xxxxxxx" required value={editingItem ? editingItem.father_number : newPerson.father_number} onChange={e => editingItem ? setEditingItem({...editingItem, father_number:e.target.value}) : setNewPerson({...newPerson, father_number:e.target.value})} style={S.input} /></div>
                <div style={S.inputGroup}><label style={S.inputLabel}>Semester</label><select required value={editingItem ? editingItem.semester : newPerson.semester} onChange={e => editingItem ? setEditingItem({...editingItem, semester:e.target.value}) : setNewPerson({...newPerson, semester:e.target.value})} style={S.input}>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}</select></div>
                <div style={S.inputGroup}><label style={S.inputLabel}>Last Education</label><input placeholder="e.g. Matric" value={editingItem ? editingItem.last_education : newPerson.last_education} onChange={e => editingItem ? setEditingItem({...editingItem, last_education:e.target.value}) : setNewPerson({...newPerson, last_education:e.target.value})} style={S.input} /></div>
                <div style={{...S.inputGroup, gridColumn:'span 2'}}>
                  <label style={S.inputLabel}>Set Password {editingItem && '(Leave blank to keep current)'}</label>
                  <input placeholder="••••••••" type="password" autoComplete="new-password" 
                    value={newPerson.password} 
                    onChange={e => setNewPerson({...newPerson, password:e.target.value})} 
                    style={S.input} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={S.inputGroup}><label style={S.inputLabel}>Full Name</label><input placeholder="e.g., John Doe" required value={editingItem ? editingItem.name : newPerson.name} onChange={e => editingItem ? setEditingItem({...editingItem, name:e.target.value}) : setNewPerson({...newPerson, name:e.target.value})} style={S.input} /></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Email Address</label><input placeholder="email@example.com" required type="email" value={editingItem ? editingItem.email : newPerson.email} onChange={e => editingItem ? setEditingItem({...editingItem, email:e.target.value}) : setNewPerson({...newPerson, email:e.target.value})} style={S.input} /></div>
              <div style={S.inputGroup}><label style={S.inputLabel}>Password</label><input placeholder="••••••••" required={!editingItem} type="password" autoComplete="new-password" value={newPerson.password} onChange={e => setNewPerson({...newPerson, password:e.target.value})} style={S.input} /></div>
            </>
          )}
          <div style={S.modalActions}>
            <button type="button" onClick={onClose} style={S.cancelBtn}>Cancel</button>
            <button type="submit" style={S.saveBtn}>{editingItem ? 'Update' : 'Add'} {singularTab(activeTab)}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Timetable Modal ─────────────────────────────────────────────────────────
export function TimetableModal({ show, onClose, editingItem, newTimetableEntry, setNewTimetableEntry, courses, classes, teachers, onSubmit }) {
  if (!show) return null;
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modal, width:'600px' }} onClick={e => e.stopPropagation()} className="animate-slideUp">
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>{editingItem ? 'Edit' : 'Add'} Timetable Entry</h3>
          <button onClick={onClose} style={S.modalClose}>×</button>
        </div>
        <form onSubmit={onSubmit} style={S.modalForm}>
          <div style={S.row}>
            <div style={S.flex1}>
              <label style={S.inputLabel}><Buildings size={14} /> Target Class</label>
              <select required value={newTimetableEntry.class_id} onChange={e => setNewTimetableEntry({...newTimetableEntry, class_id:e.target.value, course_id:'', teacher_id:''})} style={S.input}>
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.section})</option>)}
              </select>
            </div>
            <div style={S.flex1}>
              <label style={S.inputLabel}><BookOpen size={14} /> Subject / Course</label>
              <select required disabled={!newTimetableEntry.class_id} value={newTimetableEntry.course_id}
                onChange={e => {
                  const course = courses.find(c => c.id === parseInt(e.target.value));
                  setNewTimetableEntry({...newTimetableEntry, course_id:e.target.value, teacher_id: course ? course.teacher_id : ''});
                }} style={S.input}>
                <option value="">Select Course...</option>
                {courses.filter(c => c.class_id === parseInt(newTimetableEntry.class_id)).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div style={S.inputGroup}>
            <label style={S.inputLabel}><ChalkboardTeacher size={14} /> Assigned Instructor</label>
            <select disabled value={newTimetableEntry.teacher_id} style={{...S.input, background:'#f8fafc', border:'1px dashed #e2e8f0'}}>
              <option value="">Teacher will be assigned automatically</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div style={S.row}>
            <div style={S.flex1}>
              <label style={S.inputLabel}><CalendarBlank size={14} /> Scheduled Day</label>
              <select style={S.input} value={newTimetableEntry.day_of_week} onChange={e => setNewTimetableEntry({...newTimetableEntry, day_of_week:e.target.value})}>
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={S.flex1}>
              <label style={S.inputLabel}><Flask size={14} /> Room / Lab</label>
              <input placeholder="e.g. 101 or Lab A" style={S.input} value={newTimetableEntry.room_number} onChange={e => setNewTimetableEntry({...newTimetableEntry, room_number:e.target.value})} />
            </div>
          </div>
          <div style={S.row}>
            <div style={S.flex1}>
              <label style={S.inputLabel}><Clock size={14} /> Start Time</label>
              <input type="time" required value={newTimetableEntry.start_time} onChange={e => setNewTimetableEntry({...newTimetableEntry, start_time:e.target.value})} style={S.input} />
            </div>
            <div style={S.flex1}>
              <label style={S.inputLabel}><Clock size={14} /> End Time</label>
              <input type="time" required value={newTimetableEntry.end_time} onChange={e => setNewTimetableEntry({...newTimetableEntry, end_time:e.target.value})} style={S.input} />
            </div>
          </div>
          <div style={S.modalActions}>
            <button type="button" onClick={onClose} style={S.cancelBtn}>Cancel</button>
            <button type="submit" style={S.saveBtn}>Publish Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}
// ─── Student Profile View Modal ───────────────────────────────────────────────
export function StudentProfileModal({ show, student, onClose }) {
  if (!show || !student) return null;
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modal, width:'600px' }} onClick={e => e.stopPropagation()} className="animate-slideUp">
        <div style={{ ...S.modalHeader, background:'linear-gradient(135deg, #7c3aed, #a78bfa)', color:'#fff', border:'none' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{ width:'64px', height:'64px', borderRadius:'22px', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:800, border:'2px solid rgba(255,255,255,0.3)' }}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ ...S.modalTitle, color:'#fff', marginBottom:'4px' }}>{student.name}</h2>
              <div style={{ display:'flex', gap:'8px' }}>
                <span style={{ padding:'2px 10px', borderRadius:'20px', background:'rgba(255,255,255,0.2)', fontSize:'11px', fontWeight:700 }}>{student.roll_number}</span>
                <span style={{ padding:'2px 10px', borderRadius:'20px', background:'rgba(255,255,255,0.2)', fontSize:'11px', fontWeight:700 }}>Semester {student.semester}</span>
              </div>
            </div>
          </div>
          <button style={{ ...S.modalClose, color:'#fff' }} onClick={onClose}>×</button>
        </div>
        
        <div style={{ padding:'30px', background:'#f8fafc' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>
            <div>
              <label style={{ fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>Personal Information</label>
              <div style={{ marginTop:'12px', display:'flex', flexDirection:'column', gap:'16px' }}>
                <div>
                  <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Full Name</p>
                  <p style={{ margin:'2px 0 0', fontSize:'15px', color:'#0f172a', fontWeight:600 }}>{student.name}</p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Email Address</p>
                  <p style={{ margin:'2px 0 0', fontSize:'15px', color:'#0f172a', fontWeight:600 }}>{student.email}</p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>B-Form / CNIC</p>
                  <p style={{ margin:'2px 0 0', fontSize:'15px', color:'#0f172a', fontWeight:600 }}>{student.bform_number || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Last Education</p>
                  <p style={{ margin:'2px 0 0', fontSize:'15px', color:'#0f172a', fontWeight:600 }}>{student.last_education || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize:'11px', color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>Family & Guardian</label>
              <div style={{ marginTop:'12px', display:'flex', flexDirection:'column', gap:'16px' }}>
                <div>
                  <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Father's Name</p>
                  <p style={{ margin:'2px 0 0', fontSize:'15px', color:'#0f172a', fontWeight:600 }}>{student.father_name || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Father's CNIC</p>
                  <p style={{ margin:'2px 0 0', fontSize:'15px', color:'#0f172a', fontWeight:600 }}>{student.father_cnic || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Guardian Phone</p>
                  <p style={{ margin:'2px 0 0', fontSize:'15px', color:'#0f172a', fontWeight:600 }}>{student.father_number || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'13px', color:'#64748b' }}>Registration Date</p>
                  <p style={{ margin:'2px 0 0', fontSize:'15px', color:'#0f172a', fontWeight:600 }}>{new Date(student.created_at).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...S.modalFooter, background:'#fff', borderTop:'1px solid #f1f5f9' }}>
          <button style={{ ...S.saveBtn, width:'100%', height:'48px' }} onClick={onClose}>Close Profile</button>
        </div>
      </div>
    </div>
  );
}
