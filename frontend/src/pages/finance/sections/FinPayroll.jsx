import React, { useState } from 'react';
import { 
  CurrencyDollar, Eye, Printer, 
  CheckCircle, HandCoins, PencilSimple
} from "@phosphor-icons/react";

const FinPayroll = ({ payroll, onAction }) => {
  const [filterMonth, setFilterMonth] = useState('January');
  
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
            className="fin-form-select" 
            style={{ width: '150px' }}
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button 
            className="fin-add-btn" 
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
                <td>₹{(p.basic_salary || 0).toLocaleString()}</td>
                <td className="fin-bonus">₹{(p.bonus || 0).toLocaleString()}</td>
                <td className="fin-deduct">₹{(p.deductions || 0).toLocaleString()}</td>
                <td style={{ fontWeight: '700' }}>₹{(p.net_payable || 0).toLocaleString()}</td>
                <td>
                  <span className={`fin-badge fin-badge-${p.status}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div className="fin-action-icons" style={{justifyContent: 'flex-end'}}>
                    {p.status === 'pending' && (
                      <button className="fin-icon-btn" title="Disburse Salary" onClick={() => handleDisburse(p.id)}>
                        <CurrencyDollar size={18} weight="bold" color="var(--fin-primary)" />
                      </button>
                    )}
                    <button className="fin-icon-btn" title="View Payslip">
                      <Eye size={18} />
                    </button>
                    <button className="fin-icon-btn" title="Print Payslip">
                      <Printer size={18} />
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
