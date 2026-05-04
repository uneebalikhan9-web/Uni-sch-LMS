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
      <div className="fin-section-header">
        <h2>Fee Challan Management</h2>
        <div className="fin-section-actions">
          <div className="fin-search-box">
            <MagnifyingGlass size={18} />
            <input 
              type="text" 
              placeholder="Search by student, roll no or challan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="fin-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
                  <div className="fin-action-icons" style={{justifyContent: 'flex-end'}}>
                    {c.status !== 'paid' && (
                      <button className="fin-icon-btn" title="Mark as Paid" onClick={() => handleUpdateStatus(c.id, 'paid')}>
                        <CheckCircle size={18} weight="bold" />
                      </button>
                    )}
                    <button className="fin-icon-btn" title="Print Challan">
                      <Printer size={18} />
                    </button>
                    <button className="fin-icon-btn" title="Send Reminder">
                      <Envelope size={18} />
                    </button>
                    <button className="fin-icon-btn del" title="Delete" onClick={() => handleDelete(c.id)}>
                      <Trash size={18} />
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
