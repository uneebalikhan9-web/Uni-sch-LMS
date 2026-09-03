import React, { useState, useEffect } from 'react';
import {
  GraduationCap, TrendUp, TrendDown, BookOpen, Trophy,
  Warning, CheckCircle, ClockCounterClockwise, Minus
} from '@phosphor-icons/react';
import API_BASE_URL from '../../../../config/api';

const API = `${API_BASE_URL}/api`;

function gradeColor(letter) {
  if (!letter) return '#94a3b8';
  if (['A+', 'A', 'A-'].includes(letter)) return '#10b981';
  if (['B+', 'B', 'B-'].includes(letter)) return '#3b82f6';
  if (['C+', 'C', 'C-'].includes(letter)) return '#f59e0b';
  if (['D+', 'D'].includes(letter)) return '#f97316';
  return '#ef4444';
}

function StandingBadge({ standing }) {
  const config = {
    good: { label: 'Good Standing', color: '#065f46', bg: '#d1fae5', icon: <CheckCircle size={14} /> },
    warning: { label: 'Warning', color: '#92400e', bg: '#fef3c7', icon: <Warning size={14} /> },
    probation: { label: 'Academic Probation', color: '#7f1d1d', bg: '#fee2e2', icon: <Warning size={14} weight="fill" /> },
    suspension: { label: 'Suspended', color: '#1e1b4b', bg: '#ede9fe', icon: <Warning size={14} weight="fill" /> },
    dismissed: { label: 'Dismissed', color: '#fff', bg: '#dc2626', icon: <Warning size={14} weight="fill" /> },
  };
  const c = config[standing] || config.good;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem',
      fontWeight: 600, background: c.bg, color: c.color
    }}>
      {c.icon} {c.label}
    </span>
  );
}

function GPAGauge({ value, max = 4 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 3.5 ? '#10b981' : value >= 3.0 ? '#3b82f6' : value >= 2.5 ? '#f59e0b' : value >= 2.0 ? '#f97316' : '#ef4444';
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="18" fontWeight="700">
          {value ? value.toFixed(2) : '0.00'}
        </text>
        <text x="50" y="65" textAnchor="middle" fill="#94a3b8" fontSize="9">
          / 4.00
        </text>
      </svg>
    </div>
  );
}

