import React from 'react';
import { 
  Receipt, Clock, CheckCircle, 
  Warning, Printer, CalendarBlank, SealCheck
} from "@phosphor-icons/react";

export default function SDFees({ challans, onPrint }) {
  const totalPaid = challans.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.total_amount || 0), 0);
  const totalPending = challans.filter(c => c.status === 'pending' || c.status === 'overdue').reduce((sum, c) => sum + parseFloat(c.total_amount || 0), 0);
  const overdueChallans = challans.filter(c => c.status === 'overdue');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return { bg: '#ecfdf5', color: '#10b981', text: 'PAID' };
      case 'overdue':
        return { bg: '#fef2f2', color: '#ef4444', text: 'OVERDUE' };
      case 'waived':
        return { bg: '#f1f5f9', color: '#64748b', text: 'WAIVED' };
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
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>Rs. {totalPaid.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fffbeb', color: '#d97706', borderRadius: '12px', padding: '12px', display: 'flex' }}>
            <Clock size={24} weight="duotone" />
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Outstanding</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>Rs. {totalPending.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef2f2', color: '#ef4444', borderRadius: '12px', padding: '12px', display: 'flex' }}>
            <Warning size={24} weight="duotone" />
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overdue Challans</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{overdueChallans.length} Pending</div>
          </div>
        </div>
      </div>

      {/* Reminder Notification Banner if student has recently received reminders */}
      {challans.some(c => c.reminder_count > 0 && c.status !== 'paid') && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2fee 100%)',
          border: '1px solid #fca5a5',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            padding: '10px',
            display: 'flex',
            animation: 'pulse 2s infinite'
          }}>
            <Warning size={20} weight="fill" />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#991b1b', fontSize: '15px', fontWeight: '800' }}>Accounts Department Alert</h4>
            <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '13px', fontWeight: '500' }}>
              You have outstanding fee challans requiring immediate attention. Reminders have been sent to your registered email address. Please deposit the outstanding dues.
            </p>
          </div>
        </div>
      )}

      {/* Main Challan Table Grid */}
      <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 25px rgba(0, 0, 0, 0.02)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Receipt size={22} weight="duotone" color="#4f46e5" />
          Fee Challan Ledger
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Challan No</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Semester / Year</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Due Date</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Total Amount</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Alerts</th>
                <th style={{ padding: '16px 20px', color: '#64748b', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c) => {
                const badge = getStatusStyle(c.status);
                return (
                  <tr key={c.id} className="fin-table-row" style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                    <td style={{ padding: '20px', fontWeight: '700', color: '#4f46e5' }}>{c.challan_no}</td>
                    <td style={{ padding: '20px', color: '#334155', fontWeight: '600' }}>
                      {c.semester} <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>({c.academic_year})</span>
                    </td>
                    <td style={{ padding: '20px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarBlank size={16} />
                        {new Date(c.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '20px', fontWeight: '800', color: '#0f172a' }}>Rs. {c.total_amount.toLocaleString()}</td>
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
                    <td style={{ padding: '20px' }}>
                      {c.reminder_count > 0 && c.status !== 'paid' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: '700', fontSize: '12px' }}>
                          <Warning size={14} weight="fill" />
                          <span>Reminder Received ({c.reminder_count})</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => onPrint(c)}
                        style={{
                          background: '#f8fafc',
                          color: '#4f46e5',
                          border: '1px solid #e0e7ff',
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
                        <Printer size={16} weight="bold" /> View Voucher
                      </button>
                    </td>
                  </tr>
                );
              })}
              {challans.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    No fee challans recorded for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pulse Animation Style */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
