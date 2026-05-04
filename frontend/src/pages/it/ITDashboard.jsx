import React, { useState } from 'react';
import { 
  ShieldCheck, Cpu, HardDrive, Globe, Bell, 
  SignOut, List, Plus, MagnifyingGlass, ChartLineUp as TrendUp, UserCircle, 
  Terminal, Pulse, Database, Key
} from '@phosphor-icons/react';
import { useToast } from '../../components/Toast';
import './it.css';

const ITDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { showToast } = useToast();

  const [systems, setSystems] = useState([
    { id: 1, name: 'Main Database', status: 'Online', load: '12%' },
    { id: 2, name: 'Student Portal API', status: 'Online', load: '45%' },
    { id: 3, name: 'Authentication Server', status: 'Online', load: '8%' },
  ]);

  return (
    <div className="it-container">
      {/* Sidebar */}
      <aside className="it-sidebar">
        <div style={{ padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>Lancers<span style={{ color: '#a5b4fc' }}>Tech</span></div>
          <div style={{ color: '#a5b4fc', fontSize: 11, fontWeight: 600, marginTop: 4 }}>IT & SYSTEMS ADMIN</div>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 1rem' }}>
          <div onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'overview' ? 'white' : '#cbd5e1', background: activeTab === 'overview' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Pulse size={20} /> <span>System Health</span>
          </div>
          <div onClick={() => setActiveTab('security')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'security' ? 'white' : '#cbd5e1', background: activeTab === 'security' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Key size={20} /> <span>Security Logs</span>
          </div>
          <div onClick={() => setActiveTab('databases')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, color: activeTab === 'databases' ? 'white' : '#cbd5e1', background: activeTab === 'databases' ? 'rgba(79, 70, 229, 0.4)' : 'transparent', cursor: 'pointer' }}>
            <Database size={20} /> <span>Databases</span>
          </div>
        </nav>

        <div style={{ position: 'absolute', bottom: 30, width: '100%', padding: '0 1rem' }}>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', border: 'none', background: 'transparent', color: '#fca5a5', cursor: 'pointer' }}>
            <SignOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="it-main">
        <header className="it-header">
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Systems Command Center</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Bell size={22} color="#94a3b8" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1e293b', padding: '8px 18px', borderRadius: 40, border: '1px solid #334155' }}>
              <UserCircle size={28} color="#4f46e5" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.name || 'IT Admin'}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Systems Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="it-content">
          <div className="it-metrics">
            <MetricCard icon={<Cpu size={26} weight="duotone" />} value="32%" label="Server CPU Load" />
            <MetricCard icon={<HardDrive size={26} weight="duotone" />} value="1.2 TB" label="Storage Used" />
            <MetricCard icon={<Globe size={26} weight="duotone" />} value="99.9%" label="System Uptime" />
            <MetricCard icon={<ShieldCheck size={26} weight="duotone" />} value="Zero" label="Security Threats" />
          </div>

          {activeTab === 'overview' && (
            <div className="it-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3>Service Status Monitoring</h3>
                <button className="it-btn-primary" onClick={() => showToast('Re-scanning systems...', 'success')}>Run System Scan</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {systems.map(sys => (
                  <div key={sys.id} style={{ background: '#0f172a', padding: '1.5rem', borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{sys.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>Load: {sys.load}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="it-status-dot it-dot-online"></span>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>{sys.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'security' || activeTab === 'databases') && (
            <div className="it-card" style={{ textAlign: 'center', padding: '50px' }}>
              <Terminal size={64} weight="duotone" color="#4f46e5" style={{ margin: '0 auto 20px' }} />
              <h3>Advanced Systems Console</h3>
              <p style={{ color: '#94a3b8' }}>Access to this module requires multi-factor authentication (MFA) clearance.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const MetricCard = ({ icon, value, label }) => (
  <div className="it-card">
    <div style={{ background: 'rgba(79, 70, 229, 0.1)', width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: '#4f46e5' }}>{icon}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{value}</div>
    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>{label}</div>
  </div>
);

export default ITDashboard;
