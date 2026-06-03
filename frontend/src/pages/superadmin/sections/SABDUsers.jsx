import { Plus, PencilSimple, Trash, ChartLine, IdentificationCard, Buildings, Globe, ShieldCheck, Calendar, House, UserCircle, Users, PlusCircle } from "@phosphor-icons/react";
import { S } from "./SAStyles";

export default function SABDUsers({
  bds, departments,
  editingItem, setEditingItem,
  showAddModal, setShowAddModal,
  newBD, setNewBD,
  onAdd, onDelete,
  showBDModal, setShowBDModal,
  selectedBDDetails, isBDDetailsLoading,
  onViewDetails
}) {
  return (
    <>
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <h2 style={S.tableTitle}>BD Users</h2>
          <button onClick={() => { setEditingItem(null); setShowAddModal(true); }} style={S.addBtn} className="add-btn">
            <Plus size={18} weight="bold" />
            <span>Add BD User</span>
          </button>
        </div>
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>NAME</th>
                <th style={S.th}>CAMPUS</th>
                <th style={S.th}>EMAIL</th>
                <th style={S.th}>JOINED</th>
                <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {bds.map(bd => (
                <tr key={bd.id} style={S.tr}>
                  <td style={S.tdName}>{bd.name}</td>
                  <td style={S.td}>
                    <span style={{...S.planBadge, background: '#f1f5f9', color: '#475569'}}>
                      {bd.campus_name || "Global / Multi-Campus"}
                    </span>
                  </td>
                  <td style={S.td}>{bd.email}</td>
                  <td style={S.td}>{new Date(bd.created_at).toLocaleDateString()}</td>
                  <td style={{...S.td, textAlign: 'right'}}>
                    <div style={S.actionButtons}>
                      <button 
                        style={{...S.editBtn, background: '#f1f5f9', color: 'var(--primary-color, #4f46e5)'}} 
                        className="view-btn"
                        onClick={() => onViewDetails(bd.id)}
                        title="View Details"
                      >
                        <ChartLine size={16} weight="bold" />
                      </button>
                      <button 
                        style={S.editBtn}
                        onClick={() => { 
                          setEditingItem(bd); 
                          setNewBD({ name: bd.name, email: bd.email, password: "", campus_id: bd.campus_id || "" }); 
                          setShowAddModal(true); 
                        }}
                        title="Edit BD User"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button style={S.deleteBtn} onClick={() => onDelete(bd.id)} title="Delete BD User">
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

      {/* Add/Edit BD Modal */}
      {showAddModal && (
        <div style={S.overlay} onClick={() => { setShowAddModal(false); setEditingItem(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
            <h3 style={S.modalTitle}>{editingItem ? 'Edit BD User' : 'Add New BD User'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.modalClose}>×</button>
            </div>
            <form onSubmit={onAdd} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Full Name</label>
                <input placeholder="e.g., John Doe" required
                  value={editingItem ? editingItem.name : newBD.name} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewBD({...newBD, name: e.target.value})} 
                  style={S.input} />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Email Address</label>
                <input placeholder="bd@example.com" required type="email"
                  value={editingItem ? editingItem.email : newBD.email} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, email: e.target.value}) : setNewBD({...newBD, email: e.target.value})} 
                  style={S.input} />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Password {editingItem && "(leave blank to keep current)"}</label>
                <input placeholder="••••••••" required={!editingItem} type="password" autoComplete="new-password"
                  value={editingItem ? editingItem.password : newBD.password} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, password: e.target.value}) : setNewBD({...newBD, password: e.target.value})} 
                  style={S.input} />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Assign to Campus (Optional for Global)</label>
                <select 
                  value={editingItem ? (editingItem.campus_id || "") : newBD.campus_id} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, campus_id: e.target.value}) : setNewBD({...newBD, campus_id: e.target.value})} 
                  style={S.input}>
                  <option value="">Global / No Specific Campus</option>
                  {departments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>{editingItem ? 'Update BD' : 'Create BD'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BD Details Modal */}
      {showBDModal && (
        <div style={S.overlay} onClick={() => { setShowBDModal(false); }}>
          <div style={{...S.modal, maxWidth: '600px', padding: '0', overflow: 'hidden'}} onClick={e => e.stopPropagation()}>
            {isBDDetailsLoading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={S.loadingSpinner}></div>
                <p style={{ marginTop: '16px', color: '#64748b' }}>Fetching BD performance stats...</p>
              </div>
            ) : selectedBDDetails ? (
              <div>
                <div style={{ background: 'linear-gradient(135deg, #0e7490, #0891b2)', padding: '30px', color: 'white', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', opacity: 0.8 }} onClick={() => setShowBDModal(false)}>
                    <Plus size={24} weight="bold" style={{ transform: 'rotate(45deg)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '800', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                      {selectedBDDetails.name.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px' }}>{selectedBDDetails.name}</h2>
                      <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>{selectedBDDetails.email}</p>
                      <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        <IdentificationCard size={14} weight="fill" />
                        {selectedBDDetails.role === 'bd_agent' ? 'BD Agent' : 'Business Developer'}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '30px', background: '#fff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '30px' }}>
                    <div>
                      <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BD Information</h4>
                      <div style={S.infoItem}>
                        <Calendar size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>Member Since</p>
                          <p style={S.infoValue}>{new Date(selectedBDDetails.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div style={S.infoItem}>
                        <ShieldCheck size={18} color="#64748b" />
                        <div>
                          <p style={S.infoLabel}>Account Status</p>
                          <p style={S.infoValue}>{selectedBDDetails.is_approved ? 'Verified' : 'Pending'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 style={{ color: '#0f172a', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Focus</h4>
                      <div style={S.infoItem}>
                        <Buildings size={18} color="#64748b" />
                        <div><p style={S.infoLabel}>Primary Metric</p><p style={S.infoValue}>Campus Acquisitions</p></div>
                      </div>
                      <div style={S.infoItem}>
                        <Globe size={18} color="#64748b" />
                        <div><p style={S.infoLabel}>Region</p><p style={S.infoValue}>Multi-Campus</p></div>
                      </div>
                    </div>
                  </div>
                  <h4 style={{ color: '#0f172a', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales & Growth Metrics</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                    {[
                      { label: 'Total Leads', val: selectedBDDetails.stats.totalLeads, color: '#0891b2', icon: <House size={20} /> },
                      { label: 'Closed Deals', val: selectedBDDetails.stats.closedLeads, color: '#10b981', icon: <ShieldCheck size={20} /> },
                      { label: 'Shortlisted', val: selectedBDDetails.stats.shortlistedApplicants, color: 'var(--primary-color, #4f46e5)', icon: <UserCircle size={20} /> },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: stat.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '4px 0' }}>{stat.val}</h3>
                        <p style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Active Job Postings', val: selectedBDDetails.stats.activePostings, color: '#f59e0b', icon: <PlusCircle size={20} /> },
                      { label: 'Total Applicants', val: selectedBDDetails.stats.totalApplicants, color: '#ec4899', icon: <Users size={20} /> },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: stat.color }}>{stat.icon}</div>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0' }}>{stat.val}</h3>
                          <p style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>{stat.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowBDModal(false)} style={{ padding: '10px 24px', background: '#0f172a', color: 'white', borderRadius: '10px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
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
