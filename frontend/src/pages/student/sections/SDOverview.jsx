import React, { useEffect, useRef } from 'react';
import { BookOpen, CheckCircle, ChartLineUp, FileText, Pulse, Warning, CaretRight, Bell } from "@phosphor-icons/react";
import { Chart } from "chart.js/auto";
import { S } from './SDStyles';

function MetricBox({ label, value, icon, color, trend }) {
  return (
    <div style={S.metricCard} className="metric-card">
      <div style={S.metricIconWrapper(color)}>{icon}</div>
      <div style={S.metricContent}>
        <p style={S.metricLabel}>{label}</p>
        <h2 style={{ ...S.metricValue, color }}>{value}</h2>
        <span style={S.metricTrend}>{trend}</span>
      </div>
    </div>
  );
}

export default function SDOverview({ 
  courses, 
  attendanceStats, 
  attendanceLogs, 
  calculateGPA, 
  completedAssignments, 
  totalAssignments, 
  pendingAssignments,
  myClassInfo,
  myClassSubjects,
  setActivePage
}) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && attendanceLogs.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();
      
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyData = days.map((day, index) => {
        const dayLogs = attendanceLogs.filter(log => {
          const logDate = new Date(log.attendance_date);
          return logDate.getDay() === index + 1; // Monday is 1
        });
        const present = dayLogs.filter(l => l.status === 'present').length;
        const total = dayLogs.length || 1;
        return Math.round((present / total) * 100);
      });

      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: days,
          datasets: [
            { 
              label: 'Attendance %', 
              data: weeklyData, 
              borderColor: '#4f46e5', 
              backgroundColor: 'rgba(79, 70, 229, 0.1)', 
              fill: true, 
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointBackgroundColor: '#4f46e5',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              borderWidth: 3
            }
          ]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { 
            legend: { display: false },
            tooltip: { backgroundColor: '#1e293b', titleColor: '#fff', bodyColor: '#94a3b8' }
          },
          scales: { 
            y: { 
              grid: { color: '#f1f5f9' }, 
              border: { display: false },
              beginAtZero: true,
              max: 100,
              ticks: { callback: (value) => value + '%' }
            }, 
            x: { grid: { display: false } } 
          },
          animation: { duration: 1000, easing: 'easeInOutQuart' }
        }
      });
    }
  }, [attendanceLogs]);

  return (
    <div style={S.overviewContainer} className="animate-fadeIn">
      {/* Stats Grid */}
      <div style={S.statsGrid} className="stats-grid">
        <MetricBox 
          label="Enrolled Subjects" 
          value={courses.length} 
          icon={<BookOpen weight="duotone" />} 
          color="#4f46e5"
          trend={`${myClassSubjects.length} class subjects`}
        />
        <MetricBox 
          label="Attendance" 
          value={attendanceStats.percentage ? `${attendanceStats.percentage}%` : 'N/A'} 
          icon={<CheckCircle weight="duotone" />} 
          color="#10b981"
          trend={`${attendanceStats.present || 0} present`}
        />
        <MetricBox 
          label="GPA" 
          value={calculateGPA()} 
          icon={<ChartLineUp weight="duotone" />} 
          color="#8b5cf6"
          trend="Current semester"
        />
        <MetricBox 
          label="Assignments" 
          value={`${completedAssignments}/${totalAssignments}`} 
          icon={<FileText weight="duotone" />} 
          color="#f59e0b"
          trend={`${pendingAssignments} pending`}
        />
      </div>

      {/* Chart Card */}
      <div style={S.chartCard}>
        <div style={S.chartHeader}>
          <div>
            <h3 style={S.chartTitle}>Weekly Attendance Trend</h3>
            <p style={S.chartSubtitle}>Your attendance percentage over the last 7 days</p>
          </div>
          <div style={S.chartControls}>
            <Pulse size={20} color="#4f46e5" weight="duotone" />
            <span style={S.chartLive}>LIVE</span>
          </div>
        </div>
        <div style={{ height: '280px' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Class Info & Quick Actions */}
      {myClassInfo ? (
        <div style={S.classInfoCard}>
          <div style={S.classInfoHeader}>
            <div>
              <h3 style={S.classInfoTitle}>My Class: {myClassInfo.name}</h3>
              <p style={S.classInfoSubtitle}>Section {myClassInfo.section} • Academic Year {myClassInfo.academic_year}</p>
            </div>
            <div style={S.classBadge}>Active</div>
          </div>
          
          <div style={S.classSubjectsGrid}>
            {myClassSubjects.slice(0, 3).map(sub => (
              <div key={sub.id} style={S.subjectPill}>
                <BookOpen size={14} color="#4f46e5" />
                <span>{sub.title}</span>
              </div>
            ))}
            {myClassSubjects.length > 3 && (
              <div style={S.subjectPill}>+{myClassSubjects.length - 3} more</div>
            )}
          </div>

          <button 
            onClick={() => setActivePage('timetable')}
            style={S.viewScheduleBtn}
          >
            View Full Schedule <CaretRight size={16} />
          </button>
        </div>
      ) : (
        <div style={S.alertCard}>
          <Warning size={24} color="#f97316" />
          <div style={S.alertContent}>
            <h4 style={S.alertTitle}>You are not assigned to a class</h4>
            <p style={S.alertText}>Please register for your class to see your schedule and subjects.</p>
          </div>
          <button 
            onClick={() => setActivePage('registration')}
            style={S.alertBtn}
          >
            Register Now
          </button>
        </div>
      )}

      {/* Recent Activity */}
      <div style={S.recentActivityCard}>
        <div style={S.recentHeader}>
          <h4 style={S.recentTitle}>Recent Activity</h4>
          <Bell size={18} color="#64748b" />
        </div>
        <div style={S.activityList}>
          {attendanceLogs.slice(0, 3).map((log, i) => (
            <div key={i} style={S.activityItem}>
              <div style={S.activityDot}></div>
              <div style={S.activityContent}>
                <span style={S.activityCourse}>{log.course_name}</span>
                <span style={S.activityDate}>{new Date(log.attendance_date).toLocaleDateString()}</span>
              </div>
              <span style={{
                ...S.activityStatus,
                background: log.status === 'present' ? '#dcfce7' : log.status === 'late' ? '#fed7aa' : '#fee2e2',
                color: log.status === 'present' ? '#166534' : log.status === 'late' ? '#9a3412' : '#991b1b'
              }}>
                {log.status}
              </span>
            </div>
          ))}
          {attendanceLogs.length === 0 && <p style={{textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '10px'}}>No recent activity</p>}
        </div>
      </div>
    </div>
  );
}
