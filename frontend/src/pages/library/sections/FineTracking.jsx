import React from 'react';
import { Money, Warning, CheckCircle, Receipt } from '@phosphor-icons/react';

const FineTracking = ({ fines }) => {
  const currentFines = fines || [];
  
  const totalOutstanding = currentFines.reduce((acc, f) => acc + (f.status === 'Overdue' ? f.fine_amount : 0), 0);
  const totalCollected = currentFines.reduce((acc, f) => acc + (f.status === 'Returned' ? f.fine_amount : 0), 0);

  const handleGenerateReport = () => {
    if (currentFines.length === 0) return;
    
    // Create CSV content
    const headers = ['Fine ID', 'Member Name', 'Amount', 'Status', 'Due Date'];
    const rows = currentFines.map(f => [
      `F-${f.id}`,
      f.member_name,
      f.fine_amount,
      f.status === 'Overdue' ? 'UNPAID' : 'PAID',
      new Date(f.due_date).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Library_Fines_Report_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fine-section animate-fadeIn">
      <div className="metrics-grid">
        <div className="card" style={{ borderLeft: '6px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Outstanding Fines</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginTop: 4 }}>PKR {totalOutstanding.toLocaleString()}</h3>
          </div>
          <div style={{ background: '#fee2e2', padding: 12, borderRadius: 12 }}>
            <Warning size={32} color="#ef4444" weight="duotone" />
          </div>
        </div>
        <div className="card" style={{ borderLeft: '6px solid #10b981', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Collected Today</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginTop: 4 }}>PKR {totalCollected.toLocaleString()}</h3>
          </div>
          <div style={{ background: '#dcfce7', padding: 12, borderRadius: 12 }}>
            <CheckCircle size={32} color="#10b981" weight="duotone" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Fine Records</h2>
          <button className="primary-btn" onClick={handleGenerateReport}>
            <Receipt size={18} weight="bold" /> Generate CSV Report
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
          <thead>
            <tr>
              <th>Fine ID</th>
              <th>Member Name</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Date Issued</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentFines.map((f) => (
              <tr key={f.id}>
                <td style={{ color: '#64748b', fontWeight: 700 }}>F-{f.id}</td>
                <td style={{ fontWeight: 800, color: '#0f172a' }}>{f.member_name}</td>
                <td style={{ fontWeight: 900, color: f.status === 'Overdue' ? '#ef4444' : '#10b981' }}>PKR {f.fine_amount}</td>
                <td style={{ fontWeight: 600, color: '#475569' }}>{f.status === 'Overdue' ? 'Overdue Penalty' : 'Returned'}</td>
                <td style={{ fontWeight: 600, color: '#64748b' }}>{new Date(f.due_date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${f.status === 'Returned' ? 'available' : 'issued'}`}>
                    {f.status === 'Overdue' ? 'UNPAID' : 'PAID'}
                  </span>
                </td>
                <td>
                  {f.status === 'Overdue' && (
                    <button className="primary-btn" style={{ padding: '6px 14px', fontSize: '11px', background: '#10b981' }}>
                      Collect
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {currentFines.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: 600 }}>No fine records found.</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default FineTracking;
