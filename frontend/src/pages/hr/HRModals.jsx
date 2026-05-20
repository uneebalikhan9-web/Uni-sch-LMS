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

  const isEmployee = type === 'employee';

  return (
    <div className="hr-modal-overlay">
      <div className="hr-form-modal hr-animate" style={{
        background: '#ffffff',
        borderRadius: '28px',
        padding: '40px',
        width: '90%',
        maxWidth: '520px',
        boxShadow: '0 30px 70px -15px rgba(15, 23, 42, 0.3)',
        border: '1px solid rgba(15, 23, 42, 0.05)',
        position: 'relative',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(79, 70, 229, 0.1)',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.1)'
            }}>
              {isEmployee ? (
                <UserPlus size={22} weight="bold" />
              ) : (
                <Briefcase size={22} weight="bold" />
              )}
            </div>
            <div>
              <h2 className="hr-form-title" style={{ 
                fontSize: '1.4rem', 
                fontWeight: '800', 
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>
                {isEmployee ? (editingItem ? 'Edit Employee' : 'Add New Employee') : 'Post New Vacancy'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                {isEmployee ? 'Set up employee record and portal access.' : 'Publish a new career opportunity.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              border: 'none', 
              background: 'rgba(15, 23, 42, 0.05)', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer', 
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.05)'}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isEmployee ? (
            <div className="hr-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="hr-form-field">
                <label className="hr-metric-label" style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Full Name</label>
                <input 
                  className="hr-form-input" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '2px solid #e2e8f0',
                    background: '#f8fafc',
                    width: '100%',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>
              {!editingItem && (
                <div className="hr-form-field">
                  <label className="hr-metric-label" style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Email Address</label>
                  <input 
                    className="hr-form-input" 
                    type="email"
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="john@lancerstech.com"
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      border: '2px solid #e2e8f0',
                      background: '#f8fafc',
                      width: '100%',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    }}
                    required
                  />
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="hr-form-field">
                  <label className="hr-metric-label" style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Department</label>
                  <select 
                    className="hr-form-select"
                    value={formData.dept_id || ''} 
                    onChange={e => setFormData({...formData, dept_id: e.target.value})}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      border: '2px solid #e2e8f0',
                      background: '#f8fafc',
                      width: '100%',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
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
                  <label className="hr-metric-label" style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Designation</label>
                  <input 
                    className="hr-form-input" 
                    value={formData.designation || ''} 
                    onChange={e => setFormData({...formData, designation: e.target.value})}
                    placeholder="e.g. Professor"
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      border: '2px solid #e2e8f0',
                      background: '#f8fafc',
                      width: '100%',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      boxSizing: 'border-box',
                      transition: 'all 0.2s ease'
                    }}
                    required
                  />
                </div>
              </div>

              <div className="hr-form-field">
                <label className="hr-metric-label" style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Role (System)</label>
                <select 
                  className="hr-form-select"
                  value={formData.role || 'teacher'} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '2px solid #e2e8f0',
                    background: '#f8fafc',
                    width: '100%',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="teacher">Teacher</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="finance_manager">Finance Manager</option>
                  <option value="principal">Principal/HOD</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="hr-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="hr-form-field">
                <label className="hr-metric-label" style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Job Title</label>
                <input 
                  className="hr-form-input" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Senior Lecturer"
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '2px solid #e2e8f0',
                    background: '#f8fafc',
                    width: '100%',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>
              <div className="hr-form-field">
                <label className="hr-metric-label" style={{ fontSize: '0.72rem', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Department</label>
                <input 
                  className="hr-form-input" 
                  value={formData.department || ''} 
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  placeholder="e.g. IT Department"
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '2px solid #e2e8f0',
                    background: '#f8fafc',
                    width: '100%',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                flex: 1,
                padding: '14px 24px',
                border: '2px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                borderRadius: '16px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748b'; }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                flex: 2,
                padding: '14px 24px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px -8px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(79, 70, 229, 0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(79, 70, 229, 0.4)'; }}
            >
              {editingItem ? 'Save Changes' : (isEmployee ? 'Add Employee' : 'Post Vacancy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HRModals;