export default function SDGrades() {
  const token = sessionStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/grades/my-academic-record`, { headers })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setRecord(d);
          // Set most recent semester as active
          const semIds = Object.keys(d.grades_by_semester || {});
          if (semIds.length > 0) setActiveSemester(semIds[semIds.length - 1]);
        } else {
          setError(d.message);
        }
      })
      .catch(() => setError('Failed to load academic record'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <GraduationCap size={40} style={{ marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
        <p>Loading academic record…</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>
      <Warning size={40} style={{ marginBottom: '12px' }} />
      <p>{error}</p>
    </div>
  );

  const { student, grades_by_semester, semester_records } = record || {};
  const cgpa = student?.cgpa || 0;
  const semList = Object.entries(grades_by_semester || {});
  const latestRecord = semester_records?.[semester_records.length - 1];

  const creditProgress = semester_records?.reduce((s, r) => s + parseFloat(r.credits_earned || 0), 0) || 0;
  const creditRequired = student?.program_level === 'PhD' ? 54 : student?.program_level === 'Postgraduate' ? 36 : 130;

  return (
    <div style={{ padding: '8px' }}>
      {/* === Top Section: CGPA Overview === */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: '16px', padding: '28px', marginBottom: '24px', color: '#fff'
      }}>
        {/* Left: GPA Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <GPAGauge value={parseFloat(cgpa)} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>Cumulative GPA</div>
            <StandingBadge standing={student?.academic_status || 'good'} />
          </div>
        </div>

        {/* Right: Stats */}
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '4px' }}>{student?.program_name}</div>
          <div style={{ fontSize: '0.85rem', color: '#c7d2fe', marginBottom: '20px' }}>Semester {student?.current_semester}</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              {
                icon: <BookOpen size={20} />,
                label: 'Credits Earned',
                value: `${creditProgress.toFixed(0)} / ${creditRequired}`,
                sub: `${Math.round(creditProgress / creditRequired * 100)}% complete`
              },
              {
                icon: <ClockCounterClockwise size={20} />,
                label: 'Semesters',
                value: semester_records?.length || 0,
                sub: 'completed'
              },
              {
                icon: <Trophy size={20} />,
                label: 'Last Sem GPA',
                value: latestRecord?.semester_gpa ? parseFloat(latestRecord.semester_gpa).toFixed(2) : '—',
                sub: latestRecord?.semester_name || ''
              },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
                padding: '14px', backdropFilter: 'blur(8px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c7d2fe', marginBottom: '6px' }}>
                  {stat.icon}
                  <span style={{ fontSize: '0.75rem' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: '#a5b4fc' }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Credit Progress Bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#c7d2fe', marginBottom: '6px' }}>
              <span>Degree Progress</span>
              <span>{Math.round(creditProgress / creditRequired * 100)}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(creditProgress / creditRequired * 100, 100)}%`,
                height: '100%', borderRadius: '6px',
                background: 'linear-gradient(90deg, #6ee7b7, #34d399)',
                transition: 'width 1s ease'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* === Semester GPA Trend === */}
      {semester_records?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
            <TrendUp size={18} style={{ verticalAlign: 'middle', marginRight: '8px', color: '#6366f1' }} />
            Semester GPA Trend
          </h3>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {semester_records.map((rec, i) => {
              const prev = semester_records[i - 1];
              const diff = prev ? parseFloat(rec.semester_gpa) - parseFloat(prev.semester_gpa) : 0;
              const gpaVal = parseFloat(rec.semester_gpa);
              const barH = Math.max((gpaVal / 4.0) * 100, 4);
              const barColor = gpaVal >= 3.0 ? '#10b981' : gpaVal >= 2.0 ? '#f59e0b' : '#ef4444';
              return (
                <div key={rec.semester_id} style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '80px' }}>
                    <div style={{ width: '40px', height: `${barH}%`, background: barColor, borderRadius: '4px 4px 0 0', transition: 'height 0.8s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>{gpaVal.toFixed(2)}</div>
                  {i > 0 && (
                    <div style={{ fontSize: '0.65rem', color: diff >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      {diff > 0 ? <TrendUp size={10} /> : diff < 0 ? <TrendDown size={10} /> : <Minus size={10} />}
                      {diff !== 0 ? Math.abs(diff).toFixed(2) : '—'}
                    </div>
                  )}
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                    {rec.semester_name?.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === Semester Tabs + Grades Table === */}
      {semList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <GraduationCap size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No published grades yet. Grades will appear here once your teacher publishes them.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Semester Tabs */}
          <div style={{ display: 'flex', gap: '4px', padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
            {semList.map(([semId, semData]) => (
              <button
                key={semId}
                onClick={() => setActiveSemester(semId)}
                style={{
                  padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontWeight: activeSemester === semId ? 700 : 400,
                  fontSize: '0.8rem', whiteSpace: 'nowrap',
                  background: activeSemester === semId ? '#4f46e5' : 'transparent',
                  color: activeSemester === semId ? '#fff' : '#64748b',
                  transition: 'all 0.2s'
                }}>
                {semData.semester_name}
              </button>
            ))}
          </div>

          {/* Grades for active semester */}
          {activeSemester && grades_by_semester[activeSemester] && (
            <>
              {/* Semester summary */}
              {(() => {
                const semRec = semester_records?.find(r => String(r.semester_id) === String(activeSemester));
                return semRec ? (
                  <div style={{ display: 'flex', gap: '24px', padding: '16px 20px', background: '#f0f9ff', borderBottom: '1px solid #e2e8f0' }}>
                    <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Semester GPA: </span><strong style={{ color: '#0369a1' }}>{parseFloat(semRec.semester_gpa).toFixed(2)}</strong></div>
                    <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Credits Attempted: </span><strong>{semRec.credits_attempted}</strong></div>
                    <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Credits Earned: </span><strong style={{ color: '#059669' }}>{semRec.credits_earned}</strong></div>
                    <div><span style={{ fontSize: '0.75rem', color: '#64748b' }}>Standing: </span><StandingBadge standing={semRec.academic_standing} /></div>
                  </div>
                ) : null;
              })()}

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Course', 'Code', 'Credit Hours', 'Type', 'Total %', 'Grade', 'Points'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grades_by_semester[activeSemester].courses.map((g, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>{g.course_title}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem' }}>{g.course_code}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>{g.credit_hours}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
                          background: g.course_type === 'lab' ? '#ede9fe' : '#dbeafe',
                          color: g.course_type === 'lab' ? '#5b21b6' : '#1d4ed8'
                        }}>
                          {g.course_type || 'theory'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>{g.percentage ? `${parseFloat(g.percentage).toFixed(1)}%` : '—'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                          background: `${gradeColor(g.letter_grade)}20`,
                          color: gradeColor(g.letter_grade)
                        }}>
                          {g.letter_grade || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b' }}>
                        {g.grade_points !== null ? parseFloat(g.grade_points).toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
