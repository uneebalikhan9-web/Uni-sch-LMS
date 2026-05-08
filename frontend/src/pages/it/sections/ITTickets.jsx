import React, { useState } from 'react';
import { Ticket, Plus, MagnifyingGlass, Funnel, ChatCircleText } from '@phosphor-icons/react';

const ITTickets = ({ tickets, onRefresh, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentTickets = (tickets || []).filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/it/tickets/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
  };

  return (
    <div className="it-tickets-section">
      <div className="it-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <MagnifyingGlass size={20} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} weight="bold" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              className="it-input" 
              style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: 12, border: '1px solid var(--it-border)', outline: 'none' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', padding: '8px 16px', borderRadius: 10, border: '1px solid var(--it-border)', fontWeight: 700, color: '#64748b' }}>
            <Funnel size={18} /> Filter
          </button>
        </div>
        <button onClick={onAdd} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--it-primary)', color: 'white', padding: '10px 20px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={18} weight="bold" /> New Ticket
        </button>
      </div>

      <div className="it-card">
        <div className="it-table-container">
          <table className="it-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td style={{ color: 'var(--it-primary)', fontWeight: 800 }}>#TK-{ticket.id}</td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{ticket.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)' }}>{ticket.description?.substring(0, 40)}...</div>
                  </td>
                  <td>{ticket.category || 'General'}</td>
                  <td>
                    <span className={`status-badge status-${ticket.priority?.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={ticket.status} 
                      onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                      style={{ 
                        padding: '4px 8px', 
                        borderRadius: 6, 
                        border: 'none', 
                        fontSize: '0.8rem', 
                        fontWeight: 800,
                        background: ticket.status === 'Open' ? '#fef2f2' : '#ecfdf5',
                        color: ticket.status === 'Open' ? '#ef4444' : '#10b981',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Open">OPEN</option>
                      <option value="In Progress">IN PROGRESS</option>
                      <option value="Resolved">RESOLVED</option>
                      <option value="Closed">CLOSED</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--it-text-muted)' }}>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--it-primary)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ChatCircleText size={18} weight="bold" /> Respond
                    </button>
                  </td>
                </tr>
              ))}
              {currentTickets.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: 'var(--it-text-muted)' }}>No support tickets found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ITTickets;
