import React, { useState, useEffect } from 'react';
import { HardDrive, Cpu, Pulse, Database, ShieldCheck, Warning, ClockCounterClockwise } from '@phosphor-icons/react';

const ITInfrastructure = () => {
  const [metrics, setMetrics] = useState({
    cpu: 45,
    ram: 62,
    disk: 28,
    uptime: '14d 6h 22m',
    load: 1.24
  });

  // Static metrics display - no auto-simulation needed

  return (
    <div className="it-infrastructure-section">
      <div className="it-grid">
        <div className="it-card">
          <div className="card-header" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Real-time Server Health</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <MetricBar icon={<Cpu size={20} />} label="CPU Usage" value={metrics.cpu} color="var(--primary-color, #4f46e5)" />
            <MetricBar icon={<Pulse size={20} />} label="Memory (RAM)" value={metrics.ram} color="#10b981" />
            <MetricBar icon={<HardDrive size={20} />} label="Disk Storage" value={metrics.disk} color="#f59e0b" />
          </div>
        </div>

        <div className="it-card">
          <div className="card-header" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>System Uptime</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--it-primary)' }}>{metrics.uptime}</div>
            <p style={{ color: 'var(--it-text-muted)', fontSize: '0.9rem', marginTop: 8 }}>Since last full maintenance reboot</p>
          </div>
          <div style={{ marginTop: 24, padding: '16px', background: '#f8fafc', borderRadius: 12, border: '1px solid var(--it-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700 }}>System Load</span>
              <span style={{ color: '#10b981', fontWeight: 800 }}>{metrics.load} avg</span>
            </div>
          </div>
        </div>
      </div>

      <div className="it-card" style={{ marginTop: 24 }}>
        <div className="card-header" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Database Clusters</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          <ClusterNode name="DB-Main-Primary" status="Online" latency="12ms" load="22%" />
          <ClusterNode name="DB-Replica-01" status="Online" latency="18ms" load="14%" />
          <ClusterNode name="DB-Replica-02" status="Offline" latency="--" load="--" />
        </div>
      </div>
    </div>
  );
};

const MetricBar = ({ icon, label, value, color }) => (
  <div className="metric-bar-group">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.9rem' }}>
        {icon} <span>{label}</span>
      </div>
      <span style={{ fontWeight: 800, color }}>{value}%</span>
    </div>
    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, transition: '0.5s ease-in-out' }}></div>
    </div>
  </div>
);

const ClusterNode = ({ name, status, latency, load }) => (
  <div style={{ padding: '20px', borderRadius: 16, border: '1px solid var(--it-border)', background: status === 'Offline' ? '#fff1f2' : 'white' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <Database size={24} color={status === 'Offline' ? '#ef4444' : 'var(--it-primary)'} weight="duotone" />
      <span style={{ 
        fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: 40, 
        background: status === 'Offline' ? '#ef4444' : '#dcfce7', 
        color: status === 'Offline' ? 'white' : '#15803d' 
      }}>{status}</span>
    </div>
    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: 8 }}>{name}</h3>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--it-text-muted)' }}>
      <span>Latency: {latency}</span>
      <span>Load: {load}</span>
    </div>
  </div>
);

export default ITInfrastructure;
