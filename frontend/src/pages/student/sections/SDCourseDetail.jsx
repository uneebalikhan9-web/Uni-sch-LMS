import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, User, BookOpen, CheckCircle, Clock, FileText,
  GraduationCap, CalendarBlank, Sparkle, ChartBar, Warning,
  ClipboardText, Pen
} from "@phosphor-icons/react";
import { S } from './SDStyles';
import API_BASE_URL from '../../../config/api';

export default function SDCourseDetail({ selectedCourse, setActivePage, assignments = [], grades = [], attendanceLogs = [] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [courseGrades, setCourseGrades] = useState([]);
  const [courseAttendance, setCourseAttendance] = useState([]);

  const course = selectedCourse;

  useEffect(() => {
    if (!course) return;

    // Filter assignments for this course
    const filtered = assignments.filter(a =>
      a.course_id === course.id || a.course_title === course.title
    );
    setCourseAssignments(filtered);

    // Filter grades for this course
    const gradeEntry = grades.find(g => g.course_id === course.id || g.course_title === course.title);
    setCourseGrades(gradeEntry?.grades || []);

    // Filter attendance for this course (by course_id if available)
    const attFiltered = attendanceLogs.filter(a =>
      a.course_id === course.id || a.course_title === course.title
    );
    setCourseAttendance(attFiltered);
  }, [course, assignments, grades, attendanceLogs]);

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        <BookOpen size={48} weight="duotone" style={{ marginBottom: 16, opacity: 0.4 }} />
        <p>Course not found. Please go back.</p>
        <button onClick={() => setActivePage('courses')} style={S.backBtn}>
          <ArrowLeft weight="bold" /> Back to Dashboard
        </button>
      </div>
    );
  }

  const submitted = courseAssignments.filter(a => a.submitted_at).length;
  const pending   = courseAssignments.filter(a => !a.submitted_at).length;
  const graded    = courseAssignments.filter(a => a.marks_obtained != null).length;
  const presentCount = courseAttendance.filter(a => a.status === 'present').length;
  const totalAtt  = courseAttendance.length;
  const attPct    = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : null;

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.85rem',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--primary-color, #4f46e5)' : '#f1f5f9',
    color: activeTab === tab ? '#fff' : '#64748b',
  });

  return (
    <div className="animate-fadeIn">
      {/* Back Button */}
      <button onClick={() => setActivePage('courses')} style={S.backBtn}>
        <ArrowLeft weight="bold" /> Back to Courses
      </button>

      {/* Course Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '24px',
        padding: '36px',
        color: '#fff',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -12px rgba(79, 70, 229, 0.4)',
      }}>
        {/* Decorative Orbs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '60%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '18px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <BookOpen size={36} weight="duotone" />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {course.status || 'Active'}
              </span>
              {course.class_name && (
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {course.class_name}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{course.title}</h1>
            <p style={{ opacity: 0.85, fontSize: '1rem', margin: '0 0 16px', lineHeight: 1.6 }}>{course.description || 'No description provided.'}</p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
                <User size={16} weight="fill" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{course.teacher_name || 'N/A'}</span>
              </div>
              {course.academic_year && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
                  <CalendarBlank size={16} weight="duotone" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{course.academic_year}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Assignments', value: courseAssignments.length, icon: <ClipboardText size={22} weight="duotone" />, color: '#4f46e5', bg: '#eef2ff' },
          { label: 'Submitted', value: submitted, icon: <CheckCircle size={22} weight="duotone" />, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Pending', value: pending, icon: <Warning size={22} weight="duotone" />, color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Graded', value: graded, icon: <GraduationCap size={22} weight="duotone" />, color: '#8b5cf6', bg: '#faf5ff' },
          { label: 'Attendance', value: attPct !== null ? `${attPct}%` : '—', icon: <ChartBar size={22} weight="duotone" />, color: attPct !== null && attPct < 75 ? '#ef4444' : '#10b981', bg: attPct !== null && attPct < 75 ? '#fef2f2' : '#f0fdf4' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '18px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: stat.bg, padding: '10px', borderRadius: '12px', color: stat.color, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview',     label: 'Overview',     icon: <BookOpen size={16} /> },
          { id: 'assignments',  label: 'Assignments',  icon: <FileText size={16} /> },
          { id: 'grades',       label: 'My Grades',    icon: <GraduationCap size={16} /> },
          { id: 'attendance',   label: 'Attendance',   icon: <CheckCircle size={16} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ ...tabStyle(tab.id), display: 'flex', alignItems: 'center', gap: '6px' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Course Info */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} weight="duotone" color="#4f46e5" /> Course Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Course Title',    value: course.title },
                { label: 'Instructor',      value: course.teacher_name || 'N/A' },
                { label: 'Class / Group',   value: course.class_name || 'N/A' },
                { label: 'Academic Year',   value: course.academic_year || 'N/A' },
                { label: 'Status',          value: course.status || 'Active' },
                { label: 'Enrollment',      value: course.enrollment_status || 'Enrolled' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Summary */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChartBar size={18} weight="duotone" color="#4f46e5" /> Performance Summary
            </h3>
            {/* Attendance Bar */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Attendance Rate</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: attPct !== null && attPct < 75 ? '#ef4444' : '#10b981' }}>{attPct !== null ? `${attPct}%` : 'N/A'}</span>
              </div>
              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${attPct || 0}%`, height: '100%', background: attPct !== null && attPct < 75 ? '#ef4444' : '#10b981', borderRadius: '999px', transition: 'width 1s ease' }} />
              </div>
              {attPct !== null && attPct < 75 && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>⚠️ Attendance below 75% — attend more classes!</p>
              )}
            </div>
            {/* Assignment Progress */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Assignments Submitted</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4f46e5' }}>{submitted}/{courseAssignments.length}</span>
              </div>
              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: courseAssignments.length > 0 ? `${(submitted / courseAssignments.length) * 100}%` : '0%', height: '100%', background: '#4f46e5', borderRadius: '999px', transition: 'width 1s ease' }} />
              </div>
            </div>
            {/* Latest Grade */}
            {courseGrades.length > 0 ? (
              <div style={{ background: '#faf5ff', borderRadius: '14px', padding: '16px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Grade</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{courseGrades[0]?.grade_type || 'Grade'}</span>
                  <span style={{ fontWeight: 900, color: '#7c3aed', fontSize: '1.2rem' }}>{courseGrades[0]?.grade_letter || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No grades posted yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Assignments */}
      {activeTab === 'assignments' && (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} weight="duotone" color="#4f46e5" /> Assignments — {course.title}
          </h3>
          {courseAssignments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <FileText size={40} weight="duotone" style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontWeight: 700 }}>No assignments posted yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courseAssignments.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: a.submitted_at ? '#dcfce7' : '#fff7ed', padding: '8px', borderRadius: '10px', color: a.submitted_at ? '#10b981' : '#f59e0b' }}>
                      {a.submitted_at ? <CheckCircle size={20} weight="bold" /> : <Clock size={20} weight="duotone" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{a.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {a.marks_obtained != null && (
                      <span style={{ background: '#f0fdf4', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
                        {a.marks_obtained}/{a.total_marks} marks
                      </span>
                    )}
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                      background: a.submitted_at ? '#dcfce7' : '#fff7ed',
                      color: a.submitted_at ? '#15803d' : '#b45309'
                    }}>
                      {a.submitted_at ? '✓ Submitted' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Grades */}
      {activeTab === 'grades' && (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={18} weight="duotone" color="#4f46e5" /> My Grades — {course.title}
          </h3>
          {courseGrades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <GraduationCap size={40} weight="duotone" style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontWeight: 700 }}>No grades posted yet for this course</p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Your instructor will post grades after evaluations.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {['Assessment', 'Marks Obtained', 'Total Marks', 'Grade', 'Posted On'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseGrades.map((g, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{g.grade_type || 'Assessment'}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#4f46e5' }}>{g.marks_obtained ?? 'N/A'}</td>
                      <td style={{ padding: '14px 16px', color: '#64748b' }}>{g.total_marks ?? 'N/A'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#faf5ff', color: '#7c3aed', padding: '4px 12px', borderRadius: '20px', fontWeight: 900, fontSize: '0.9rem' }}>
                          {g.grade_letter || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.82rem' }}>
                        {g.created_at ? new Date(g.created_at).toLocaleDateString('en-GB') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Attendance */}
      {activeTab === 'attendance' && (
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} weight="duotone" color="#4f46e5" /> Attendance — {course.title}
            </h3>
            {attPct !== null && (
              <div style={{ background: attPct < 75 ? '#fef2f2' : '#f0fdf4', color: attPct < 75 ? '#ef4444' : '#10b981', padding: '8px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>
                {attPct}% — {presentCount}/{totalAtt} classes
              </div>
            )}
          </div>
          {courseAttendance.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <CheckCircle size={40} weight="duotone" style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontWeight: 700 }}>No attendance records for this course yet</p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                {attendanceLogs.length > 0
                  ? 'Attendance may be tracked at class level. Check the Attendance section.'
                  : 'Your instructor will mark attendance during classes.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    {['Date', 'Status', 'Remarks'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courseAttendance.map((a, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {a.date ? new Date(a.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800,
                          background: a.status === 'present' ? '#dcfce7' : a.status === 'late' ? '#fff7ed' : '#fef2f2',
                          color: a.status === 'present' ? '#15803d' : a.status === 'late' ? '#b45309' : '#b91c1c',
                        }}>
                          {a.status === 'present' ? '✓ Present' : a.status === 'late' ? '⏰ Late' : '✗ Absent'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem' }}>{a.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
