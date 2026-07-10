import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { Presentation, Plus, Trash, Eye, X, Spinner, Clock } from '@phosphor-icons/react';

const RegistrarCourseSections = () => {
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [viewScheduleOpen, setViewScheduleOpen] = useState(false);

  // Selection
  const [selectedSection, setSelectedSection] = useState(null);
  const [schedules, setSchedules] = useState([]);

  // Form: Section
  const [courseId, setCourseId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [sectionLabel, setSectionLabel] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(30);
  const [status, setStatus] = useState('open');

  // Form: Schedule slot
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [scheduleRoomId, setScheduleRoomId] = useState('');
  const [scheduleType, setScheduleType] = useState('lecture');

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [sectionsRes, coursesRes, semestersRes, roomsRes, teachersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/course-sections`, { headers }),
        axios.get(`${API_BASE_URL}/api/degree-plans/courses`, { headers }),
        axios.get(`${API_BASE_URL}/api/semesters`, { headers }),
        axios.get(`${API_BASE_URL}/api/rooms`, { headers }),
        axios.get(`${API_BASE_URL}/api/course-sections/teachers`, { headers })
      ]);

      if (sectionsRes.data.success) setSections(sectionsRes.data.courseSections);
      if (coursesRes.data.success) setCourses(coursesRes.data.courses);
      if (semestersRes.data.success) setSemesters(semestersRes.data.semesters);
      if (roomsRes.data.success) setRooms(roomsRes.data.rooms);
      if (teachersRes.data.success) setTeachers(teachersRes.data.teachers);
    } catch (error) {
      console.error('Error fetching sections metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openSectionModal = () => {
    setCourseId('');
    setSemesterId('');
    setSectionLabel('');
    setTeacherId('');
    setRoomId('');
    setMaxCapacity(30);
    setStatus('open');
    setSectionModalOpen(true);
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        course_id: courseId,
        semester_id: semesterId,
        section_label: sectionLabel,
        teacher_id: teacherId || null,
        room_id: roomId || null,
        max_capacity: parseInt(maxCapacity),
        status
      };

      await axios.post(`${API_BASE_URL}/api/course-sections`, payload, { headers });
      setSectionModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating section');
    }
  };

  const handleViewSchedule = async (section) => {
    setSelectedSection(section);
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/course-sections/${section.id}/schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSchedules(res.data.schedules);
        setViewScheduleOpen(true);
      }
    } catch (error) {
      alert('Error fetching schedules');
    }
  };

  const openAddScheduleModal = () => {
    setDayOfWeek('Monday');
    setStartTime('09:00');
    setEndTime('10:30');
    setScheduleRoomId(selectedSection.room_id || '');
    setScheduleType('lecture');
    setScheduleModalOpen(true);
  };

  const handleAddScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        day_of_week: dayOfWeek,
        start_time: startTime + ':00',
        end_time: endTime + ':00',
        room_id: scheduleRoomId || null,
        schedule_type: scheduleType
      };

      await axios.post(`${API_BASE_URL}/api/course-sections/${selectedSection.id}/schedules`, payload, { headers });
      setScheduleModalOpen(false);
      handleViewSchedule(selectedSection);
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding schedule slot');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Delete this class schedule slot?')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/course-sections/${selectedSection.id}/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      handleViewSchedule(selectedSection);
    } catch (error) {
      alert('Error deleting schedule slot');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Delete this course section? This will delete all its schedule slots.')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/course-sections/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error deleting course section');
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '80vh', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Presentation size={28} weight="duotone" color="var(--reg-primary, var(--primary-color, #4f46e5))" />
            Course Sections & Timetable Slots
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Offer course sections, assign instructors/classrooms, and build timetable schedules.</p>
        </div>

        <button onClick={openSectionModal} className="action-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
          <Plus size={20} weight="bold" />
          Add Section
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px' }}><Spinner size={40} className="spinner" /></div>
      ) : sections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <Presentation size={60} weight="thin" color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569' }}>No course sections created yet</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 20px 0' }}>Offer course sections for the upcoming semesters.</p>
          <button onClick={openSectionModal} className="action-btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Create Section</button>
        </div>
      ) : (
        <div className="table-responsive" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Semester</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Course</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Section</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Instructor</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Room</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Enrolled / Max</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec) => (
                <tr key={sec.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', fontWeight: '600' }}>{sec.semester_name}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    {sec.course_title} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>({sec.course_code})</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0f172a', fontWeight: '800' }}>Sec {sec.section_label}</td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>{sec.teacher_name || 'Unassigned'}</td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569' }}>
                    {sec.room_number ? `${sec.room_number} (${sec.building})` : 'Unassigned'}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#4f46e5' }}>
                    {sec.current_enrolled} / {sec.max_capacity}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleViewSchedule(sec)} className="edit-btn" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontSize: '12px', fontWeight: 700 }} title="Schedules">
                        <Clock size={16} />
                        Schedule
                      </button>
                      <button onClick={() => handleDeleteSection(sec.id)} className="delete-btn" style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE SECTION MODAL */}
      {sectionModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add Course Section</h3>
              <button onClick={() => setSectionModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Semester *</label>
                  <select value={semesterId} onChange={(e) => setSemesterId(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="">Select term...</option>
                    {semesters.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Section Label *</label>
                  <input type="text" value={sectionLabel} onChange={(e) => setSectionLabel(e.target.value)} required placeholder="e.g. A, B, C" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Course *</label>
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                  <option value="">Select offered course...</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Primary Instructor</label>
                  <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="">Select teacher...</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Default Classroom</label>
                  <select value={roomId} onChange={(e) => setRoomId(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="">Select room...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.building} - {r.room_number} (Cap: {r.capacity})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Max Capacity *</label>
                  <input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} required min={5} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Status *</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="open">Open (Enrolling)</option>
                    <option value="full">Full</option>
                    <option value="waitlist">Waitlist</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setSectionModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: 'white', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', border: 'none', cursor: 'pointer' }}>Save Section</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SECTION SCHEDULES MODAL */}
      {viewScheduleOpen && selectedSection && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Timetable Slots: Sec {selectedSection.section_label}</h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{selectedSection.course_title} ({selectedSection.course_code}) - {selectedSection.semester_name}</span>
              </div>
              <button onClick={() => setViewScheduleOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button onClick={openAddScheduleModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                <Plus size={16} weight="bold" />
                Add Schedule Slot
              </button>
            </div>

            {schedules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                <Clock size={40} weight="thin" color="#94a3b8" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', color: '#64748b' }}>No schedule slots added yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {schedules.map(slot => (
                  <div key={slot.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', width: '90px' }}>{slot.day_of_week}</span>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                      </span>
                      <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {slot.room_number ? `${slot.room_number} (${slot.building})` : 'No room'}
                      </span>
                      <span style={{ fontSize: '11px', textTransform: 'capitalize', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {slot.schedule_type}
                      </span>
                    </div>

                    <button onClick={() => handleDeleteSchedule(slot.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Add Schedule Slot</h3>
              <button onClick={() => setScheduleModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleAddScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Day of Week *</label>
                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Start Time *</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>End Time *</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Classroom</label>
                  <select value={scheduleRoomId} onChange={(e) => setScheduleRoomId(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="">Select room...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.building} - {r.room_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Schedule Type *</label>
                  <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab Class</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setScheduleModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: 'white', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', border: 'none', cursor: 'pointer' }}>Save Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarCourseSections;
