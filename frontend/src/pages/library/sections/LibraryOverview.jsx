import React from 'react';
import { Books, ArrowUDownRight, Clock, Users, BookmarkSimple, TrendUp } from '@phosphor-icons/react';

const LibraryOverview = ({ stats, transactions }) => {
  const metrics = [
    { label: 'Total Books', value: stats.totalBooks || 0, sub: '+12 new today', icon: Books, color: '#0891b2' },
    { label: 'Issued Books', value: stats.issuedBooks || 0, sub: '35 returned today', icon: ArrowUDownRight, color: '#10b981' },
    { label: 'Active Members', value: stats.members || 0, sub: '+5 new members', icon: Users, color: '#6366f1' },
    { label: 'Overdue Books', value: stats.overdue || 0, sub: 'High risk', icon: Clock, color: '#ef4444' },
  ];

  const recentTransactions = (transactions || []).map(t => ({
    member: t.member_name,
    book: t.book_title,
    type: t.status === 'Returned' ? 'Returned' : 'Issued',
    date: new Date(t.issue_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="overview-section animate-fadeIn">
      <div className="metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className="card" style={{ padding: '24px', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ backgroundColor: `${m.color}15`, color: m.color, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <m.icon size={24} weight="duotone" />
              </div>
              <div style={{ fontSize: '0.75rem', color: m.color, fontWeight: 800 }}>{m.sub}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem', marginTop: 6, textTransform: 'uppercase', letterspacing: '0.5px' }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Popular Resources</h2>
            <button className="primary-btn" style={{ padding: '6px 14px', fontSize: '11px' }}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Subject</th><th>Checkouts</th><th>Trend</th></tr>
            </thead>
            <tbody>
              {stats.popularResources && stats.popularResources.length > 0 ? (
                stats.popularResources.map((res, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{res.title}</td>
                    <td style={{ fontWeight: 600, color: '#475569' }}>{res.subject || 'General'}</td>
                    <td style={{ fontWeight: 900 }}>{res.checkouts}</td>
                    <td><TrendUp size={18} weight="bold" color="#10b981" /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontWeight: 600 }}>No popular resources data available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Live Activity</h2>
          </div>
          <div className="activity-list">
            {recentTransactions.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.type === 'Issued' ? '#0891b2' : '#10b981', boxShadow: `0 0 0 4px ${t.type === 'Issued' ? '#0891b220' : '#10b98120'}` }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>{t.member}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{t.type}: {t.book}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>{t.date}</div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontWeight: 600 }}>No live activity recorded.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryOverview;
