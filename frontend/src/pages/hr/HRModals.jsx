import React, { useState, useEffect } from 'react';
import { X, UserPlus, Megaphone, Briefcase } from "@phosphor-icons/react";

const HRModals = ({ show, onClose, type, editingItem, onAction }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (editingItem) setFormData(editingItem);
    else setFormData({});
  }, [editingItem, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'employee') {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/employees/${editingItem.id}` : '/employees';
      onAction(method, url, formData);
    } else if (type === 'job') {
      onAction('POST', '/jobs', formData);
    }
    onClose();
  };

  return (
    <div className="hr-modal-overlay">
      <div className="hr-form-modal hr-animate">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 className="hr-form-title">
            {type === 'employee' ? (editingItem ? 'Edit Employee' : 'Add New Employee') : 'Post New Vacancy'}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--hr-text-muted)' }}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {type === 'employee' ? (
            <div className="hr-form-grid">
              <div className="hr-form-field full">
                <label className="hr-metric-label">Full Name</label>
                <input 
                  className="hr-form-input" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              {!editingItem && (
                <div className="hr-form-field full">
                  <label className="hr-metric-label">Email Address</label>
                  <input 
                    className="hr-form-input" 
                    type="email"
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="john@lancerstech.com"
                    required
                  />
                </div>
              )}
              <div className="hr-form-field">
                <label className="hr-metric-label">Department</label>
                <select 
                  className="hr-form-select"
                  value={formData.dept_id || ''} 
                  onChange={e => setFormData({...formData, dept_id: e.target.value})}
                  required
                >
                  <option value="">Select Dept</option>
                  <option value="1">Computer Science</option>
                  <option value="2">Administration</option>
                  <option value="3">Finance</option>
                  <option value="4">HR</option>
                </select>
              </div>
              <div className="hr-form-field">
                <label className="hr-metric-label">Designation</label>
                <input 
                  className="hr-form-input" 
                  value={formData.designation || ''} 
                  onChange={e => setFormData({...formData, designation: e.target.value})}
                  placeholder="e.g. Professor"
                  required
                />
              </div>
              <div className="hr-form-field">
                <label className="hr-metric-label">Role (System)</label>
                <select 
                  className="hr-form-select"
                  value={formData.role || 'teacher'} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="teacher">Teacher</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="finance_manager">Finance Manager</option>
                  <option value="principal">Principal/HOD</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="hr-form-grid">
              <div className="hr-form-field full">
                <label className="hr-metric-label">Job Title</label>
                <input 
                  className="hr-form-input" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Senior Lecturer"
                  required
                />
              </div>
              <div className="hr-form-field full">
                <label className="hr-metric-label">Department</label>
                <input 
                  className="hr-form-input" 
                  value={formData.department || ''} 
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g. IT Department"
                  required
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button type="button" onClick={onClose} className="hr-modal-cancel">Cancel</button>
            <button type="submit" className="hr-modal-confirm">
              {editingItem ? 'Save Changes' : (type === 'employee' ? 'Add Employee' : 'Post Vacancy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HRModals;
