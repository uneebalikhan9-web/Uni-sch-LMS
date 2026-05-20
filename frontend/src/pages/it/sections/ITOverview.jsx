import React from 'react';
import { Users, Ticket, Cpu, Pulse, ClockCounterClockwise } from '@phosphor-icons/react';

const ITOverview = ({ stats, logs }) => {
  return (
    <div className="it-overview">
      <div className="it-metrics-grid">
        <div className="it-card">
          <div className="it-stat-icon" style={{ background: '#eff6ff' }}>
            <Users size={24} weight="bold" color="#3b82f6" />
          </div>
          <p className="it-stat-label">Total Managed Users</p>
          <h2 className="it-stat-value">{stats.totalUsers || 0}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--it-success)', fontWeight: 700 }}>+12 New this week</p>
        </div>

        <div className="it-card">
          <div className="it-stat-icon" style={{ background: '#fef2f2' }}>
            <Ticket size={24} weight="bold" color="#ef4444" />
          </div>
          <p className="it-stat-label">Active Support Tickets</p>
          <h2 className="it-stat-value">{stats.activeTickets || 0}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', fontWeight: 600 }}>Critical Priority: 2</p>
        </div>

        <div className="it-card">
          <div className="it-stat-icon" style={{ background: '#ecfdf5' }}>
            <Pulse size={24} weight="bold" color="#10b981" />
          </div>
          <p className="it-stat-label">System Health Index</p>
          <h2 className="it-stat-value">{stats.systemHealth || 100}%</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--it-success)', fontWeight: 700 }}>Optimal Performance</p>
        </div>

        <div className="it-card">
          <div className="it-stat-icon" style={{ background: '#fff7ed' }}>
            <ClockCounterClockwise size={24} weight="bold" color="#f59e0b" />
          </div>
          <p className="it-stat-label">Last Backup</p>
          <h2 className="it-stat-value" style={{ fontSize: '1.5rem', marginTop: 12 }}>2h 14m ago</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)', fontWeight: 600 }}>Incremental Sync: Success</p>
        </div>
      </div>

      <div className="it-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="it-card">
          <div className="card-header" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent System Activity</h2>
          </div>
          <div className="it-table-container">
            <table className="it-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(logs || []).slice(0, 5).map((log, index) => (
                  <tr key={index}>
                    <td style={{ color: 'var(--it-text-muted)', fontSize: '0.85rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                    <td style={{ fontWeight: 700 }}>{log.action}</td>
                    <td>{log.user_id ? `ID: ${log.user_id}` : 'System'}</td>
                    <td><span className="status-badge status-low">Success</span></td>
                  </tr>
                ))}
                {(!logs || logs.length === 0) && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--it-text-muted)' }}>No recent activity logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="it-card">
          <div className="card-header" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Server Nodes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '16px', border: '1px solid var(--it-border)', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>Primary Node</span>
                <span style={{ color: 'var(--it-success)', fontWeight: 800 }}>Online</span>
              </div>
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                <div style={{ width: '45%', height: '100%', background: 'var(--it-primary)', borderRadius: 3 }}></div>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--it-text-muted)', marginTop: 8 }}>CPU: 45% | RAM: 3.2GB / 8GB</p>
            </div>
            <div style={{ padding: '16px', border: '1px solid var(--it-border)', borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700 }}>DB Cluster</span>
                <span style={{ color: 'var(--it-success)', fontWeight: 800 }}>Online</span>
              </div>
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3 }}>
                <div style={{ width: '22%', height: '100%', background: 'var(--it-accent)', borderRadius: 3 }}></div>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--it-text-muted)', marginTop: 8 }}>CPU: 22% | Active Connections: 142</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITOverview;
