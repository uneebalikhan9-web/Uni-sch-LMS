import React from 'react';
import { 
  TrendUp, Clock, Users, ChartPie, 
  ArrowUp, ArrowDown, CurrencyCircleDollar,
  Receipt, Wallet
} from "@phosphor-icons/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const MetricCard = ({ title, value, change, icon: Icon, trend, isCurrency = true, tab, setActiveTab }) => (
  <div 
    className="fin-metric-card" 
    style={{ cursor: tab ? 'pointer' : 'default' }}
    onClick={() => tab && setActiveTab && setActiveTab(tab)}
  >
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

const FinOverview = ({ stats, challans, expenses, trend, setActiveTab }) => {
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

  const chartData = months.map((month, idx) => ({
    name: month,
    Revenue: revenueData[idx],
    Expenses: expenseData[idx]
  }));

  return (
    <div className="fin-animate">
      <div className="fin-metrics-grid">
        <MetricCard 
          title="Total Revenue" 
          value={stats.totalRevenue || 0} 
          change="+12.5%" 
          icon={<TrendUp size={24} weight="duotone" />}
          trend="up"
          tab="fees"
          setActiveTab={setActiveTab}
        />
        <MetricCard 
          title="Pending Fees" 
          value={stats.pendingFees || 0} 
          change={`${stats.overdueCount || 0} overdue`} 
          icon={<Clock size={24} weight="duotone" />}
          trend="down"
          tab="fees"
          setActiveTab={setActiveTab}
        />
        <MetricCard 
          title="Payroll Paid" 
          value={stats.payrollDisbursed || 0} 
          change="+5.3%" 
          icon={<Users size={24} weight="duotone" />}
          trend="up"
          tab="payroll"
          setActiveTab={setActiveTab}
        />
        <MetricCard 
          title="Op. Margin" 
          value={`${stats.operatingMargin || 0}%`} 
          change="+2.1%" 
          icon={<ChartPie size={24} weight="duotone" />}
          trend="up"
          isCurrency={false}
          tab="reports"
          setActiveTab={setActiveTab}
        />
      </div>

      <div style={{ background: 'white', borderRadius: 24, padding: '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.5rem' }}>Revenue vs Expenses Trend (k)</h3>
        <div style={{ width: '100%', minWidth: 0 }}>
          <ResponsiveContainer width="99%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 600 }}
                formatter={(value) => [`Rs. ${value}k`, undefined]}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 600, color: '#475569' }} />
              <Bar dataKey="Revenue" fill="var(--primary-color, #4f46e5)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Expenses" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
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
