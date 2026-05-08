import React from 'react';
import { ArrowUDownRight, ArrowUUpLeft, UserCircle, IdentificationCard } from '@phosphor-icons/react';

const IssueReturn = ({ transactions, onIssue }) => {
  return (
    <div className="issuance-section animate-fadeIn">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ArrowUDownRight color="#0891b2" weight="bold" /> Issue Resource
            </h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 24, fontWeight: 600 }}>Select a registered member and an available book from the catalog to issue.</p>
          <button className="primary-btn" onClick={onIssue} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            <ArrowUDownRight size={20} weight="bold" /> Open Issuance Form
          </button>
        </div>

        <div className="card">
          <div className="card-header" style={{ marginBottom: 12 }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ArrowUUpLeft color="#10b981" weight="bold" /> Quick Return
            </h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 24, fontWeight: 600 }}>Enter the Book ID or ISBN to process an instant return and clear any penalties.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <input 
              type="text" 
              placeholder="Enter Book ID..." 
              style={{ flex: 1, padding: '12px 18px', borderRadius: 12, border: '1px solid #e2e8f0', outline: 'none', fontWeight: 600 }} 
            />
            <button className="primary-btn" style={{ background: '#10b981' }}>Return Book</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Queue for Return (Today)</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Member</th><th>Book</th><th>Due Date</th><th>Penalty Status</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(transactions || []).map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{t.member_name}</td>
                  <td style={{ fontWeight: 600, color: '#475569' }}>{t.book_title}</td>
                  <td style={{ fontWeight: 700, color: '#64748b' }}>{new Date(t.due_date).toLocaleDateString()}</td>
                  <td style={{ color: t.status === 'Overdue' ? '#ef4444' : '#10b981', fontWeight: 900 }}>PKR {t.fine_amount}</td>
                  <td>
                    <span className={`status-badge status-${t.status.toLowerCase()}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: 600 }}>No resources currently queued for return.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IssueReturn;
