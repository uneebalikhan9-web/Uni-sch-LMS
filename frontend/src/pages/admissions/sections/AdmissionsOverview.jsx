import React from 'react';
import { 
  Users, FileText, CheckCircle, GraduationCap, CurrencyDollar, 
  TrendUp, Buildings, Clock, ArrowRight, UserPlus, Receipt
} from '@phosphor-icons/react';

export default function AdmissionsOverview({ stats, pipeline, onOpenWalkin, onViewPipeline }) {
  const metrics = [
    { title: 'Total Inquiries', value: stats.totalInquiries || 0, icon: Users, color: 'var(--primary-color, #4f46e5)', desc: 'Total Registered Inquiries' },
    { title: 'Pending Fee', value: stats.pendingFee || 0, icon: Clock, color: '#f59e0b', desc: 'Awaiting Fee Payment' },
    { title: 'Fee Cleared', value: stats.feeVerified || 0, icon: CheckCircle, color: '#0284c7', desc: 'In Principal Review' },
    { title: 'Officially Admitted', value: stats.admitted || 0, icon: GraduationCap, color: '#10b981', desc: 'Enrolled in Class' },
    { title: 'Fee Revenue', value: `Rs. ${(stats.totalRevenue || 0).toLocaleString()}`, icon: CurrencyDollar, color: '#8b5cf6', desc: 'Total Admission Fee Collected' }
  ];

  // Grade-wise breakdown from pipeline data
  const allList = [
    ...(pipeline?.pending_fee || []),
    ...(pipeline?.fee_verified || []),
    ...(pipeline?.admitted || [])
  ];

  const gradeCounts = {};
  allList.forEach(item => {
    const grade = item.target_class || 'Class 1';
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
  });

  const recentInquiries = allList.slice(0, 6);

  return (
    <div className="animate-fadeIn">
      {/* Top Welcome Banner with Action */}
      <div style={{
        padding: '24px 28px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#ffffff',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', fontWeight: '700', letterSpacing: '0.5px' }}>
              COLLEGE ADMISSIONS PORTAL
            </span>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', background: '#dcfce7', color: '#166534', fontWeight: '800' }}>
              ● Session 2026-2027 Active
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800' }}>College Admissions Desk & Funnel</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#c7d2fe' }}>
            Track walk-in applications, finance fee verification, and principal enrollment in real time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onOpenWalkin}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              border: 'none',
              background: '#ffffff',
              color: '#312e81',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={18} weight="bold" /> New Walk-in Admission
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {metrics.map((m, idx) => (
          <div key={idx} style={{
            background: '#ffffff',
            padding: '20px',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                {m.title}
              </span>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: `${m.color}15`, color: m.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <m.icon size={20} weight="duotone" />
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a' }}>{m.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3-Step Lifecycle Visual Guide */}
      <div style={{
        background: '#ffffff',
        padding: '22px 26px',
        borderRadius: '18px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
              College Admissions Lifecycle
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Automated workflow connecting Admissions Office ➡️ Finance Department ➡️ Principal Office
            </p>
          </div>
          <button 
            onClick={onViewPipeline}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary-color, #4f46e5)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            View Live Pipeline <ArrowRight size={14} weight="bold" />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px'
        }}>
          <div style={{
            padding: '16px', borderRadius: '14px',
            background: '#fffbeb', border: '1px solid #fde68a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
              <strong style={{ fontSize: '0.9rem', color: '#92400e' }}>Admissions Desk</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#78350f', lineHeight: '1.4' }}>
              Student & Parent registration with target grade & branch. Instant 3-copy Admission Fee Challan printed.
            </p>
          </div>

          <div style={{
            padding: '16px', borderRadius: '14px',
            background: '#eff6ff', border: '1px solid #bfdbfe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
              <strong style={{ fontSize: '0.9rem', color: '#1e40af' }}>Finance Clearance</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e3a8a', lineHeight: '1.4' }}>
              Finance verifies payment (Cash / Bank receipt). Status updates to <strong>Fee Verified</strong> and forwards to Principal.
            </p>
          </div>

          <div style={{
            padding: '16px', borderRadius: '14px',
            background: '#f0fdf4', border: '1px solid #bbf7d0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#16a34a', color: '#fff', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              <strong style={{ fontSize: '0.9rem', color: '#166534' }}>Principal Enrollment</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#14532d', lineHeight: '1.4' }}>
              Principal assigns Class Section & Roll Number. Student user account is created & enrolled into Teacher's roster.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Grade Breakdown & Recent Inquiries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Grade-wise Inquiries */}
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '18px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
            Grade-Wise Inquiries Distribution
          </h3>

          {Object.keys(gradeCounts).length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
              No grade distribution data yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(gradeCounts).map(([grade, count]) => {
                const total = allList.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={grade}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '700', color: '#334155' }}>{grade}</span>
                      <span style={{ color: '#64748b' }}>{count} student(s) ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'var(--primary-color, #4f46e5)',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Inquiries List */}
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '18px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
            Recent Admission Inquiries
          </h3>

          {recentInquiries.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
              No inquiries registered yet. Use "+ New Walk-in Admission" to register applicants.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentInquiries.map(item => (
                <div key={item.id} style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                      {item.full_name}
                    </h5>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Grade: <strong>{item.target_class}</strong> • Father: {item.father_name || '—'}
                    </p>
                  </div>
                  <div>
                    {item.status === 'admitted' || item.status === 'approved' ? (
                      <span style={{ padding: '3px 8px', borderRadius: '8px', background: '#dcfce7', color: '#166534', fontSize: '0.72rem', fontWeight: '800' }}>
                        Admitted
                      </span>
                    ) : item.status === 'fee_verified' || item.fee_status === 'paid' ? (
                      <span style={{ padding: '3px 8px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: '800' }}>
                        Fee Paid
                      </span>
                    ) : (
                      <span style={{ padding: '3px 8px', borderRadius: '8px', background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: '800' }}>
                        Pending Fee
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
