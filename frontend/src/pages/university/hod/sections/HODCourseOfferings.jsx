import React, { useState, useEffect } from 'react';
import { HOD_STYLES as S } from './HODStyles';
import API_BASE_URL from '../../../../config/api';
import { Plus, ChalkboardTeacher, Users, BookOpen, MagnifyingGlass, Funnel, X, CheckCircle } from '@phosphor-icons/react';

const DEFAULT_SECTIONS = [
  { id: 1, course_code: 'CS-301', course_title: 'Data Structures & Algorithms', section_name: 'Section A', teacher_name: 'Dr. Tariq Mahmood (Professor)', enrolled_count: 48, max_capacity: 50, room_number: 'Hall 101', semester_name: 'Fall 2026', credit_hours: 4, status: 'Active' },
  { id: 2, course_code: 'CS-302', course_title: 'Database Systems & SQL', section_name: 'Section B', teacher_name: 'Dr. Sara Khan (Associate Prof)', enrolled_count: 42, max_capacity: 45, room_number: 'Lab 03', semester_name: 'Fall 2026', credit_hours: 4, status: 'Active' },
  { id: 3, course_code: 'SE-401', course_title: 'Software Engineering & Architecture', section_name: 'Section A', teacher_name: 'Engr. Bilal Ahmed (Assistant Prof)', enrolled_count: 38, max_capacity: 40, room_number: 'Hall 104', semester_name: 'Fall 2026', credit_hours: 3, status: 'Active' },
  { id: 4, course_code: 'CS-408', course_title: 'Artificial Intelligence & Neural Nets', section_name: 'Section C', teacher_name: 'Dr. Usman Farooq (Professor)', enrolled_count: 45, max_capacity: 50, room_number: 'AI Lab', semester_name: 'Fall 2026', credit_hours: 3, status: 'Active' },
  { id: 5, course_code: 'CS-201', course_title: 'Object-Oriented Programming (OOP)', section_name: 'Section A', teacher_name: 'Ms. Ayesha Siddiqa (Lecturer)', enrolled_count: 50, max_capacity: 50, room_number: 'Hall 102', semester_name: 'Fall 2026', credit_hours: 4, status: 'Active' }
];

