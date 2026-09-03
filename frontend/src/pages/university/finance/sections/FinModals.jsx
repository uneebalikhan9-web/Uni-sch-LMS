import React, { useState, useEffect } from 'react';
import { X } from "@phosphor-icons/react";

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const FinModals = ({ show, onClose, type, editingItem, students, employees, onAction }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
    } else {
      // Reset form for new entry
      const now = new Date();
      if (type === 'challan') {
        setFormData({
          student_id: '',
          tuition_fee: 5000,
          transport_fee: 0,
          computer_fee: 500,
          activity_fee: 500,
          other_fee: 0,
          due_date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString().split('T')[0],
          fee_month: now.getMonth() + 1,
          fee_year: now.getFullYear(),
          academic_year: `${now.getFullYear()}-${now.getFullYear()+1}`
        });
      }
      if (type === 'payroll') {
        setFormData({
          employee_id: '',
          month: MONTHS[now.getMonth()],
          year: now.getFullYear(),
          basic_salary: '',
          bonus: 0,
          deductions: 0,
          net_payable: 0
        });
      }
      if (type === 'expense') {
        setFormData({
          title: '',
          category: 'utilities',
          amount: '',
          expense_date: now.toISOString().split('T')[0],
          description: ''
        });
      }
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
          <div style={{ display: 'grid', gap: '1.2rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Select Enrolled Student *</label>
              <select name="student_id" style={inputStyle} value={formData.student_id ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur}>
                <option value="">Select a student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Roll: {s.roll_number || s.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Fee Month</label>
              <select name="fee_month" style={inputStyle} value={formData.fee_month ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}>
                {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Fee Year</label>
              <input type="number" name="fee_year" style={inputStyle} value={formData.fee_year ?? new Date().getFullYear()} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div>
              <label style={labelStyle}>Monthly Tuition Fee (Rs.) *</label>
              <input type="number" name="tuition_fee" style={inputStyle} value={formData.tuition_fee ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div>
              <label style={labelStyle}>Transport Fee (Rs.)</label>
              <input type="number" name="transport_fee" style={inputStyle} value={formData.transport_fee ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div>
              <label style={labelStyle}>Computer / Lab Fee (Rs.)</label>
              <input type="number" name="computer_fee" style={inputStyle} value={formData.computer_fee ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div>
              <label style={labelStyle}>Activity / Exam Fee (Rs.)</label>
              <input type="number" name="activity_fee" style={inputStyle} value={formData.activity_fee ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Due Date *</label>
              <input type="date" name="due_date" style={inputStyle} value={formData.due_date ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>
        );

      case 'payroll':
        return (
          <div style={{ display: 'grid', gap: '1.2rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Select Teacher / Staff *</label>
              <select name="employee_id" style={inputStyle} value={formData.employee_id ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur}>
                <option value="">Select an employee...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.designation || 'Teacher / Staff'}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Salary Month</label>
              <select name="month" style={inputStyle} value={formData.month ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <input type="number" name="year" style={inputStyle} value={formData.year ?? new Date().getFullYear()} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Basic Monthly Salary (Rs.) *</label>
              <input type="number" name="basic_salary" style={inputStyle} value={formData.basic_salary ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Allowances / Bonus (Rs.)</label>
              <input type="number" name="bonus" style={inputStyle} value={formData.bonus ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Deductions / Absences (Rs.)</label>
              <input type="number" name="deductions" style={inputStyle} value={formData.deductions ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Net Payable (Rs.)</label>
              <input type="number" name="net_payable" style={{ ...inputStyle, background: '#f1f5f9', fontWeight: 800, color: '#166534' }} value={formData.net_payable ?? ''} readOnly />
            </div>
          </div>
        );

      case 'expense':
        return (
          <div style={{ display: 'grid', gap: '1.2rem', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Expense Title *</label>
              <input type="text" name="title" placeholder="e.g. Campus Electricity Bill, Exam Paper Printing" style={inputStyle} value={formData.title ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Expense Category</label>
              <select name="category" style={inputStyle} value={formData.category ?? 'utilities'} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}>
                <option value="utilities">Utilities & Bills (Electricity, Water)</option>
                <option value="maintenance">Campus Maintenance & Repairs</option>
                <option value="supplies">Printing, Stationery & Books</option>
                <option value="events">Sports, Annual Function & Events</option>
                <option value="salaries">Staff Refreshment & Welfare</option>
                <option value="other">Other College Expenses</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Amount (Rs.) *</label>
              <input type="number" name="amount" style={inputStyle} value={formData.amount ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Expense Date</label>
              <input type="date" name="expense_date" style={inputStyle} value={formData.expense_date ?? ''} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description / Notes</label>
              <textarea name="description" rows={3} placeholder="Vendor name, invoice number, or details..." style={{ ...inputStyle, resize: 'vertical' }} value={formData.description ?? ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    if (editingItem) return `Edit ${type === 'challan' ? 'Monthly Fee Challan' : type === 'payroll' ? 'Staff Payroll' : 'Expense'}`;
    return `Add New ${type === 'challan' ? 'Monthly College Challan' : type === 'payroll' ? 'Teacher / Staff Payroll' : 'College Expense'}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '20px 20px 0 0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{getTitle()}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 4 }}><X size={20} weight="bold" /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {renderForm()}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 18px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 24px', background: 'var(--primary-color, #4f46e5)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>Save Entry</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinModals;
