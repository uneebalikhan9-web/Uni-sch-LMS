import React from 'react';
import { 
  Download, FilePdf, FileCsv, 
  Printer, SealCheck, FileText
} from "@phosphor-icons/react";

const FinReports = ({ stats, challans }) => {
  
  // Sample logic for most recent paid challan as a preview
  const recentPaid = challans.find(c => c.status === 'paid') || challans[0];

  return (
    <div className="fin-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Financial Reports & Receipts</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <FilePdf size={18} weight="bold" color="#ef4444" /> Export PDF
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <FileCsv size={18} weight="bold" color="#10b981" /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
             <FileText size={20} weight="duotone" /> Recent Receipt Template
          </h3>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#f8fafc', color: '#4f46e5', border: '1px solid #e0e7ff', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
            <Download size={16} weight="bold" /> Download
          </button>
        </div>
        
        {recentPaid ? (
          <div className="fin-receipt-card">
            <div className="fin-receipt-org">
              <div className="fin-receipt-logo">LT</div>
              <div className="fin-receipt-org-info">
                <h4>Lancers Tech Institute</h4>
                <p>123 Education Street, Knowledge Park</p>
                <p>UAN: 111-000-789 | NTN: 1234567-8</p>
              </div>
            </div>
            
            <div className="fin-receipt-title">
              <h2>FEE PAYMENT RECEIPT</h2>
              <div className="fin-receipt-no">Receipt #: {recentPaid.challan_no.replace('FEE', 'RCP')}</div>
            </div>

            <div className="fin-receipt-info">
              <div><strong>Student:</strong> {recentPaid.student_name}</div>
              <div><strong>Roll No:</strong> {recentPaid.roll_number}</div>
              <div><strong>Academic Year:</strong> {recentPaid.academic_year || '2024-25'}</div>
              <div><strong>Payment Date:</strong> {recentPaid.paid_date ? new Date(recentPaid.paid_date).toLocaleDateString() : 'N/A'}</div>
            </div>

            <table className="fin-receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{textAlign: 'right'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Tuition Fee</td><td style={{textAlign: 'right'}}>₹{recentPaid.tuition_fee?.toLocaleString()}</td></tr>
                <tr><td>Lab Charges</td><td style={{textAlign: 'right'}}>₹{recentPaid.lab_fee?.toLocaleString()}</td></tr>
                <tr><td>Library Fee</td><td style={{textAlign: 'right'}}>₹{recentPaid.library_fee?.toLocaleString()}</td></tr>
                {recentPaid.other_fee > 0 && <tr><td>Miscellaneous</td><td style={{textAlign: 'right'}}>₹{recentPaid.other_fee?.toLocaleString()}</td></tr>}
                <tr className="fin-total-row">
                  <td><strong>Total Amount Paid</strong></td>
                  <td style={{textAlign: 'right'}}><strong>₹{recentPaid.total_amount?.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="fin-receipt-footer">
              <div className="fin-signature">
                <p style={{fontSize: '0.7rem', color: '#9ca3af'}}>Authorized Signature</p>
                <div style={{width: '120px', borderBottom: '1px solid #d1d5db', marginTop: '20px'}}></div>
              </div>
              <div className="fin-paid-stamp">
                <SealCheck size={20} weight="fill" style={{marginRight: '6px'}} />
                PAID
              </div>
            </div>
          </div>
        ) : (
          <div className="fin-empty-row" style={{background: 'white', borderRadius: '16px', padding: '3rem'}}>
            <p>No paid challans available to preview receipts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinReports;