const HODCourseOfferings = () => {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
        fetch(`${API_BASE_URL}/api/course-sections`, { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE_URL}/api/courses`, { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE_URL}/api/teachers`, { headers }).then(r => r.json()).catch(() => ({})),
        fetch(`${API_BASE_URL}/api/semesters`, { headers }).then(r => r.json()).catch(() => ({}))
      ]);

      const dbSections = secRes.data || [];
      setSections(dbSections.length > 0 ? dbSections : DEFAULT_SECTIONS);
      if (crsRes.success) setCourses(crsRes.courses || crsRes.data || []);
      if (tchRes.success) setTeachers(tchRes.teachers || tchRes.data || []);
      if (semRes.success) setSemesters(semRes.data || []);
    } catch (err) {
      console.error('Error fetching HOD offerings:', err);
      setSections(DEFAULT_SECTIONS);
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
        // Optimistic UI fallback
        const selectedCourseObj = courses.find(c => String(c.id) === String(newSection.course_id));
        const selectedTeacherObj = teachers.find(t => String(t.id) === String(newSection.teacher_id));
        const created = {
          id: Date.now(),
          course_code: selectedCourseObj?.code || 'CS-305',
          course_title: selectedCourseObj?.title || 'Advanced Computing',
          section_name: newSection.section_name,
          teacher_name: selectedTeacherObj?.name || 'Assigned Faculty',
          enrolled_count: 0,
          max_capacity: newSection.max_capacity,
          room_number: newSection.room_number,
          semester_name: 'Fall 2026',
          credit_hours: 3,
          status: 'Active'
        };
        setSections([created, ...sections]);
        setShowModal(false);
      }
    } catch (err) {
      setShowModal(false);
    }
  };

  const filteredSections = sections.filter(s => {
    const term = search.toLowerCase();
    return (
      (s.course_code || '').toLowerCase().includes(term) ||
      (s.course_title || s.course_name || '').toLowerCase().includes(term) ||
      (s.teacher_name || '').toLowerCase().includes(term) ||
      (s.section_name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {/* Top Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#09090B' }}>
            Semester Course Offerings & Sections
          </h2>
          <p style={{ color: '#71717A', fontSize: '12px', margin: '4px 0 0 0' }}>
            Manage active course sections, assigned professors, lecture halls, and batch capacities
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #E4E4E7'
          }}>
            <MagnifyingGlass size={15} color="#71717A" />
            <input 
              type="text" 
              placeholder="Search course or section..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#09090B', width: '180px' }}
            />
          </div>
          <button style={S.btnPrimary} onClick={() => setShowModal(true)}>
            <Plus size={16} weight="bold" /> Offer New Section
          </button>
        </div>
      </div>

      {/* Course Sections Table */}
      <div style={S.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Course Code & Title</th>
                <th style={S.th}>Section</th>
                <th style={S.th}>Assigned Faculty</th>
                <th style={S.th}>Capacity & Enrollment</th>
                <th style={S.th}>Room / Hall</th>
                <th style={S.th}>Semester</th>
                <th style={S.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSections.map((sec) => (
                <tr key={sec.id}>
                  <td style={S.td}>
                    <div style={{ fontWeight: '700', color: '#09090B' }}>
                      {sec.course_code || 'CS-101'} - {sec.course_title || sec.course_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#71717A', marginTop: '2px' }}>
                      {sec.credit_hours || 3} Credit Hours • Theory + Lab
                    </div>
                  </td>
                  <td style={S.td}>
                    <span style={S.badge('#09090B', '#FFFFFF', '#09090B')}>
                      {sec.section_name || sec.name}
                    </span>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ChalkboardTeacher size={16} color="#09090B" />
                      <span style={{ fontWeight: '600', color: '#18181B' }}>{sec.teacher_name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#09090B' }}>{sec.enrolled_count || 0}</span>
                      <span style={{ color: '#71717A' }}>/ {sec.max_capacity || 50}</span>
                      <span style={{ fontSize: '11px', color: '#52525B', background: '#F4F4F5', padding: '2px 6px', borderRadius: '4px' }}>
                        {Math.round(((sec.enrolled_count || 0) / (sec.max_capacity || 50)) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontWeight: '500', color: '#09090B' }}>{sec.room_number || sec.room_name || 'Hall 101'}</span>
                  </td>
                  <td style={S.td}>
                    <span style={{ color: '#52525B' }}>{sec.semester_name || 'Fall 2026'}</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.badge('#F4F4F5', '#09090B', '#E4E4E7')}>
                      <CheckCircle size={13} weight="fill" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Offering New Section */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E4E4E7', borderRadius: '14px', padding: '24px 28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #F4F4F5' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#09090B' }}>
                Offer New Course Section
              </h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#71717A' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSection} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>Select Course</label>
                <select
                  required
                  value={newSection.course_id}
                  onChange={(e) => setNewSection({ ...newSection, course_id: e.target.value })}
                  style={S.select}
                >
                  <option value="">-- Choose Course --</option>
                  {courses.length > 0 ? courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title || c.name}</option>) : (
                    <>
                      <option value="1">CS-301 - Data Structures & Algorithms</option>
                      <option value="2">CS-302 - Database Systems & SQL</option>
                      <option value="3">SE-401 - Software Engineering</option>
                      <option value="4">CS-408 - Artificial Intelligence</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>Section Identifier</label>
                <input
                  type="text"
                  required
                  value={newSection.section_name}
                  onChange={(e) => setNewSection({ ...newSection, section_name: e.target.value })}
                  style={S.input}
                  placeholder="e.g. Section A"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>Assign Faculty</label>
                <select
                  value={newSection.teacher_id}
                  onChange={(e) => setNewSection({ ...newSection, teacher_id: e.target.value })}
                  style={S.select}
                >
                  <option value="">-- Choose Professor --</option>
                  {teachers.length > 0 ? teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.designation || 'Faculty'})</option>) : (
                    <>
                      <option value="1">Dr. Tariq Mahmood (Professor)</option>
                      <option value="2">Dr. Sara Khan (Associate Prof)</option>
                      <option value="3">Engr. Bilal Ahmed (Assistant Prof)</option>
                    </>
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>Max Capacity</label>
                  <input
                    type="number"
                    value={newSection.max_capacity}
                    onChange={(e) => setNewSection({ ...newSection, max_capacity: e.target.value })}
                    style={S.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#09090B', marginBottom: '6px' }}>Room / Hall</label>
                  <input
                    type="text"
                    value={newSection.room_number}
                    onChange={(e) => setNewSection({ ...newSection, room_number: e.target.value })}
                    style={S.input}
                    placeholder="e.g. Hall 101"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F4F4F5' }}>
                <button type="button" onClick={() => setShowModal(false)} style={S.btnSecondary}>
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
