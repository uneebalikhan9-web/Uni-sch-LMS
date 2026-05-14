import React from 'react';
import { S } from './RDStyles';
import { ChartLineUp, SquaresFour, ChartPie, Info } from '@phosphor-icons/react';

const RDStrategy = ({ activeTab }) => {
  const isFinance = activeTab === 'finance';
  
  return (
    <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
      <div style={S.contentGrid}>
        {/* Main Analytics Card */}
        <div style={S.card}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
            <h3 style={S.cardTitle}>{isFinance ? 'Budget Utilization Nexus' : 'Academic Growth Trajectory'}</h3>
            <Info size={20} color="#94a3b8" style={{cursor:'pointer'}} />
          </div>
          <div style={{height:'400px', background:'#f8fafc', borderRadius:'24px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed #cbd5e1', color:'#64748b'}}>
             <div style={{textAlign:'center'}}>
               {isFinance ? <ChartPie size={48} weight="duotone" /> : <ChartLineUp size={48} weight="duotone" />}
               <p style={{marginTop:'12px', fontWeight:'700'}}>{isFinance ? 'Financial Allocation Chart' : 'Program Success Heatmap'}</p>
               <span style={{fontSize:'0.8rem'}}>Real-time data synchronization required</span>
             </div>
          </div>
        </div>

        {/* Side Summary */}
        <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
          <div style={{...S.card, padding:'24px'}}>
            <h4 style={{margin:0, fontSize:'1rem', fontWeight:'800', color:'#1e3a8a'}}>Current Quarter</h4>
            <div style={{marginTop:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                <span style={{fontSize:'0.85rem', color:'#64748b'}}>Efficiency Index</span>
                <span style={{fontSize:'0.85rem', fontWeight:'800', color:'#10b981'}}>94%</span>
              </div>
              <div style={{height:'6px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden'}}>
                <div style={{width:'94%', height:'100%', background:'#10b981'}} />
              </div>
            </div>
            <div style={{marginTop:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                <span style={{fontSize:'0.85rem', color:'#64748b'}}>Quality Score</span>
                <span style={{fontSize:'0.85rem', fontWeight:'800', color:'#3b82f6'}}>88%</span>
              </div>
              <div style={{height:'6px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden'}}>
                <div style={{width:'88%', height:'100%', background:'#3b82f6'}} />
              </div>
            </div>
          </div>

          <div style={{...S.card, padding:'24px', background:'linear-gradient(135deg, #1e3a8a, #1e40af)', color:'#fff'}}>
             <h4 style={{margin:0, fontSize:'0.9rem', fontWeight:'800'}}>Strategy Tip</h4>
             <p style={{fontSize:'0.8rem', marginTop:'10px', opacity:0.9, lineHeight:'1.5'}}>
               Based on current trends, expanding the CS department by 15% would optimize the staff-to-student ratio by Q4.
             </p>
             <button style={{marginTop:'15px', width:'100%', padding:'10px', borderRadius:'10px', border:'none', background:'rgba(255,255,255,0.2)', color:'#fff', fontWeight:'700', cursor:'pointer', fontSize:'0.8rem'}}>Generate Proposal</button>
          </div>
        </div>
      </div>
      
      {/* Lower Breakdown */}
      <div style={S.card}>
         <h3 style={S.cardTitle}><SquaresFour size={24} weight="fill" /> {isFinance ? 'Spending per Department' : 'Program-wise Enrollment Breakdown'}</h3>
         <div style={{height:'200px', background:'#f1f5f9', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed #cbd5e1', color:'#64748b'}}>
            [Categorical Distribution Map]
         </div>
      </div>
    </div>
  );
};

export default RDStrategy;
