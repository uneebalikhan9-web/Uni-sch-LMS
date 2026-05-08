import React from 'react';
import { Users, FileText, Calendar, GraduationCap, TrendUp, ChartLineUp } from '@phosphor-icons/react';
import { S } from './ADStyles';

const AdmissionsOverview = ({ stats, activities }) => {
  const metrics = [
    { title: 'Total Leads', value: stats.totalLeads, change: '+12%', icon: Users, color: '#4f46e5' },
    { title: 'New Apps', value: stats.newApps, change: '+8%', icon: FileText, color: '#10b981' },
    { title: 'Interviewed', value: stats.interviewed, change: '+24%', icon: Calendar, color: '#f59e0b' },
    { title: 'Admitted', value: stats.admitted, change: '+5%', icon: GraduationCap, color: '#6366f1' },
  ];

  const funnelData = [
    { stage: 'Lead', count: stats.totalLeads, height: 100 },
    { stage: 'Applied', count: stats.newApps, height: (stats.newApps / (stats.totalLeads || 1)) * 100 },
    { stage: 'Interview', count: stats.interviewed, height: (stats.interviewed / (stats.totalLeads || 1)) * 100 },
    { stage: 'Admitted', count: stats.admitted, height: (stats.admitted / (stats.totalLeads || 1)) * 100 },
  ];

  const currentActivities = (activities || []).slice(0, 6).map(act => ({
    text: act.action_text,
    time: new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: act.action_type
  }));

  return (
    <div className="animate-fadeIn">
      <div className="metrics-grid">
        {metrics.map((metric, idx) => (
          <div key={idx} className="metric-card">
            <div className="metric-header">
              <span className="metric-label">{metric.title}</span>
              <div className="metric-icon-box" style={{ background: `${metric.color}10`, color: metric.color }}>
                <metric.icon size={22} weight="duotone" />
              </div>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-trend">
              <div className="trend-badge">
                <TrendUp size={14} weight="bold" />
                <span>{metric.change}</span>
              </div>
              <span className="trend-label">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="funnel-activity-row">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Enrollment Velocity</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Funnel conversion throughput</p>
            </div>
            <div style={{ background: '#f5f3ff', padding: '6px 14px', borderRadius: '10px', color: '#4f46e5', fontWeight: 700, fontSize: '0.75rem' }}>
              LIVE MONITOR
            </div>
          </div>
          
          <div className="funnel-container">
            {funnelData.map((stage, idx) => {
              const h = Math.max(stage.height, 10);
              return (
                <div key={idx} className="funnel-bar-wrapper">
                  <div className="bar-container">
                    <div className="funnel-bar" style={{ height: `${h}%` }}>
                      <div className="funnel-value">{stage.count}</div>
                    </div>
                  </div>
                  <div className="funnel-label">{stage.stage}</div>
                  <div className="funnel-percent">{Math.round(h)}%</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Logs</h2>
            <ChartLineUp size={20} color="#64748b" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {currentActivities.map((activity, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ marginTop: 6, width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', boxShadow: '0 0 0 4px rgba(79,70,229,0.1)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4 }}>{activity.text}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, marginTop: 4 }}>{activity.time}</div>
                </div>
              </div>
            ))}
            {currentActivities.length === 0 && (
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>No activity stream available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsOverview;