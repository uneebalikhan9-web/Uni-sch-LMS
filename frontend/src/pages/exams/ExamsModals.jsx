import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Book, Users, Trash, FileText, CheckCircle } from '@phosphor-icons/react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export const ScheduleExamModal = ({ onClose, onSave }) => {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        course_id: '',
        name: '',
        exam_date: '',
        max_marks: 100,
        room_number: ''
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/courses`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (res.data.success) setCourses(res.data.courses);
            } catch (err) { console.error(err); }
        };
        fetchCourses();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="ex-modal-overlay">
            <div className="ex-modal">
                <div className="ex-modal-header">
                    <h2><Plus size={24} weight="bold" color="var(--primary-color, #4f46e5)" /> Schedule New Exam</h2>
                    <button className="ex-modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="ex-modal-body">
                    <div className="ex-form-group">
                        <label>Select Course</label>
                        <select 
                            required
                            value={formData.course_id} 
                            onChange={e => setFormData({...formData, course_id: e.target.value})}
                        >
                            <option value="">Select a Course...</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="ex-form-group">
                        <label>Exam Name (e.g. Final Term Spring 2026)</label>
                        <input 
                            required
                            type="text" 
                            value={formData.name} 
                            placeholder="e.g. Midterm Examination"
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="ex-form-group">
                            <label>Exam Date</label>
                            <input 
                                required
                                type="date" 
                                value={formData.exam_date} 
                                onChange={e => setFormData({...formData, exam_date: e.target.value})}
                            />
                        </div>
                        <div className="ex-form-group">
                            <label>Max Marks</label>
                            <input 
                                type="number" 
                                value={formData.max_marks} 
                                onChange={e => setFormData({...formData, max_marks: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="ex-form-group">
                        <label>Room Number / Location</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Room 302"
                            value={formData.room_number} 
                            onChange={e => setFormData({...formData, room_number: e.target.value})}
                        />
                    </div>
                    <div className="ex-modal-footer">
                        <button type="button" className="ex-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="ex-btn-primary">Create Schedule</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ProcessResultsModal = ({ exam, onClose, onSave }) => {
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState({}); // { student_id: marks }

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Fetch students enrolled in this course
                const res = await axios.get(`${API_BASE_URL}/api/classes`, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                });
                if (res.data.success) {
                    const allRes = await axios.get(`${API_BASE_URL}/api/users`, {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                    });
                    setStudents(allRes.data.users.filter(u => u.role === 'student').slice(0, 5)); // Just 5 for demo
                }
            } catch (err) { console.error(err); }
        };
        fetchStudents();
    }, [exam]);

    const handleSave = () => {
        const payload = Object.entries(results).map(([studentId, marks]) => ({
            student_id: studentId,
            marks_obtained: marks,
            remarks: 'Processed by Exam Controller'
        }));
        onSave(payload);
    };

    return (
        <div className="ex-modal-overlay">
            <div className="ex-modal" style={{ maxWidth: '600px' }}>
                <div className="ex-modal-header">
                    <h2><CheckCircle size={24} weight="bold" color="#10b981" /> Grading: {exam.name}</h2>
                    <button className="ex-modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="ex-modal-body">
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px', fontWeight: 500 }}>
                        Enter marks for students enrolled in this course. Maximum marks: {exam.max_marks || 100}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                        {students.map(s => (
                            <div key={s.id} className="ex-student-grading-row">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{s.email}</div>
                                </div>
                                <input 
                                    type="number" 
                                    placeholder="Marks"
                                    style={{ width: '100px', padding: '8px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontWeight: 600, textAlign: 'center', background: '#f8fafc' }}
                                    value={results[s.id] || ''}
                                    onChange={e => setResults({...results, [s.id]: e.target.value})}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="ex-modal-footer">
                    <button className="ex-btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="ex-btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }} onClick={handleSave}>Publish Results</button>
                </div>
            </div>
        </div>
    );
};

export const ReportIncidentModal = ({ onClose, onSave }) => {
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [formData, setFormData] = useState({
        student_id: '',
        exam_id: '',
        incident_description: '',
        severity: 'Medium',
        incident_date: new Date().toISOString().split('T')[0]
    });

    const [allStudents, setAllStudents] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const [usersRes, examsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_BASE_URL}/api/exams/list`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                
                if (usersRes.data.success) {
                    const studentUsers = usersRes.data.users.filter(u => u.role === 'student');
                    setAllStudents(studentUsers);
                    setStudents(studentUsers); // Initially show all
                }
                if (examsRes.data.success) {
                    setExams(examsRes.data.exams);
                }
            } catch (err) {
                console.error('Error fetching data for incident modal:', err);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchExamStudents = async () => {
            if (!formData.exam_id) {
                setStudents(allStudents);
                return;
            }
            try {
                const token = sessionStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/api/exams/${formData.exam_id}/students`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                if (res.data.success) {
                    setStudents(res.data.students);
                }
            } catch (err) {
                console.error('Error fetching students for exam:', err);
            }
        };
        fetchExamStudents();
        // Also reset selected student if they are no longer in the list
        setFormData(prev => ({...prev, student_id: ''}));
    }, [formData.exam_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/exams/malpractice`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                onSave();
            }
        } catch (err) {
            console.error('Error saving incident:', err);
            alert('Failed to save incident record');
        }
    };

    return (
        <div className="ex-modal-overlay">
            <div className="ex-modal">
                <div className="ex-modal-header">
                    <h2><Plus size={24} weight="bold" color="#ef4444" /> Report Malpractice Incident</h2>
                    <button className="ex-modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="ex-modal-body">
                    <div className="ex-form-group">
                        <label>Select Exam (Optional)</label>
                        <select 
                            value={formData.exam_id} 
                            onChange={e => setFormData({...formData, exam_id: e.target.value})}
                        >
                            <option value="">General / None</option>
                            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.course_name} - {ex.name}</option>)}
                        </select>
                    </div>
                    <div className="ex-form-group">
                        <label>Select Student</label>
                        <select 
                            required
                            value={formData.student_id} 
                            onChange={e => setFormData({...formData, student_id: e.target.value})}
                        >
                            <option value="">Select a Student...</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number || s.email})</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="ex-form-group">
                            <label>Incident Date</label>
                            <input 
                                required
                                type="date" 
                                value={formData.incident_date} 
                                onChange={e => setFormData({...formData, incident_date: e.target.value})}
                            />
                        </div>
                        <div className="ex-form-group">
                            <label>Severity Level</label>
                            <select 
                                value={formData.severity} 
                                onChange={e => setFormData({...formData, severity: e.target.value})}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="ex-form-group">
                        <label>Incident Description</label>
                        <textarea 
                            required
                            rows="4"
                            placeholder="Describe what happened..."
                            value={formData.incident_description} 
                            onChange={e => setFormData({...formData, incident_description: e.target.value})}
                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div className="ex-modal-footer">
                        <button type="button" className="ex-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="ex-btn-primary" style={{ background: '#ef4444' }}>Submit Report</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
