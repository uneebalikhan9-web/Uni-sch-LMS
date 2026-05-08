import React from 'react';
import { GraduationCap } from "@phosphor-icons/react";
import { S } from './SDStyles';

export default function SDGrades({ grades, calculateGPA }) {
  return (
    <div className="animate-fadeIn">
      <h2 style={S.sectionTitle}>
        <GraduationCap size={28} weight="duotone" color="#7c3aed" style={{verticalAlign:'middle', marginRight:'12px'}} />
        Examination Results
      </h2>
      <div style={S.gradesSummary}>
        <div style={S.summaryItem}>
          <span style={{color:'rgba(255,255,255,0.6)', fontSize:'12px', fontWeight:600, letterSpacing:'1px'}}>GPA</span>
          <strong style={{color:'#fff', fontSize:'28px', fontWeight:800}}>{calculateGPA()}</strong>
        </div>
        <div style={S.summaryItem}>
          <span style={{color:'rgba(255,255,255,0.6)', fontSize:'12px', fontWeight:600, letterSpacing:'1px'}}>COURSES</span>
          <strong style={{color:'#fff', fontSize:'28px', fontWeight:800}}>{grades.length}</strong>
        </div>
        <div style={S.summaryItem}>
          <span style={{color:'rgba(255,255,255,0.6)', fontSize:'12px', fontWeight:600, letterSpacing:'1px'}}>TOTAL GRADES</span>
          <strong style={{color:'#fff', fontSize:'28px', fontWeight:800}}>{grades.reduce((acc, g) => acc + (g.grades?.length || 0), 0)}</strong>
        </div>
      </div>

      {grades.map(cg => (
        <div key={cg.course_id} style={S.tableCard}>
          <div style={S.tableHeader}>
            <h3 style={S.tableTitle}>{cg.course_title}</h3>
          </div>
          <div style={S.tableContainer} className="table-container">
            <table style={S.table}>
              <thead>
                <tr style={S.tableHeadRow}>
                  <th style={S.th}>EXAM TYPE</th>
                  <th style={S.th}>MARKS</th>
                  <th style={{...S.th, textAlign: 'right'}}>GRADE</th>
                </tr>
              </thead>
              <tbody>
                {cg.grades.map(g => (
                  <tr key={g.id} style={S.tableRow}>
                    <td style={S.tdName}>{g.exam_type}</td>
                    <td style={S.td}>{g.marks_obtained} / {g.max_marks}</td>
                    <td style={{...S.td, textAlign: 'right'}}>
                      <span style={S.gradeBadge}>{g.grade_letter}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {grades.length === 0 && (
        <div style={S.emptyState}>
          <GraduationCap size={48} weight="duotone" color="#94a3b8" />
          <p>No examination results found.</p>
        </div>
      )}
    </div>
  );
}
