import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, PencilSimple, Trash, Briefcase, CalendarBlank } from '@phosphor-icons/react';
import { S } from './SAStyles';

export default function SATrainings() {
  const [trainings, setTrainings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    instructor: '',
    start_date: '',
    end_date: '',
    image_url: '',
    status: 'upcoming'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5000/api/trainings', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching trainings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (training = null) => {
    if (training) {
      setFormData({
        ...training,
        start_date: training.start_date ? training.start_date.split('T')[0] : '',
        end_date: training.end_date ? training.end_date.split('T')[0] : ''
      });
    } else {
      setFormData({ id: null, title: '', description: '', instructor: '', start_date: '', end_date: '', image_url: '', status: 'upcoming' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = formData.id 
        ? `http://localhost:5000/api/trainings/${formData.id}` 
        : 'http://localhost:5000/api/trainings';
      const method = formData.id ? 'put' : 'post';
      
      const res = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}` }
      });

      if (res.data.success) {
        setIsModalOpen(false);
        fetchTrainings();
      }
    } catch (err) {
      console.error(err);
      alert('Error saving training');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      try {
        await axios.delete(`http://localhost:5000/api/trainings/${id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}` }
        });
        fetchTrainings();
      } catch (err) {
        console.error(err);
        alert('Error deleting training');
      }
    }
  };

  return (
    <div style={S.overviewContainer}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Manage Trainings</h1>
          <p style={S.subtitle}>Add, edit, and organize institutional training programs</p>
        </div>
        <button style={S.addBtn} onClick={() => handleOpenModal()}>
          <Plus size={20} weight="bold" /> Add Training
        </button>
      </div>

      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <h2 style={S.tableTitle}>All Trainings</h2>
          <div style={S.tableBadge}>{trainings.length} Total</div>
        </div>
        <div style={S.tableContainer}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading trainings...</div>
          ) : trainings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No trainings found. Click "Add Training" to create one.</div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>TRAINING TITLE</th>
                  <th style={S.th}>INSTRUCTOR</th>
                  <th style={S.th}>DATES</th>
                  <th style={S.th}>STATUS</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {trainings.map((t) => (
                  <tr key={t.id} style={S.tr}>
                    <td style={S.tdName}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={S.metricIconWrapper('var(--primary-color, #4f46e5)')}>
                          <Briefcase size={24} weight="duotone" />
                        </div>
                        <div>
                          <div>{t.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>
                            {t.description.length > 50 ? t.description.substring(0, 50) + '...' : t.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>{t.instructor || 'N/A'}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarBlank size={16} />
                        {t.start_date ? new Date(t.start_date).toLocaleDateString() : '-'} to {t.end_date ? new Date(t.end_date).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{
                        ...S.statusBadge,
                        background: t.status === 'ongoing' ? '#dcfce7' : t.status === 'upcoming' ? '#fef9c3' : '#f1f5f9',
                        color: t.status === 'ongoing' ? '#166534' : t.status === 'upcoming' ? '#854d0e' : '#475569'
                      }}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ ...S.td, textAlign: 'right' }}>
                      <div style={S.actionButtons}>
                        <button style={S.editBtn} onClick={() => handleOpenModal(t)}><PencilSimple size={20} weight="bold" /></button>
                        <button style={S.deleteBtn} onClick={() => handleDelete(t.id)}><Trash size={20} weight="bold" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <h2 style={S.modalTitle}>{formData.id ? 'Edit Training' : 'Add New Training'}</h2>
              <button style={S.modalClose} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Title</label>
                <input style={S.input} type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Advanced AI Bootcamp" />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Description</label>
                <textarea style={{...S.input, height: '100px', resize: 'vertical'}} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required placeholder="Detailed course description..." />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Instructor Name</label>
                <input style={S.input} type="text" value={formData.instructor} onChange={(e) => setFormData({...formData, instructor: e.target.value})} placeholder="e.g. Dr. John Doe" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>Start Date</label>
                  <input style={S.input} type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div style={S.inputGroup}>
                  <label style={S.inputLabel}>End Date</label>
                  <input style={S.input} type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Image URL</label>
                <input style={S.input} type="text" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} placeholder="https://example.com/image.jpg" />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Status</label>
                <select style={S.input} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div style={S.modalActions}>
                <button type="button" style={S.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" style={S.saveBtn}>{formData.id ? 'Update Training' : 'Save Training'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
