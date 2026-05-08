import React, { useState } from 'react';
import { X, Books, UserPlus, ArrowUDownRight, Money } from '@phosphor-icons/react';
import './LibraryModal.css';

export const AddBookModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ isbn: '', title: '', author: '', rack: 'A01' });

  return (
    <div className="lib-modal-overlay">
      <div className="lib-modal">
        <div className="lib-modal-header">
          <h2><Books size={24} weight="bold" color="#0891b2" /> Add New Book</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="lib-modal-body">
          <div className="form-group">
            <label>ISBN / Book ID</label>
            <input type="text" placeholder="e.g. ISBN-90210" value={formData.isbn} onChange={(e) => setFormData({...formData, isbn: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Book Title</label>
            <input type="text" placeholder="Enter full title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Author</label>
            <input type="text" placeholder="Primary Author" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Rack Location</label>
            <input type="text" placeholder="e.g. A12" value={formData.rack} onChange={(e) => setFormData({...formData, rack: e.target.value})} />
          </div>
        </div>
        <div className="lib-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(formData)}>Add Book</button>
        </div>
      </div>
    </div>
  );
};

export const IssueBookModal = ({ onClose, onSave, members, books }) => {
  const [formData, setFormData] = useState({ member_id: '', book_id: '', due_date: '' });

  return (
    <div className="lib-modal-overlay">
      <div className="lib-modal">
        <div className="lib-modal-header">
          <h2><ArrowUDownRight size={24} weight="bold" color="#0891b2" /> Issue Resource</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="lib-modal-body">
          <div className="form-group">
            <label>Select Member</label>
            <select value={formData.member_id} onChange={(e) => setFormData({...formData, member_id: e.target.value})}>
              <option value="">Select a member...</option>
              {(members || []).map(m => <option key={m.id} value={m.id}>{m.name} (MEM-{m.id})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Select Book</label>
            <select value={formData.book_id} onChange={(e) => setFormData({...formData, book_id: e.target.value})}>
              <option value="">Select a book...</option>
              {(books || []).filter(b => b.status === 'Available').map(b => <option key={b.id} value={b.id}>{b.title} ({b.isbn})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
          </div>
        </div>
        <div className="lib-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(formData)}>Confirm Issue</button>
        </div>
      </div>
    </div>
  );
};

export const MemberModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', role: 'Student', department: '' });

  return (
    <div className="lib-modal-overlay">
      <div className="lib-modal">
        <div className="lib-modal-header">
          <h2><UserPlus size={24} weight="bold" color="#0891b2" /> Register Member</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="lib-modal-body">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Member Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <input type="text" placeholder="e.g. Computer Science" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
          </div>
        </div>
        <div className="lib-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={() => onSave(formData)}>Register</button>
        </div>
      </div>
    </div>
  );
};

export const HistoryModal = ({ onClose, member, history }) => {
  return (
    <div className="lib-modal-overlay">
      <div className="lib-modal" style={{ maxWidth: '650px' }}>
        <div className="lib-modal-header">
          <h2><Books size={24} weight="bold" color="#0891b2" /> Borrowing History: {member?.name}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="lib-modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="lib-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(history || []).length > 0 ? (
                history.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 700 }}>{h.book_title}</td>
                    <td>{new Date(h.issue_date).toLocaleDateString()}</td>
                    <td>{new Date(h.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${h.status.toLowerCase()}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No history found for this member.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="lib-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
