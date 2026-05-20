import React from 'react';
import { 
  Receipt, Clock, CheckCircle, 
  Warning, Printer, CalendarBlank, SealCheck, Money
} from "@phosphor-icons/react";

export default function EPayroll({ payroll, onPrint }) {
  const totalPaid = payroll.filter(p => p.status === 'disbursed').reduce((sum, p) => sum + parseFloat(p.net_payable || 0), 0);
  const totalPending = payroll.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.net_payable || 0), 0);
  const totalDeductions = payroll.reduce((sum, p) => sum + parseFloat(p.deductions || 0), 0);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'disbursed':
        return { bg: '#ecfdf5', color: '#10b981', text: 'DISBURSED' };
      default:
        return { bg: '#fffbeb', color: '#d97706', text: 'PENDING' };
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Real-time summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#ecfdf5', color: '#10b981', borderRadius: '12px', padding: '12px', display: 'flex' }}>
            <CheckCircle size={24} weight="duotone" />
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Received</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>Rs. {totalPaid.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fffbeb', color: '#d97706', borderRadius: '12px', padding: '12px', display: 'flex' }}>
            <Clock size={24} weight="duotone" />
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Salaries</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>Rs. {totalPending.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: '12px', padding: '12px', display: 'flex' }}>
            <Warning size={24} weight="duotone" />
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Deductions</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>Rs. {totalDeductions.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Main Payroll Table Grid */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 25px rgba(0, 0, 0, 0.02)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Money size={22} weight="duotone" color="#7c3aed" />
          My Salary & Payroll Slips
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Month / Year</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Basic Salary</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Bonus</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Deductions</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Net Payable</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payroll.map((p) => {
                const badge = getStatusStyle(p.status);
                return (
                  <tr key={p.id} className="fin-table-row" style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px', fontWeight: '700', color: '#7c3aed' }}>
                      {p.month} <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>({p.year})</span>
                    </td>
                    <td style={{ padding: '20px', color: '#334155', fontWeight: '600' }}>Rs. {(p.basic_salary || 0).toLocaleString()}</td>
                    <td style={{ padding: '20px', color: '#10b981', fontWeight: '700' }}>+ Rs. {(p.bonus || 0).toLocaleString()}</td>
                    <td style={{ padding: '20px', color: '#ef4444', fontWeight: '700' }}>- Rs. {(p.deductions || 0).toLocaleString()}</td>
                    <td style={{ padding: '20px', fontWeight: '800', color: '#0f172a' }}>Rs. {(p.net_payable || 0).toLocaleString()}</td>
                    <td style={{ padding: '20px' }}>
                      <span style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        display: 'inline-block'
                      }}>
                        {badge.text}
                      </span>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => onPrint(p)}
                        style={{
                          background: '#f8fafc',
                          color: '#7c3aed',
                          border: '1px solid #ddd6fe',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        className="btn-print"
                      >
                        <Printer size={16} weight="bold" /> Print Slip
                      </button>
                    </td>
                  </tr>
                );
              })}
              {payroll.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No payroll slips recorded for your employee account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
