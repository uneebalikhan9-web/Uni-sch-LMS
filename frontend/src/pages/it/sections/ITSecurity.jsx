import React from 'react';
import { 
  ShieldCheck, Lock, Warning, ClockCounterClockwise, 
  CloudArrowUp, ShieldWarning, IdentificationBadge, CheckCircle 
} from '@phosphor-icons/react';

const ITSecurity = () => {
  return (
    <div className="it-security-section">
      <div className="it-grid">
        <div className="it-card">
          <div className="card-header" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Backup & Recovery</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <BackupItem label="Daily Database Backup" date="May 06, 2026 - 02:00 AM" size="1.2 GB" status="Success" />
            <BackupItem label="System Files Backup" date="May 05, 2026 - 11:30 PM" size="4.8 GB" status="Success" />
            <BackupItem label="User Data Snapshot" date="May 05, 2026 - 06:00 PM" size="850 MB" status="Success" />
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <button className="btn-primary" style={{ flex: 1, padding: '12px', background: 'var(--it-primary)', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                <CloudArrowUp size={20} weight="bold" /> Manual Backup
            </button>
            <button className="btn-secondary" style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid var(--it-border)', borderRadius: 12, color: 'var(--it-text-muted)', fontWeight: 700, cursor: 'pointer' }}>
                Restore Point
            </button>
          </div>
        </div>

        <div className="it-card">
          <div className="card-header" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Security Compliance</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SecurityCheck label="SSL/TLS Certificate" status="Valid" expiry="242 days left" color="#10b981" icon={<Lock size={20} />} />
            <SecurityCheck label="Firewall Status" status="Active" expiry="2.4M requests filtered" color="#10b981" icon={<ShieldCheck size={20} />} />
            <SecurityCheck label="Vulnerability Scan" status="Clean" expiry="Last scan: 4h ago" color="#10b981" icon={<ShieldWarning size={20} />} />
            <SecurityCheck label="SSO Integration" status="Configured" expiry="Azure AD Linked" color="var(--it-primary)" icon={<IdentificationBadge size={20} />} />
          </div>
        </div>
      </div>

      <div className="it-card" style={{ marginTop: 24 }}>
        <div className="card-header" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recent Security Events</h2>
        </div>
        <div className="it-table-container">
            <table className="it-table">
                <thead>
                    <tr><th>Event Type</th><th>Origin</th><th>Severity</th><th>Timestamp</th><th>Status</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ fontWeight: 700 }}><Warning size={18} color="#f59e0b" weight="bold" /> Brute Force Attempt</td>
                        <td>IP: 192.168.1.142</td>
                        <td><span style={{ color: '#f59e0b', fontWeight: 800 }}>Medium</span></td>
                        <td style={{ fontSize: '0.85rem' }}>May 06, 2026 - 10:22 AM</td>
                        <td><span className="status-badge status-low">Blocked</span></td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 700 }}><ShieldCheck size={18} color="#10b981" weight="bold" /> Admin Login</td>
                        <td>IP: 202.163.112.5 ( Karachi, PK )</td>
                        <td><span style={{ color: '#10b981', fontWeight: 800 }}>Low</span></td>
                        <td style={{ fontSize: '0.85rem' }}>May 06, 2026 - 09:15 AM</td>
                        <td><span className="status-badge status-low">Authorized</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const BackupItem = ({ label, date, size, status }) => (
  <div style={{ padding: '14px', borderRadius: 12, border: '1px solid var(--it-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)' }}>{date} • {size}</p>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>
      <CheckCircle size={16} weight="bold" /> {status}
    </div>
  </div>
);

const SecurityCheck = ({ label, status, expiry, color, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ padding: 10, background: `${color}15`, color: color, borderRadius: 10 }}>{icon}</div>
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)' }}>{expiry}</p>
      </div>
    </div>
    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: color }}>{status}</span>
  </div>
);

export default ITSecurity;

