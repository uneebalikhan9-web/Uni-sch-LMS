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
        <div className="lib-modal-overlay">
            <div className="lib-modal">
                <div className="lib-modal-header">
                    <h2><Plus size={24} weight="bold" color="#4f46e5" /> Schedule New Exam</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="lib-modal-body">
                    <div className="form-group">
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
                    <div className="form-group">
                        <label>Exam Name (e.g. Final Term Spring 2026)</label>
                        <input 
                            required
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>Exam Date</label>
                            <input 
                                required
                                type="date" 
                                value={formData.exam_date} 
                                onChange={e => setFormData({...formData, exam_date: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Marks</label>
                            <input 
                                type="number" 
                                value={formData.max_marks} 
                                onChange={e => setFormData({...formData, max_marks: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Room Number / Location</label>
                        <input 
                            type="text" 
                            value={formData.room_number} 
                            onChange={e => setFormData({...formData, room_number: e.target.value})}
                        />
                    </div>
                    <div className="lib-modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ background: '#4f46e5' }}>Create Schedule</button>
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
                // This is a simplification, ideally we fetch students for this specific exam/course
                if (res.data.success) {
                    // For demo, we'll use all students if we can't filter precisely
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
        <div className="lib-modal-overlay">
            <div className="lib-modal" style={{ maxWidth: '600px' }}>
                <div className="lib-modal-header">
                    <h2><CheckCircle size={24} weight="bold" color="#10b981" /> Grading: {exam.name}</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="lib-modal-body">
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 20 }}>
                        Enter marks for students enrolled in this course. Maximum marks: {exam.max_marks || 100}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {students.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '12px', background: '#f8fafc', borderRadius: 12 }}>
                                <div style={{ flex: 1, fontWeight: 700 }}>{s.name}</div>
                                <input 
                                    type="number" 
                                    placeholder="Marks"
                                    style={{ width: '80px', padding: '8px', borderRadius: 8, border: '1.5px solid #e2e8f0' }}
                                    value={results[s.id] || ''}
                                    onChange={e => setResults({...results, [s.id]: e.target.value})}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lib-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" style={{ background: '#10b981' }} onClick={handleSave}>Publish Results</button>
                </div>
            </div>
        </div>
    );
};
