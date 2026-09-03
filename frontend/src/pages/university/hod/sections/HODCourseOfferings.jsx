import React, { useState, useEffect } from 'react';
import { HOD_STYLES as S } from './HODStyles';
import API_BASE_URL from '../../../../config/api';
import { Plus, ChalkboardTeacher, Users, BookOpen, Clock } from '@phosphor-icons/react';

const HODCourseOfferings = () => {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSection, setNewSection] = useState({
    course_id: '',
    semester_id: '',
    section_name: 'Section A',
    teacher_id: '',
    max_capacity: 50,
    room_number: 'Hall 101'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [secRes, crsRes, tchRes, semRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/course-sections`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/courses`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/teachers`, { headers }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/semesters`, { headers }).then(r => r.json()),
      ]);

      if (secRes.success) setSections(secRes.data || []);
      if (crsRes.success) setCourses(crsRes.courses || crsRes.data || []);
      if (tchRes.success) setTeachers(tchRes.teachers || tchRes.data || []);
      if (semRes.success) setSemesters(semRes.data || []);
    } catch (err) {
      console.error('Error fetching HOD offerings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/course-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSection)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(data.message || 'Failed to create section');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Semester Course Offerings & Sections</h2>
          <p style={{ color: '#94A3B8', fontSize: '13px', margin: '4px 0 0 0' }}>Manage active course sections, assigned professors, and batch capacities</p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={18} weight="bold" /> Offer New Section
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading course offerings...</p>
      ) : (
        <div style={S.card}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Course Code & Title</th>
                <th style={S.th}>Section</th>
                <th style={S.th}>Assigned Faculty</th>
                <th style={S.th}>Capacity</th>
                <th style={S.th}>Room</th>
                <th style={S.th}>Semester</th>
                <th style={S.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sections.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ ...S.td, textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    No active course sections found for this term.
                  </td>
                </tr>
              ) : (
                sections.map((sec) => (
                  <tr key={sec.id}>
                    <td style={S.td}>
                      <div style={{ fontWeight: '600', color: '#FFFFFF' }}>{sec.course_code || 'CS-101'} - {sec.course_title || sec.course_name}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>{sec.credit_hours || 3} Credit Hours</div>
                    </td>
                    <td style={S.td}><span style={S.badge('#1E293B', '#38BDF8')}>{sec.section_name || sec.name}</span></td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChalkboardTeacher size={18} color="#94A3B8" />
                        <span>{sec.teacher_name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontWeight: '600' }}>{sec.enrolled_count || 0}</span> / {sec.max_capacity || 50}
                    </td>
                    <td style={S.td}>{sec.room_number || sec.room_name || 'Hall A'}</td>
                    <td style={S.td}>{sec.semester_name || 'Fall 2026'}</td>
                    <td style={S.td}>
                      <span style={S.badge('rgba(16, 185, 129, 0.15)', '#34D399')}>Active</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Offer New Course Section</h3>
            <form onSubmit={handleCreateSection} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Select Course</label>
                <select
                  required
                  value={newSection.course_id}
                  onChange={(e) => setNewSection({ ...newSection, course_id: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title || c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Section Name</label>
                <input
                  type="text"
                  required
                  value={newSection.section_name}
                  onChange={(e) => setNewSection({ ...newSection, section_name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Assign Faculty</label>
                <select
                  value={newSection.teacher_id}
                  onChange={(e) => setNewSection({ ...newSection, teacher_id: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.designation || 'Faculty'})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Max Capacity</label>
                  <input
                    type="number"
                    value={newSection.max_capacity}
                    onChange={(e) => setNewSection({ ...newSection, max_capacity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Room / Hall</label>
                  <input
                    type="text"
                    value={newSection.room_number}
                    onChange={(e) => setNewSection({ ...newSection, room_number: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1F2937', color: '#fff', border: '1px solid #374151' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#374151', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={S.btnPrimary}>
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODCourseOfferings;
