import React, { useState } from 'react';

const S = {
  modalOverlay: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(15, 23, 42, 0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal: { background:'#fff', borderRadius:'24px', width:'95%', maxWidth:'1200px', padding:'0', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.25)', display:'flex', flexDirection:'column', border:'1px solid rgba(255,255,255,0.1)' },
  modalHeader: { padding:'20px 24px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  modalTitle: { margin:0, fontSize:'1.25rem', color:'#0f172a', fontWeight:800 },
  modalClose: { background:'transparent', border:'none', fontSize:'24px', color:'#64748b', cursor:'pointer', padding:'4px', lineHeight:1, borderRadius:'8px' },
  input: { width:'100%', padding:'10px 14px', border:'1px solid #cbd5e1', borderRadius:'12px', fontSize:'14px', color:'#1e293b', background:'#fff', outline:'none', boxSizing:'border-box' },
  modalActions: { padding:'20px 24px', borderTop:'1px solid #e2e8f0', background:'#f8fafc', borderRadius:'0 0 24px 24px', display:'flex', justifyContent:'flex-end', gap:'12px' },
  cancelBtn: { padding:'12px 24px', borderRadius:'14px', border:'1px solid #cbd5e1', background:'#fff', color:'#64748b', fontWeight:700, cursor:'pointer' },
  saveBtn: { padding:'12px 32px', borderRadius:'14px', border:'none', background:'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', color:'#fff', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 12px rgba(124,58,237,0.3)' }
};

export function BulkDataSheetModal({ show, onClose, onSaveAll, type = 'student' }) {
  const getEmptyRow = () => {
    if (type === 'teacher') {
      return { name: '', email: '', password: 'Password123', designation: '' };
    }
    return { name: '', email: '', password: 'Password123', semester: 1, father_name: '', father_cnic: '', bform_number: '' };
  };

  const [rows, setRows] = useState([getEmptyRow(), getEmptyRow(), getEmptyRow(), getEmptyRow(), getEmptyRow()]);

  if (!show) return null;

  const handleCellChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleAddRows = () => {
    setRows([...rows, getEmptyRow(), getEmptyRow(), getEmptyRow(), getEmptyRow(), getEmptyRow()]);
  };

  const handleSave = () => {
    const validRows = rows.filter(r => r.name.trim() !== '' && r.email.trim() !== '');
    if (validRows.length === 0) {
      alert(`Please fill in at least the Name and Email for one ${type}.`);
      return;
    }
    onSaveAll(validRows);
    setRows([getEmptyRow(), getEmptyRow(), getEmptyRow(), getEmptyRow(), getEmptyRow()]);
  };

  const handleClose = () => {
    setRows([getEmptyRow(), getEmptyRow(), getEmptyRow(), getEmptyRow(), getEmptyRow()]);
    onClose();
  };

  const isTeacher = type === 'teacher';

  return (
    <div style={S.modalOverlay} onClick={handleClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()} className="animate-slideUp">
        <div style={S.modalHeader}>
          <div>
            <h3 style={S.modalTitle}>📝 Bulk {isTeacher ? 'Teacher' : 'Student'} Entry Sheet</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Enter details directly in the grid. Rows without Name and Email will be ignored.</p>
          </div>
          <button onClick={handleClose} style={S.modalClose}>×</button>
        </div>
        
        <div style={{ overflowX: 'auto', maxHeight: '65vh', padding: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isTeacher ? '800px' : '1000px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0', width: '40px' }}>#</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Full Name *</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Email Address *</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Password</th>
                {isTeacher ? (
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Designation</th>
                ) : (
                  <>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0', width: '100px' }}>Sem *</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Father's Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>Father's CNIC</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>B-Form / CNIC</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>{i + 1}</td>
                  <td style={{ padding: '8px' }}><input value={row.name} onChange={e => handleCellChange(i, 'name', e.target.value)} placeholder="Full Name" style={{...S.input, marginBottom: 0, padding: '8px 12px'}} /></td>
                  <td style={{ padding: '8px' }}><input value={row.email} onChange={e => handleCellChange(i, 'email', e.target.value)} placeholder="email@example.com" style={{...S.input, marginBottom: 0, padding: '8px 12px'}} /></td>
                  <td style={{ padding: '8px' }}><input value={row.password} onChange={e => handleCellChange(i, 'password', e.target.value)} placeholder="Default..." style={{...S.input, marginBottom: 0, padding: '8px 12px'}} /></td>
                  {isTeacher ? (
                    <td style={{ padding: '8px' }}><input value={row.designation} onChange={e => handleCellChange(i, 'designation', e.target.value)} placeholder="e.g. Lecturer" style={{...S.input, marginBottom: 0, padding: '8px 12px'}} /></td>
                  ) : (
                    <>
                      <td style={{ padding: '8px' }}>
                        <select value={row.semester} onChange={e => handleCellChange(i, 'semester', parseInt(e.target.value))} style={{...S.input, marginBottom: 0, padding: '8px 12px'}}>
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}><input value={row.father_name} onChange={e => handleCellChange(i, 'father_name', e.target.value)} placeholder="Father Name" style={{...S.input, marginBottom: 0, padding: '8px 12px'}} /></td>
                      <td style={{ padding: '8px' }}><input value={row.father_cnic} onChange={e => handleCellChange(i, 'father_cnic', e.target.value)} placeholder="xxxxx-xxxxxxx-x" style={{...S.input, marginBottom: 0, padding: '8px 12px'}} /></td>
                      <td style={{ padding: '8px' }}><input value={row.bform_number} onChange={e => handleCellChange(i, 'bform_number', e.target.value)} placeholder="Student CNIC" style={{...S.input, marginBottom: 0, padding: '8px 12px'}} /></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleAddRows} style={{ marginTop: '16px', padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, width: '100%' }}>
            + Add 5 More Rows
          </button>
        </div>
        
        <div style={S.modalActions}>
          <button type="button" onClick={handleClose} style={S.cancelBtn}>Cancel</button>
          <button type="button" onClick={handleSave} style={S.saveBtn}>Save All {isTeacher ? 'Teachers' : 'Students'}</button>
        </div>
      </div>
    </div>
  );
}
