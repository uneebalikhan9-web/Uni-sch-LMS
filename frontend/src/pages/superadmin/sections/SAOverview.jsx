import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
import { Buildings, UserCircle, IdentificationCard, ChartLine, Calendar } from "@phosphor-icons/react";
import { S } from "./SAStyles";

export default function SAOverview({ overview, departmentStats }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && departmentStats.length > 0) {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: departmentStats.map(c => c.campus_name),
          datasets: [
            { 
              label: 'Students', 
              data: departmentStats.map(c => c.students), 
              backgroundColor: 'rgba(79, 70, 229, 0.8)',
              borderRadius: 8,
              barPercentage: 0.6,
            },
            { 
              label: 'Teachers', 
              data: departmentStats.map(c => c.teachers), 
              backgroundColor: 'rgba(124, 58, 237, 0.8)',
              borderRadius: 8,
              barPercentage: 0.6,
            },
          ]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { 
            legend: { 
              position: 'top',
              labels: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: 600 } }
            } 
          }, 
          scales: { 
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' } },
            x: { grid: { display: false } }
          } 
        }
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [departmentStats]);

  return (
    <div style={S.overviewContainer}>
      {/* Stats Grid */}
      <div style={S.statsGrid} className="stats-grid">
        {[
          ['Total Faculties', overview.totalCampuses || 0, '#4f46e5', <Buildings size={24} weight="duotone" />],
          ['Institutional Reach', overview.totalPrincipals || 0, '#7c3aed', <UserCircle size={24} weight="duotone" />],
          ['Admissions & Growth', overview.totalStudents || 0, '#ec4899', <IdentificationCard size={24} weight="duotone" />],
          ['Faculty Strength', overview.totalTeachers || 0, '#2563eb', <UserCircle size={24} weight="duotone" />],
          ['Active Programs', overview.totalCourses || 0, '#0891b2', <ChartLine size={24} weight="duotone" />],
        ].map(([label, val, color, icon]) => (
          <div key={label} style={S.metricCard} className="metric-card">
            <div style={S.metricIconWrapper(color)}>{icon}</div>
            <div>
              <p style={S.metricLabel}>{label}</p>
              <h2 style={{...S.metricValue, color}}>{val.toLocaleString()}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={S.chartCard}>
        <div style={S.chartHeader}>
          <h3 style={S.chartTitle}>Student Enrollment & Faculty Distribution</h3>
          <div style={S.chartLegend}>
            <span style={S.legendItem}><span style={{...S.legendDot, background: '#4f46e5'}}></span> Students</span>
            <span style={S.legendItem}><span style={{...S.legendDot, background: '#7c3aed'}}></span> Teachers</span>
          </div>
        </div>
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <h3 style={S.tableTitle}>Faculty & Institutional Performance</h3>
          <div style={S.tableBadge}>
            <Calendar size={14} />
            <span>Real-time stats</span>
          </div>
        </div>
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>DEPARTMENT</th>
                <th style={S.th}>STUDENTS</th>
                <th style={S.th}>TEACHERS</th>
                <th style={S.th}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map(c => (
                <tr key={c.id} style={S.tr}>
                  <td style={S.tdName}>{c.campus_name}</td>
                  <td style={S.td}>{c.students}</td>
                  <td style={S.td}>{c.teachers}</td>
                  <td style={S.td}>
                    <span style={{...S.statusBadge, 
                      background: c.is_active ? '#dcfce7' : '#fee2e2',
                      color: c.is_active ? '#166534' : '#991b1b'
                    }}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
