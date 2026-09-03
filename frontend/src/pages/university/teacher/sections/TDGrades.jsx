import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, Table, Eye, CheckCircle, Warning, BookOpen,
  Student, Percent, Trophy, X, FloppyDisk, ArrowLeft
} from "@phosphor-icons/react";
import { S } from "./TDStyles";
import API_BASE_URL from '../../../../config/api';

const API = `${API_BASE_URL}/api`;

// Grade color helper
function gradeColor(letter) {
  if (!letter) return '#94a3b8';
  if (['A+','A','A-'].includes(letter)) return '#10b981';
  if (['B+','B','B-'].includes(letter)) return '#3b82f6';
  if (['C+','C','C-'].includes(letter)) return '#f59e0b';
  if (['D+','D'].includes(letter)) return '#f97316';
  return '#ef4444'; // F
}

// Compute grade letter from percentage locally (mirrors HEC scale)
function computeGrade(pct) {
  if (pct >= 90) return { letter: 'A+', points: 4.00 };
  if (pct >= 85) return { letter: 'A',  points: 4.00 };
  if (pct >= 80) return { letter: 'A-', points: 3.70 };
  if (pct >= 75) return { letter: 'B+', points: 3.30 };
  if (pct >= 71) return { letter: 'B',  points: 3.00 };
  if (pct >= 68) return { letter: 'B-', points: 2.70 };
  if (pct >= 64) return { letter: 'C+', points: 2.30 };
  if (pct >= 60) return { letter: 'C',  points: 2.00 };
  if (pct >= 57) return { letter: 'C-', points: 1.70 };
  if (pct >= 53) return { letter: 'D+', points: 1.30 };
  if (pct >= 50) return { letter: 'D',  points: 1.00 };
  return { letter: 'F', points: 0.00 };
}
// Compute grade letter for schools (Standard Percentage Scale)
function computeSchoolGrade(pct) {
  if (pct >= 80) return { letter: 'A+', points: 4.00 };
  if (pct >= 70) return { letter: 'A',  points: 3.70 };
  if (pct >= 60) return { letter: 'B',  points: 3.00 };
  if (pct >= 50) return { letter: 'C',  points: 2.00 };
  if (pct >= 40) return { letter: 'D',  points: 1.00 };
  return { letter: 'F', points: 0.00 };
}

