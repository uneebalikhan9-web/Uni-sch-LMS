import React, { useState } from 'react';
import { 
  CurrencyDollar, Eye, Printer, 
  CheckCircle, HandCoins, PencilSimple
} from "@phosphor-icons/react";

const FinPayroll = ({ payroll, onAction }) => {
  const [filterMonth, setFilterMonth] = useState('May');
  
  const handleDisburse = async (id) => {
    onAction('POST', `/payroll/${id}/disburse`);
  };

  const filtered = payroll.filter(p => p.month === filterMonth);

  return (
    <div className="fin-animate">
      <div className="fin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Payroll Management</h2>
          <p style={{ color: 'var(--fin-text-muted)', fontSize: '14px' }}>Manage employee salaries and disbursements</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', width: '150px' }}
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
            onClick={() => onAction('POST', '/payroll/disburse-all', { month: filterMonth })}
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
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="fin-name">{p.employee_name}</div>
                  <div className="fin-sub">Code: {p.employee_code}</div>
                </td>
                <td>{p.designation}</td>
                <td>{p.month} {p.year}</td>
                <td>Rs. {(p.basic_salary || 0).toLocaleString()}</td>
                <td className="fin-bonus">Rs. {(p.bonus || 0).toLocaleString()}</td>
                <td className="fin-deduct">Rs. {(p.deductions || 0).toLocaleString()}</td>
                <td style={{ fontWeight: '700' }}>Rs. {(p.net_payable || 0).toLocaleString()}</td>
                <td>
                  <span className={`fin-badge fin-badge-${p.status}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    {p.status === 'pending' && (
                      <button style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Disburse Salary" onClick={() => handleDisburse(p.id)}>
                        <CurrencyDollar size={18} weight="bold" />
                      </button>
                    )}
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="View Payslip">
                      <Eye size={18} weight="duotone" />
                    </button>
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Print Payslip">
                      <Printer size={18} weight="duotone" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {payroll.length === 0 && (
              <tr className="fin-empty-row">
                <td colSpan="9">No payroll records found for the selected period</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinPayroll;
