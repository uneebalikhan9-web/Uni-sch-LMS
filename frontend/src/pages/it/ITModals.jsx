import React, { useState } from 'react';
import { X, UserPlus, Ticket, Warning, FileCsv, IdentificationCard } from '@phosphor-icons/react';

export const BulkImportModal = ({ onClose, onSave }) => {
  const [csvData, setCsvData] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleProcess = () => {
    const rows = csvData.split('\n').filter(r => r.trim() !== '');
    // Remove header row if it exists
    const startIdx = rows[0].toLowerCase().includes('name') ? 1 : 0;
    const users = rows.slice(startIdx).map(row => {
      const [name, email, role, password] = row.split(',').map(s => s.trim());
      if (!name || !email) return null;
      return { name, email, role, password };
    }).filter(Boolean);
    
    if (users.length === 0) {
      alert('No valid user data found. Please check format: Name, Email, Role, Password');
      return;
    }
    onSave(users);
  };

  return (
    <div className="lib-modal-overlay">
      <div className="lib-modal" style={{ maxWidth: '500px' }}>
        <div className="lib-modal-header">
          <h2><FileCsv size={24} weight="bold" color="var(--it-primary)" /> Bulk Import Users</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="lib-modal-body">
          <div style={{ marginBottom: 20, padding: 20, border: '2px dashed #e2e8f0', borderRadius: 12, textAlign: 'center' }}>
            <input type="file" id="csvFile" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            <label htmlFor="csvFile" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <FileCsv size={40} color="var(--it-primary)" />
              <span style={{ fontWeight: 700, color: 'var(--it-primary)' }}>Click to upload CSV file</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Format: Name, Email, Role, Password</span>
            </label>
          </div>
          
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 8, fontWeight: 700 }}>
            Or paste data manually:
          </p>
          <textarea 
            placeholder="John Doe, john@example.com, student, password123"
            style={{ width: '100%', height: '120px', padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'monospace', fontSize: '0.85rem' }}
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
          />
        </div>
        <div className="lib-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ background: 'var(--it-primary)' }} onClick={handleProcess}>Process {csvData ? 'Data' : 'Import'}</button>
        </div>
      </div>
    </div>
  );
};

export const NewTicketModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ subject: '', category: 'General', priority: 'Medium', description: '' });

  return (
    <div className="lib-modal-overlay">
      <div className="lib-modal">
        <div className="lib-modal-header">
          <h2><Ticket size={24} weight="bold" color="var(--it-primary)" /> Create Support Ticket</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="lib-modal-body">
          <div className="form-group">
            <label>Subject</label>
            <input type="text" placeholder="Brief issue title" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Category</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="General">General</option>
                <option value="Network">Network</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Details of the problem..." style={{ height: 100 }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>
        <div className="lib-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ background: 'var(--it-primary)' }} onClick={() => onSave(formData)}>Submit Ticket</button>
        </div>
      </div>
    </div>
  );
};

export const DeleteConfirmModal = ({ onClose, onConfirm, itemName }) => {
  return (
    <div className="lib-modal-overlay">
      <div className="lib-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ padding: '32px 24px' }}>
          <div style={{ background: '#fee2e2', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Warning size={32} color="#ef4444" weight="bold" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Delete {itemName}?</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
            This action cannot be undone. All data associated with this record will be permanently removed.
          </p>
        </div>
        <div className="lib-modal-footer" style={{ background: '#f8fafc' }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} style={{ background: '#ef4444', flex: 1 }}>Delete Now</button>
        </div>
      </div>
    </div>
  );
};

export const EditUserModal = ({ onClose, onSave, user }) => {
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', role: user?.role || 'student' });

  return (
    <div className="lib-modal-overlay">
      <div className="lib-modal">
        <div className="lib-modal-header">
          <h2><IdentificationCard size={24} weight="bold" color="var(--it-primary)" /> Edit User Account</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="lib-modal-body">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="it_admin">IT Admin</option>
              <option value="registrar">Registrar</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>
        </div>
        <div className="lib-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" style={{ background: 'var(--it-primary)' }} onClick={() => onSave(formData)}>Update User</button>
        </div>
      </div>
    </div>
  );
};
