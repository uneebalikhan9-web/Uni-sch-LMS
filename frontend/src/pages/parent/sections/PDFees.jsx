import React, { useState, useEffect } from 'react';
import { S } from './PDStyles';
import API_BASE_URL from '../../../config/api';
import { CurrencyDollar, Receipt, FileText } from '@phosphor-icons/react';

export default function PDFees({ student }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    const token = sessionStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/parent/fees/${student.student_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setFees(d.challans || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [student]);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading fees...</div>;

  return (
    <div className="animate-fadeIn">
      <div style={{ ...S.card, padding: '35px', background: 'linear-gradient(145deg, #ffffff, #f8fafc)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Receipt size={24} color="#3b82f6" weight="duotone" /> Fee Challans
        </h3>
        
        {fees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <FileText size={48} weight="duotone" />
            <p style={{ marginTop: '12px', fontWeight: 600 }}>No fee records found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Challan Title</th>
                  <th style={S.th}>Amount</th>
                  <th style={S.th}>Due Date</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((challan, idx) => (
                  <tr key={idx} className="hover-lift" style={{ cursor: 'default' }}>
                    <td style={{ ...S.td, ...S.tdFirst }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                          <CurrencyDollar size={20} weight="bold" />
                        </div>
                        <span style={{ fontWeight: 700 }}>{challan.title}</span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        Rs. {Number(challan.amount).toLocaleString()}
                      </span>
                    </td>
                    <td style={S.td}>
                      {new Date(challan.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ ...S.td, ...S.tdLast }}>
                      {challan.status === 'paid' ? (
                        <span style={{ ...S.badge, background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>PAID</span>
                      ) : challan.status === 'unpaid' ? (
                        <span style={{ ...S.badge, background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>UNPAID</span>
                      ) : (
                        <span style={{ ...S.badge, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{challan.status.toUpperCase()}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
