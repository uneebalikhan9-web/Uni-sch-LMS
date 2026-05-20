import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
import {
  ChalkboardTeacher, Users, Buildings, BookOpen,
  UserPlus, TrendUp, Pulse, Bell, Clock,
  House, Star
} from "@phosphor-icons/react";
import { S } from "./PDStyles";

export default function PDOverview({
  teachers, students, classes, courses, pendingStudents,
  logs, engagementData, setActiveTab, setShowAddModal, rightPanelOpen, leftSidebarOpen
}) {
  const chartRef  = useRef(null);
  const chartInst = useRef(null);

  const totalActiveCourses   = courses.filter(c => c.status === 'active').length;
  const pendingCount         = pendingStudents.length;
  const teacherStudentRatio  = teachers.length > 0 ? (students.length / teachers.length).toFixed(1) : 0;
  const classAverageSize     = classes.length  > 0 ? Math.round(students.length / classes.length) : 0;

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInst.current) chartInst.current.destroy();
    
    // Add a tiny 250ms delay so that the parent container has finished transitioning its width
    // before Chart.js renders. This ensures the canvas has the correct container width.
    const timer = setTimeout(() => {
      chartInst.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: engagementData.labels,
          datasets: [{
            label: 'Activity',
            data: engagementData.data,
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124,58,237,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: '#7c3aed',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            borderWidth: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' },
          },
          scales: {
            y: { grid: { color: '#f1f5f9' }, border: { display: false }, beginAtZero: true, ticks: { stepSize: 5 } },
            x: { grid: { display: false } },
          },
          animation: { duration: 1000, easing: 'easeInOutQuart' },
        },
      });
    }, 250);

    return () => {
      clearTimeout(timer);
      if (chartInst.current) chartInst.current.destroy();
    };
  }, [engagementData, rightPanelOpen, leftSidebarOpen]);

  const metrics = [
    { label: 'Faculty Members', val: teachers.length,         color: '#7c3aed', trend: `+${Math.floor(teachers.length * 0.2) || 2}%` },
    { label: 'Student Enrollment', val: students.length,         color: '#8b5cf6', trend: `+${Math.floor(students.length * 0.15) || 5}%` },
    { label: 'Academic Groups', val: classes.length,          color: '#a78bfa', trend: `Avg ${classAverageSize} students` },
    { label: 'Curriculum Programs', val: totalActiveCourses,      color: '#c084fc', trend: `${courses.length - totalActiveCourses} inactive` },
    { label: 'Enrollment Queue', val: pendingCount,            color: '#f472b6', trend: 'Awaiting approval' },
    { label: 'Faculty:Student', val: teacherStudentRatio,     color: '#60a5fa', trend: 'Ratio' },
  ];

  const icons = [
    <ChalkboardTeacher size={24} weight="duotone" />,
    <Users           size={24} weight="duotone" />,
    <Buildings       size={24} weight="duotone" />,
    <BookOpen        size={24} weight="duotone" />,
    <UserPlus        size={24} weight="duotone" />,
    <TrendUp         size={24} weight="duotone" />,
  ];

  return (
    <div style={S.overviewContainer}>
      {/* Stats Grid with dynamic layout keys */}
      <div key={`${rightPanelOpen ? 'g-open' : 'g-closed'}-${leftSidebarOpen ? 'l-open' : 'l-closed'}`} style={S.statsGrid} className="stats-grid animate-slideUp">
        {metrics.map((m, i) => (
          <div key={m.label} style={S.metricCard} className="metric-card">
            <div style={S.metricIconWrapper(m.color)}>{icons[i]}</div>
            <div style={S.metricContent}>
              <p style={S.metricLabel}>{m.label}</p>
              <h2 style={{ ...S.metricValue, color: m.color }}>{m.val}</h2>
              <span style={S.metricTrend}>{m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div key={`${rightPanelOpen ? 'c-open' : 'c-closed'}-${leftSidebarOpen ? 'l-open' : 'l-closed'}`} style={S.chartCard} className="animate-slideUp">
        <div style={S.chartHeader}>
          <div>
            <h3 style={S.chartTitle}>Faculty & Student Engagement Analytics</h3>
            <p style={S.chartSubtitle}>Departmental activity monitoring based on real-time data</p>
          </div>
          <div style={S.chartControls}>
            <Pulse size={20} color="#7c3aed" weight="duotone" />
            <span style={S.chartLive}>LIVE</span>
          </div>
        </div>
        <div style={{ height: '300px' }}><canvas ref={chartRef}></canvas></div>
      </div>

      {/* Bottom Grid — Quick Actions + Recent Activity */}
      <div key={`${rightPanelOpen ? 'b-open' : 'b-closed'}-${leftSidebarOpen ? 'l-open' : 'l-closed'}`} style={S.bottomGrid} className="animate-slideUp">
        <div style={S.quickActionsCard}>
          <h4 style={S.sectionTitle}>Quick Actions</h4>
          <div style={{ marginTop: '16px', ...S.actionsGrid }}>
            {[
              ['teachers', 'Add Teacher',  <ChalkboardTeacher size={20} />],
              ['students', 'Add Student',  <Users size={20} />],
              ['classes',  'New Class',    <Buildings size={20} />],
              ['courses',  'New Course',   <BookOpen size={20} />],
            ].map(([tab, label, icon]) => (
              <button
                key={tab}
                style={S.actionButton}
                className="action-btn"
                onClick={() => { setActiveTab(tab); setShowAddModal(true); }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <div style={S.recentActivityCard}>
          <div style={S.sectionHeader}>
            <h4 style={S.sectionTitle}>Recent Activity</h4>
            <Bell size={16} color="#64748b" />
          </div>
          <div style={S.activityList}>
            {logs.slice(0, 5).map((log, i) => (
              <div key={i} style={S.activityItem}>
                <div style={S.activityIcon}><Clock size={12} color="#7c3aed" /></div>
                <div style={S.activityContent}>
                  <p style={S.activityText}>{log.action}</p>
                  <span style={S.activityTime}>
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
