import React from 'react';
import { 
  User, CheckCircle, GraduationCap, Clock, Receipt, 
  Phone, IdentificationCard, Buildings, CurrencyDollar, ArrowRight
} from '@phosphor-icons/react';

export default function AdmissionsPipeline({ pipeline, onPrintChallan, onClearFee, onInspectApplicant }) {
  const stages = [
    {
      key: 'pending_fee',
      title: '1. Inquiries (Pending Fee)',
      subtitle: 'Awaiting Fee Payment / Clearance',
      icon: Clock,
      color: '#f59e0b',
      bg: '#fffbeb',
      borderColor: '#fde68a',
      badgeBg: '#fef3c7',
      badgeColor: '#92400e',
      items: pipeline?.pending_fee || []
    },
    {
      key: 'fee_verified',
      title: '2. Fee Verified by Finance',
      subtitle: 'In Principal Review for Section Allotment',
      icon: CheckCircle,
      color: '#0284c7',
      bg: '#f0f9ff',
      borderColor: '#bae6fd',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
      items: pipeline?.fee_verified || []
    },
    {
      key: 'admitted',
      title: '3. Officially Admitted',
      subtitle: 'Enrolled in Class Roster',
      icon: GraduationCap,
      color: '#10b981',
      bg: '#f0fdf4',
      borderColor: '#bbf7d0',
      badgeBg: '#dcfce7',
      badgeColor: '#166534',
      items: pipeline?.admitted || []
    }
  ];

  return (
    <div className="animate-fadeIn">
      {/* Header Info */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
            College Admissions Live Funnel
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
            Interactive stage progression from initial inquiry to final classroom enrollment.
          </p>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px',
        alignItems: 'start'
      }}>
        {stages.map(stage => (
          <div key={stage.key} style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: `1px solid ${stage.borderColor}`,
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}>
            {/* Column Header */}
            <div style={{
              padding: '16px 18px',
              background: stage.bg,
              borderBottom: `1px solid ${stage.borderColor}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: '#ffffff', color: stage.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <stage.icon size={18} weight="duotone" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>
                    {stage.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                    {stage.subtitle}
                  </p>
                </div>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '10px',
                background: stage.badgeBg,
                color: stage.badgeColor,
                fontWeight: '900',
                fontSize: '0.8rem'
              }}>
                {stage.items.length}
              </span>
            </div>

            {/* Column Items */}
            <div style={{
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'auto'
            }}>
              {stage.items.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '30px 10px',
                  color: '#94a3b8',
                  fontSize: '0.82rem'
                }}>
                  No students in this stage.
                </div>
              ) : (
                stage.items.map(student => (
                  <div key={student.id} style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}>
                    {/* Top Row: Name & Target Grade */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                          {student.full_name}
                        </h4>
                        <span style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(var(--primary-rgb, 79, 70, 229), 0.1)',
                          color: 'var(--primary-color, #4f46e5)',
                          fontSize: '0.72rem',
                          fontWeight: '800'
                        }}>
                          Grade: {student.target_class}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          background: student.fee_status === 'paid' ? '#dcfce7' : '#fef3c7',
                          color: student.fee_status === 'paid' ? '#166534' : '#92400e'
                        }}>
                          {student.fee_status === 'paid' ? '● Fee Paid' : '● Fee Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Student Info Details */}
                    <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IdentificationCard size={14} color="#94a3b8" />
                        <span>B-Form / ID: <strong>{student.bform_number || '—'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#94a3b8" />
                        <span>Father: <strong>{student.father_name || '—'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#94a3b8" />
                        <span>Contact: <strong>{student.phone || '—'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Buildings size={14} color="#94a3b8" />
                        <span>Branch: <strong>{student.campus_name || 'Main Campus'}</strong></span>
                      </div>
                      {student.assigned_section && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '700' }}>
                          <GraduationCap size={14} color="#166534" />
                          <span>Class: {student.assigned_section} (Roll: {student.assigned_roll_number || '—'})</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      paddingTop: '10px',
                      borderTop: '1px solid #e2e8f0',
                      display: 'flex',
                      gap: '8px',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <button 
                        onClick={() => onPrintChallan(student)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#334155',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Receipt size={14} weight="bold" /> Challan
                      </button>

                      {stage.key === 'pending_fee' && onClearFee && (
                        <button 
                          onClick={() => onClearFee(student.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CurrencyDollar size={14} weight="bold" /> Clear Fee
                        </button>
                      )}

                      {stage.key === 'fee_verified' && (
                        <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: '700' }}>
                          Awaiting Principal
                        </span>
                      )}

                      {stage.key === 'admitted' && (
                        <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '700' }}>
                          Active Student
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
