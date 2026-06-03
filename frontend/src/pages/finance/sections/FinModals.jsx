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
      const now = new Date();
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      if (type === 'payroll') setFormData({ employee_id: '', month: months[now.getMonth()], year: now.getFullYear(), basic_salary: '', bonus: 0, deductions: 0 });
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
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate net payable for payroll
      if (['basic_salary','bonus','deductions'].includes(name)) {
        const basic = parseFloat(name==='basic_salary' ? value : updated.basic_salary) || 0;
        const bonus = parseFloat(name==='bonus' ? value : updated.bonus) || 0;
        const ded   = parseFloat(name==='deductions' ? value : updated.deductions) || 0;
        updated.net_payable = basic + bonus - ded;
      }
      return updated;
    });
  };

  const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s' };
  const handleFocus = (e) => { e.target.style.borderColor='var(--primary-color, #4f46e5)'; e.target.style.boxShadow='0 0 0 4px #e0e7ff'; e.target.style.background='white'; };
  const handleBlur = (e) => { e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; e.target.style.background='#f8fafc'; };

  const renderForm = () => {
    switch (type) {
      case 'challan':
        return (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Select Student</label>
              <select name="student_id" style={inputStyle} value={formData.student_id ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur}>
                <option value="">Select a student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll_number})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tuition Fee</label>
              <input type="number" name="tuition_fee" style={inputStyle} value={formData.tuition_fee ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Lab Fee</label>
              <input type="number" name="lab_fee" style={inputStyle} value={formData.lab_fee ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Library Fee</label>
              <input type="number" name="library_fee" style={inputStyle} value={formData.library_fee ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" name="due_date" style={inputStyle} value={formData.due_date ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>
        );
      case 'payroll':
        return (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Select Employee *</label>
              <select name="employee_id" style={inputStyle} value={formData.employee_id ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur}>
                <option value="">Select an employee...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.designation || 'Staff'}</option>)}
              </select>
              {employees.length === 0 && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px' }}>⚠️ No employees found. Please add employees first from HR Portal.</p>}
            </div>
            <div>
              <label style={labelStyle}>Month *</label>
              <select name="month" style={inputStyle} value={formData.month ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}>
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year *</label>
              <input type="number" name="year" style={inputStyle} value={formData.year ?? ''} onChange={handleChange} required min="2020" max="2030" onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Basic Salary (Rs.) *</label>
              <input type="number" name="basic_salary" style={inputStyle} value={formData.basic_salary ?? ''} onChange={handleChange} required placeholder="e.g. 50000" onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Bonus / Allowances (Rs.)</label>
              <input type="number" name="bonus" style={inputStyle} value={formData.bonus ?? ''} onChange={handleChange} placeholder="0" onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Deductions / Tax (Rs.)</label>
              <input type="number" name="deductions" style={inputStyle} value={formData.deductions ?? ''} onChange={handleChange} placeholder="0" onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '14px', padding: '16px 20px', border: '1px solid #86efac' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Payable (Auto-calculated)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803d' }}>Rs. {((parseFloat(formData.basic_salary)||0) + (parseFloat(formData.bonus)||0) - (parseFloat(formData.deductions)||0)).toLocaleString()}</div>
            </div>
          </div>
        );
      case 'expense':
        return (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Expense Title</label>
              <input type="text" name="title" style={inputStyle} placeholder="e.g. Electricity Bill" value={formData.title ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select name="category" style={inputStyle} value={formData.category ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="supplies">Supplies</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Amount</label>
              <input type="number" name="amount" style={inputStyle} value={formData.amount ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description</label>
              <textarea name="description" style={{...inputStyle, height: '100px', resize: 'none'}} value={formData.description ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}></textarea>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{editingItem ? 'Edit' : 'Add New'} {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <button onClick={onClose} style={{ background:'#f1f5f9', border:'none', cursor:'pointer', color:'#64748b', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} weight="bold" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {renderForm()}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '12px 24px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '12px 24px', background: 'var(--primary-color, #4f46e5)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(var(--primary-rgb, 79, 70, 229), 0.25)' }}>Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinModals;
