import { useRef } from "react";
import { Chart } from "chart.js/auto";
import { Star } from "@phosphor-icons/react";
import { S } from "./PDStyles";

function FeedbackChart({ data, color }) {
  return (
    <div style={{ height: '350px' }}>
      <canvas ref={el => {
        if (el) {
          const ctx = el.getContext('2d');
          if (el.chart) el.chart.destroy();
          el.chart = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: data.map(a => a.title),
              datasets: [{
                label: 'Average Rating',
                data: data.map(a => parseFloat(a.avg_rating).toFixed(1)),
                backgroundColor: color,
                borderRadius: 8,
                barThickness: 40,
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: { y: { beginAtZero: true, max: 5 } },
              plugins: { legend: { display: false } },
            },
          });
        }
      }}></canvas>
    </div>
  );
}

function FeedbackTable({ analytics }) {
  return (
    <table style={S.table}>
      <thead>
        <tr style={S.tableHeadRow}>
          <th style={S.th}>NAME</th>
          <th style={S.th}>AVERAGE RATING</th>
          <th style={S.th}>TOTAL FEEDBACKS</th>
          <th style={S.th}>QUALITY STATUS</th>
        </tr>
      </thead>
      <tbody>
        {analytics.map((item, idx) => {
          const rating = parseFloat(item.avg_rating);
          const bg    = rating >= 4 ? '#dcfce7' : rating >= 3 ? '#fef3c7' : '#fee2e2';
          const color = rating >= 4 ? '#166534' : rating >= 3 ? '#92400e' : '#991b1b';
          const label = rating >= 4 ? 'Excellent' : rating >= 3 ? 'Good' : 'Needs Review';
          return (
            <tr key={idx} style={S.tableRow}>
              <td style={S.tdName}>{item.title}</td>
              <td style={S.td}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <Star size={16} color="#f59e0b" weight="fill" />
                  {rating.toFixed(1)} / 5.0
                </div>
              </td>
              <td style={S.td}>{item.feedback_count} reviews</td>
              <td style={S.td}>
                <span style={{ ...S.statusBadge, background: bg, color }}>{label}</span>
              </td>
            </tr>
          );
        })}
        {analytics.length === 0 && (
          <tr><td colSpan="4" style={{ ...S.td, textAlign:'center', padding:'24px', color:'#94a3b8' }}>No feedback data yet.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default function PDFeedback({ courseFeedbackAnalytics, labFeedbackAnalytics }) {
  return (
    <div className="animate-fadeIn">
      {/* Course Quality */}
      <div style={{ ...S.tableCard, marginBottom: '24px' }}>
        <div style={S.tableHeader}>
          <div>
            <h2 style={S.tableTitle}>📈 Course Quality Metrics</h2>
            <p style={S.tableSubtitle}>Monitoring training standards through student feedback</p>
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          {courseFeedbackAnalytics.length > 0
            ? <FeedbackChart data={courseFeedbackAnalytics} color="#7c3aed" />
            : <div style={S.emptyState}>No feedback data available for courses yet.</div>
          }
        </div>
      </div>

      <div style={{ ...S.tableCard, marginBottom: '24px' }}>
        <div style={S.tableHeader}>
          <div>
            <h2 style={S.tableTitle}>Feedback Details</h2>
            <p style={S.tableSubtitle}>Breakdown by course and rating count</p>
          </div>
        </div>
        <FeedbackTable analytics={courseFeedbackAnalytics} />
      </div>

      {/* Lab Quality */}
      <div style={{ ...S.tableCard, marginBottom: '24px' }}>
        <div style={S.tableHeader}>
          <div>
            <h2 style={S.tableTitle}>🔬 Lab Quality Metrics</h2>
            <p style={S.tableSubtitle}>Student feedback on cloud labs performance and utility</p>
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          {labFeedbackAnalytics.length > 0
            ? <FeedbackChart data={labFeedbackAnalytics} color="#8b5cf6" />
            : <div style={S.emptyState}>No feedback data available for labs yet.</div>
          }
        </div>
      </div>

      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <div>
            <h2 style={S.tableTitle}>Lab Feedback Details</h2>
            <p style={S.tableSubtitle}>Ratings summary per cloud lab</p>
          </div>
        </div>
        <FeedbackTable analytics={labFeedbackAnalytics} />
      </div>
    </div>
  );
}
