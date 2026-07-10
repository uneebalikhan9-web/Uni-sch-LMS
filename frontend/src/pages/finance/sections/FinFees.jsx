import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlass, Printer, Envelope, 
  CheckCircle, Receipt, Trash, CalendarBlank
} from "@phosphor-icons/react";
import API_BASE_URL from '../../../config/api';

const StatusBadge = ({ status }) => {
  const statusClass = `fin-badge fin-badge-${status.toLowerCase()}`;
  return <span className={statusClass}>{status.toUpperCase()}</span>;
};

const FinFees = ({ challans, onAction, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [semesters, setSemesters] = useState([]);
  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedSem, setSelectedSem] = useState('');
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/finance/semesters`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.semesters) {
        setSemesters(data.semesters);
        if (data.semesters.length > 0) setSelectedSem(data.semesters[0].id);
      }
    });
  }, []);

  const handleGenerateSemesterChallans = async () => {
    if (!selectedSem) return;
    setGenLoading(true);
    const success = await onAction('POST', '/challans/generate-semester', { semester_id: selectedSem });
    setGenLoading(false);
    if (success) {
      setShowGenModal(false);
    }
  };

  const filteredChallans = challans.filter(c => {
    const matchesSearch = c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.challan_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.roll_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id, status) => {
    await onAction('PUT', `/challans/${id}/status`, { status });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this challan?')) {
      await onAction('DELETE', `/challans/${id}`);
    }
  };

  const handleSendReminder = async (id) => {
    await onAction('POST', `/challans/${id}/remind`);
  };

  const handlePrintChallan = (c) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Fee Challan - ${c.challan_no}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; }
            .voucher-container { max-width: 800px; margin: 0 auto; background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: 800; color: var(--primary-color, #4f46e5); }
            .badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; background: #dcfce7; color: #15803d; }
            .badge.pending { background: #fef9c3; color: #a16207; }
            .badge.overdue { background: #fee2e2; color: #b91c1c; }
            .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 12px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
            .info-item { background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #f1f5f9; }
            .info-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
            .info-val { font-size: 14px; font-weight: 700; color: #0f172a; }
            .fees-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .fees-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
            .fees-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
            .total-row { background: #eef2ff; font-weight: 800; color: var(--primary-color, #4f46e5); }
            .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
            .signature { text-align: center; width: 150px; }
            .signature-line { border-bottom: 1px solid #94a3b8; margin-bottom: 8px; height: 30px; }
            .signature-label { font-size: 11px; color: #64748b; }
            @media print {
              body { background: white; padding: 0; }
              .voucher-container { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="voucher-container">
            <div class="header">
              <div>
                <div class="logo">LANCERS <span style="color:#a5b4fc">TECH</span></div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Lancers Tech Institute of Technology & Sciences</div>
              </div>
              <div>
                <span class="badge ${c.status}">${c.status}</span>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">OFFICIAL FEE CHALLAN VOUCHER</h2>
              <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Challan No: <strong>${c.challan_no}</strong></div>
            </div>

            <div class="section-title">Student Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Student Name</div>
                <div class="info-val">${c.student_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Roll Number</div>
                <div class="info-val">${c.roll_number}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Semester / Session</div>
                <div class="info-val">${c.semester || 'N/A'} (${c.academic_year || 'N/A'})</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-val">${c.student_email || 'N/A'}</div>
              </div>
            </div>

            <div class="section-title">Fee Particulars</div>
            <table class="fees-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th style="text-align: right;">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tuition Fee</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(c.tuition_fee || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Lab Charges</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(c.lab_fee || 0).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Library Fee</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(c.library_fee || 0).toLocaleString()}</td>
                </tr>
                ${c.other_fee > 0 ? `
                <tr>
                  <td>Miscellaneous Charges</td>
                  <td style="text-align: right; font-weight: 600;">Rs. ${(c.other_fee || 0).toLocaleString()}</td>
                </tr>
                ` : ''}
                ${c.discount_amount > 0 ? `
                <tr style="color: #10b981; font-weight: 600;">
                  <td>Scholarship Discount</td>
                  <td style="text-align: right;">- Rs. ${(c.discount_amount || 0).toLocaleString()}</td>
                </tr>
                ` : ''}
                ${c.accrued_late_fee > 0 ? `
                <tr style="color: #ef4444; font-weight: 600;">
                  <td>Accrued Late Surcharge</td>
                  <td style="text-align: right;">+ Rs. ${(c.accrued_late_fee || 0).toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td>Total Amount Payable</td>
                  <td style="text-align: right; font-size: 16px;">Rs. ${(c.total_amount + (c.accrued_late_fee || 0)).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 30px;">
              <strong>Important Notes:</strong><br/>
              1. Please deposit the fee in any designated bank branch before the due date: <strong>${new Date(c.due_date).toLocaleDateString()}</strong>.<br/>
              2. Late fee surcharge of Rs. ${c.late_fee_per_day || 100}/day will be applicable after the due date.<br/>
              3. This is a computer-generated voucher and does not require manual signature unless stamped by the cashier.
            </div>

            <div class="footer">
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Student Signature</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Cashier / Stamp</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Officer</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fin-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Fee Challan Management</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => setShowGenModal(true)} 
            style={{ 
              padding: '10px 16px', 
              background: 'var(--fin-primary, #4f46e5)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' 
            }}
          >
            <CalendarBlank size={18} weight="bold" /> Auto-Generate Dues
          </button>

          <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <MagnifyingGlass size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search student or challan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '10px', outline: 'none', width: '220px', fontSize: '0.85rem' }}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#475569', fontWeight: 600, outline: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="waived">Waived</option>
          </select>
        </div>
      </div>

      <div className="fin-table-wrap">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No</th>
              <th>Challan ID</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChallans.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="fin-cell">
                    <div className="fin-avatar">{c.student_name?.charAt(0)}</div>
                    <div className="fin-name">{c.student_name}</div>
                  </div>
                </td>
                <td>{c.roll_number}</td>
                <td style={{fontWeight: '600', color: 'var(--fin-primary)'}}>{c.challan_no}</td>
                <td className="fin-net">
                  <div>Rs. {(c.total_amount + (c.accrued_late_fee || 0)).toLocaleString()}</div>
                  {c.discount_amount > 0 && (
                    <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                      - Rs. {parseFloat(c.discount_amount).toLocaleString()} (Scholarship)
                    </div>
                  )}
                  {c.accrued_late_fee > 0 && (
                    <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>
                      + Rs. {parseFloat(c.accrued_late_fee).toLocaleString()} (Late fee)
                    </div>
                  )}
                </td>
                <td>{new Date(c.due_date).toLocaleDateString()}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    {c.status !== 'paid' && (
                      <button style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Mark as Paid" onClick={() => handleUpdateStatus(c.id, 'paid')}>
                        <CheckCircle size={18} weight="bold" />
                      </button>
                    )}
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Print Challan" onClick={() => handlePrintChallan(c)}>
                      <Printer size={18} weight="duotone" />
                    </button>
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Send Reminder" onClick={() => handleSendReminder(c.id)}>
                      <Envelope size={18} weight="duotone" />
                    </button>
                    <button style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Delete" onClick={() => handleDelete(c.id)}>
                      <Trash size={18} weight="duotone" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredChallans.length === 0 && (
              <tr className="fin-empty-row">
                <td colSpan="7">No fee records found matching your filters</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showGenModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setShowGenModal(false)}>
          <div style={{ background: 'white', borderRadius: 24, padding: '2.5rem', width: '90%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem 0' }}>Auto-Generate Semester Dues</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Select a semester term to automatically calculate and generate tuition and registration fee challans for all enrolled students based on their registered credit hours.</p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Select Semester Term</label>
              <select 
                value={selectedSem} 
                onChange={(e) => setSelectedSem(e.target.value)} 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#0f172a', outline: 'none' }}
              >
                {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setShowGenModal(false)} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleGenerateSemesterChallans} disabled={genLoading} style={{ padding: '10px 20px', background: 'var(--fin-primary, #4f46e5)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                {genLoading ? 'Calculating...' : 'Generate Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinFees;
