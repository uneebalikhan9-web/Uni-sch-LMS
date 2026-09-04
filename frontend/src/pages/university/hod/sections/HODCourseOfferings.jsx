import React, { useState, useEffect } from 'react';
import { HOD_STYLES as S } from './HODStyles';
import API_BASE_URL from '../../../../config/api';
import { Plus, ChalkboardTeacher, Users, BookOpen, Clock, Building } from '@phosphor-icons/react';

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
        fetch(`${API_BASE_URL}/api/course-sections`, { headers }).then(r => r.json()).catch(() => ({ success: true, data: [] })),
        fetch(`${API_BASE_URL}/api/courses`, { headers }).then(r => r.json()).catch(() => ({ success: true, courses: [] })),
        fetch(`${API_BASE_URL}/api/teachers`, { headers }).then(r => r.json()).catch(() => ({ success: true, teachers: [] })),
        fetch(`${API_BASE_URL}/api/semesters`, { headers }).then(r => r.json()).catch(() => ({ success: true, data: [] })),
      ]);

      if (secRes?.success) setSections(secRes.data || []);
      if (crsRes?.success) setCourses(crsRes.courses || crsRes.data || []);
      if (tchRes?.success) setTeachers(tchRes.teachers || tchRes.data || []);
      if (semRes?.success) setSemesters(semRes.data || []);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Semester Course Offerings & Sections</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Manage active course sections, assigned professors, and batch capacities</p>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={18} weight="bold" /> Offer New Section
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#64748b', fontWeight: '500' }}>Loading course offerings...</p>
      ) : (
        <div style={S.card}>
          <div style={{ overflowX: 'auto' }}>
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
                    <td colSpan="7" style={{ ...S.td, textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No active course sections found for this term.
                    </td>
                  </tr>
                ) : (
                  sections.map((sec) => (
                    <tr key={sec.id} style={{ transition: 'background 0.2s' }}>
                      <td style={S.td}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{sec.course_code || 'CS-101'} - {sec.course_title || sec.course_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{sec.credit_hours || 3} Credit Hours</div>
                      </td>
                      <td style={S.td}><span style={S.badge('#eff6ff', '#2563eb')}>{sec.section_name || sec.name}</span></td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                          <ChalkboardTeacher size={18} color="#6366f1" />
                          <span style={{ fontWeight: '600' }}>{sec.teacher_name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{sec.enrolled_count || 0}</span> / {sec.max_capacity || 50}
                      </td>
                      <td style={S.td}><span style={{ color: '#475569' }}>{sec.room_number || sec.room_name || 'Hall A'}</span></td>
                      <td style={S.td}><span style={{ color: '#475569' }}>{sec.semester_name || 'Fall 2026'}</span></td>
                      <td style={S.td}>
                        <span style={S.badge('#dcfce7', '#16a34a')}>Active</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Offer New Course Section</h3>
            <form onSubmit={handleCreateSection} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Select Course</label>
                <select
                  required
                  value={newSection.course_id}
                  onChange={(e) => setNewSection({ ...newSection, course_id: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: '600', outline: 'none' }}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title || c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Section Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Section A / Lab-01"
                  value={newSection.section_name}
                  onChange={(e) => setNewSection({ ...newSection, section_name: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Assign Faculty</label>
                <select
                  value={newSection.teacher_id}
                  onChange={(e) => setNewSection({ ...newSection, teacher_id: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', fontWeight: '600', outline: 'none' }}
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.designation || 'Faculty'})</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Max Capacity</label>
                  <input
                    type="number"
                    value={newSection.max_capacity}
                    onChange={(e) => setNewSection({ ...newSection, max_capacity: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Room / Hall</label>
                  <input
                    type="text"
                    placeholder="e.g. Hall 101"
                    value={newSection.room_number}
                    onChange={(e) => setNewSection({ ...newSection, room_number: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 20px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
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
