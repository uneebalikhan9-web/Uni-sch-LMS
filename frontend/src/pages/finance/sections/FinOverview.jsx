import React from 'react';
import { 
  TrendUp, Clock, Users, ChartPie, 
  ArrowUp, ArrowDown, CurrencyCircleDollar,
  Receipt, Wallet
} from "@phosphor-icons/react";

const MetricCard = ({ title, value, change, icon: Icon, trend, isCurrency = true }) => (
  <div className="fin-metric-card">
    <div className="fin-metric-header">
      <span className="fin-metric-label">{title}</span>
      <div className="fin-metric-icon-wrap">
        {Icon}
      </div>
    </div>
    <div className="fin-metric-value">{isCurrency ? `Rs. ${value.toLocaleString()}` : value}</div>
    {change && (
      <div className={`fin-metric-trend ${trend === 'up' ? 'fin-trend-up' : 'fin-trend-down'}`}>
        {trend === 'up' ? <ArrowUp size={14} weight="bold" /> : <ArrowDown size={14} weight="bold" />}
        {change}
      </div>
    )}
  </div>
);

const FinOverview = ({ stats, challans, expenses, trend }) => {
  // Generate last 6 months list dynamically
  const months = [];
  const d = new Date();
  d.setMonth(d.getMonth() - 5);
  for (let i = 0; i < 6; i++) {
    months.push(d.toLocaleString('default', { month: 'short' }));
    d.setMonth(d.getMonth() + 1);
  }

  // Map backend trend to months array
  const revMap = trend?.revenue?.reduce((acc, r) => ({...acc, [r.month]: r.revenue}), {}) || {};
  const expMap = trend?.expenses?.reduce((acc, e) => ({...acc, [e.month]: e.expenses}), {}) || {};

  const revenueData = [];
  const expenseData = [];

  const tempDate = new Date();
  tempDate.setMonth(tempDate.getMonth() - 5);
  for (let i = 0; i < 6; i++) {
    const mStr = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`;
    revenueData.push((revMap[mStr] || 0) / 1000); // Scale to 'k'
    expenseData.push((expMap[mStr] || 0) / 1000);
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  return (
    <div className="fin-animate">
      <div className="fin-metrics-grid">
        <MetricCard 
          title="Total Revenue" 
          value={stats.totalRevenue || 0} 
          change="+12.5%" 
          icon={<TrendUp size={24} weight="duotone" />}
          trend="up"
        />
        <MetricCard 
          title="Pending Fees" 
          value={stats.pendingFees || 0} 
          change={`${stats.overdueCount || 0} overdue`} 
          icon={<Clock size={24} weight="duotone" />}
          trend="down"
        />
        <MetricCard 
          title="Payroll Paid" 
          value={stats.payrollDisbursed || 0} 
          change="+5.3%" 
          icon={<Users size={24} weight="duotone" />}
          trend="up"
        />
        <MetricCard 
          title="Op. Margin" 
          value={`${stats.operatingMargin || 0}%`} 
          change="+2.1%" 
          icon={<ChartPie size={24} weight="duotone" />}
          trend="up"
          isCurrency={false}
        />
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Revenue vs Expenses Trend (k)</h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}><span style={{ width: 12, height: 12, borderRadius: 4, background: 'var(--primary-color, #4f46e5)' }}></span> Revenue</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}><span style={{ width: 12, height: 12, borderRadius: 4, background: '#e2e8f0' }}></span> Expenses</span>
          </div>
        </div>
        <div style={{ position: 'relative', height: 260, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 20, borderBottom: '2px solid #f1f5f9' }}>
            {/* Grid lines */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px dashed #e2e8f0', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #e2e8f0', zIndex: 0 }}></div>

          {months.map((month, idx) => (
            <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '10%', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 220, width: '100%', justifyContent: 'center' }}>
                <div 
                  style={{ width: 24, height: `${revenueData[idx] * 1.2}%`, maxHeight: '100%', background: 'linear-gradient(180deg, var(--primary-color, #4f46e5) 0%, #6366f1 100%)', borderRadius: '6px 6px 0 0', transition: 'height 1s ease-out', position: 'relative', cursor: 'pointer' }}
                  title={`Revenue: Rs. ${revenueData[idx].toFixed(0)}k`}
                />
                <div 
                  style={{ width: 24, height: `${expenseData[idx] * 1.2}%`, maxHeight: '100%', background: '#e2e8f0', borderRadius: '6px 6px 0 0', transition: 'height 1s ease-out 0.2s', position: 'relative', cursor: 'pointer' }}
                  title={`Expenses: Rs. ${expenseData[idx].toFixed(0)}k`}
                />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>{month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fin-section-header">
        <h2>Recent Transactions</h2>
      </div>
      
      <div className="fin-table-wrap">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {challans.slice(0, 3).map(c => (
              <tr key={c.id}>
                <td>
                  <div className="fin-cell">
                    <div className="fin-avatar"><CurrencyCircleDollar size={18} /></div>
                    <div>
                      <div className="fin-name">Fee: {c.student_name}</div>
                      <div className="fin-sub">Challan #{c.challan_no}</div>
                    </div>
                  </div>
                </td>
                <td>Student Fee</td>
                <td className="fin-bonus">Rs. {c.total_amount.toLocaleString()}</td>
                <td>{new Date(c.created_at).toLocaleDateString()}</td>
                <td><span className={`fin-badge fin-badge-${c.status}`}>{c.status}</span></td>
              </tr>
            ))}
            {expenses.slice(0, 3).map(e => (
              <tr key={e.id}>
                <td>
                  <div className="fin-cell">
                    <div className="fin-avatar" style={{background:'#f97316'}}><Wallet size={18} /></div>
                    <div>
                      <div className="fin-name">{e.title}</div>
                      <div className="fin-sub">{e.category}</div>
                    </div>
                  </div>
                </td>
                <td>Expense</td>
                <td className="fin-deduct">Rs. {e.amount.toLocaleString()}</td>
                <td>{new Date(e.expense_date || e.created_at).toLocaleDateString()}</td>
                <td><span className="fin-badge fin-badge-paid">Paid</span></td>
              </tr>
            ))}
            {challans.length === 0 && expenses.length === 0 && (
              <tr className="fin-empty-row">
                <td colSpan="5">No recent transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinOverview;
