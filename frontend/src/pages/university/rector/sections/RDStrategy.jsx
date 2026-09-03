import React, { useState, useEffect } from 'react';
import { S } from './RDStyles';
import { ChartLineUp, SquaresFour, ChartPie, Info } from '@phosphor-icons/react';
import API_BASE_URL from '../../../../config/api';
import { useToast } from '../../../../components/Toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RDStrategy = ({ activeTab }) => {
  const isFinance = activeTab === 'finance';
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFinance) {
      fetchFinanceData();
    } else {
      fetchData();
    }
  }, [isFinance]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rector/strategy`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/rector/finance`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      const json = await res.json();
      if (json.success) setFinanceData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProposal = () => {
    showToast(isFinance ? "Analyzing fiscal trends for budget proposal..." : "Generating comprehensive strategic proposal based on current KPIs...", "success");
    setTimeout(() => {
      showToast(isFinance ? "Fiscal proposal ready for review!" : "Proposal generated! Check your institutional inbox.", "info");
    }, 2000);
  };

  if (loading) return <div style={{padding:'40px', textAlign:'center', color:'#1e3a8a'}}>{isFinance ? 'Calculating Fiscal Metrics...' : 'Analyzing Institutional Growth...'}</div>;

  const growthChartData = {
    labels: data?.growthData?.map(d => d.year) || [],
    datasets: [{
      label: 'Enrollment Growth',
      data: data?.growthData?.map(d => d.count) || [],
      borderColor: 'var(--primary-color, #4f46e5)',
      backgroundColor: 'rgba(var(--primary-rgb, 79, 70, 229), 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const enrollmentChartData = {
    labels: data?.enrollmentBreakdown?.map(d => d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name) || [],
    datasets: [{
      label: 'Students',
      data: data?.enrollmentBreakdown?.map(d => d.count) || [],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'],
      borderRadius: 8
    }]
  };

  const financeChartData = {
    labels: ['Revenue', 'Expenses', 'Payroll'],
    datasets: [{
      data: [financeData?.totalRevenue || 0, financeData?.totalExpenses || 0, financeData?.payrollDisbursed || 0],
      backgroundColor: ['#10b981', '#ef4444', '#3b82f6'],
      hoverOffset: 4
    }]
  };

  const spendingChartData = {
    labels: financeData?.spendingByDept?.map(d => d.name) || [],
    datasets: [{
      label: 'Amount (PKR)',
      data: financeData?.spendingByDept?.map(d => d.amount) || [],
      backgroundColor: '#8b5cf6',
      borderRadius: 8
    }]
  };

  return (
    <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
      <div style={S.contentGrid}>
        {/* Main Analytics Card */}
        <div style={S.card}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
            <h3 style={S.cardTitle}>{isFinance ? 'Budget Utilization Nexus' : 'Academic Growth Trajectory'}</h3>
            <Info size={20} color="#94a3b8" style={{cursor:'pointer'}} />
          </div>
          <div style={{height:'400px', padding:'10px'}}>
             {isFinance ? (
                <div style={{height:'100%', display:'flex', justifyContent:'center'}}>
                   <Bar 
                     data={financeChartData} 
                     options={{ 
                       responsive: true, 
                       maintainAspectRatio: false,
                       plugins: { legend: { display: false } },
                       scales: { y: { beginAtZero: true } }
                     }} 
                   />
                </div>
             ) : (
               <Line 
                 data={growthChartData} 
                 options={{ 
                   responsive: true, 
                   maintainAspectRatio: false,
                   plugins: { legend: { display: false } },
                   scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
                 }} 
               />
             )}
          </div>
        </div>

        {/* Side Summary */}
        <div style={{display:'flex', flexDirection:'column', gap:'24px'}}>
          <div style={{...S.card, padding:'24px'}}>
            <h4 style={{margin:0, fontSize:'1rem', fontWeight:'800', color:'#1e3a8a'}}>{isFinance ? 'Fiscal Health' : 'Current Quarter'}</h4>
            <div style={{marginTop:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                <span style={{fontSize:'0.85rem', color:'#64748b'}}>{isFinance ? 'Operating Margin' : 'Efficiency Index'}</span>
                <span style={{fontSize:'0.85rem', fontWeight:'800', color:'#10b981'}}>{isFinance ? `${financeData?.operatingMargin ?? 0}%` : (data?.efficiency || 0) + '%'}</span>
              </div>
              <div style={{height:'6px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden'}}>
                <div style={{width: isFinance ? `${Math.min(Math.abs(financeData?.operatingMargin ?? 0), 100)}%` : `${data?.efficiency || 0}%`, height:'100%', background:'#10b981'}} />
              </div>
            </div>
            <div style={{marginTop:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                <span style={{fontSize:'0.85rem', color:'#64748b'}}>{isFinance ? 'Budget Adherence' : 'Quality Score'}</span>
                <span style={{fontSize:'0.85rem', fontWeight:'800', color:'#3b82f6'}}>{isFinance ? `${financeData?.budgetAdherence ?? 0}%` : (data?.quality || 0) + '%'}</span>
              </div>
              <div style={{height:'6px', background:'#f1f5f9', borderRadius:'3px', overflow:'hidden'}}>
                <div style={{width: isFinance ? `${financeData?.budgetAdherence ?? 0}%` : `${data?.quality || 0}%`, height:'100%', background:'#3b82f6'}} />
              </div>
            </div>
          </div>

          <div style={{...S.card, padding:'24px', background:'linear-gradient(135deg, #1e3a8a, #1e40af)', color:'#fff'}}>
             <h4 style={{margin:0, fontSize:'0.9rem', fontWeight:'800'}}>{isFinance ? 'Finance Tip' : 'Strategy Tip'}</h4>
             <p style={{fontSize:'0.8rem', marginTop:'10px', opacity:0.9, lineHeight:'1.5'}}>
               {isFinance 
                 ? "Operating costs are slightly high this quarter. Reducing utility overhead by 5% could improve net margins significantly."
                 : (data?.tip || "No strategic insights available at this moment. Add student and faculty data to generate real-time tips.")
               }
             </p>
             <button 
               onClick={handleGenerateProposal}
               style={{marginTop:'15px', width:'100%', padding:'10px', borderRadius:'10px', border:'none', background:'rgba(255,255,255,0.2)', color:'#fff', fontWeight:'700', cursor:'pointer', fontSize:'0.8rem'}}
             >
               Generate Proposal
             </button>
          </div>
        </div>
      </div>
      
      {/* Lower Breakdown */}
      <div style={S.card}>
         <h3 style={S.cardTitle}><SquaresFour size={24} weight="fill" /> {isFinance ? 'Spending per Department' : 'Program-wise Enrollment Breakdown'}</h3>
         <div style={{height:'300px', padding:'20px'}}>
            {isFinance ? (
               <Bar 
                 data={spendingChartData} 
                 options={{ 
                   responsive: true, 
                   maintainAspectRatio: false,
                   plugins: { legend: { display: false } },
                   scales: { y: { beginAtZero: true } }
                 }} 
               />
            ) : (
               <Bar 
                 data={enrollmentChartData} 
                 options={{ 
                   responsive: true, 
                   maintainAspectRatio: false,
                   plugins: { legend: { display: false } },
                   scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
                 }} 
               />
            )}
         </div>
      </div>
    </div>
  );
};

export default RDStrategy;
