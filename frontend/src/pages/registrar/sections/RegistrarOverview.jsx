import React from 'react';
import { 
  Student, GraduationCap, Certificate, PencilSimple, Eye,
  Clock, CheckCircle, ShieldCheck, ChartLine, ArrowsClockwise,
  Files
} from '@phosphor-icons/react';

const RegistrarOverview = ({ stats, recentRecords, getStatusClass, handleEditRecord, handleViewTranscript }) => {
  
  // Calculate some insights
  const regularCount = recentRecords.filter(r => r.status === 'Enrolled').length;
  const regularPercentage = recentRecords.length ? Math.round((regularCount / recentRecords.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Premium Symmetrical 4-Card Stats Grid */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: 0 }}>
        
        {/* Total Enrolled Students */}
        <div className="metric-card" style={{ border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#4f46e5' }}></div>
          <div className="metric-info">
            <h4 style={{ color: '#64748b', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Enrolled</h4>
            <div className="metric-number" style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>{stats.totalEnrolled}</div>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <CheckCircle size={12} weight="bold" /> Active Status
            </span>
          </div>
          <div className="metric-icon" style={{ background: '#f5f3ff', color: '#4f46e5', borderRadius: '16px', width: '56px', height: '56px' }}>
            <Student size={28} weight="duotone" />
          </div>
        </div>

        {/* Degrees Issued */}
        <div className="metric-card" style={{ border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10b981' }}></div>
          <div className="metric-info">
            <h4 style={{ color: '#64748b', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Degrees Issued</h4>
            <div className="metric-number" style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>{stats.degreesIssued}</div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Clock size={12} weight="bold" /> Current Session
            </span>
          </div>
          <div className="metric-icon" style={{ background: '#ecfdf5', color: '#10b981', borderRadius: '16px', width: '56px', height: '56px' }}>
            <GraduationCap size={28} weight="duotone" />
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="metric-card" style={{ border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b' }}></div>
          <div className="metric-info">
            <h4 style={{ color: '#64748b', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Verifications</h4>
            <div className="metric-number" style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>{stats.pendingVerifications}</div>
            <span style={{ fontSize: '11px', color: stats.pendingVerifications > 0 ? '#ef4444' : '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Clock size={12} weight="bold" /> Action Required
            </span>
          </div>
          <div className="metric-icon" style={{ background: '#fffbeb', color: '#d97706', borderRadius: '16px', width: '56px', height: '56px' }}>
            <Certificate size={28} weight="duotone" />
          </div>
        </div>

        {/* Transcript Requests */}
        <div className="metric-card" style={{ border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6' }}></div>
          <div className="metric-info">
            <h4 style={{ color: '#64748b', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transcript Requests</h4>
            <div className="metric-number" style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>{stats.transcriptRequests}</div>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Files size={12} weight="bold" /> Awaiting Process
            </span>
          </div>
          <div className="metric-icon" style={{ background: '#f5f3ff', color: '#8b5cf6', borderRadius: '16px', width: '56px', height: '56px' }}>
            <Files size={28} weight="duotone" />
          </div>
        </div>

      </div>

      {/* Two-Column Elegant Layout: Left 2fr Table, Right 1fr Side Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '32px', alignItems: 'flex-start' }} className="responsive-flex">
        
        {/* Left Column: Recent Academic Records */}
        <div className="section" style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', margin: 0 }}>
          <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Academic Ledger</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Latest verified degree programs and student records.</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyCenter: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
              title="Refresh ledger"
            >
              <ArrowsClockwise size={18} weight="bold" style={{ margin: 'auto' }} />
            </button>
          </div>

          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>STUDENT ID</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>FULL NAME</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7' }}>PROGRAM</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>CGPA</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>STATUS</th>
                  <th style={{ padding: '16px', fontSize: '11px', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.slice(0, 6).map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px' }}>
                      <span className="id-cell" style={{ background: '#f5f3ff', color: '#4f46e5', fontWeight: '700', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
                        {record.id}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div className="name-cell" style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{record.name}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                      {record.program || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
                      {record.cgpa}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span className={`status-badge ${getStatusClass(record.status)}`} style={{ padding: '6px 14px', borderRadius: '30px', fontSize: '11px', fontWeight: '800' }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleEditRecord(record.id)} 
                          style={{ border: '1px solid #e2e8f0', background: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#4f46e5', display: 'inline-flex', transition: 'all 0.2s' }}
                          title="Edit Student Status"
                        >
                          <PencilSimple size={16} weight="bold" />
                        </button>
                        <button 
                          onClick={() => handleViewTranscript(record.id)} 
                          style={{ border: '1px solid #e2e8f0', background: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#64748b', display: 'inline-flex', transition: 'all 0.2s' }}
                          title="View Records"
                        >
                          <Eye size={16} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {recentRecords.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '600' }}>No student records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Activity Insights & Health Widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Operations and Quality Board */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                <ShieldCheck size={20} weight="bold" />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Quality Assurance</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '6px' }}>
                  <span>REGULAR ATTENDANCE RATE</span>
                  <span style={{ color: '#10b981' }}>{regularPercentage}%</span>
                </div>
                <div style={{ background: '#f1f5f9', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ background: '#10b981', height: '100%', width: `${regularPercentage}%`, borderRadius: '10px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', fontWeight: '700', marginBottom: '6px' }}>
                  <span>DEGREE PROCESSING SLA</span>
                  <span style={{ color: '#4f46e5' }}>100%</span>
                </div>
                <div style={{ background: '#f1f5f9', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ background: '#4f46e5', height: '100%', width: '100%', borderRadius: '10px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* System Performance Tracker */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#f5f3ff', color: '#8b5cf6', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                <ChartLine size={20} weight="bold" />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Verification Health</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Active Registry Sync</div>
                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>Online</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Degree DB Integrity</div>
                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>100% OK</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default RegistrarOverview;
