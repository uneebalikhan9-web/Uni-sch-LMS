import React from 'react';
import { 
  TrendUp, Clock, Users, ChartPie, 
  ArrowUp, ArrowDown, CurrencyCircleDollar,
  Receipt, Wallet
} from "@phosphor-icons/react";

const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="fin-metric-card">
    <div className="fin-metric-header">
      <span className="fin-metric-label">{title}</span>
      <div className="fin-metric-icon-wrap">
        {Icon}
      </div>
    </div>
    <div className="fin-metric-value">₹{value.toLocaleString()}</div>
    {change && (
      <div className={`fin-metric-trend ${trend === 'up' ? 'fin-trend-up' : 'fin-trend-down'}`}>
        {trend === 'up' ? <ArrowUp size={14} weight="bold" /> : <ArrowDown size={14} weight="bold" />}
        {change}
      </div>
    )}
  </div>
);

const FinOverview = ({ stats, challans, expenses }) => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Dummy trend data for visualization
  const revenueData = [125, 142, 138, 165, 178, stats.totalRevenue ? stats.totalRevenue / 1000 : 0];
  const expenseData = [98, 105, 112, 118, 125, stats.totalExpenses ? stats.totalExpenses / 1000 : 0];

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
        />
      </div>

      <div className="fin-chart-card">
        <div className="fin-chart-header">
          <h3>Revenue vs Expenses Trend (k)</h3>
          <div className="fin-chart-legends">
            <span><span className="fin-legend fin-legend-rev"></span> Revenue</span>
            <span><span className="fin-legend fin-legend-exp"></span> Expenses</span>
          </div>
        </div>
        <div className="fin-bar-chart">
          {months.map((month, idx) => (
            <div key={month} className="fin-bar-group">
              <div className="fin-bar-col">
                <div 
                  className="fin-bar fin-bar-rev" 
                  style={{ height: `${revenueData[idx] * 1.2}px` }}
                >
                  <span className="fin-bar-tip">₹{revenueData[idx].toFixed(0)}k</span>
                </div>
                <div 
                  className="fin-bar fin-bar-exp" 
                  style={{ height: `${expenseData[idx] * 1.2}px` }}
                >
                  <span className="fin-bar-tip">₹{expenseData[idx].toFixed(0)}k</span>
                </div>
              </div>
              <span className="fin-bar-label">{month}</span>
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
                <td className="fin-bonus">₹{c.total_amount.toLocaleString()}</td>
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
                <td className="fin-deduct">₹{e.amount.toLocaleString()}</td>
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
