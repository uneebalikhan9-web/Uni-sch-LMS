import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { Calendar, Plus, PencilSimple, Trash, Check, X, Spinner } from '@phosphor-icons/react';

const RegistrarSemesters = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [termType, setTermType] = useState('Fall');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regOpen, setRegOpen] = useState('');
  const [regClose, setRegClose] = useState('');
  const [addDrop, setAddDrop] = useState('');
  const [withdrawal, setWithdrawal] = useState('');
  const [midStart, setMidStart] = useState('');
  const [midEnd, setMidEnd] = useState('');
  const [finalStart, setFinalStart] = useState('');
  const [finalEnd, setFinalEnd] = useState('');
  const [resPublish, setResPublish] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [isSummer, setIsSummer] = useState(false);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/semesters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSemesters(res.data.semesters);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const openAddModal = () => {
    setEditingSemester(null);
    setName('');
    setTermType('Fall');
    setStartDate('');
    setEndDate('');
    setRegOpen('');
    setRegClose('');
    setAddDrop('');
    setWithdrawal('');
    setMidStart('');
    setMidEnd('');
    setFinalStart('');
    setFinalEnd('');
    setResPublish('');
    setStatus('upcoming');
    setIsSummer(false);
    setModalOpen(true);
  };

  const openEditModal = (sem) => {
    const formatDate = (d) => d ? d.substring(0, 10) : '';
    const formatDateTime = (dt) => dt ? dt.substring(0, 16) : '';
    
    setEditingSemester(sem);
    setName(sem.name);
    setTermType(sem.term_type);
    setStartDate(formatDate(sem.start_date));
    setEndDate(formatDate(sem.end_date));
    setRegOpen(formatDateTime(sem.registration_open));
    setRegClose(formatDateTime(sem.registration_close));
    setAddDrop(formatDateTime(sem.add_drop_deadline));
    setWithdrawal(formatDateTime(sem.withdrawal_deadline));
    setMidStart(formatDate(sem.midterm_start));
    setMidEnd(formatDate(sem.midterm_end));
    setFinalStart(formatDate(sem.final_start));
    setFinalEnd(formatDate(sem.final_end));
    setResPublish(formatDate(sem.result_publish_date));
    setStatus(sem.status);
    setIsSummer(sem.is_summer === 1);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        name,
        term_type: termType,
        start_date: startDate,
        end_date: endDate,
        registration_open: regOpen,
        registration_close: regClose,
        add_drop_deadline: addDrop,
        withdrawal_deadline: withdrawal,
        midterm_start: midStart,
        midterm_end: midEnd,
        final_start: finalStart,
        final_end: finalEnd,
        result_publish_date: resPublish,
        status,
        is_summer: isSummer
      };

      if (editingSemester) {
        await axios.put(`${API_BASE_URL}/api/semesters/${editingSemester.id}`, payload, { headers });
      } else {
        await axios.post(`${API_BASE_URL}/api/semesters`, payload, { headers });
      }
      setModalOpen(false);
      fetchSemesters();
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this semester? This action cannot be undone.')) return;
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/semesters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSemesters();
    } catch (error) {
      alert('Error deleting semester');
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'active': return <span className="status-badge status-success">Active</span>;
      case 'completed': return <span className="status-badge status-info">Completed</span>;
      case 'frozen': return <span className="status-badge status-warning">Frozen</span>;
      default: return <span className="status-badge status-danger">Upcoming</span>;
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '80vh', borderRadius: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={28} weight="duotone" color="var(--reg-primary, var(--primary-color, #4f46e5))" />
            Academic Calendar & Semesters
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Configure semesters, registration windows, and exam dates.</p>
        </div>
        
        <button onClick={openAddModal} className="action-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
          <Plus size={20} weight="bold" />
          Add Semester
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px' }}><Spinner size={40} className="spinner" /></div>
      ) : semesters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <Calendar size={60} weight="thin" color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569' }}>No semesters created yet</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 20px 0' }}>Get started by creating your first academic semester.</p>
          <button onClick={openAddModal} className="action-btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Create Semester</button>
        </div>
      ) : (
        <div className="table-responsive" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Semester Name</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Term Type</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Start & End Dates</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Reg. Window</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((sem) => (
                <tr key={sem.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{sem.name}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#475569', fontWeight: '600' }}>
                    {sem.term_type} {sem.is_summer === 1 && <span style={{ fontSize: '11px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Summer</span>}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>
                    {sem.start_date ? new Date(sem.start_date).toLocaleDateString() : 'N/A'} - {sem.end_date ? new Date(sem.end_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>
                    {sem.registration_open ? new Date(sem.registration_open).toLocaleDateString() : 'N/A'} - {sem.registration_close ? new Date(sem.registration_close).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>{getStatusBadge(sem.status)}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openEditModal(sem)} className="edit-btn" style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#475569' }} title="Edit"><PencilSimple size={18} /></button>
                      <button onClick={() => handleDelete(sem.id)} className="delete-btn" style={{ background: '#fef2f2', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="Delete"><Trash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SEMESTER CREATION/EDITION MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{editingSemester ? 'Edit Academic Semester' : 'Add New Semester'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Semester Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Fall 2026" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Term Type *</label>
                  <select value={termType} onChange={(e) => setTermType(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Registration Open</label>
                  <input type="datetime-local" value={regOpen} onChange={(e) => setRegOpen(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Registration Close</label>
                  <input type="datetime-local" value={regClose} onChange={(e) => setRegClose(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Add/Drop Deadline</label>
                  <input type="datetime-local" value={addDrop} onChange={(e) => setAddDrop(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Withdrawal Deadline</label>
                  <input type="datetime-local" value={withdrawal} onChange={(e) => setWithdrawal(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Midterm Start</label>
                  <input type="date" value={midStart} onChange={(e) => setMidStart(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Midterm End</label>
                  <input type="date" value={midEnd} onChange={(e) => setMidEnd(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Final Exams Start</label>
                  <input type="date" value={finalStart} onChange={(e) => setFinalStart(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Final Exams End</label>
                  <input type="date" value={finalEnd} onChange={(e) => setFinalEnd(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Result Publish Date</label>
                  <input type="date" value={resPublish} onChange={(e) => setResPublish(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}>
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="frozen">Frozen</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <input type="checkbox" id="isSummer" checked={isSummer} onChange={(e) => setIsSummer(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                <label htmlFor="isSummer" style={{ fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Is Summer Semester?</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: '#64748b', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '700', color: 'white', background: 'var(--reg-primary, var(--primary-color, #4f46e5))', border: 'none', cursor: 'pointer' }}>Save Semester</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarSemesters;
