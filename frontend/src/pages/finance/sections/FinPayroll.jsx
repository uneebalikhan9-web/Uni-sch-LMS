import React, { useState } from 'react';
import { 
  CurrencyDollar, Eye, Printer, 
  CheckCircle, PencilSimple, X, Buildings, Check
} from "@phosphor-icons/react";

const MONTHS = ['All','January','February','March','April','May','June','July','August','September','October','November','December'];

const FinPayroll = ({ payroll, onAction, onEdit }) => {
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterYear, setFilterYear]   = useState('All');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  
  const handleDisburse = async (id) => {
    if (window.confirm('Disburse salary for this employee?')) {
      onAction('POST', `/payroll/${id}/disburse`);
    }
  };

  const handleDisburseAll = async () => {
    if (window.confirm('Disburse all pending salaries for the current batch?')) {
      onAction('POST', '/payroll/disburse-all');
    }
  };

  const filtered = payroll.filter(p => {
    const monthOk = filterMonth === 'All' || p.month === filterMonth;
    const yearOk  = filterYear  === 'All' || String(p.year) === String(filterYear);
    return monthOk && yearOk;
  });

  const pendingCount = filtered.filter(p => p.status === 'pending').length;
  const years = ['All', ...Array.from(new Set(payroll.map(p => p.year))).sort((a,b) => b-a)];

  return (
    <div className="fin-animate">
      <div className="fin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>College Faculty & Staff & Teachers Payroll</h2>
          <p style={{ color: 'var(--fin-text-muted)', fontSize: '14px', margin: '4px 0 0' }}>Manage monthly teacher compensations, allowances, deductions, and salary slips</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          >
            {MONTHS.map(m => <option key={m} value={m}>{m === 'All' ? 'All Months' : m}</option>)}
          </select>
          <select 
            style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
          >
            {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
          </select>

          {pendingCount > 0 && (
            <button
              onClick={handleDisburseAll}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
              }}
            >
              <Check size={16} weight="bold" /> Disburse All ({pendingCount})
            </button>
          )}
        </div>
      </div>

      <div className="fin-table-wrap">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role / Designation</th>
              <th>Month / Year</th>
              <th>Basic Salary</th>
              <th>Allowances</th>
              <th>Deductions</th>
              <th>Net Payable</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="fin-name">{p.employee_name || 'Staff Member'}</div>
                  <div className="fin-sub">Code: {p.employee_code || `EMP-${p.employee_id}`}</div>
                </td>
                <td>{p.designation || 'Teacher / Staff'}</td>
                <td style={{ fontWeight: 600 }}>{p.month} {p.year}</td>
                <td>Rs. {(p.basic_salary || 0).toLocaleString()}</td>
                <td className="fin-bonus">+ Rs. {(p.bonus || 0).toLocaleString()}</td>
                <td className="fin-deduct">- Rs. {(p.deductions || 0).toLocaleString()}</td>
                <td style={{ fontWeight: '800', color: '#10b981', fontSize: '0.95rem' }}>Rs. {(p.net_payable || 0).toLocaleString()}</td>
                <td>
                  <span className={`fin-badge fin-badge-${p.status}`}>
                    {p.status === 'disbursed' ? '✓ Disbursed' : '⏳ Pending'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    {p.status === 'pending' && (
                      <button style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }} title="Disburse Salary" onClick={() => handleDisburse(p.id)}>
                        <CurrencyDollar size={16} weight="bold" /> Pay
                      </button>
                    )}
                    <button 
                      style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }} 
                      title="View & Print Salary Slip" 
                      onClick={() => setSelectedPayslip(p)}
                    >
                      <Printer size={15} weight="duotone" /> Payslip
                    </button>
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Edit" onClick={() => onEdit && onEdit(p)}>
                      <PencilSimple size={16} weight="duotone" />
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
                    {payroll.length === 0 ? 'Click "Add New" to create the first staff payroll entry.' : 'No records match the selected month/year filter.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SALARY PAYSLIP MODAL */}
      {selectedPayslip && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Top Actions */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Employee Salary Slip</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: 'var(--primary-color, #4f46e5)', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Printer size={15} weight="bold" /> Print Slip
                </button>
                <button onClick={() => setSelectedPayslip(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
            </div>

            {/* Printable Slip Content */}
            <div id="printable-payslip" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', background: '#fff' }}>
              
              {/* Slip Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>LANCERS TECH COLLEGE</h3>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, marginTop: '2px' }}>MONTHLY SALARY DISBURSEMENT SLIP</div>
                <div style={{ display: 'inline-block', marginTop: '6px', padding: '2px 10px', borderRadius: '6px', background: '#f1f5f9', fontWeight: 800, fontSize: '0.8rem' }}>
                  Pay Period: {selectedPayslip.month} {selectedPayslip.year}
                </div>
              </div>

              {/* Employee Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div><span style={{ color: '#64748b' }}>Employee Name:</span> <strong style={{ color: '#0f172a' }}>{selectedPayslip.employee_name || 'Staff Member'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Employee Code:</span> <strong>{selectedPayslip.employee_code || `EMP-${selectedPayslip.employee_id}`}</strong></div>
                <div><span style={{ color: '#64748b' }}>Designation:</span> <strong>{selectedPayslip.designation || 'Teacher / Staff'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Disbursement Status:</span> <strong style={{ color: selectedPayslip.status === 'disbursed' ? '#166534' : '#92400e' }}>{selectedPayslip.status === 'disbursed' ? '✓ Paid' : 'Pending'}</strong></div>
              </div>

              {/* Earnings & Deductions Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* Earnings */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', background: '#f0fdf4', color: '#166534', fontWeight: 800, fontSize: '0.8rem', borderBottom: '1px solid #bbf7d0' }}>
                    EARNINGS
                  </div>
                  <div style={{ padding: '12px 14px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Basic Salary:</span>
                      <strong>Rs. {(selectedPayslip.basic_salary || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Teaching Allowances:</span>
                      <strong>Rs. {(selectedPayslip.bonus || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontWeight: 800, color: '#166534' }}>
                      <span>Total Earnings:</span>
                      <span>Rs. {((parseFloat(selectedPayslip.basic_salary) || 0) + (parseFloat(selectedPayslip.bonus) || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', background: '#fef2f2', color: '#991b1b', fontWeight: 800, fontSize: '0.8rem', borderBottom: '1px solid #fecaca' }}>
                    DEDUCTIONS
                  </div>
                  <div style={{ padding: '12px 14px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Leave / Absences:</span>
                      <strong>Rs. {(selectedPayslip.deductions || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tax / Fund:</span>
                      <strong>Rs. 0</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontWeight: 800, color: '#991b1b' }}>
                      <span>Total Deductions:</span>
                      <span>Rs. {(selectedPayslip.deductions || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Net Payable Banner */}
              <div style={{ padding: '14px 20px', borderRadius: '12px', background: '#1e1b4b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>NET SALARY PAYABLE:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#4ade80' }}>Rs. {(selectedPayslip.net_payable || 0).toLocaleString()}</span>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px' }}>
                <div style={{ textAlign: 'center', width: '160px' }}>
                  <div style={{ borderBottom: '1px solid #94a3b8', height: '24px' }}></div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Employee Signature</span>
                </div>
                <div style={{ textAlign: 'center', width: '160px' }}>
                  <div style={{ borderBottom: '1px solid #94a3b8', height: '24px' }}></div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Accountant / Principal</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default FinPayroll;
