import { Plus, Trash, Buildings, Users, Envelope, ShieldCheck, Calendar, UserCirclePlus } from "@phosphor-icons/react";
import { S } from "./SAStyles";

export default function SAFinanceManagers({
  financeManagers, departments,
  showAddModal, setShowAddModal,
  newManager, setNewManager,
  onAdd, onDelete
}) {
  return (
    <>
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: '#f5f3ff', color: '#4f46e5', borderRadius: '12px' }}>
              <Users size={24} weight="duotone" />
            </div>
            <h2 style={S.tableTitle}>Finance Managers</h2>
          </div>
          <button onClick={() => { setShowAddModal(true); }} style={S.addBtn} className="add-btn">
            <UserCirclePlus size={18} weight="bold" />
            <span>Add Finance Manager</span>
          </button>
        </div>
        
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>MANAGER NAME</th>
                <th style={S.th}>CAMPUS / DEPARTMENT</th>
                <th style={S.th}>EMAIL</th>
                <th style={S.th}>DATE ADDED</th>
                <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {financeManagers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No finance managers found. Create one to manage campus finances.
                  </td>
                </tr>
              ) : (
                financeManagers.map(fm => (
                  <tr key={fm.id} style={S.tr}>
                    <td style={S.tdName}>{fm.name}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Buildings size={16} color="#4f46e5" />
                        <span style={{...S.planBadge, background: '#f5f3ff', color: '#4f46e5'}}>
                          {fm.campus_name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Envelope size={16} color="#64748b" />
                        {fm.email}
                      </div>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#64748b" />
                        {new Date(fm.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{...S.td, textAlign: 'right'}}>
                      <button 
                        style={S.deleteBtn} 
                        onClick={() => onDelete(fm.id)} 
                        title="Remove Manager"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Finance Manager Modal */}
      {showAddModal && (
        <div style={S.overlay} onClick={() => setShowAddModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={S.modalTitle}>Create Finance Manager</h3>
              <div style={{ padding: '8px', background: '#f5f3ff', color: '#4f46e5', borderRadius: '10px' }}>
                <ShieldCheck size={24} weight="duotone" />
              </div>
            </div>
            
            <form onSubmit={onAdd} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Full Name</label>
                <input 
                  placeholder="e.g., Salman Khan" 
                  required
                  value={newManager.name} 
                  onChange={e => setNewManager({...newManager, name: e.target.value})} 
                  style={S.input} 
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Email Address</label>
                <input 
                  placeholder="finance@lancerstech.com" 
                  required 
                  type="email"
                  value={newManager.email} 
                  onChange={e => setNewManager({...newManager, email: e.target.value})} 
                  style={S.input} 
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Password</label>
                <input 
                  placeholder="••••••••" 
                  required 
                  type="password" 
                  autoComplete="new-password"
                  value={newManager.password} 
                  onChange={e => setNewManager({...newManager, password: e.target.value})} 
                  style={S.input} 
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Assign to Campus / Department</label>
                <select 
                  required
                  value={newManager.campus_id} 
                  onChange={e => setNewManager({...newManager, campus_id: e.target.value})} 
                  style={S.input}
                >
                  <option value="">Select a Campus...</option>
                  {departments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div style={S.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
