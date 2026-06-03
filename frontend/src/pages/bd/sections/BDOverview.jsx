import React from 'react';
import { Buildings, CheckCircle, Briefcase, Users, Pulse, TrendUp } from "@phosphor-icons/react";
import { S } from './BDStyles';

const MetricBox = ({ label, value, icon, color, trend }) => (
  <div style={S.metricCard} className="metric-card">
    <div style={S.metricIconWrapper(color)}>
      {icon}
    </div>
    <div style={S.metricContent}>
      <p style={S.metricLabel}>{label}</p>
      <h2 style={S.metricValue}>{value}</h2>
      {trend && <span style={S.metricTrend}>{trend}</span>}
    </div>
  </div>
);

export default function BDOverview({ stats, globalStats, pipeline, chartRef, LEAD_COLORS }) {
  const LEAD_STATUSES = ['prospect', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

  return (
    <div style={S.overviewContainer} className="animate-fadeIn">
      {/* Stats Grid */}
      <div style={S.statsGrid} className="stats-grid">
        <MetricBox
          label="Total Leads"
          value={stats.totalLeads || 0}
          icon={<Buildings weight="duotone" />}
          color="var(--primary-color, #4f46e5)"
          trend="+12% this month"
        />
        <MetricBox
          label="Won Deals"
          value={stats.wonLeads || 0}
          icon={<CheckCircle weight="duotone" />}
          color="#22c55e"
          trend="PKR 2.5M"
        />
        <MetricBox
          label="Open Jobs"
          value={stats.openJobs || 0}
          icon={<Briefcase weight="duotone" />}
          color="#3b82f6"
          trend={`${stats.totalApplicants || 0} applicants`}
        />
        <MetricBox
          label="Total Students"
          value={globalStats.totalStudents || 0}
          icon={<Users weight="duotone" />}
          color="#8b5cf6"
          trend={`${globalStats.totalTeachers || 0} teachers`}
        />
      </div>

      {/* Charts Row */}
      <div style={S.chartsRow}>
        <div style={S.chartCard}>
          <div style={S.chartHeader}>
            <h3 style={S.chartTitle}>Lead Pipeline</h3>
            <Pulse size={20} color="var(--primary-color, #4f46e5)" weight="duotone" />
          </div>
          <div style={{ height: '260px' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
        <div style={S.chartCard}>
          <div style={S.chartHeader}>
            <h3 style={S.chartTitle}>Pipeline Stages</h3>
            <TrendUp size={20} color="var(--primary-color, #4f46e5)" weight="duotone" />
          </div>
          <div style={S.pipelineStages}>
            {LEAD_STATUSES.map(status => {
              const found = pipeline.find(p => p.status === status);
              const count = found ? found.count : 0;
              const total = pipeline.reduce((s, p) => s + Number(p.count), 0) || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={status} style={S.stageItem}>
                  <div style={S.stageHeader}>
                    <span style={{ ...S.stageName, color: LEAD_COLORS[status] }}>
                      {status.replace('_', ' ')}
                    </span>
                    <span style={S.stageCount}>{count} ({percentage}%)</span>
                  </div>
                  <div style={S.progressBarBg}>
                    <div style={{
                      ...S.progressBarFill,
                      background: LEAD_COLORS[status],
                      width: `${percentage}%`
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
