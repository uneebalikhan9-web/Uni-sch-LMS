import { ChartBar, ChartLine, UserCircle, Check, Warning, ArrowsCounterClockwise, Download, X } from "@phosphor-icons/react";
import { S } from "./SAStyles";

// Safe number formatting helpers
const safeFloat = (val, fallback = 0) => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};
const safePercent = (numerator, denominator) => {
  if (!denominator || denominator === 0) return 0;
  const result = Math.round((numerator / denominator) * 100);
  return isNaN(result) ? 0 : result;
};

export default function SAReports({
  reports, reportsLoading,
  showReportModal, setShowReportModal,
  selectedReport, setSelectedReport,
  reportDetails, setReportDetails,
  isReportDetailsLoading,
  onViewDetails
}) {
  return (
    <>
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <h2 style={S.tableTitle}>
            <ChartBar size={28} weight="duotone" color="#6366f1" style={{verticalAlign:'middle', marginRight:'12px'}} />
            Course Completion Reports
          </h2>
          <span style={{fontSize:'13px', color:'#64748b'}}>{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
        </div>

        {reportsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <div style={{ marginBottom: '16px' }}><ChartBar size={64} weight="duotone" color="#94a3b8" /></div>
            <p>No course reports yet. Reports are auto-generated when a teacher marks a course as complete.</p>
          </div>
        ) : (
          <div style={S.tableContainer} className="table-container">
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>COURSE</th>
                  <th style={S.th}>CLASS</th>
                  <th style={S.th}>CAMPUS</th>
                  <th style={S.th}>TEACHER</th>
                  <th style={S.th}>STUDENTS</th>
                  <th style={S.th}>AVG MARKS</th>
                  <th style={S.th}>ATTENDANCE</th>
                  <th style={S.th}>PASS/FAIL</th>
                  <th style={S.th}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} style={{...S.tr, cursor: 'pointer'}} onClick={() => onViewDetails(r)}>
                    <td style={S.tdName}>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <ChartBar size={18} color="#6366f1" />
                        {r.course_title}
                      </div>
                    </td>
                    <td style={S.td}>{r.class_name}</td>
                    <td style={S.td}><span style={S.campusTag}>{r.campus_name}</span></td>
                    <td style={S.td}>{r.teacher_name}</td>
                    <td style={S.td}><strong>{r.total_students}</strong></td>
                    <td style={S.td}>
                      <span style={{...S.planBadge, padding:'4px 10px', background: safeFloat(r.avg_marks) >= 50 ? '#dcfce7' : '#fee2e2', color: safeFloat(r.avg_marks) >= 50 ? '#166534' : '#991b1b'}}>
                        {safeFloat(r.avg_marks).toFixed(1)}%
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{...S.planBadge, padding:'4px 10px', background: '#dbeafe', color: '#1e40af'}}>
                        {safeFloat(r.avg_attendance).toFixed(1)}%
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <span style={{color:'#166534', fontWeight:700}}>{r.pass_count}✓</span>
                        <span style={{color:'#94a3b8'}}>|</span>
                        <span style={{color:'#ef4444', fontWeight:700}}>{r.fail_count}✗</span>
                      </div>
                    </td>
                    <td style={S.td}>{new Date(r.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Report Modal — rendered at body level via portal-style fixed overlay */}
      {showReportModal && selectedReport && (
        <div
          style={{...S.overlay, zIndex: 9999}}
          onClick={() => { setShowReportModal(false); setReportDetails(null); }}
        >
          <div
            style={{...S.modal, maxWidth: '860px', width: '90%', padding: 0, margin: '0 auto'}}
            onClick={e => e.stopPropagation()}
            className="animate-slideUp"
          >
            <div style={S.modalHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                <div style={{width:'56px', height:'56px', borderRadius:'18px', background:'linear-gradient(135deg, #f5f3ff, #ede9fe)', display:'flex', alignItems:'center', justifyContent:'center', color:'#4f46e5', boxShadow:'0 8px 15px -5px rgba(79, 70, 229, 0.2)'}}>
                  <ChartLine size={28} weight="duotone" />
                </div>
                <div>
                  <h2 style={{...S.modalTitle, marginBottom: '4px', textAlign: 'left', fontSize: '1.4rem'}}>{selectedReport.course_title}</h2>
                  <p style={{margin:0, fontSize:'14px', color:'#64748b', fontWeight: 500}}>Detailed Academic Performance Report</p>
                </div>
              </div>
              <button style={S.modalClose} onClick={() => { setShowReportModal(false); setReportDetails(null); }} className="modal-close">
                <X size={20} weight="bold" />
              </button>
            </div>
            
            <div style={{padding: '32px', maxHeight: '70vh', overflowY: 'auto'}} className="hidden-scrollbar">
              {isReportDetailsLoading ? (
                <div style={{textAlign:'center', padding:'60px', color:'#64748b'}}>
                   <div className="loading-spinner" style={{marginBottom: '16px'}}></div>
                   <p style={{fontWeight: 600}}>Generating comprehensive report analytics...</p>
                </div>
              ) : reportDetails ? (
                <>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'32px'}}>
                    {[
                      {
                        label: 'AVERAGE MARKS',
                        val: `${safeFloat(reportDetails.teacher_performance?.avg_student_marks).toFixed(1)}%`,
                        color: safeFloat(reportDetails.teacher_performance?.avg_student_marks) >= 50 ? '#166534' : '#991b1b',
                        bg: safeFloat(reportDetails.teacher_performance?.avg_student_marks) >= 50 ? '#f0fdf4' : '#fff1f2',
                      },
                      {
                        label: 'ATTENDANCE',
                        val: `${safeFloat(reportDetails.teacher_performance?.avg_attendance).toFixed(1)}%`,
                        color: safeFloat(reportDetails.teacher_performance?.avg_attendance) >= 75 ? '#166534' : '#92400e',
                        bg: safeFloat(reportDetails.teacher_performance?.avg_attendance) >= 75 ? '#f0fdf4' : '#fffbeb',
                      },
                      {
                        label: 'PASS RATE',
                        val: `${safePercent(selectedReport.pass_count, selectedReport.total_students)}%`,
                        color: safePercent(selectedReport.pass_count, selectedReport.total_students) >= 50 ? '#166534' : '#991b1b',
                        bg: safePercent(selectedReport.pass_count, selectedReport.total_students) >= 50 ? '#f0fdf4' : '#fff1f2',
                      },
                    ].map(({ label, val, color, bg }) => (
                      <div key={label} style={{padding:'24px', borderRadius:'24px', background: bg, border:'1px solid #e2e8f0'}} className="metric-card">
                        <span style={{fontSize:'11px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</span>
                        <h3 style={{margin:'10px 0 0', fontSize:'2rem', color, fontWeight:800}}>{val}</h3>
                      </div>
                    ))}
                  </div>

                  <div style={{marginBottom:'32px', padding:'28px', borderRadius:'28px', background:'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)', border:'1px solid #ddd6fe'}}>
                    <h3 style={{margin:'0 0 20px', fontSize:'18px', color:'#4f46e5', display:'flex', alignItems:'center', gap:'12px', fontWeight:800}}>
                      <UserCircle size={24} weight="duotone" /> Teacher Insights: {selectedReport.teacher_name}
                    </h3>
                    <div style={{display:'flex', gap:'40px', flexWrap: 'wrap', alignItems:'center'}}>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>RATING</span>
                        <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'6px'}}>
                          <span style={{fontSize:'28px', fontWeight:800, color:'#5b21b6'}}>{reportDetails.teacher_performance.rating}</span>
                          <span style={{fontSize:'18px', color:'#a78bfa', fontWeight: 600}}>/ 5.0</span>
                        </div>
                      </div>
                      <div>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>FEEDBACK COUNT</span>
                        <div style={{marginTop:'6px', fontSize:'22px', fontWeight:800, color:'#5b21b6'}}>
                          {reportDetails.teacher_performance.feedback_count} <span style={{fontSize: '14px', color: '#7c3aed', fontWeight: 600}}>Students</span>
                        </div>
                      </div>
                      <div style={{flex:1, textAlign:'right', minWidth:'220px'}}>
                        <span style={{fontSize:'12px', color:'#7c3aed', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>STATUS</span>
                        <div style={{marginTop:'10px'}}>
                          <span style={{padding:'8px 24px', borderRadius:'30px', background:'#4f46e5', color:'#fff', fontSize:'14px', fontWeight:800}}>ACCOMPLISHED</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <h3 style={{fontSize:'18px', color:'#1e293b', fontWeight:800, display:'flex', alignItems:'center', gap:'12px'}}>
                      Student-wise Performance
                    </h3>
                    <div style={{fontSize: '13px', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '6px 14px', borderRadius: '30px'}}>
                      Total Students: {reportDetails.students.length}
                    </div>
                  </div>

                  <div style={{border:'1px solid #e2e8f0', borderRadius:'24px', overflow:'hidden', background:'#fff'}}>
                    <div style={{overflowX: 'auto'}} className="hidden-scrollbar">
                      <table style={{width:'100%', borderCollapse:'collapse', minWidth:'700px'}}>
                        <thead>
                          <tr style={{background:'#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
                            <th style={{padding:'20px 28px', textAlign:'left', fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>STUDENT NAME</th>
                            <th style={{padding:'20px 28px', textAlign:'left', fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>MARKS (%)</th>
                            <th style={{padding:'20px 28px', textAlign:'right', fontSize:'12px', color:'#64748b', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.05em'}}>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportDetails.students.map(s => (
                            <tr key={s.id} style={{borderBottom:'1px solid #f1f5f9'}} className="tr-hover">
                              <td style={{padding:'20px 28px', fontSize:'15px', fontWeight:700, color:'#0f172a'}}>{s.name}</td>
                              <td style={{padding:'20px 28px', fontSize:'14px', color:'#475569', fontWeight:500}}>
                                {s.marks_obtained ? (
                                  <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                    <span style={{color:'#0f172a', fontWeight:800, fontSize: '16px'}}>{s.marks_obtained}</span>
                                    <span style={{color:'#cbd5e1', fontSize: '18px'}}>/</span>
                                    <span style={{color: '#64748b', fontWeight: 600}}>{s.max_marks}</span>
                                    <span style={{marginLeft:'auto', padding:'4px 10px', borderRadius:'10px', background:'#e0e7ff', color:'#4f46e5', fontWeight:800, fontSize:'12px'}}>{s.percentage}%</span>
                                  </div>
                                ) : (
                                  <span style={{color:'#94a3b8', fontStyle:'italic'}}>No Evaluation</span>
                                )}
                              </td>
                              <td style={{padding:'20px 28px', textAlign:'right'}}>
                                {s.status === 'Pass' ? (
                                  <span style={{display:'inline-flex', alignItems:'center', gap:'6px', color:'#166534', fontWeight:800, fontSize:'13px', padding:'6px 14px', background:'#f0fdf4', borderRadius:'30px', border: '1px solid #dcfce7'}}>
                                    <Check size={14} weight="bold" /> PASS
                                  </span>
                                ) : (
                                  <span style={{display:'inline-flex', alignItems:'center', gap:'6px', color:'#ef4444', fontWeight:800, fontSize:'13px', padding:'6px 14px', background:'#fef2f2', borderRadius:'30px', border: '1px solid #fee2e2'}}>
                                    <Warning size={14} weight="bold" /> FAIL
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
                <div style={{textAlign:'center', padding:'80px 20px'}}>
                  <div style={{fontSize:'64px', marginBottom:'24px'}}>📊</div>
                  <h3 style={{color:'#0f172a', marginBottom:'12px', fontSize: '1.5rem', fontWeight: 800}}>Performance Analytics Partially Unavailable</h3>
                  <p style={{color:'#64748b', fontSize:'15px', maxWidth:'450px', margin:'0 auto 32px', lineHeight: 1.6}}>
                    We couldn't retrieve the full student-wise breakdown for this course report.
                  </p>
                  <button onClick={() => onViewDetails(selectedReport)} style={{...S.cancelBtn, background:'#fff', border: '2px solid #e2e8f0', padding:'14px 28px', fontSize:'15px', display: 'inline-flex', alignItems:'center', gap: '8px'}}>
                    <ArrowsCounterClockwise size={18} weight="bold" /> Refresh Analytics
                  </button>
                </div>
              )}
            </div>
            
            <div style={S.modalFooter}>
              <button style={S.cancelBtn} onClick={() => { setShowReportModal(false); setReportDetails(null); }}>Close Report</button>
              <button style={{...S.submitBtn, background:'#0f172a', display: 'flex', alignItems:'center', gap:'8px'}} onClick={() => window.print()}>
                <Download size={18} weight="bold" /> Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
