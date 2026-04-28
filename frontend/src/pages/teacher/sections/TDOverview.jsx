import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
import { BookOpen, Users, ChalkboardTeacher, FileText, UserPlus, Pulse, Warning, Clock } from "@phosphor-icons/react";
import { S } from "./TDStyles";

function MetricBox({ label, value, icon, color, trend }) {
  return (
    <div style={S.metricCard} className="metric-card">
      <div style={S.metricIconWrapper(color)}>{icon}</div>
      <div>
        <p style={S.metricLabel}>{label}</p>
        <h2 style={{ ...S.metricValue, color }}>{value}</h2>
        <span style={S.metricTrend}>{trend}</span>
      </div>
    </div>
  );
}

export default function TDOverview({ stats = {}, timetable = [], pendingCount = 0, setActivePage }) {
  const chartRef  = useRef(null);
  const chartInst = useRef(null);
  
  // Safe stats defaults
  const s = {
    total_courses: stats?.total_courses || 0,
    total_students: stats?.total_students || 0,
    total_classes: stats?.total_classes || 0,
    total_assignments: stats?.total_assignments || 0,
    total_graded: stats?.total_graded || 0,
    total_pending: stats?.total_pending || 0,
    recent_students: stats?.recent_students || []
  };

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInst.current) chartInst.current.destroy();
    const data = [s.total_courses, s.total_students, s.total_classes, s.total_assignments, s.total_graded, s.total_pending, s.recent_students.length];
    chartInst.current = new Chart(chartRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ label:'Activity', data: data.slice(0,7), borderColor:'#4f46e5', backgroundColor:'rgba(79,70,229,0.1)', fill:true, tension:0.4, pointRadius:5, pointHoverRadius:8, pointBackgroundColor:'#4f46e5', pointBorderColor:'#fff', pointBorderWidth:2, borderWidth:3 }],
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false}, tooltip:{backgroundColor:'#1e293b'} }, scales:{ y:{grid:{color:'#f1f5f9'}, border:{display:false}, beginAtZero:true, ticks:{stepSize:5}}, x:{grid:{display:false}} }, animation:{duration:1000,easing:'easeInOutQuart'} },
    });
    return () => { if (chartInst.current) chartInst.current.destroy(); };
  }, [s]);

  const displayCompletionRate = s.total_assignments > 0 ? Math.min(100, Math.round((s.total_graded / (s.total_assignments || 1)) * 10)) : 0;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayEntries = timetable.filter(t => t.day_of_week === today);

  return (
    <div className="animate-fadeIn">
      <div style={S.statsGrid} className="stats-grid">
        <MetricBox label="Total Courses"  value={s.total_courses}     icon={<BookOpen weight="duotone" />}         color="#7c3aed" trend="+2 this month" />
        <MetricBox label="Students"       value={s.total_students}    icon={<Users weight="duotone" />}            color="#7c3aed" trend={`${s.recent_students.length} recent`} />
        <MetricBox label="Classes"        value={s.total_classes}     icon={<ChalkboardTeacher weight="duotone" />} color="#2563eb" trend="Real-time" />
        <MetricBox label="Assignments"    value={s.total_assignments} icon={<FileText weight="duotone" />}         color="#0891b2" trend={`${displayCompletionRate}% progress`} />
      </div>

      <div style={S.chartCard}>
        <div style={S.chartHeader}>
          <div>
            <h3 style={S.chartTitle}>Weekly Activity</h3>
            <p style={S.chartSubtitle}>Teaching engagement over the last 7 days</p>
          </div>
          <div style={S.chartControls}><Pulse size={20} color="#4f46e5" weight="duotone" /><span style={S.chartLive}>LIVE</span></div>
        </div>
        <div style={{ height:'300px' }}><canvas ref={chartRef}></canvas></div>
      </div>

      <div style={S.bottomGrid}>
        <div style={S.quickActionsCard}>
          <h4 style={S.sectionTitle}>Recent Student Enrollments</h4>
          <div style={S.scheduleList}>
            {s.recent_students.length > 0 ? s.recent_students.map((stu, idx) => (
              <div key={idx} style={S.scheduleItem}>
                <div style={S.scheduleTime}>{new Date(stu.enrolled_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</div>
                <div style={S.scheduleInfo}><span style={S.scheduleCourse}>{stu.name}</span><span style={S.scheduleRoom}>Joined: {stu.course_title}</span></div>
                <div style={{ ...S.statusBadge, background:'#dcfce7', color:'#166534', padding:'4px 12px', fontSize:'10px' }}>APPROVED</div>
              </div>
            )) : <p style={S.emptySchedule}>No approved students yet</p>}
          </div>
        </div>
        <div style={S.scheduleCard}>
          <div style={S.sectionHeader}><h4 style={S.sectionTitle}>Today's Schedule</h4><Clock size={16} color="#64748b" /></div>
          <div style={S.scheduleList}>
            {todayEntries.slice(0, 3).map((item, idx) => (
              <div key={idx} style={S.scheduleItem}>
                <div style={S.scheduleTime}>{item.start_time}</div>
                <div style={S.scheduleInfo}><span style={S.scheduleCourse}>{item.course_title}</span><span style={S.scheduleRoom}>Room {item.room_number || 'TBD'}</span></div>
              </div>
            ))}
            {todayEntries.length === 0 && <p style={S.emptySchedule}>No classes scheduled today</p>}
          </div>
        </div>
      </div>

      <div style={S.bottomGrid}>
        <div style={S.quickActionsCard}>
          <h4 style={S.sectionTitle}>Quick Actions</h4>
          <div style={S.actionsGrid}>
            <button onClick={() => setActivePage('classes')}     style={S.primarySmallBtn}><BookOpen size={18} /> My Classes</button>
            <button onClick={() => setActivePage('pending')}     style={S.primarySmallBtn}><UserPlus size={18} /> Pending Requests</button>
            <button onClick={() => setActivePage('grades')}      style={S.secondarySmallBtn}><ChalkboardTeacher size={18} /> Update Grades</button>
            <button onClick={() => setActivePage('assignments')} style={S.secondarySmallBtn}><FileText size={18} /> New Assignment</button>
          </div>
        </div>
      </div>

      {pendingCount > 0 && (
        <div style={S.pendingAlert} className="animate-fadeIn">
          <Warning size={20} color="#f97316" />
          <span>You have <strong>{pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}</strong> to review</span>
          <button onClick={() => setActivePage('pending')} style={S.viewBtn}>View Now →</button>
        </div>
      )}
    </div>
  );
}
