import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Phone, EnvelopeSimple, MapPin, GraduationCap, 
  Clock, ShieldCheck, Heartbeat, FileText, Receipt, CheckCircle, 
  Calendar, Buildings, IdentificationCard, Sparkle
} from '@phosphor-icons/react';
import API_BASE_URL from '../../../config/api';

export default function ApplicantDetailsModal({ applicant, onClose, onPrintChallan, onClearFee, onAdmit }) {
  if (!applicant) return null;

  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  const photoSrc = getPhotoUrl(applicant.photo_url);

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return d;
    }
  };

  const modalContent = (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35)',
        border: '1px solid #e2e8f0',
        margin: 'auto',
        overflow: 'hidden'
      }}>
        {/* MODAL HEADER */}
        <div style={{
          padding: '22px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {photoSrc ? (
              <img 
                src={photoSrc} 
                alt={applicant.full_name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              />
            ) : (
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: '900',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}>
                {applicant.full_name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#ffffff' }}>
                  {applicant.full_name}
                </h2>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  background: applicant.fee_status === 'paid' ? '#10b981' : '#f59e0b',
                  color: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  {applicant.fee_status === 'paid' ? '✓ Fee Paid & Verified' : '● Fee Pending'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#c7d2fe' }}>
                Application Ref: <strong>#APP-{applicant.id}</strong> • Applied for: <strong>{applicant.target_class || applicant.program || 'Degree / Grade'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            title="Close modal"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{
          padding: '24px 28px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          background: '#f8fafc'
        }}>
          {/* SECTION 1: PERSONAL & RESIDENCE */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h4 style={{
              margin: '0 0 14px 0',
              fontSize: '0.92rem',
              fontWeight: '800',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <User size={18} color="#4f46e5" weight="bold" />
              1. Personal & Contact Profile
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px 16px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Full Name</div>
                <div style={{ color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>{applicant.full_name || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Father / Guardian Name</div>
                <div style={{ color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>{applicant.father_name || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Gender</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.gender || 'Male'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Date of Birth</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{formatDate(applicant.dob)}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>B-Form / CNIC</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.bform_number || applicant.cnic || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Religion & Nationality</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>
                  {applicant.religion || 'Islam'} • {applicant.nationality || 'Pakistani'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</div>
                <div style={{ color: '#4f46e5', fontWeight: '700', marginTop: '2px', wordBreak: 'break-all' }}>{applicant.email || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Contact Phone / Mobile</div>
                <div style={{ color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>{applicant.phone || applicant.father_phone || '—'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Residential Address & City</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>
                  {applicant.address ? `${applicant.address}, ${applicant.city || 'Lahore'}` : (applicant.city || 'Lahore')}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: EMERGENCY & GUARDIAN DETAILS */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h4 style={{
              margin: '0 0 14px 0',
              fontSize: '0.92rem',
              fontWeight: '800',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={18} color="#059669" weight="bold" />
              2. Guardian & Emergency Contact
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px 16px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Father's CNIC</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.father_cnic || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Father's Phone Number</div>
                <div style={{ color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>{applicant.father_phone || applicant.phone || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Emergency Contact Person</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>
                  {applicant.emergency_name || applicant.father_name || '—'} ({applicant.emergency_relation || 'Father / Guardian'})
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Emergency Phone</div>
                <div style={{ color: '#0f172a', fontWeight: '800', marginTop: '2px' }}>
                  {applicant.emergency_phone || applicant.father_phone || applicant.phone || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: ACADEMIC HISTORY */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h4 style={{
              margin: '0 0 14px 0',
              fontSize: '0.92rem',
              fontWeight: '800',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <GraduationCap size={18} color="#2563eb" weight="bold" />
              3. Academic Background & Prior Education
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px 16px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Last Qualification</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.last_qualification || 'Matric / O-Levels'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Board / University</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.board_university || 'BISE / Federal'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Passing Year</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.passing_year || '2024'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Marks Obtained / GPA</div>
                <div style={{ color: '#16a34a', fontWeight: '900', marginTop: '2px' }}>{applicant.marks_gpa || 'Grade A / 85%'}</div>
              </div>
            </div>
          </div>

          {/* SECTION 4: PROGRAM PREFERENCES & MEDICAL */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h4 style={{
              margin: '0 0 14px 0',
              fontSize: '0.92rem',
              fontWeight: '800',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkle size={18} color="#9333ea" weight="bold" />
              4. Target Degree Program & Shift
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px 16px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Desired Program / Class</div>
                <div style={{ color: '#4f46e5', fontWeight: '800', marginTop: '2px' }}>
                  {applicant.target_class || applicant.program || 'BS Computer Science'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Preferred Shift</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.preferred_shift || 'Morning'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Medical / Allergies</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.medical_condition || 'None / Fit'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Campus / Branch</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>{applicant.campus_name || 'Main Campus'}</div>
              </div>
              {applicant.notes && (
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Special Remarks / Notes</div>
                  <div style={{ color: '#334155', marginTop: '2px', fontStyle: 'italic' }}>{applicant.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: FINANCIAL CLEARANCE */}
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '18px 22px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <h4 style={{
              margin: '0 0 14px 0',
              fontSize: '0.92rem',
              fontWeight: '800',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Receipt size={18} color="#ea580c" weight="bold" />
              5. Financial Clearance & Enrollment Status
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px 16px',
              fontSize: '0.85rem'
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Admission Processing Fee</div>
                <div style={{ color: '#0f172a', fontWeight: '900', fontSize: '1.05rem', marginTop: '2px' }}>
                  Rs. {(applicant.admission_fee || 5000).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Payment Status</div>
                <div style={{ marginTop: '2px' }}>
                  {applicant.fee_status === 'paid' ? (
                    <span style={{ padding: '3px 10px', borderRadius: '8px', background: '#dcfce7', color: '#166534', fontWeight: '800' }}>
                      ✓ Paid ({applicant.payment_method || 'Cash Desk'})
                    </span>
                  ) : (
                    <span style={{ padding: '3px 10px', borderRadius: '8px', background: '#fef3c7', color: '#92400e', fontWeight: '800' }}>
                      ● Pending Payment
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Application Date</div>
                <div style={{ color: '#0f172a', fontWeight: '700', marginTop: '2px' }}>
                  {formatDate(applicant.created_at)}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Enrollment Stage</div>
                <div style={{ color: '#4f46e5', fontWeight: '800', marginTop: '2px' }}>
                  {applicant.status === 'admitted' ? `Admitted in ${applicant.assigned_section || 'Class'}` : applicant.fee_status === 'paid' ? 'In Principal Review' : 'Inquiry / Walk-in'}
                </div>
              </div>
              {applicant.assigned_roll_number && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Roll Number</div>
                  <div style={{ color: '#166534', fontWeight: '900', fontSize: '1.05rem', marginTop: '2px' }}>
                    {applicant.assigned_roll_number}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{
          padding: '16px 28px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onPrintChallan(applicant)}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Receipt size={16} weight="bold" /> Print 3-Copy Challan
            </button>

            {applicant.fee_status !== 'paid' && onClearFee && (
              <button
                onClick={() => { onClearFee(applicant.id); onClose(); }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                <CheckCircle size={16} weight="bold" /> Verify & Mark Paid
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '9px 22px',
              borderRadius: '12px',
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
