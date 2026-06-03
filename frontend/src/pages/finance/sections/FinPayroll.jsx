import React, { useState } from 'react';
import { 
  CurrencyDollar, Eye, Printer, 
  CheckCircle, PencilSimple
} from "@phosphor-icons/react";

const MONTHS = ['All','January','February','March','April','May','June','July','August','September','October','November','December'];

const FinPayroll = ({ payroll, onAction, onEdit }) => {
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear]   = useState('All');
  
  const handleDisburse = async (id) => {
    onAction('POST', `/payroll/${id}/disburse`);
  };

  const filtered = payroll.filter(p => {
    const monthOk = filterMonth === 'All' || p.month === filterMonth;
    const yearOk  = filterYear  === 'All' || String(p.year) === String(filterYear);
    return monthOk && yearOk;
  });

  const years = ['All', ...Array.from(new Set(payroll.map(p => p.year))).sort((a,b) => b-a)];

  return (
    <div className="fin-animate">
      <div className="fin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Payroll Management</h2>
          <p style={{ color: 'var(--fin-text-muted)', fontSize: '14px' }}>Manage employee salaries and disbursements</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select 
            style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', whiteSpace: 'nowrap' }}
            onClick={() => onAction('POST', '/payroll/disburse-all', { month: filterMonth !== 'All' ? filterMonth : undefined })}
          >
            <CheckCircle size={18} weight="bold" /> Disburse All Pending
          </button>
        </div>
      </div>

      <div className="fin-table-wrap">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Designation</th>
              <th>Month/Year</th>
              <th>Basic Salary</th>
              <th>Bonus</th>
              <th>Deductions</th>
              <th>Net Payable</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="fin-name">{p.employee_name || 'N/A'}</div>
                  <div className="fin-sub">Code: {p.employee_code || '—'}</div>
                </td>
                <td>{p.designation || 'Staff'}</td>
                <td style={{ fontWeight: 600 }}>{p.month} {p.year}</td>
                <td>Rs. {(p.basic_salary || 0).toLocaleString()}</td>
                <td className="fin-bonus">+ Rs. {(p.bonus || 0).toLocaleString()}</td>
                <td className="fin-deduct">- Rs. {(p.deductions || 0).toLocaleString()}</td>
                <td style={{ fontWeight: '800', color: '#10b981', fontSize: '0.95rem' }}>Rs. {(p.net_payable || 0).toLocaleString()}</td>
                <td>
                  <span className={`fin-badge fin-badge-${p.status}`}>
                    {p.status === 'disbursed' ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    {p.status === 'pending' && (
                      <button style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }} title="Disburse Salary" onClick={() => handleDisburse(p.id)}>
                        <CurrencyDollar size={16} weight="bold" /> Pay
                      </button>
                    )}
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Edit" onClick={() => onEdit && onEdit(p)}>
                      <PencilSimple size={16} weight="duotone" />
                    </button>
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Print Payslip" onClick={() => window.print()}>
                      <Printer size={16} weight="duotone" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr className="fin-empty-row">
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💼</div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>No payroll records found</div>
                  <div style={{ fontSize: '0.8rem' }}>
                    {payroll.length === 0 ? 'Click "Add New" to create the first payroll entry.' : 'No records match the selected filters.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinPayroll;
