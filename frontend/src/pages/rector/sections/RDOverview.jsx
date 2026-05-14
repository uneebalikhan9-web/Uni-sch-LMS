import React from 'react';
import { S } from './RDStyles';
import { 
  Users, ChalkboardTeacher, GraduationCap, 
  ChartLineUp, ArrowUp, ArrowDown, DotsThree
} from '@phosphor-icons/react';

const RDOverview = ({ stats = {}, departments = [] }) => {
  const kpis = [
    { label: 'Total Enrollment', val: stats.totalEnrollment || '0', trend: stats.growthTrend || '+0%', up: true, icon: Users, color: '#3b82f6' },
    { label: 'Faculty Members', val: stats.facultyStrength || '0', trend: '+3%', up: true, icon: ChalkboardTeacher, color: '#8b5cf6' },
    { label: 'Active Programs', val: stats.activeResearch || '0', trend: '+8%', up: true, icon: GraduationCap, color: '#10b981' },
    { label: 'Uni. Ranking', val: '#42 National', trend: '-2', up: true, icon: ChartLineUp, color: '#f59e0b' },
  ];

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'32px'}}>
      {/* KPI Cards */}
      <div style={S.statsGrid}>
        {kpis.map((kpi, i) => (
          <div key={i} style={S.metricCard}>
            <div style={S.metricIcon(kpi.color)}><kpi.icon size={28} weight="duotone" /></div>
            <div style={{flex:1}}>
              <p style={S.metricLabel}>{kpi.label}</p>
              <h2 style={S.metricValue}>{kpi.val}</h2>
              <span style={{fontSize:'0.75rem', fontWeight:'700', color: kpi.up ? '#10b981' : '#ef4444', display:'flex', alignItems:'center', gap:'4px'}}>
                {kpi.up ? <ArrowUp size={12}/> : <ArrowDown size={12}/>} {kpi.trend} vs last year
              </span>
            </div>
            <DotsThree size={20} color="#94a3b8" style={{cursor:'pointer'}} />
          </div>
        ))}
      </div>

      <div style={S.contentGrid}>
        {/* Main Strategic Card */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Departmental Academic Health</h3>
          <div style={{overflowX:'auto', marginTop:'10px'}}>
             <table style={S.table}>
               <thead>
                 <tr>
                   <th style={S.th}>Department</th>
                   <th style={S.th}>Success Rate</th>
                   <th style={S.th}>Attendance</th>
                   <th style={S.th}>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {departments.map((row, i) => (
                   <tr key={i} style={S.tr}>
                     <td style={{...S.td, ...S.tdFirst}}>{row.dept}</td>
                     <td style={S.td}>{row.rate}</td>
                     <td style={S.td}>{row.att}</td>
                     <td style={{...S.td, ...S.tdLast}}>
                       <span style={S.statusBadge(row.bg, row.color)}>{row.status}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>

        {/* Action Center */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Executive Actions</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {['Approve New Program', 'Faculty Appraisal Cycle', 'Accreditation Review', 'Budget Sign-off'].map((action, i) => (
              <button key={i} style={{padding:'16px', background:'#f1f5f9', border:'none', borderRadius:'16px', color:'#1e3a8a', fontWeight:'700', fontSize:'0.9rem', cursor:'pointer', textAlign:'left', display:'flex', justifyContent:'space-between'}}>
                {action} <span>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RDOverview;
