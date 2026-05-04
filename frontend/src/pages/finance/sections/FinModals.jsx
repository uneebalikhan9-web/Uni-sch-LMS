import React, { useState, useEffect } from 'react';
import { X } from "@phosphor-icons/react";

const FinModals = ({ show, onClose, type, editingItem, students, employees, onAction }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      // Reset form for new entry
      if (type === 'challan') setFormData({ student_id: '', tuition_fee: 0, lab_fee: 0, library_fee: 0, other_fee: 0, due_date: '', semester: '', academic_year: '2024-25' });
      if (type === 'payroll') setFormData({ employee_id: '', month: 'December', year: 2024, basic_salary: 0, bonus: 0, deductions: 0 });
      if (type === 'expense') setFormData({ title: '', category: 'other', amount: 0, expense_date: '', description: '' });
    }
  }, [editingItem, type, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = type === 'challan' ? '/challans' : type === 'payroll' ? '/payroll' : '/expenses';
    const success = await onAction('POST', url, formData);
    if (success) onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderForm = () => {
    switch (type) {
      case 'challan':
        return (
          <>
            <div className="fin-form-field full">
              <label className="fin-form-label">Select Student</label>
              <select name="student_id" className="fin-form-select" value={formData.student_id} onChange={handleChange} required>
                <option value="">Select a student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
              </select>
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Tuition Fee</label>
              <input type="number" name="tuition_fee" className="fin-form-input" value={formData.tuition_fee} onChange={handleChange} />
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Lab Fee</label>
              <input type="number" name="lab_fee" className="fin-form-input" value={formData.lab_fee} onChange={handleChange} />
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Library Fee</label>
              <input type="number" name="library_fee" className="fin-form-input" value={formData.library_fee} onChange={handleChange} />
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Due Date</label>
              <input type="date" name="due_date" className="fin-form-input" value={formData.due_date} onChange={handleChange} required />
            </div>
          </>
        );
      case 'payroll':
        return (
          <>
            <div className="fin-form-field full">
              <label className="fin-form-label">Select Employee</label>
              <select name="employee_id" className="fin-form-select" value={formData.employee_id} onChange={handleChange} required>
                <option value="">Select an employee...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>)}
              </select>
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Month</label>
              <select name="month" className="fin-form-select" value={formData.month} onChange={handleChange}>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Basic Salary</label>
              <input type="number" name="basic_salary" className="fin-form-input" value={formData.basic_salary} onChange={handleChange} required />
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Bonus</label>
              <input type="number" name="bonus" className="fin-form-input" value={formData.bonus} onChange={handleChange} />
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Deductions</label>
              <input type="number" name="deductions" className="fin-form-input" value={formData.deductions} onChange={handleChange} />
            </div>
          </>
        );
      case 'expense':
        return (
          <>
            <div className="fin-form-field full">
              <label className="fin-form-label">Expense Title</label>
              <input type="text" name="title" className="fin-form-input" placeholder="e.g. Electricity Bill" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Category</label>
              <select name="category" className="fin-form-select" value={formData.category} onChange={handleChange}>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="supplies">Supplies</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="fin-form-field">
              <label className="fin-form-label">Amount</label>
              <input type="number" name="amount" className="fin-form-input" value={formData.amount} onChange={handleChange} required />
            </div>
            <div className="fin-form-field full">
              <label className="fin-form-label">Description</label>
              <textarea name="description" className="fin-form-input" style={{height: '80px'}} value={formData.description} onChange={handleChange}></textarea>
            </div>
          </>
        );
      default: return null;
    }
  };

  return (
    <div className="fin-modal-overlay" onClick={onClose}>
      <div className="fin-form-modal" onClick={e => e.stopPropagation()}>
        <div className="fin-modal-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
          <h3 className="fin-form-title">{editingItem ? 'Edit' : 'Add New'} {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'#9ca3af'}}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="fin-form-grid">
            {renderForm()}
          </div>
          <div className="fin-form-actions">
            <button type="button" className="fin-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="fin-modal-confirm">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinModals;
