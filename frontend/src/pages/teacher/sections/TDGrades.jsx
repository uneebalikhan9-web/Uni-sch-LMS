import { GraduationCap, ArrowLeft, Table } from "@phosphor-icons/react";
import { S } from "./TDStyles";

export default function TDGrades({ courses, students, grades, selectedCourse, setSelectedCourse, setActivePage, showGradeModal, setShowGradeModal, newGrade, setNewGrade, editingItem, setEditingItem, bulkGrades, setBulkGrades, showBulkGradeModal, setShowBulkGradeModal, handleGradesCourseSelect, fetchCourseGrades, bulkGradeHeader, setBulkGradeHeader, onBulkGradeSubmit }) {
  const filteredStudents = selectedCourse 
    ? students.filter(s => s.class_id === selectedCourse.class_id)
    : [];

  const avgGrade = grades.length > 0 ? Math.round(grades.reduce((acc, g) => acc + (g.percentage || 0), 0) / grades.length) : 0;
  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
            <button onClick={() => setActivePage('classes')} style={{ ...S.iconBtn, background:'#fff', border:'1px solid #e2e8f0', width:'32px', height:'32px' }}><ArrowLeft size={16} weight="bold" /></button>
            <h2 style={{ ...S.tableTitle, margin:0 }}><GraduationCap size={28} weight="duotone" color="#7c3aed" style={{ verticalAlign:'middle', marginRight:'12px' }} />Student Performance</h2>
          </div>
          <p style={S.tableSubtitle}>Manage grades {selectedCourse ? `for ${selectedCourse.title}` : ''}</p>
        </div>
        {selectedCourse && (
          <button onClick={() => {
            const initialBulk = filteredStudents.map(s => {
              const existing = grades.find(g => g.student_id === s.student_id);
              return { student_id:s.student_id, student_name:s.name, marks_obtained: existing ? existing.marks_obtained : '', remarks: existing ? existing.remarks : '' };
            });
            setBulkGrades(initialBulk);
            setShowBulkGradeModal(true);
          }} style={S.addBtn} className="add-btn"><Table size={18} weight="bold" /> Bulk Grade</button>
        )}
      </div>

      <div style={S.gradesFilter}>
        <select onChange={e => { const cid = e.target.value; handleGradesCourseSelect(cid); if (cid) fetchCourseGrades(cid); }} style={S.modernSelect} value={selectedCourse?.id || ''}>
          <option value="">Select a course to view grades</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>

      {selectedCourse && (
        <>
          <div style={S.gradesSummary}>
            <div style={S.summaryItem}><span>Total Students</span><strong>{filteredStudents.length}</strong></div>
            <div style={S.summaryItem}><span>Graded</span><strong>{grades.length}</strong></div>
            <div style={S.summaryItem}><span>Average</span><strong>{avgGrade}%</strong></div>
          </div>
          <table style={S.table}>
            <thead><tr style={S.tableHeadRow}><th style={S.th}>STUDENT</th><th style={S.th}>EXAM</th><th style={S.th}>MARKS</th><th style={S.th}>GRADE</th><th style={S.th}>DATE</th></tr></thead>
            <tbody>
              {filteredStudents.map(s => {
                const g = grades.find(grade => grade.student_id === s.student_id);
                return (
                  <tr key={s.student_id} style={{ ...S.tableRow, cursor:'pointer' }} onClick={() => {
                    if (g) { setEditingItem(g); setNewGrade({ student_id:g.student_id, exam_type:g.exam_type, marks_obtained:g.marks_obtained, max_marks:g.max_marks, exam_date:new Date(g.exam_date).toISOString().split('T')[0], remarks:g.remarks||'' }); }
                    else { setEditingItem(null); setNewGrade({ ...newGrade, student_id:s.student_id, exam_date:new Date().toISOString().split('T')[0] }); }
                    setShowGradeModal(true);
                  }}>
                    <td style={{ ...S.tdName, color:'#4f46e5' }}>{s.name}</td>
                    <td style={S.td}>{g ? <span style={S.examType}>{g.exam_type}</span> : <span style={{ color:'#94a3b8' }}>—</span>}</td>
                    <td style={S.td}>{g ? `${g.marks_obtained}/${g.max_marks}` : <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>Not Graded</span>}</td>
                    <td style={S.td}>{g ? <span style={S.gradeBadge}>{g.grade_letter}</span> : <span style={{ color:'#94a3b8' }}>—</span>}</td>
                    <td style={S.td}>{g ? new Date(g.exam_date).toLocaleDateString() : <span style={{ color:'#94a3b8' }}>—</span>}</td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && <tr><td colSpan="5" style={S.emptyTableCell}>No students enrolled in this course yet</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
