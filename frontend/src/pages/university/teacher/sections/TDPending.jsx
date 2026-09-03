import { S } from "./TDStyles";
import API_BASE_URL from "../../../../config/api";
import { useToast } from "../../../../components/Toast";
import { ClipboardText, Eye } from "@phosphor-icons/react";

export default function TDPending({ pendingEnrollments, loadingPending, fetchPendingEnrollments, onOpenStudentProfile }) {
  const token = sessionStorage.getItem('token');
  const { showToast } = useToast();

  const handleAction = async (enrollment, action) => {
    const endpoint = enrollment.type === 'class'
      ? `class-requests/${enrollment.request_id}/${action}`
      : `enrollments/${enrollment.request_id}/${action}`;
    try {
      const res  = await fetch(`${API_BASE_URL}/api/teachers/${endpoint}`, { method:'POST', headers:{ 'Authorization':`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { showToast(`Request ${action}d!`, 'success'); fetchPendingEnrollments(); }
      else showToast(data.message||'Error', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const courseBadge = { padding:'4px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'700' };
  const classBadgeLight = { padding:'4px 8px', background:'#f1f5f9', color:'#475569', borderRadius:'8px', fontSize:'0.75rem', fontWeight:'700' };

  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <h2 style={{ ...S.tableTitle, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardText size={24} weight="duotone" style={{ color: 'var(--primary-color, #4f46e5)' }} />
            Pending Enrollment Requests
          </h2>
          <p style={S.tableSubtitle}>Students requesting to enroll in your courses</p>
        </div>
      </div>
      {loadingPending ? (
        <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Loading enrollment requests...</div>
      ) : (
        <table style={S.table}>
          <thead>
            <tr style={S.tableHeadRow}>
              <th style={S.th}>STUDENT</th>
              <th style={S.th}>EMAIL</th>
              <th style={S.th}>COURSE</th>
              <th style={S.th}>CLASS</th>
              <th style={S.th}>REQUESTED</th>
              <th style={S.th}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {pendingEnrollments.map(enrollment => (
              <tr key={`${enrollment.type}-${enrollment.request_id}`} style={S.tableRow}>
                <td style={S.td}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'var(--primary-color, #4f46e5)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', fontSize:'14px' }}>{enrollment.student_name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight:'700', color:'#0f172a' }}>{enrollment.student_name}</div>
                      <div style={{ fontSize:'10px', color:'#94a3b8', background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px', display:'inline-block' }}>
                        {enrollment.type === 'class' ? 'Class Join Request' : 'Course Enroll Request'}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={S.td}>{enrollment.student_email}</td>
                <td style={S.td}>
                  <span style={{ ...courseBadge, background: enrollment.type === 'class' ? '#e0f2fe' : '#e0e7ff', color: enrollment.type === 'class' ? '#0369a1' : '#4338ca' }}>
                    {enrollment.label}
                  </span>
                </td>
                <td style={S.td}><span style={classBadgeLight}>{enrollment.class_name} ({enrollment.class_section})</span></td>
                <td style={S.td}>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                <td style={S.td}>
                  <div style={S.actionGroup}>
                    <button 
                      onClick={() => onOpenStudentProfile({
                        name: enrollment.student_name,
                        email: enrollment.student_email,
                        roll_number: enrollment.roll_number,
                        semester: enrollment.semester,
                        bform_number: enrollment.bform_number,
                        last_education: enrollment.last_education,
                        father_name: enrollment.father_name,
                        father_cnic: enrollment.father_cnic,
                        father_number: enrollment.father_number
                      })} 
                      style={{ padding:'6px 12px', background:'#f1f5f9', color:'#475569', borderRadius:'8px', fontSize:'0.75rem', fontWeight:'700', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}
                    >
                      <Eye size={14} weight="bold" /> View Details
                    </button>
                    <button onClick={() => handleAction(enrollment, 'approve')} style={S.approveBtn} className="approve-btn">✓ Approve</button>
                    <button onClick={() => handleAction(enrollment, 'reject')}  style={S.rejectBtn}  className="reject-btn">✕ Reject</button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingEnrollments.length === 0 && <tr><td colSpan="6" style={S.emptyTableCell}>No pending enrollment requests</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
