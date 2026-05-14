import React from 'react';
import { S } from './RDStyles';
import { MagnifyingGlass, Funnel, DownloadSimple, DotsThreeVertical } from '@phosphor-icons/react';

const RDDataTable = ({ title, activeTab, data = [] }) => {
  const getHeaders = () => {
    switch(activeTab) {
      case 'faculty':  return ['Name', 'Designation', 'Department', 'Load', 'Status'];
      case 'students': return ['Academic Year', 'Intake', 'Retention', 'Avg GPA', 'Growth'];
      case 'research': return ['Project Title', 'Lead PI', 'Funding', 'Duration', 'Impact'];
      case 'compliance': return ['Accreditation', 'Body', 'Valid Until', 'Last Audit', 'Risk'];
      default: return ['Item', 'Detail', 'Metric', 'Date', 'Status'];
    }
  };

  const headers = getHeaders();

  return (
    <div style={S.card}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px'}}>
        <div>
          <h2 style={{...S.cardTitle, marginBottom:'4px'}}>{title}</h2>
          <p style={{margin:0, fontSize:'0.85rem', color:'#64748b'}}>Institutional records and metrics for {activeTab}</p>
        </div>
        <div style={{display:'flex', gap:'12px'}}>
          <div style={{position:'relative'}}>
             <MagnifyingGlass size={18} style={{position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#94a3b8'}} />
             <input placeholder="Search..." style={{padding:'10px 15px 10px 40px', borderRadius:'12px', border:'1px solid #e2e8f0', fontSize:'0.85rem'}} />
          </div>
          <button style={{padding:'10px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', cursor:'pointer'}}><Funnel size={20} color="#64748b" /></button>
          <button style={{padding:'10px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'12px', cursor:'pointer'}}><DownloadSimple size={20} color="#64748b" /></button>
        </div>
      </div>

      <div style={{overflowX:'auto'}}>
        <table style={S.table}>
          <thead>
            <tr>
              {headers.map(h => <th key={h} style={S.th}>{h}</th>)}
              <th style={{...S.th, textAlign:'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((item, i) => (
              <tr key={i} style={S.tr}>
                {Object.values(item).map((val, idx) => (
                  <td key={idx} style={{...S.td, ...(idx === 0 ? S.tdFirst : {}), ...(idx === Object.values(item).length - 1 ? S.tdLast : {})}}>
                    {typeof val === 'string' && val.includes('%') ? (
                       <span style={{color:'#1e3a8a', fontWeight:'800'}}>{val}</span>
                    ) : val}
                  </td>
                ))}
                <td style={{...S.td, ...S.tdLast, textAlign:'right'}}>
                  <button style={{background:'none', border:'none', cursor:'pointer'}}><DotsThreeVertical size={18} color="#64748b" /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={headers.length + 1} style={{textAlign:'center', padding:'60px', color:'#94a3b8', fontSize:'0.9rem'}}>
                  No records found in the {activeTab} nexus.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RDDataTable;
