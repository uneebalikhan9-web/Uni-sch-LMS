import React from 'react';
import { 
  Download, FilePdf, FileCsv, 
  Printer, SealCheck
} from "@phosphor-icons/react";

const FinReports = ({ stats, challans }) => {
  
  // Sample logic for most recent paid challan as a preview
  const recentPaid = challans.find(c => c.status === 'paid') || challans[0];

  return (
    <div className="fin-animate">
      <div className="fin-section-header">
        <h2>Financial Reports & Receipts</h2>
        <div className="fin-section-actions">
          <button className="fin-action-btn">
            <FilePdf size={18} /> Export PDF
          </button>
          <button className="fin-action-btn" style={{background: '#065f46'}}>
            <FileCsv size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="fin-receipt-wrap">
        <div className="fin-receipt-header">
          <h3>📄 Recent Receipt Template</h3>
          <button className="fin-icon-btn"><Download size={18} /> Download</button>
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