export default function TDGrades({ courses, isSchool }) {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [existingGrades, setExistingGrades] = useState([]);
  const [bulkGrades, setBulkGrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load semesters
  useEffect(() => {
    fetch(`${API}/semesters`, { headers }).then(r => r.json()).then(d => {
      if (d.success) setSemesters(d.semesters || []);
    });
  }, []);

  // Load sections when course + semester selected
  useEffect(() => {
    if (!selectedCourse || !selectedSemester) { setSections([]); setSelectedSection(null); return; }
    fetch(`${API}/course-sections?semester_id=${selectedSemester}`, { headers })
      .then(r => r.json()).then(d => {
        if (d.success) {
          const filtered = (d.courseSections || []).filter(
            s => String(s.course_id) === String(selectedCourse.id)
          );
          setSections(filtered);
        }
      });
  }, [selectedCourse, selectedSemester]);

  // Load enrolled students + existing grades when section selected
  useEffect(() => {
    if (!selectedSection || !selectedSemester) { setEnrolledStudents([]); setExistingGrades([]); setBulkGrades([]); return; }

    // Enrolled students
    fetch(`${API}/enrollment/section/${selectedSection}`, { headers })
      .then(r => r.json()).then(d => {
        if (d.success) setEnrolledStudents(d.enrollments || []);
      });

    // Existing grades
    fetch(`${API}/grades/final/section/${selectedSection}?semester_id=${selectedSemester}`, { headers })
      .then(r => r.json()).then(d => {
        if (d.success) setExistingGrades(d.grades || []);
      });
  }, [selectedSection, selectedSemester]);

  // Build bulk grade rows whenever enrolled students or existing grades change
  useEffect(() => {
    if (enrolledStudents.length === 0) { setBulkGrades([]); return; }
    const rows = enrolledStudents.filter(e => e.status === 'enrolled').map(e => {
      const existing = existingGrades.find(g => g.student_id === e.student_id);
      return {
        student_id: e.student_id,
        student_name: e.student_name,
        roll_number: e.roll_number,
        midterm_marks: existing?.midterm_marks ?? '',
        final_marks: existing?.final_marks ?? '',
        assignment_marks: existing?.assignment_marks ?? '',
        quiz_marks: existing?.quiz_marks ?? '',
        lab_marks: existing?.lab_marks ?? '',
        existing_grade: existing?.letter_grade || null,
        is_published: existing?.is_published || false,
      };
    });
    setBulkGrades(rows);
  }, [enrolledStudents, existingGrades]);

  const updateRow = (idx, field, value) => {
    setBulkGrades(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const getRowTotal = (row) => {
    const mid = parseFloat(row.midterm_marks) || 0;
    const fin = parseFloat(row.final_marks) || 0;
    const asgn = parseFloat(row.assignment_marks) || 0;
    const quiz = parseFloat(row.quiz_marks) || 0;
    const lab = parseFloat(row.lab_marks) || 0;
    return mid + fin + asgn + quiz + lab;
  };

  const handleSaveAll = async () => {
    if (!selectedCourse || !selectedSection || !selectedSemester) return;
    setSaving(true);
    setMsg(null);
    try {
      const students_grades = bulkGrades.map(row => ({
        student_id: row.student_id,
        midterm_marks: row.midterm_marks,
        final_marks: row.final_marks,
        assignment_marks: row.assignment_marks,
        quiz_marks: row.quiz_marks,
        lab_marks: row.lab_marks
      }));

      const res = await fetch(`${API}/grades/final/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          course_id: selectedCourse.id,
          section_id: selectedSection,
          semester_id: selectedSemester,
          students_grades
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        // Refresh grades
        const gr = await fetch(`${API}/grades/final/section/${selectedSection}?semester_id=${selectedSemester}`, { headers });
        const gd = await gr.json();
        if (gd.success) setExistingGrades(gd.grades || []);
      } else {
        setMsg({ type: 'error', text: data.message });
      }
    } catch {
      setMsg({ type: 'error', text: 'Error saving grades. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedCourse || !selectedSemester) return;
    if (!window.confirm('Are you sure you want to PUBLISH these grades? Students will be able to see them and GPA will be recalculated.')) return;
    setPublishing(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/grades/publish`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          course_id: selectedCourse.id,
          section_id: selectedSection,
          semester_id: selectedSemester
        })
      });
      const data = await res.json();
      setMsg({ type: data.success ? 'success' : 'error', text: data.message });
      if (data.success) {
        const gr = await fetch(`${API}/grades/final/section/${selectedSection}?semester_id=${selectedSemester}`, { headers });
        const gd = await gr.json();
        if (gd.success) setExistingGrades(gd.grades || []);
      }
    } catch {
      setMsg({ type: 'error', text: 'Error publishing grades.' });
    } finally {
      setPublishing(false);
    }
  };

  const previewRows = bulkGrades.map(row => {
    const total = getRowTotal(row);
    const grade = isSchool ? computeSchoolGrade(total) : computeGrade(total);
    return { ...row, total, letter: grade.letter, points: grade.points };
  });

  const avgPct = previewRows.length > 0
    ? Math.round(previewRows.reduce((s, r) => s + r.total, 0) / previewRows.length)
    : 0;

  const passCount = previewRows.filter(r => r.letter !== 'F').length;

  return (
    <div style={S.tableCard} className="animate-fadeIn">
      {/* Header */}
      <div style={S.tableHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ ...S.tableTitle, margin: 0 }}>
              <GraduationCap size={28} weight="duotone" color="#7c3aed" style={{ verticalAlign: 'middle', marginRight: '12px' }} />
              {isSchool ? 'Grade Management — Standard Evaluation' : 'Grade Management — HEC Compliant'}
            </h2>
          </div>
          <p style={S.tableSubtitle}>
            {isSchool 
              ? 'Enter First Term, Final Term, Assessment, Monthly Tests & Practical marks. Grades computed automatically.'
              : 'Enter midterm, final, assignment, quiz & lab marks. Grades computed automatically using HEC scale.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedSection && (
            <>
              <button
                onClick={() => setShowPreview(!showPreview)}
                style={{ ...S.addBtn, background: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} /> {showPreview ? 'Edit Mode' : 'Preview'}
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving || bulkGrades.length === 0}
                style={{ ...S.addBtn, background: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FloppyDisk size={16} /> {saving ? 'Saving...' : 'Save All'}
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                style={{ ...S.addBtn, background: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> {publishing ? 'Publishing...' : 'Publish Grades'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select
          style={{ ...S.modernSelect, flex: 1, minWidth: '200px' }}
          value={selectedCourse?.id || ''}
          onChange={e => {
            const c = courses.find(x => String(x.id) === e.target.value);
            setSelectedCourse(c || null);
            setSelectedSection(null);
          }}>
          <option value="">{isSchool ? 'Select Subject' : 'Select Course'}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
        </select>

        <select
          style={{ ...S.modernSelect, minWidth: '180px' }}
          value={selectedSemester}
          onChange={e => { setSelectedSemester(e.target.value); setSelectedSection(null); }}>
          <option value="">{isSchool ? 'Select Term/Year' : 'Select Semester'}</option>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {sections.length > 0 && (
          <select
            style={{ ...S.modernSelect, minWidth: '150px' }}
            value={selectedSection || ''}
            onChange={e => setSelectedSection(e.target.value || null)}>
            <option value="">Select Section</option>
            {sections.map(s => <option key={s.id} value={s.id}>Section {s.section_label} ({s.current_enrolled}/{s.max_capacity})</option>)}
          </select>
        )}
      </div>

      {/* Message */}
      {msg && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
          background: msg.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: msg.type === 'success' ? '#065f46' : '#991b1b',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <Warning size={18} />}
          {msg.text}
          <button onClick={() => setMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {/* Summary Cards */}
      {selectedSection && previewRows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { icon: <Student size={20} color="#6366f1" />, label: 'Students', value: previewRows.length, bg: '#eef2ff' },
            { icon: <Percent size={20} color="#059669" />, label: 'Class Average', value: `${avgPct}%`, bg: '#d1fae5' },
            { icon: <Trophy size={20} color="#f59e0b" />, label: 'Pass Rate', value: `${Math.round(passCount / previewRows.length * 100)}%`, bg: '#fef3c7' },
            { icon: <BookOpen size={20} color="#3b82f6" />, label: 'Published', value: existingGrades.filter(g => g.is_published).length, bg: '#dbeafe' },
          ].map((card, i) => (
            <div key={i} style={{ background: card.bg, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {card.icon}
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{card.label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{card.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grade Table */}
      {selectedSection && (
        <div style={{ overflowX: 'auto' }}>
          {bulkGrades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <Student size={40} style={{ marginBottom: '12px' }} />
              <p>No enrolled students found for this section.</p>
            </div>
          ) : (
            <table style={{ ...S.table, minWidth: '900px' }}>
              <thead>
                <tr style={S.tableHeadRow}>
                  <th style={S.th}>STUDENT</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>{isSchool ? '1ST TERM' : 'MIDTERM'}<br /><span style={{ fontWeight: 400, fontSize: '0.7rem' }}>(out of 30)</span></th>
                  <th style={{ ...S.th, textAlign: 'center' }}>{isSchool ? 'FINAL TERM' : 'FINAL'}<br /><span style={{ fontWeight: 400, fontSize: '0.7rem' }}>(out of 50)</span></th>
                  <th style={{ ...S.th, textAlign: 'center' }}>{isSchool ? 'ASSESSMENT' : 'ASSIGNMENT'}<br /><span style={{ fontWeight: 400, fontSize: '0.7rem' }}>(out of 10)</span></th>
                  <th style={{ ...S.th, textAlign: 'center' }}>{isSchool ? 'MONTHLY TEST' : 'QUIZ'}<br /><span style={{ fontWeight: 400, fontSize: '0.7rem' }}>(out of 5)</span></th>
                  <th style={{ ...S.th, textAlign: 'center' }}>{isSchool ? 'PRACTICAL' : 'LAB'}<br /><span style={{ fontWeight: 400, fontSize: '0.7rem' }}>(out of 5)</span></th>
                  <th style={{ ...S.th, textAlign: 'center' }}>TOTAL %</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>GRADE</th>
                  <th style={{ ...S.th, textAlign: 'center' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {bulkGrades.map((row, idx) => {
                  const total = getRowTotal(row);
                  const grade = isSchool ? computeSchoolGrade(total) : computeGrade(total);
                  return (
                    <tr key={row.student_id} style={S.tableRow}>
                      <td style={S.tdName}>
                        <div style={{ fontWeight: 600 }}>{row.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.roll_number}</div>
                      </td>
                      {showPreview ? (
                        <>
                          <td style={{ ...S.td, textAlign: 'center' }}>{row.midterm_marks || '—'}</td>
                          <td style={{ ...S.td, textAlign: 'center' }}>{row.final_marks || '—'}</td>
                          <td style={{ ...S.td, textAlign: 'center' }}>{row.assignment_marks || '—'}</td>
                          <td style={{ ...S.td, textAlign: 'center' }}>{row.quiz_marks || '—'}</td>
                          <td style={{ ...S.td, textAlign: 'center' }}>{row.lab_marks || '—'}</td>
                        </>
                      ) : (
                        ['midterm_marks', 'final_marks', 'assignment_marks', 'quiz_marks', 'lab_marks'].map(field => (
                          <td key={field} style={{ ...S.td, textAlign: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              max={field === 'midterm_marks' ? 30 : field === 'final_marks' ? 50 : field === 'assignment_marks' ? 10 : 5}
                              value={row[field]}
                              onChange={e => updateRow(idx, field, e.target.value)}
                              disabled={row.is_published}
                              style={{
                                width: '60px', textAlign: 'center', padding: '4px 6px',
                                border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem',
                                background: row.is_published ? '#f1f5f9' : '#fff'
                              }}
                            />
                          </td>
                        ))
                      )}
                      <td style={{ ...S.td, textAlign: 'center', fontWeight: 600 }}>
                        {total > 0 ? `${total}%` : '—'}
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        {total > 0 ? (
                          <span style={{
                            padding: '3px 10px', borderRadius: '12px', fontWeight: 700,
                            fontSize: '0.8rem', background: `${gradeColor(grade.letter)}20`,
                            color: gradeColor(grade.letter)
                          }}>
                            {grade.letter}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        {row.is_published ? (
                          <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600 }}>Published</span>
                        ) : row.existing_grade ? (
                          <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 600 }}>Saved</span>
                        ) : (
                          <span style={{ padding: '3px 10px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', fontSize: '0.75rem' }}>Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selectedSection && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <GraduationCap size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', marginBottom: '8px' }}>Select a {isSchool ? 'subject, term' : 'course, semester'}, and section to manage grades</p>
          <p style={{ fontSize: '0.85rem' }}>
            {isSchool 
              ? 'Standard School Scale: A+(80+) → A(70+) → B(60+) → C(50+) → D(40+) → F(<40)'
              : 'HEC Grade Scale: A+(90+) → A(85) → B+(75) → C(60) → D(50) → F(<50)'}
          </p>
        </div>
      )}
    </div>
  );
}
