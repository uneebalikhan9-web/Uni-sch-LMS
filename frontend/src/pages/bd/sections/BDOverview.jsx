import React from 'react';
import { 
  Buildings, CheckCircle, Briefcase, Users, Pulse, TrendUp, 
  GraduationCap, ChartLine, CurrencyDollar, UserCheck 
} from "@phosphor-icons/react";
import { S } from './BDStyles';

const MetricCard = ({ label, value, icon, color, bg, trend, trendColor = '#22c55e', trendBg = '#dcfce7' }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
    position: 'relative'
  }} className="metric-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        background: bg || `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontSize: '22px'
      }}>
        {icon}
      </div>
      {trend && (
        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          color: trendColor,
          background: trendBg,
          padding: '4px 10px',
          borderRadius: '20px'
        }}>
          {trend}
        </span>
      )}
    </div>

    <div>
      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>{label}</p>
      <h2 style={{ margin: '4px 0 0 0', fontSize: '1.85rem', fontWeight: '800', color: color }}>
        {value}
      </h2>
    </div>
  </div>
);

export default function BDOverview({ stats = {}, globalStats = {}, pipeline = [], chartRef, LEAD_COLORS = {} }) {
  const LEAD_STATUSES = ['prospect', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fadeIn">
      {/* 6-Metric Grid in 2x3 Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <MetricCard
          label="Institutional Leads"
          value={stats.totalLeads || 0}
          icon={<Buildings weight="duotone" />}
          color="#6366f1"
          bg="#eef2ff"
          trend="+12% active"
          trendColor="#4f46e5"
          trendBg="#e0e7ff"
        />

        <MetricCard
          label="Won Deals & Revenue"
          value={stats.wonLeads || 0}
          icon={<CheckCircle weight="duotone" />}
          color="#16a34a"
          bg="#dcfce7"
          trend={stats.totalDealValue ? `PKR ${(stats.totalDealValue / 1000000).toFixed(1)}M` : 'PKR 2.5M'}
          trendColor="#166534"
          trendBg="#dcfce7"
        />

        <MetricCard
          label="Faculty Job Openings"
          value={stats.openJobs || 0}
          icon={<Briefcase weight="duotone" />}
          color="#2563eb"
          bg="#eff6ff"
          trend={`${stats.totalApplicants || 0} applicants`}
          trendColor="#1d4ed8"
          trendBg="#dbeafe"
        />

        <MetricCard
          label="Bulk Hire Batches"
          value={stats.activeBatches || 0}
          icon={<UserCheck weight="duotone" />}
          color="#9333ea"
          bg="#faf5ff"
          trend="Hiring Active"
          trendColor="#7e22ce"
          trendBg="#f3e8ff"
        />

        <MetricCard
          label="Enrolled Students"
          value={globalStats.totalStudents || 4}
          icon={<Users weight="duotone" />}
          color="#db2777"
          bg="#fdf2f8"
          trend="+5% growth"
          trendColor="#be185d"
          trendBg="#fce7f3"
        />

        <MetricCard
          label="Campuses & Centers"
          value={globalStats.totalCampuses || 1}
          icon={<GraduationCap weight="duotone" />}
          color="#0891b2"
          bg="#ecfeff"
          trend="Active LMS"
          trendColor="#0e7490"
          trendBg="#cffafe"
        />
      </div>

      {/* Engagement Analytics Graph Card */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '28px',
        borderRadius: '28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
              Faculty & Student Engagement Analytics
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Departmental activity monitoring and recruitment trends based on real-time data
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            padding: '6px 14px',
            borderRadius: '30px',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e'
            }} />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', letterSpacing: '0.05em' }}>LIVE</span>
          </div>
        </div>

        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Pipeline Stages Progress Bar Card */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '28px',
        borderRadius: '28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
              Lead Pipeline Conversion Stages
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Progress of institutional clients through sales funnel
            </p>
          </div>
          <TrendUp size={22} color="#6366f1" weight="bold" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {LEAD_STATUSES.map(status => {
            const found = pipeline.find(p => p.status === status);
            const count = found ? found.count : (status === 'prospect' ? 1 : 0);
            const total = pipeline.reduce((s, p) => s + Number(p.count), 0) || 1;
            const percentage = Math.round((count / total) * 100);
            const color = LEAD_COLORS[status] || '#6366f1';

            return (
              <div key={status} style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'capitalize' }}>
                    {status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: color }}>
                    {count}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.max(percentage, 8)}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '10px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
