import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlass, Printer, Envelope, 
  CheckCircle, Receipt, Trash, CalendarBlank, Warning, Plus, CurrencyDollar, X, Check
} from "@phosphor-icons/react";
import API_BASE_URL from '../../../config/api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const StatusBadge = ({ status }) => {
  const statusClass = `fin-badge fin-badge-${(status || 'pending').toLowerCase()}`;
  return (
    <span className={statusClass}>
      {status === 'paid' ? '✓ PAID' : status === 'overdue' ? '⚠️ OVERDUE' : '⏳ PENDING'}
    </span>
  );
};

const FinFees = ({ challans = [], onAction, onEdit, isCollege = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [feeSubTab, setFeeSubTab] = useState('challans'); // 'challans' | 'admissions'
  
  // Admission inquiries
  const [admissionInquiries, setAdmissionInquiries] = useState([]);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);

  // Monthly generation state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genLoading, setGenLoading] = useState(false);

  // Fast Cash Pay Modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayChallan, setSelectedPayChallan] = useState(null);
  const [payMethod, setPayMethod] = useState('Cash Counter');
  const [payingLoading, setPayingLoading] = useState(false);

  const fetchAdmissionInquiries = async () => {
    try {
      setAdmissionsLoading(true);
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/finance/admission-inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAdmissionInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error('Error fetching admission inquiries:', err);
    } finally {
      setAdmissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissionInquiries();
  }, []);

  const handleClearAdmissionFee = async (inquiryId) => {
    if (!window.confirm('Verify and mark admission fee as PAID for this student?')) return;
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/finance/admission-clearance/${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ payment_method: 'Finance Cash Desk' })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Fee verified and forwarded to Principal!');
        fetchAdmissionInquiries();
      } else {
        alert(data.message || 'Error clearing fee');
      }
    } catch (e) {
      alert('Failed to clear fee');
    }
  };

  const handleGenerateMonthlyChallans = async () => {
    setGenLoading(true);
    const success = await onAction('POST', '/challans/generate-monthly', {
      month: genMonth,
      year: genYear
    });
    setGenLoading(false);
    if (success) {
      setShowGenModal(false);
    }
  };

  const handleOpenPayModal = (challan) => {
    setSelectedPayChallan(challan);
    setShowPayModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayChallan) return;
    setPayingLoading(true);
    const success = await onAction('PUT', `/challans/${selectedPayChallan.id}/status`, {
      status: 'paid',
      payment_method: payMethod
    });
    setPayingLoading(false);
    if (success) {
      setShowPayModal(false);
      setSelectedPayChallan(null);
    }
  };

  // PRINT 3-COPY OFFICIAL COLLEGE CHALLAN
  const handlePrint3CopyChallan = (c) => {
    const printWindow = window.open('', '_blank');
    const monthName = MONTHS[(c.fee_month || 1) - 1] || 'Current';

    printWindow.document.write(`
      <html>
        <head>
          <title>College Fee Voucher - ${c.challan_no || c.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b; background: #ffffff; }
            .copies-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1100px; margin: 0 auto; }
            .copy-box { border: 1.5px dashed #94a3b8; border-radius: 12px; padding: 16px; font-size: 11px; display: flex; flex-direction: column; justify-content: space-between; background: #fafafa; }
            .header { text-align: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 8px; }
            .school-name { font-size: 13px; font-weight: 900; color: #0f172a; }
            .copy-tag { display: inline-block; margin-top: 4px; padding: 2px 8px; border-radius: 4px; background: #e2e8f0; font-weight: 800; font-size: 9px; }
            .meta-grid { display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 8px; }
            .meta-row { display: flex; justify-content: space-between; }
            .meta-label { color: #64748b; }
            .meta-val { font-weight: 700; color: #0f172a; }
            .fees-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
            .fees-table td { padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
            .total-row { font-weight: 900; font-size: 12px; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 6px; }
            .footer { display: flex; justify-content: space-between; margin-top: 16px; padding-top: 10px; border-top: 1px dashed #94a3b8; font-size: 9px; }
            @media print {
              body { padding: 0; background: white; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">🖨️ Print 3-Copy Voucher</button>
          </div>

          <div class="copies-grid">
            ${['BANK COPY', 'COLLEGE ACCOUNTS COPY', 'PARENT / STUDENT COPY'].map(title => `
              <div class="copy-box">
                <div>
                  <div class="header">
                    <div class="school-name">LANCERS TECH COLLEGE</div>
                    <div style="font-size: 10px; color: #64748b; font-weight: 700;">MONTHLY FEE VOUCHER</div>
                    <div class="copy-tag">${title}</div>
                  </div>

                  <div class="meta-grid">
                    <div class="meta-row"><span class="meta-label">Challan No:</span><span class="meta-val">${c.challan_no || 'SCH-' + c.id}</span></div>
                    <div class="meta-row"><span class="meta-label">Fee Month:</span><span class="meta-val">${monthName} ${c.fee_year || new Date().getFullYear()}</span></div>
                    <div class="meta-row"><span class="meta-label">Due Date:</span><span class="meta-val" style="color: #b91c1c;">${c.due_date ? new Date(c.due_date).toLocaleDateString() : '10th of Month'}</span></div>
                    <div class="meta-row"><span class="meta-label">Student:</span><span class="meta-val">${c.student_name || 'Enrolled Student'}</span></div>
                    <div class="meta-row"><span class="meta-label">Roll No:</span><span class="meta-val">${c.roll_number || '—'}</span></div>
                    <div class="meta-row"><span class="meta-label">Class:</span><span class="meta-val" style="color: #4f46e5;">${c.class_name || c.program_name || 'Class Grade'}</span></div>
                  </div>

                  <table class="fees-table">
                    <tr><td>Tuition Fee:</td><td style="text-align: right; font-weight: 700;">Rs. ${(parseFloat(c.tuition_fee) || 0).toLocaleString()}</td></tr>
                    ${c.transport_fee > 0 ? `<tr><td>Transport Fee:</td><td style="text-align: right; font-weight: 700;">Rs. ${(parseFloat(c.transport_fee)).toLocaleString()}</td></tr>` : ''}
                    ${c.computer_fee > 0 ? `<tr><td>Computer / Lab:</td><td style="text-align: right; font-weight: 700;">Rs. ${(parseFloat(c.computer_fee)).toLocaleString()}</td></tr>` : ''}
                    ${c.activity_fee > 0 ? `<tr><td>Activity / Exam:</td><td style="text-align: right; font-weight: 700;">Rs. ${(parseFloat(c.activity_fee)).toLocaleString()}</td></tr>` : ''}
                    ${c.accrued_late_fee > 0 ? `<tr><td style="color: #b91c1c;">Late Fine:</td><td style="text-align: right; font-weight: 700; color: #b91c1c;">+ Rs. ${(parseFloat(c.accrued_late_fee)).toLocaleString()}</td></tr>` : ''}
                    <tr class="total-row"><td>TOTAL PAYABLE:</td><td style="text-align: right;">Rs. ${(parseFloat(c.total_amount) || 0).toLocaleString()}</td></tr>
                  </table>
                </div>

                <div class="footer">
                  <div style="text-align: center;"><div style="border-top: 1px solid #94a3b8; width: 80px; margin-top: 20px;"></div>Cashier / Bank</div>
                  <div style="text-align: center;"><div style="border-top: 1px solid #94a3b8; width: 80px; margin-top: 20px;"></div>Authorized Officer</div>
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredChallans = challans.filter(c => {
    const matchesSearch = 
      (c.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.roll_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.challan_no || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (c.status || '').toLowerCase() === filterStatus.toLowerCase();
    const matchesClass = filterClass === 'all' || (c.class_name || '').toLowerCase() === filterClass.toLowerCase();
    return matchesSearch && matchesStatus && matchesClass;
  });

  const uniqueClasses = Array.from(new Set(challans.map(c => c.class_name).filter(Boolean)));

  return (
    <div className="fin-animate">
      
      {/* Top Header & Sub-Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            🏫 College Monthly Fee Register
          </h2>
          
          <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '12px', padding: '4px', gap: '4px' }}>
            <button
              onClick={() => setFeeSubTab('challans')}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                background: feeSubTab === 'challans' ? '#ffffff' : 'transparent',
                color: feeSubTab === 'challans' ? '#0f172a' : '#64748b',
                fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
                boxShadow: feeSubTab === 'challans' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📄 Monthly Fee Register ({challans.length})
            </button>
            <button
              onClick={() => { setFeeSubTab('admissions'); fetchAdmissionInquiries(); }}
              style={{
                padding: '6px 14px', borderRadius: '8px', border: 'none',
                background: feeSubTab === 'admissions' ? 'var(--primary-color, #4f46e5)' : 'transparent',
                color: feeSubTab === 'admissions' ? '#ffffff' : '#64748b',
                fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
                boxShadow: feeSubTab === 'admissions' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              🎓 New Admission Fee Clearance
              {admissionInquiries.filter(a => a.fee_status !== 'paid').length > 0 && (
                <span style={{ padding: '2px 6px', borderRadius: '6px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '900' }}>
                  {admissionInquiries.filter(a => a.fee_status !== 'paid').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={async () => {
              if (window.confirm('Calculate and apply late fee fines to all overdue school challans?')) {
                await onAction('POST', '/challans/apply-late-fines');
              }
            }}
            style={{ 
              padding: '10px 16px', 
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
            }}
            title="Auto-calculate late fees for overdue challans"
          >
            <Warning size={18} weight="bold" /> Calculate Fines
          </button>

          <button 
            onClick={() => setShowGenModal(true)}
            style={{ 
              padding: '10px 18px', 
              background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 4px 12px rgba(var(--primary-rgb, 79, 70, 229), 0.3)'
            }}
          >
            <Plus size={18} weight="bold" /> Generate Monthly Dues
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. ADMISSION INQUIRIES CLEARANCE TAB                     */}
      {/* ======================================================== */}
      {feeSubTab === 'admissions' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                New Admission Fee Inquiries & Clearance Desk
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Verify admission fee payment and forward applicant directly to Principal for Section & Roll No allotment.
              </p>
            </div>
            <button
              onClick={fetchAdmissionInquiries}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
            >
              🔄 Refresh List
            </button>
          </div>

          {admissionsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading inquiries...</div>
          ) : admissionInquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No admission inquiries found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>STUDENT NAME</th>
                    <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>FATHER NAME</th>
                    <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>GRADE / CLASS</th>
                    <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>CAMPUS</th>
                    <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>FEE AMOUNT</th>
                    <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem' }}>STATUS</th>
                    <th style={{ padding: '12px 14px', color: '#64748b', fontWeight: '700', fontSize: '0.75rem', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {admissionInquiries.map(inq => (
                    <tr key={inq.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>{inq.full_name}</td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>{inq.father_name || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', fontWeight: '700', color: '#334155' }}>
                          {inq.target_class || inq.program}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{inq.campus_name || 'Main Campus'}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a' }}>
                        Rs. {(inq.admission_fee || 5000).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {inq.fee_status === 'paid' ? (
                          <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#dcfce7', color: '#166534', fontWeight: '800', fontSize: '0.75rem' }}>
                            ✓ Fee Paid
                          </span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#fef3c7', color: '#92400e', fontWeight: '800', fontSize: '0.75rem' }}>
                            ● Pending Payment
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {inq.fee_status !== 'paid' ? (
                          <button
                            onClick={() => handleClearAdmissionFee(inq.id)}
                            style={{
                              padding: '6px 14px', borderRadius: '8px', border: 'none',
                              background: '#10b981', color: '#fff', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(16,185,129,0.3)'
                            }}
                          >
                            ✓ Clear Fee & Forward
                          </button>
                        ) : (
                          <span style={{ color: '#0284c7', fontWeight: '700', fontSize: '0.78rem' }}>
                            In Principal Review
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MONTHLY FEE REGISTER & TABLE                          */}
      {/* ======================================================== */}
      {feeSubTab === 'challans' && (
        <>
          {/* Filters Bar */}
          <div className="fin-filters-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div className="fin-search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <MagnifyingGlass size={18} className="fin-search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search by student, roll number, or challan #..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.85rem', fontWeight: 600, color: '#334155', outline: 'none' }}
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">✓ Paid Challans</option>
              <option value="pending">⏳ Pending Challans</option>
              <option value="overdue">⚠️ Overdue Defaulters</option>
            </select>

            {uniqueClasses.length > 0 && (
              <select 
                value={filterClass} 
                onChange={(e) => setFilterClass(e.target.value)}
                style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.85rem', fontWeight: 600, color: '#334155', outline: 'none' }}
              >
                <option value="all">All Classes & Grades</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            )}
          </div>

          {/* Challans Table */}
          <div className="fin-table-wrap">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Student Info</th>
                  <th>Class / Grade</th>
                  <th>Fee Month</th>
                  <th>Tuition Fee</th>
                  <th>Add-ons & Fines</th>
                  <th>Total Payable</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChallans.length > 0 ? (
                  filteredChallans.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {c.challan_no || `SCH-${c.id}`}
                      </td>
                      <td>
                        <div className="fin-name">{c.student_name || 'Enrolled Student'}</div>
                        <div className="fin-sub">Roll: {c.roll_number || '—'}</div>
                      </td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', fontWeight: '700', color: '#334155', fontSize: '0.78rem' }}>
                          {c.class_name || c.program_name || 'Class Grade'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {MONTHS[(c.fee_month || 1) - 1] || 'Monthly'} {c.fee_year || new Date().getFullYear()}
                      </td>
                      <td>Rs. {(parseFloat(c.tuition_fee) || 0).toLocaleString()}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          + Rs. {((parseFloat(c.transport_fee) || 0) + (parseFloat(c.computer_fee) || 0) + (parseFloat(c.activity_fee) || 0) + (parseFloat(c.accrued_late_fee) || 0)).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                        Rs. {(parseFloat(c.total_amount) || 0).toLocaleString()}
                      </td>
                      <td style={{ color: c.status === 'overdue' ? '#b91c1c' : '#64748b', fontWeight: c.status === 'overdue' ? 800 : 500 }}>
                        {c.due_date ? new Date(c.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {c.status !== 'paid' && (
                            <button 
                              className="fin-btn-pay" 
                              onClick={() => handleOpenPayModal(c)}
                              style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                              title="Collect Fee Payment"
                            >
                              <CurrencyDollar size={16} weight="bold" /> Collect
                            </button>
                          )}
                          <button 
                            className="fin-btn-icon" 
                            onClick={() => handlePrint3CopyChallan(c)}
                            style={{ padding: '6px 10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                            title="Print 3-Copy Fee Voucher"
                          >
                            <Printer size={15} weight="duotone" /> Print
                          </button>
                          <button 
                            className="fin-btn-icon" 
                            onClick={() => onAction('POST', `/challans/${c.id}/remind`)}
                            style={{ padding: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                            title="Send SMS / Email Fee Reminder"
                          >
                            <Envelope size={15} weight="duotone" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="fin-empty-row">
                    <td colSpan="10" style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                      <Receipt size={48} weight="duotone" style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>No Fee Challans Found</div>
                      <div style={{ fontSize: '0.85rem' }}>
                        Click <strong>"+ Generate Monthly Dues"</strong> above to generate monthly fee challans for all school classes.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 3. GENERATE MONTHLY DUES MODAL (COLLEGE)                  */}
      {/* ======================================================== */}
      {showGenModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Auto-Generate Monthly College Dues</h3>
              <button onClick={() => setShowGenModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '20px', lineHeight: '1.4' }}>
              Calculates Tuition, Transport, Computer & Activity fees based on each grade's fee structure and generates printable 3-copy challans for all enrolled students.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Billing Month</label>
                <select 
                  value={genMonth} 
                  onChange={(e) => setGenMonth(parseInt(e.target.value))} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                >
                  {MONTHS.map((m, idx) => <option key={m} value={idx + 1}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Billing Year</label>
                <select 
                  value={genYear} 
                  onChange={(e) => setGenYear(parseInt(e.target.value))} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}
                >
                  {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowGenModal(false)} style={{ padding: '10px 18px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handleGenerateMonthlyChallans} 
                disabled={genLoading} 
                style={{ padding: '10px 22px', background: 'var(--primary-color, #4f46e5)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={16} weight="bold" /> {genLoading ? 'Generating...' : 'Generate Monthly Dues'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FAST CASH COLLECT MODAL                               */}
      {/* ======================================================== */}
      {showPayModal && selectedPayChallan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Fee Payment Collection</h3>
              <button onClick={() => setShowPayModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Student:</span>
                <strong style={{ color: '#0f172a' }}>{selectedPayChallan.student_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Class & Roll:</span>
                <strong>{selectedPayChallan.class_name || 'Class'} (Roll: {selectedPayChallan.roll_number || '—'})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px', fontSize: '1rem', fontWeight: 800 }}>
                <span>Total Amount Due:</span>
                <span style={{ color: '#166534' }}>Rs. {(parseFloat(selectedPayChallan.total_amount) || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Payment Mode</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.85rem', outline: 'none' }}
              >
                <option value="Cash Counter">Cash at Counter</option>
                <option value="Bank Deposit Slip">Bank Deposit Challan</option>
                <option value="Online / Mobile Banking">Online Banking Transfer</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowPayModal(false)} style={{ padding: '10px 16px', background: 'white', border: '1px solid #cbd5e1', color: '#64748b', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handleConfirmPayment}
                disabled={payingLoading}
                style={{ padding: '10px 22px', background: '#10b981', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={18} weight="bold" /> {payingLoading ? 'Processing...' : 'Mark Fee as PAID'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinFees;
