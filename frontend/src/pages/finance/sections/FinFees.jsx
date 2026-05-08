import React, { useState } from 'react';
import { 
  MagnifyingGlass, Printer, Envelope, 
  CheckCircle, Receipt, Trash
} from "@phosphor-icons/react";

const StatusBadge = ({ status }) => {
  const statusClass = `fin-badge fin-badge-${status.toLowerCase()}`;
  return <span className={statusClass}>{status.toUpperCase()}</span>;
};

const FinFees = ({ challans, onAction, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  return (
    <div className="fin-animate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Fee Challan Management</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                <td className="fin-net">₹{c.total_amount.toLocaleString()}</td>
                <td>{new Date(c.due_date).toLocaleDateString()}</td>
                <td><StatusBadge status={c.status} /></td>
                <td>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                    {c.status !== 'paid' && (
                      <button style={{ background: '#ecfdf5', color: '#10b981', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Mark as Paid" onClick={() => handleUpdateStatus(c.id, 'paid')}>
                        <CheckCircle size={18} weight="bold" />
                      </button>
                    )}
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Print Challan">
                      <Printer size={18} weight="duotone" />
                    </button>
                    <button style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }} title="Send Reminder">
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
    </div>
  );
};

export default FinFees;
