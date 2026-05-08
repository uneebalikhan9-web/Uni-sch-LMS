import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldCheck, Key, DotsThreeVertical, Trash } from '@phosphor-icons/react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';

const UserAccess = ({ onBulkImport, onRefresh, onEdit }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/it/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDelete(false);
      onRefresh();
      fetchUsers();
    } catch (err) { console.error('Error deleting user', err); }
  };

  return (
    <div className="user-access-section">
      <div className="it-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>User Accounts & Roles</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '10px 20px', borderRadius: 12, border: '1px solid var(--it-border)', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>
            <Key size={18} weight="bold" /> Permission Matrix
          </button>
          <button onClick={onBulkImport} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--it-primary)', color: 'white', padding: '10px 20px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            <UserPlus size={18} weight="bold" /> Bulk Import
          </button>
        </div>
      </div>

      <div className="it-card">
        <div className="it-table-container">
          <table className="it-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Role</th>
                <th>System Access</th>
                <th>MFA Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--it-primary)' }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--it-text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.role}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, background: 'var(--it-success)', borderRadius: '50%' }}></div>
                      <span style={{ fontSize: '0.85rem' }}>Active</span>
                    </div>
                  </td>
                  <td>
                    <ShieldCheck size={20} color={user.mfa_enabled ? 'var(--it-success)' : '#cbd5e1'} weight={user.mfa_enabled ? 'bold' : 'regular'} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => onEdit(user)} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}>
                        <DotsThreeVertical size={20} weight="bold" />
                      </button>
                      <button onClick={() => { setSelectedUser(user); setShowDelete(true); }} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash size={20} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDelete && <DeleteConfirmModal onClose={() => setShowDelete(false)} onConfirm={handleDelete} itemName={selectedUser?.name} />}
    </div>
  );
};

export default UserAccess;
