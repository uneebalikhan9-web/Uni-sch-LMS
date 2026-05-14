import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { CheckCircle, XCircle, Clock, CalendarBlank, Users, CaretRight, FileText, DownloadSimple } from "@phosphor-icons/react";
import API_BASE_URL from '../../../config/api';
import { S } from './TDStyles';

export default function TDAttendance({ teacherClasses, token, showToast }) {
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
      const response = await fetch(`${API_BASE_URL}/api/attendance/history/all?class_id=${selectedClassId}&course_id=${selectedCourseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data);
        setViewMode('history');
      }
    } catch (error) { showToast('Failed to fetch history', 'error'); }
    finally { setLoading(true); setLoading(false); }
  };

  const exportToExcel = () => {
    if (!history || !history.dates || !history.records) return;

    // 1. Prepare Headers: Student Info + All Dates
    const headers = ['Student Name', 'Email', ...history.dates];

    // 2. Group records by student
    const studentMap = {};
    history.records.forEach(r => {
      if (!studentMap[r.student_id]) {
        studentMap[r.student_id] = {
          'Student Name': r.student_name,
          'Email': r.student_email
        };
        // Initialize all dates as N/A or empty
        history.dates.forEach(d => studentMap[r.student_id][d] = '-');
      }
      studentMap[r.student_id][r.date] = r.status.toUpperCase().charAt(0); // P, A, or L
    });

    // 3. Convert map to array for XLSX
    const data = Object.values(studentMap);

    // 4. Create Workbook
    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");

    // 5. Download
    const fileName = `Attendance_${selectedClassId}_${selectedCourseId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast('Excel sheet downloaded!', 'success');
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
      students: students.map(s => ({
        student_id: s.id,
        status: attendanceRecords[s.id] || 'present'
      }))
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
                    </td>
                    <td style={S.td}>{student.email}</td>
                    <td style={S.td}>
                      <span style={{
                        ...S.statusBadge,
                        backgroundColor: 
                          attendanceRecords[student.id] === 'present' ? '#ecfdf5' : 
                          attendanceRecords[student.id] === 'absent' ? '#fef2f2' : '#fff7ed',
                        color: 
                          attendanceRecords[student.id] === 'present' ? '#10b981' : 
                          attendanceRecords[student.id] === 'absent' ? '#ef4444' : '#f97316',
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
                          onClick={() => handleStatusChange(student.id, 'late')}
                          style={{ 
                            padding: '6px', borderRadius: '6px', border: 'none',
                            background: attendanceRecords[student.id] === 'late' ? '#f97316' : '#f1f5f9',
                            color: attendanceRecords[student.id] === 'late' ? 'white' : '#64748b',
                            cursor: 'pointer'
                          }}
                          title="Late"
                        >
                          <Clock size={18} />
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

  const renderSheetView = () => (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ ...S.card, padding: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={S.cardTitle}>Attendance Master Sheet</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Showing all records for {classCourses.find(c => c.id == selectedCourseId)?.title}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={exportToExcel} style={{ ...S.secondaryBtn, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #10b981', color: '#10b981' }}>
              <DownloadSimple size={18} /> Download Excel
            </button>
            <button onClick={() => setViewMode('mark')} style={{ ...S.secondaryBtn, padding: '0.5rem 1rem' }}>
              Back to Marking
            </button>
          </div>
        </div>

        {history && history.dates.length > 0 ? (
          <div className="table-responsive" style={{ overflowX: 'auto', maxHeight: '600px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ ...S.table, borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ ...S.th, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 20, minWidth: '180px', borderRight: '2px solid #e2e8f0' }}>Student Name</th>
                  {history.dates.map(date => (
                    <th key={date} style={{ ...S.th, textAlign: 'center', minWidth: '100px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Prepare the grid data */}
                {(() => {
                  const studentData = {};
                  history.records.forEach(r => {
                    if (!studentData[r.student_id]) {
                      studentData[r.student_id] = { name: r.student_name, records: {} };
                    }
                    studentData[r.student_id].records[r.date] = r.status;
                  });

                  return Object.entries(studentData).map(([sId, data]) => (
                    <tr key={sId} style={S.tr}>
                      <td style={{ ...S.td, fontWeight: 600, position: 'sticky', left: 0, background: 'white', zIndex: 5, borderRight: '2px solid #e2e8f0' }}>
                        {data.name}
                      </td>
                      {history.dates.map(date => {
                        const status = data.records[date];
                        return (
                          <td key={date} style={{ ...S.td, textAlign: 'center' }}>
                            {status ? (
                              <span style={{
                                display: 'inline-block',
                                width: '24px',
                                height: '24px',
                                lineHeight: '24px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                color: status === 'present' ? '#10b981' : status === 'absent' ? '#ef4444' : '#f97316',
                                background: status === 'present' ? '#ecfdf5' : status === 'absent' ? '#fef2f2' : '#fff7ed',
                              }}>
                                {status.toUpperCase().charAt(0)}
                              </span>
                            ) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>No attendance history found for this course</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header Selectors */}
      <div style={{ ...S.card, padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
        <div>
          <label style={{ ...S.label, display: 'block', marginBottom: '8px' }}>Select Class</label>
          <select 
            style={S.input}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">Choose Class...</option>
            {teacherClasses.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ ...S.label, display: 'block', marginBottom: '8px' }}>Select Course</label>
          <select 
            style={S.input}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={!selectedClassId}
          >
            <option value="">Choose Course...</option>
            {classCourses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ ...S.label, display: 'block', marginBottom: '8px' }}>Attendance Date</label>
          <input 
            type="date" 
            style={S.input} 
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchHistory}
            disabled={!selectedCourseId}
            style={{ ...S.secondaryBtn, flex: 1, padding: '10px' }}
          >
            History
          </button>
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
    </div>
  );
}
