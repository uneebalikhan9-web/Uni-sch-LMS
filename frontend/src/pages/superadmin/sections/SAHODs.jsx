import { Plus, Trash, ChartLine, Buildings, Globe, ShieldCheck, Calendar, Users, UserCircle, PencilSimple } from "@phosphor-icons/react";
import { S } from "./SAStyles";

export default function SAHODs({
  isSchool = false,
  hods, departments,
  showAddModal, setShowAddModal,
  newHOD, setNewHOD,
  editingItem, setEditingItem,
  onAdd, onDelete,
  showHODModal, setShowHODModal,
  selectedHODDetails, isHODDetailsLoading,
  onViewDetails
}) {
  return (
    <>
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <h2 style={S.tableTitle}>{isSchool ? 'Principals & Headmasters' : 'Deans & Academic Heads'}</h2>
          <button onClick={() => { setEditingItem(null); setNewHOD({ name: "", email: "", password: "", campus_id: "" }); setShowAddModal(true); }} style={S.addBtn} className="add-btn">
            <Plus size={18} weight="bold" />
            <span>{isSchool ? 'Add Principal / Head' : 'Add Dean / Head'}</span>
          </button>
        </div>
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>NAME</th>
                <th style={S.th}>EMAIL</th>
                <th style={S.th}>{isSchool ? 'BRANCH' : 'CAMPUS'}</th>
                <th style={S.th}>JOINED</th>
                <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {hods.map(p => (
                <tr key={p.id} style={S.tr}>
                  <td style={S.tdName}>{p.name}</td>
                  <td style={S.td}>{p.email}</td>
                  <td style={S.td}><span style={S.campusTag}>{p.campus_name || '—'}</span></td>
                  <td style={S.td}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={{...S.td, textAlign: 'right'}}>
                    <div style={S.actionButtons}>
                      <button 
                        style={{...S.editBtn, background: '#f1f5f9', color: 'var(--primary-color, #4f46e5)'}} 
                        className="view-btn"
                        onClick={() => onViewDetails(p.id)}
                        title="View Details"
                      >
                        <ChartLine size={16} weight="bold" />
                      </button>
                      <button 
                        style={{...S.editBtn, background: '#e0e7ff', color: '#4338ca'}} 
                        className="edit-btn"
                        onClick={() => { setEditingItem(p); setShowAddModal(true); }}
                        title={isSchool ? "Edit Principal / Head" : "Edit Dean / Head"}
                      >
                        <PencilSimple size={16} weight="bold" />
                      </button>
                      <button 
                        style={S.deleteBtn} className="delete-btn"
                        onClick={() => onDelete(p.id)}
                        title={isSchool ? "Delete Principal / Head" : "Delete Dean / Head"}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Principal Modal */}
      {showAddModal && (
        <div style={S.overlay} onClick={() => setShowAddModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
            <h3 style={S.modalTitle}>{editingItem ? (isSchool ? 'Edit Principal / Head' : 'Edit Dean / Academic Head') : (isSchool ? 'Add New Principal / Headmaster' : 'Add New Dean / Academic Head')}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.modalClose}>×</button>
            </div>
            <form onSubmit={onAdd} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Full Name</label>
                <input placeholder={isSchool ? "e.g., Mr. Ahmed / Mrs. Sara" : "e.g., Prof. Ahmed"} required value={editingItem ? editingItem.name : newHOD.name} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewHOD({...newHOD, name: e.target.value})} style={S.input} />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Email Address</label>
                <input placeholder={isSchool ? "principal@school.edu" : "principal@department.edu"} required type="email" value={editingItem ? editingItem.email : newHOD.email} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, email: e.target.value}) : setNewHOD({...newHOD, email: e.target.value})} style={S.input} />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>{editingItem ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input placeholder="Password" required={!editingItem} type="password" autoComplete="new-password"
                  value={editingItem ? (editingItem.password || '') : newHOD.password} onChange={e => editingItem ? setEditingItem({...editingItem, password: e.target.value}) : setNewHOD({...newHOD, password: e.target.value})} style={S.input} />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>{isSchool ? 'Assign to Branch' : 'Assign to Campus'}</label>
                <select required value={editingItem ? editingItem.campus_id : newHOD.campus_id} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, campus_id: e.target.value}) : setNewHOD({...newHOD, campus_id: e.target.value})} style={S.input}>
                  <option value="">{isSchool ? 'Select a Branch...' : 'Select a Campus...'}</option>
                  {departments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>{editingItem ? 'Save Changes' : (isSchool ? 'Create Principal / Head' : 'Create Dean / Head')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Principal Details Modal */}
      {showHODModal && (
        <div style={S.overlay} onClick={() => { setShowHODModal(false); }}>
          <div style={{...S.modal, maxWidth: '600px', padding: '0', overflow: 'hidden'}} onClick={e => e.stopPropagation()}>
            {isHODDetailsLoading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={S.loadingSpinner}></div>
                <p style={{ marginTop: '16px', color: '#64748b' }}>Fetching real-time stats...</p>
              </div>
            ) : selectedHODDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #7c3aed)', padding: '30px', color: 'white', position: 'relative', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', opacity: 0.8 }} onClick={() => setShowHODModal(false)}>
                    <Plus size={24} weight="bold" style={{ transform: 'rotate(45deg)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                      {selectedHODDetails.name.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 4px 0' }}>{selectedHODDetails.name}</h2>
                      <p style={{ opacity: 0.9, fontSize: '0.95rem', margin: 0 }}>{selectedHODDetails.email}</p>
                      <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <Buildings size={14} weight="fill" />
                        {selectedHODDetails.campus_name}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '30px', background: '#fff', overflowY: 'auto', flex: 1 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
                    <div>
                      <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Principal Information</h4>
                      <div style={S.infoItem}>
                        <Calendar size={18} color="#64748b" style={{ flexShrink: 0 }} />
                        <div>
                          <p style={S.infoLabel}>Member Since</p>
                          <p style={S.infoValue}>{new Date(selectedHODDetails.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div style={S.infoItem}>
                        <ShieldCheck size={18} color="#64748b" style={{ flexShrink: 0 }} />
                        <div>
                          <p style={S.infoLabel}>System Role</p>
                          <p style={S.infoValue}>Dean / Academic Council</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department Context</h4>
                      <div style={S.infoItem}>
                        <Globe size={18} color="#64748b" style={{ flexShrink: 0 }} />
                        <div>
                          <p style={S.infoLabel}>Location</p>
                          <p style={S.infoValue}>{selectedHODDetails.campus_location || 'Not Set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Operational Stats</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '12px' }}>
                    {[
                      { label: 'Students', val: selectedHODDetails.stats.students, color: 'var(--primary-color, #4f46e5)', icon: <Users size={20} /> },
                      { label: 'Teachers', val: selectedHODDetails.stats.teachers, color: '#7c3aed', icon: <UserCircle size={20} /> },
                      { label: 'Classes', val: selectedHODDetails.stats.classes, color: '#0891b2', icon: <Buildings size={20} /> },
                      { label: 'Courses', val: selectedHODDetails.stats.courses, color: '#2563eb', icon: <ChartLine size={20} /> },
                      { label: 'Labs', val: selectedHODDetails.stats.labs, color: '#ec4899', icon: <Globe size={20} /> },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: '#f8fafc', padding: '16px 8px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: stat.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>{stat.val}</h3>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '24px', padding: '16px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', lineHeight: 1.5 }}>
                      This Head of Department has full operational control over the <strong style={{ color: '#0f172a' }}>{selectedHODDetails.campus_name}</strong> faculty.
                    </span>
                  </div>
                </div>

                <div style={{ padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                  <button onClick={() => setShowHODModal(false)} style={{ padding: '10px 24px', background: '#0f172a', color: 'white', borderRadius: '10px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
