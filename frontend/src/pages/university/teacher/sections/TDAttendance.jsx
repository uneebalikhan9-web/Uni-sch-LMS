import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, CalendarBlank, Users, CaretRight, FileText, DownloadSimple, ScanSmiley, ArrowClockwise } from "@phosphor-icons/react";
import API_BASE_URL from '../../../../config/api';
import { S } from './TDStyles';

export default function TDAttendance({ teacherClasses, token, showToast }) {
  const [mainTab, setMainTab] = useState('class'); // 'class' | 'face'
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classCourses, setClassCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // {student_id: status}
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(null);
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'history'
  const [saving, setSaving] = useState(false);
  // Face Attendance Sheet state
  const [faceDate, setFaceDate] = useState(new Date().toISOString().split('T')[0]);
  const [faceLog, setFaceLog] = useState([]);
  const [faceLoading, setFaceLoading] = useState(false);
  
  // Monthly Sheet State
  const [historyMonth, setHistoryMonth] = useState(new Date().getMonth() + 1);
  const [historyYear, setHistoryYear] = useState(new Date().getFullYear());

  // Fetch courses when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchClassCourses(selectedClassId);
      setSelectedCourseId('');
      setStudents([]);
      setAttendanceRecords({});
    }
  }, [selectedClassId]);

  // Fetch students when course is selected
  useEffect(() => {
    if (selectedClassId && selectedCourseId) {
      fetchClassStudents();
      fetchExistingAttendance();
      fetchFaceAttendance();
    } else {
      setStudents([]);
      setAttendanceRecords({});
    }
  }, [selectedCourseId, attendanceDate]);

  const fetchClassCourses = async (classId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${classId}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setClassCourses(data.courses || []);
    } catch (error) { console.error(error); }
  };

  const fetchClassStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/class/${selectedClassId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
        // Default everyone to present if no existing records
        const initial = {};
        data.students.forEach(s => initial[s.id] = 'present');
        setAttendanceRecords(prev => ({...initial, ...prev}));
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/class/${selectedClassId}/date/${attendanceDate}?course_id=${selectedCourseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.records.length > 0) {
        const existing = {};
        data.records.forEach(r => existing[r.student_id] = r.status);
        setAttendanceRecords(prev => ({...prev, ...existing}));
      }
    } catch (error) { console.error(error); }
  };

  const fetchHistory = async () => {
    if (!selectedClassId || !selectedCourseId) {
      showToast('Please select Class and Course first', 'warning');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/history/all?class_id=${selectedClassId}&course_id=${selectedCourseId}&month=${historyMonth}&year=${historyYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data);
        setViewMode('history');
      }
    } catch (error) { showToast('Failed to fetch history', 'error'); }
    finally { setLoading(false); }
  };

  const fetchFaceAttendance = async (targetDate) => {
    const dateParam = typeof targetDate === 'string' ? targetDate : faceDate;
    setFaceLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/face-attendance/today?date=${dateParam}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      // Filter face log to only show students in the currently selected course/class
      // If students array is empty (e.g. still loading), we might show nothing, 
      // but students is usually loaded alongside. 
      // A better approach is to store all records, and filter when rendering, or filter here.
      // We will store all, but when rendering, we filter, or filter here using `students` state.
      // Wait, `students` state might not be populated yet if they are fetched in parallel.
      setFaceLog(data.attendance || []);
    } catch {
      showToast('Could not load face attendance data', 'error');
    } finally {
      setFaceLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'face') fetchFaceAttendance();
  }, [mainTab]);

  useEffect(() => {
    if (viewMode === 'history' && selectedClassId && selectedCourseId) {
      fetchHistory();
    }
  }, [historyMonth, historyYear]);

  const exportToExcel = () => {
    const daysInMonth = new Date(historyYear, historyMonth, 0).getDate();
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const studentMap = {};
    students.forEach(s => {
      studentMap[s.id] = { name: s.name, email: s.email };
      monthDays.forEach(d => studentMap[s.id][d] = '-');
    });

    if (history && history.records) {
      history.records.forEach(r => {
        if (studentMap[r.student_id]) {
          const dayNum = parseInt(r.date.split('-')[2], 10);
          studentMap[r.student_id][dayNum] = r.status.toUpperCase().charAt(0);
        }
      });
    }

    const headers = ['Student Name', 'Email', ...monthDays];
    const rows = Object.values(studentMap).map(s =>
      [s.name, s.email, ...monthDays.map(d => s[d] || '-')]
        .map(cell => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_${historyYear}_${historyMonth}_${classCourses.find(c => c.id == selectedCourseId)?.title || 'Course'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Attendance CSV downloaded! (Opens in Excel)', 'success');
  };

  const exportFaceToExcel = () => {
    if (faceLog.length === 0) { showToast('No face attendance data to export', 'warning'); return; }
    const headers = ['#', 'Student Name', 'Roll Number', 'Date', 'Time In', 'Status'];
    const rows = faceLog.map((r, i) => [
      i + 1, r.student_name, r.roll_number, r.date, r.time, 'Present'
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    link.download = `FaceAttendance_${faceDate}.csv`;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
    showToast('Face Attendance Excel downloaded!', 'success');
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedCourseId || !attendanceDate) {
      showToast('Please select all required fields', 'warning');
      return;
    }

    setSaving(true);
    const payload = {
      class_id: selectedClassId,
      course_id: selectedCourseId,
      attendance_date: attendanceDate,
      students: students.map(s => {
        const scan = faceLog.find(f => f.student_id === s.id || f.roll_number === s.roll_number);
        const status = attendanceRecords[s.id] || 'present';
        return {
          student_id: s.id,
          status: status,
          method: (status === 'present' && scan) ? 'Face AI' : 'Manual'
        };
      })
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        showToast('Attendance saved successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to save attendance', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderMarkingView = () => (
    <div style={{ marginTop: '2rem' }}>
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={S.cardTitle}>Mark Students Attendance</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setAttendanceRecords(prev => {
                const updated = {...prev};
                students.forEach(s => updated[s.id] = 'present');
                return updated;
              })}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #10b981', color: '#10b981', background: 'transparent', fontSize: '13px', cursor: 'pointer' }}
            >
              All Present
            </button>
            <button 
              onClick={handleSaveAttendance}
              disabled={saving}
              style={{ ...S.primaryBtn, padding: '0.5rem 1.5rem', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>

        {students.length > 0 ? (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Student Name</th>
                  <th style={S.th}>Email</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} style={S.tr}>
                    <td style={S.td}>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      {(() => {
                        const scan = faceLog.find(f => f.student_id === student.id || f.roll_number === student.roll_number);
                        if (scan) {
                          return (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px', background: 'rgba(16,185,129,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                              <ScanSmiley size={12} />
                              Face ID Check-in: {scan.time}
                            </div>
                          );
                        } else {
                          return (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                              No Face Check-in
                            </div>
                          );
                        }
                      })()}
                    </td>
                    <td style={S.td}>{student.email}</td>
                    <td style={S.td}>
                      <span style={{
                        ...S.statusBadge,
                        backgroundColor: 
                          attendanceRecords[student.id] === 'present' ? '#ecfdf5' : 
                          attendanceRecords[student.id] === 'absent' ? '#fef2f2' : 
                          attendanceRecords[student.id] === 'leave' ? '#eff6ff' : '#fff7ed',
                        color: 
                          attendanceRecords[student.id] === 'present' ? '#10b981' : 
                          attendanceRecords[student.id] === 'absent' ? '#ef4444' : 
                          attendanceRecords[student.id] === 'leave' ? '#3b82f6' : '#f97316',
                      }}>
                        {attendanceRecords[student.id]?.toUpperCase() || 'PRESENT'}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleStatusChange(student.id, 'present')}
                          style={{ 
                            padding: '6px', borderRadius: '6px', border: 'none',
                            background: attendanceRecords[student.id] === 'present' ? '#10b981' : '#f1f5f9',
                            color: attendanceRecords[student.id] === 'present' ? 'white' : '#64748b',
                            cursor: 'pointer'
                          }}
                          title="Present"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          style={{ 
                            padding: '6px', borderRadius: '6px', border: 'none',
                            background: attendanceRecords[student.id] === 'absent' ? '#ef4444' : '#f1f5f9',
                            color: attendanceRecords[student.id] === 'absent' ? 'white' : '#64748b',
                            cursor: 'pointer'
                          }}
                          title="Absent"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(student.id, 'leave')}
                          style={{ 
                            padding: '6px', borderRadius: '6px', border: 'none',
                            background: attendanceRecords[student.id] === 'leave' ? '#3b82f6' : '#f1f5f9',
                            color: attendanceRecords[student.id] === 'leave' ? 'white' : '#64748b',
                            cursor: 'pointer'
                          }}
                          title="Leave"
                        >
                          <CalendarBlank size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>Select a class and course to load students</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSheetView = () => {
    const daysInMonth = new Date(historyYear, historyMonth, 0).getDate();
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div style={{ marginTop: '2rem' }}>
        <div style={{ ...S.card, padding: '1.5rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={S.cardTitle}>Monthly Attendance Sheet</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Showing all records for {classCourses.find(c => c.id == selectedCourseId)?.title}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select style={{...S.input, padding: '6px 10px', minWidth: '100px'}} value={historyMonth} onChange={e => setHistoryMonth(parseInt(e.target.value))}>
                {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'short' })}</option>)}
              </select>
              <select style={{...S.input, padding: '6px 10px', minWidth: '80px'}} value={historyYear} onChange={e => setHistoryYear(parseInt(e.target.value))}>
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <button onClick={exportToExcel} style={{ ...S.secondaryBtn, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #10b981', color: '#10b981' }}>
                <DownloadSimple size={18} /> Excel
              </button>
              <button onClick={() => setViewMode('mark')} style={{ ...S.secondaryBtn, padding: '0.5rem 1rem' }}>
                Back
              </button>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '600px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ ...S.table, borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ ...S.th, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 20, minWidth: '180px', borderRight: '2px solid #e2e8f0' }}>Student Name</th>
                  {monthDays.map(day => {
                    const dateObj = new Date(historyYear, historyMonth - 1, day);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    return (
                      <th key={day} style={{ ...S.th, textAlign: 'center', minWidth: '35px', padding: '10px 4px', fontSize: '11px', background: isWeekend ? '#f1f5f9' : '#f8fafc', color: isWeekend ? '#94a3b8' : '#475569' }}>
                        {day}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const studentData = {};
                  // Initialize all students
                  students.forEach(s => {
                    studentData[s.id] = { name: s.name, records: {}, methods: {} };
                  });
                  // Map history records
                  if (history && history.records) {
                    history.records.forEach(r => {
                      if (!studentData[r.student_id]) {
                        studentData[r.student_id] = { name: r.student_name, records: {}, methods: {} };
                      }
                      const dayStr = r.date.split('-')[2];
                      const dayNum = parseInt(dayStr, 10);
                      studentData[r.student_id].records[dayNum] = r.status;
                      studentData[r.student_id].methods[dayNum] = r.method;
                    });
                  }

                  return Object.entries(studentData).map(([sId, data]) => (
                    <tr key={sId} style={S.tr}>
                      <td style={{ ...S.td, fontWeight: 600, position: 'sticky', left: 0, background: 'white', zIndex: 5, borderRight: '2px solid #e2e8f0' }}>
                        {data.name}
                      </td>
                      {monthDays.map(day => {
                        const status = data.records[day];
                        const method = data.methods[day];
                        const dateObj = new Date(historyYear, historyMonth - 1, day);
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                        return (
                          <td key={day} style={{ ...S.td, textAlign: 'center', background: isWeekend ? '#f8fafc' : 'white', padding: '8px 4px' }}>
                            {status ? (
                              <span 
                                title={method === 'Face AI' ? 'Face ID verified' : 'Manually marked'}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  color: status === 'present' ? '#10b981' : status === 'absent' ? '#ef4444' : status === 'leave' ? '#3b82f6' : '#f97316',
                                  background: status === 'present' ? '#ecfdf5' : status === 'absent' ? '#fef2f2' : status === 'leave' ? '#eff6ff' : '#fff7ed',
                                  cursor: 'help'
                                }}
                              >
                                {status.toUpperCase().charAt(0)}
                              </span>
                            ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderFaceSheet = () => (
    <div style={{ marginTop: '2rem' }}>
      {/* Controls */}
      <div style={{ background: '#fff', borderRadius: '20px', padding: '20px 24px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ScanSmiley size={20} color="#4f46e5" weight="duotone" /> Face Attendance Sheet
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Students who marked attendance via Face AI on {new Date(faceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={faceDate}
            onChange={(e) => {
              setFaceDate(e.target.value);
              fetchFaceAttendance(e.target.value);
            }}
            max={new Date().toISOString().split('T')[0]}
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: '13px',
              color: '#334155',
              background: '#f8fafc'
            }}
          />
          <button onClick={() => fetchFaceAttendance(faceDate)} disabled={faceLoading} style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: faceLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', opacity: faceLoading ? 0.7 : 1 }}>
            <ArrowClockwise size={16} weight={faceLoading ? "bold" : "regular"} /> {faceLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={exportFaceToExcel} style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.08)', color: '#065f46', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DownloadSimple size={16} /> Download Excel
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: `Present (${new Date(faceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })})`, value: faceLog.filter(row => students.some(s => s.id === row.student_id)).length, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
          { label: 'Last Updated', value: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }), color: '#4f46e5', bg: 'rgba(79,70,229,0.08)', border: 'rgba(79,70,229,0.2)' },
          { label: 'Date', value: new Date(faceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, margin: '0 0 4px' }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        {faceLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ fontWeight: 600 }}>Loading face attendance...</p>
          </div>
        ) : faceLog.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FileText size={48} color="#94a3b8" weight="duotone" style={{ marginBottom: '16px' }} />
            <p style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 6px', color: '#475569' }}>No face attendance recorded today</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Students need to mark attendance from their portal using face recognition</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['#', 'Student Name', 'Roll Number', 'Time In', 'Face Status'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {faceLog.filter(row => students.some(s => s.id === row.student_id)).map((row, i) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                  <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{row.student_name}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '14px', fontFamily: 'monospace' }}>{row.roll_number}</td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontSize: '14px', fontWeight: 600 }}>{row.time}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', color: '#065f46', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                      <CheckCircle size={14} /> Face Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', borderRadius: '16px', padding: '5px', width: 'fit-content' }}>
        {[
          { key: 'class', label: 'Class Attendance', icon: <Users size={16} /> },
          { key: 'face', label: 'Face AI Sheet', icon: <ScanSmiley size={16} /> },
        ].map(t => (
          <button
            key={t.key}
            style={{ padding: '10px 22px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
              background: mainTab === t.key ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
              color: mainTab === t.key ? '#fff' : '#64748b',
              boxShadow: mainTab === t.key ? '0 4px 12px rgba(79,70,229,0.35)' : 'none' }}
            onClick={() => setMainTab(t.key)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t.icon}
              {t.label}
            </span>
          </button>
        ))}
      </div>

      {mainTab === 'face' ? renderFaceSheet() : (
        <>
          {/* Header Selectors */}
          <div style={{ ...S.card, padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: '8px' }}>Select Class</label>
              <select style={S.input} value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}>
                <option value="">Choose Class...</option>
                {teacherClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: '8px' }}>Select Course</label>
              <select style={S.input} value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} disabled={!selectedClassId}>
                <option value="">Choose Course...</option>
                {classCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ ...S.label, display: 'block', marginBottom: '8px' }}>Attendance Date</label>
              <input type="date" style={S.input} value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={fetchHistory} disabled={!selectedCourseId} style={{ ...S.secondaryBtn, flex: 1, padding: '10px' }}>History</button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading students...</p>
            </div>
          ) : (
            viewMode === 'mark' ? renderMarkingView() : renderSheetView()
          )}
        </>
      )}
    </div>
  );
}
