import React from 'react';
import { UserCirclePlus, MagnifyingGlass, UserCircle, IdentificationCard } from '@phosphor-icons/react';

const LibraryMembers = ({ members, onAdd, onViewHistory }) => {
  const currentMembers = members || [];

  return (
    <div className="members-section animate-fadeIn">
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: '400px', marginBottom: 0 }}>
          <MagnifyingGlass size={20} color="#64748b" weight="bold" />
          <input type="text" placeholder="Search members by name or ID..." />
        </div>
        <button className="primary-btn" onClick={onAdd}>
          <UserCirclePlus size={18} weight="bold" /> New Membership
        </button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
          <thead>
            <tr>
              <th>Member ID</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Books Held</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentMembers.map((member) => (
              <tr key={member.id}>
                <td style={{ color: '#0891b2', fontWeight: 800 }}>MEM-{member.id.toString().padStart(3, '0')}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <UserCircle size={32} weight="duotone" color="#94a3b8" />
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{member.name}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: '#475569' }}>{member.role}</td>
                <td style={{ fontWeight: 600, color: '#475569' }}>{member.department}</td>
                <td style={{ textAlign: 'center', fontWeight: 900, color: '#0f172a' }}>0</td>
                <td>
                  <span className={`status-badge status-${member.status === 'Active' ? 'available' : 'issued'}`}>
                    {member.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => onViewHistory(member)}
                    style={{ background: 'transparent', border: 'none', color: '#0891b2', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default LibraryMembers;
