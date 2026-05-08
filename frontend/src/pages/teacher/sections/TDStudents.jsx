import { PlusCircle } from "@phosphor-icons/react";
import { S } from "./TDStyles";

export default function TDStudents({ campusStudents, loadingStudents, setShowAddStudentModal, onOpenStudentProfile }) {
  return (
    <div style={S.tableCard} className="table-container animate-fadeIn">
      <div style={S.tableHeader}>
        <div>
          <h2 style={S.tableTitle}>👥 Student Directory</h2>
          <p style={S.tableSubtitle}>Manage and view students in your department</p>
        </div>
        <button onClick={() => setShowAddStudentModal(true)} style={S.addBtn} className="add-btn">
          <PlusCircle size={20} weight="bold" /> Add Student
        </button>
      </div>
      {loadingStudents ? (
        <div style={{ textAlign:'center', padding:'40px', color:'#64748b' }}>Loading students...</div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={S.table}>
            <thead>
              <tr style={S.tableHeadRow}>
                <th style={S.th}>STUDENT NAME</th>
                <th style={S.th}>ROLL NUMBER</th>
                <th style={S.th}>EMAIL</th>
                <th style={S.th}>SEMESTER</th>
                <th style={S.th}>JOINED ON</th>
              </tr>
            </thead>
            <tbody>
              {campusStudents.map(student => (
                <tr key={student.student_id} style={S.tableRow}>
                  <td style={S.td}>
                    <div 
                      style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}
                      onClick={() => onOpenStudentProfile(student)}
                    >
                      <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'#f1f5f9', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700' }}>{student.name.charAt(0)}</div>
                      <div>
                        <span style={{ fontWeight:'700', color:'#4f46e5', display:'block' }}>{student.name}</span>
                        <span style={{ fontSize:'10px', color:'#64748b' }}>View Profile</span>
                      </div>
                    </div>
                  </td>
                  <td style={S.td}><span style={{ fontWeight:700, color:'#0f172a' }}>{student.roll_number || 'N/A'}</span></td>
                  <td style={S.td}>{student.email}</td>
                  <td style={S.td}><span style={{ padding:'4px 8px', background:'#e0f2fe', color:'#0369a1', borderRadius:'6px', fontSize:'12px', fontWeight:700 }}>Sem {student.semester}</span></td>
                  <td style={S.td}>{new Date(student.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {campusStudents.length === 0 && <tr><td colSpan="5" style={S.emptyTableCell}>No students found in your department</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
