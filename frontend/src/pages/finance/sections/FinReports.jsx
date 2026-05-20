import React, { useState } from 'react';
import { 
  Download, FilePdf, FileCsv, 
  SealCheck, FileText, Printer, Funnel, MagnifyingGlass
} from "@phosphor-icons/react";

const FinReports = ({ stats = {}, challans = [] }) => {
  const paidChallans = challans.filter(c => c.status === 'paid');
  const [selectedReceiptId, setSelectedReceiptId] = useState(paidChallans[0]?.id || '');

  const recentPaid = paidChallans.find(c => c.id === parseInt(selectedReceiptId)) || paidChallans[0];

  // PRINT SINGLE RECEIPT VOUCHER
  const handlePrintReceipt = (rcp) => {
    if (!rcp) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Payment Receipt - ${rcp.challan_no}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #ffffff; }
            .receipt-container { max-width: 700px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 20px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 24px; }
            .logo-area { display: flex; align-items: center; gap: 12px; }
            .logo-icon { width: 44px; height: 44px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
            .logo-text { font-size: 20px; font-weight: 800; color: #0f172a; }
            .receipt-no { background: #f5f3ff; color: #6366f1; padding: 6px 12px; border-radius: 30px; font-size: 12px; font-weight: 700; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 28px; }
            .info-item { font-size: 13px; color: #64748b; font-weight: 600; }
            .info-item strong { color: #0f172a; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; font-size: 12px; font-weight: 800; color: #64748b; border-bottom: 2px solid #e2e8f0; padding: 12px 8px; text-transform: uppercase; letter-spacing: 0.05em; }
            td { padding: 16px 8px; font-size: 14px; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-weight: 600; }
            .total-row td { border-top: 2px solid #e2e8f0; border-bottom: none; font-size: 16px; color: #0f172a; padding-top: 20px; }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
            .stamp { background: #ecfdf5; color: #10b981; border: 2px solid #10b981; padding: 8px 16px; border-radius: 12px; font-weight: 800; font-size: 14px; transform: rotate(-10deg); text-transform: uppercase; letter-spacing: 0.05em; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="logo-area">
                <div class="logo-icon">LT</div>
                <div class="logo-text">Lancers Tech Institute</div>
              </div>
              <div class="receipt-no">Receipt #: ${rcp.challan_no.replace('FEE', 'RCP')}</div>
            </div>
            
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 24px; font-weight: 800; color: #4f46e5; margin: 0;">FEE PAYMENT RECEIPT</h2>
              <p style="font-size: 13px; color: #64748b; margin: 4px 0 0;">Official computer-generated receipt voucher.</p>
            </div>

            <div class="info-grid">
              <div class="info-item"><strong>Student:</strong> ${rcp.student_name}</div>
              <div class="info-item"><strong>Roll No:</strong> ${rcp.roll_number}</div>
              <div class="info-item"><strong>Academic Year:</strong> ${rcp.academic_year || '2024-25'}</div>
              <div class="info-item"><strong>Payment Date:</strong> ${rcp.paid_date ? new Date(rcp.paid_date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Tuition Fee</td><td style="text-align: right;">Rs. ${rcp.tuition_fee?.toLocaleString()}</td></tr>
                <tr><td>Lab Charges</td><td style="text-align: right;">Rs. ${rcp.lab_fee?.toLocaleString()}</td></tr>
                <tr><td>Library Fee</td><td style="text-align: right;">Rs. ${rcp.library_fee?.toLocaleString()}</td></tr>
                ${rcp.other_fee > 0 ? `<tr><td>Miscellaneous</td><td style="text-align: right;">Rs. ${rcp.other_fee?.toLocaleString()}</td></tr>` : ''}
                <tr class="total-row">
                  <td><strong>Total Amount Paid</strong></td>
                  <td style="text-align: right;"><strong>Rs. ${rcp.total_amount?.toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <div>
                <p style="font-size: 11px; color: #94a3b8; margin-bottom: 24px;">Authorized Digital Signature</p>
                <div style="width: 150px; border-bottom: 2px dashed #cbd5e1;"></div>
              </div>
              <div class="stamp">PAID</div>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // EXPORT SUMMARY LEDGER AS PDF
  const handlePrintSummaryReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Lancers Tech - Financial Statement Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-size: 26px; font-weight: 800; color: #4f46e5; border-bottom: 3px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px; }
            .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .metric-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #f8fafc; }
            .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; }
            .value { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; background: #f1f5f9; padding: 12px; font-size: 11px; font-weight: 800; color: #475569; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; }
            td { padding: 14px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>Financial Statement Summary</h1>
          <p style="font-size: 13px; color: #64748b; margin-top: -10px;">Generated on: ${new Date().toLocaleDateString()}</p>

          <div class="metric-grid">
            <div class="metric-card">
              <div class="label">Total Fees Collected</div>
              <div class="value">Rs. ${(stats.totalRevenue || 0).toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="label">Outstanding Balances</div>
              <div class="value">Rs. ${(stats.pendingFees || 0).toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="label">Operating Margin</div>
              <div class="value">${stats.operatingMargin || 'N/A'}%</div>
            </div>
          </div>

          <h3 style="font-weight: 800; font-size: 16px; margin-top: 30px;">Completed Payment Records</h3>
          <table>
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Student</th>
                <th>Tuition Fee</th>
                <th>Lab Fee</th>
                <th>Library Fee</th>
                <th>Total Paid</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${paidChallans.map(c => `
                <tr>
                  <td>${c.challan_no.replace('FEE', 'RCP')}</td>
                  <td>${c.student_name}</td>
                  <td>Rs. ${c.tuition_fee?.toLocaleString()}</td>
                  <td>Rs. ${c.lab_fee?.toLocaleString()}</td>
                  <td>Rs. ${c.library_fee?.toLocaleString()}</td>
                  <td style="color:#10b981;">Rs. ${c.total_amount?.toLocaleString()}</td>
                  <td>${c.paid_date ? new Date(c.paid_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // EXPORT TRANSACTIONS AS CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Receipt Number,Student Name,Roll Number,Tuition Fee,Lab Fee,Library Fee,Total Amount Paid,Payment Date\n";
    
    paidChallans.forEach(c => {
      const row = [
        c.challan_no.replace('FEE', 'RCP'),
        c.student_name,
        c.roll_number,
        c.tuition_fee,
        c.lab_fee,
        c.library_fee,
        c.total_amount,
        c.paid_date ? new Date(c.paid_date).toLocaleDateString() : 'N/A'
      ].map(v => `"${v}"`).join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LancersTech_Collections_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fin-animate">
      {/* Top Banner Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Financial Statements & Receipts</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Download audited summaries and computer-generated receipts.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handlePrintSummaryReport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <FilePdf size={18} weight="bold" color="#ef4444" /> Export Report Summary
          </button>
          <button 
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <FileCsv size={18} weight="bold" color="#10b981" /> Export Collections CSV
          </button>
        </div>
      </div>

      {/* Main receipt container */}
      <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', border: '1px solid #f1f5f9', boxShadow: 'var(--fin-shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ background: '#f5f3ff', color: '#6366f1', borderRadius: '10px', padding: '8px', display: 'flex' }}><FileText size={20} weight="duotone" /></div>
             <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Receipt Voucher Viewer</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {paidChallans.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 12px' }}>
                <Funnel size={16} color="#64748b" />
                <select 
                  value={selectedReceiptId} 
                  onChange={(e) => setSelectedReceiptId(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 700, color: '#0f172a', fontSize: '13px', cursor: 'pointer' }}
                >
                  {paidChallans.map(c => (
                    <option key={c.id} value={c.id}>{c.student_name} ({c.challan_no.replace('FEE', 'RCP')})</option>
                  ))}
                </select>
              </div>
            )}
            {recentPaid && (
              <button 
                onClick={() => handlePrintReceipt(recentPaid)}
                className="fin-add-btn" 
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', boxShadow: 'none' }}
              >
                <Printer size={16} weight="bold" /> Print Receipt
              </button>
            )}
          </div>
        </div>
        
        {recentPaid ? (
          <div className="fin-receipt-card fin-animate">
            <div className="fin-receipt-org">
              <div className="fin-receipt-logo">LT</div>
              <div className="fin-receipt-org-info">
                <h4>Lancers Tech Institute</h4>
                <p>123 Education Street, Knowledge Park</p>
                <p>UAN: 111-000-789 | NTN: 1234567-8</p>
              </div>
            </div>
            
            <div className="fin-receipt-title">
              <div>
                <h2>FEE PAYMENT RECEIPT</h2>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: '600' }}>Official Audited Invoice Voucher</div>
              </div>
              <div className="fin-receipt-no">Receipt #: {recentPaid.challan_no.replace('FEE', 'RCP')}</div>
            </div>
 
            <div className="fin-receipt-info">
              <div><strong>Student Name:</strong><br />{recentPaid.student_name}</div>
              <div><strong>Roll Number:</strong><br />{recentPaid.roll_number}</div>
              <div><strong>Academic Year:</strong><br />{recentPaid.academic_year || '2024-25'}</div>
              <div><strong>Payment Date:</strong><br />{recentPaid.paid_date ? new Date(recentPaid.paid_date).toLocaleDateString() : 'N/A'}</div>
            </div>
 
            <table className="fin-receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{textAlign: 'right'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Tuition Fee</td><td style={{textAlign: 'right', fontWeight: '700'}}>Rs. {(recentPaid.tuition_fee || 0).toLocaleString()}</td></tr>
                <tr><td>Lab Charges</td><td style={{textAlign: 'right', fontWeight: '700'}}>Rs. {(recentPaid.lab_fee || 0).toLocaleString()}</td></tr>
                <tr><td>Library Fee</td><td style={{textAlign: 'right', fontWeight: '700'}}>Rs. {(recentPaid.library_fee || 0).toLocaleString()}</td></tr>
                {recentPaid.other_fee > 0 && <tr><td>Miscellaneous Fee</td><td style={{textAlign: 'right', fontWeight: '700'}}>Rs. {(recentPaid.other_fee || 0).toLocaleString()}</td></tr>}
                <tr className="fin-total-row">
                  <td><strong>Total Amount Paid</strong></td>
                  <td style={{textAlign: 'right', color: '#10b981'}}><strong>Rs. {(recentPaid.total_amount || 0).toLocaleString()}</strong></td>
                </tr>
              </tbody>
            </table>
 
            <div className="fin-receipt-footer">
              <div className="fin-signature">
                <p style={{fontSize: '11px', color: '#94a3b8', margin: '0 0 16px 0', fontWeight: '600'}}>Authorized Digital Signature</p>
                <div style={{width: '160px', borderBottom: '2px dashed #cbd5e1'}}></div>
              </div>
              <div className="fin-paid-stamp">
                <SealCheck size={18} weight="fill" style={{marginRight: '6px'}} />
                PAID
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '4rem', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>No paid challans available to preview receipts.</p>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default FinReports;
