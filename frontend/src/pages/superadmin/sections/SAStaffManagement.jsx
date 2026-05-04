import { Plus, Trash, Buildings, Users, Envelope, ShieldCheck, Calendar, UserCirclePlus } from "@phosphor-icons/react";
import { S } from "./SAStyles";

export default function SAStaffManagement({
  title, role, icon: Icon,
  staffList, departments,
  showAddModal, setShowAddModal,
  newItem, setNewItem,
  onAdd, onDelete
}) {
  return (
    <>
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: '#f5f3ff', color: '#4f46e5', borderRadius: '12px' }}>
              <Icon size={24} weight="duotone" />
            </div>
            <h2 style={S.tableTitle}>{title}</h2>
          </div>
          <button onClick={() => { setShowAddModal(true); }} style={S.addBtn} className="add-btn">
            <UserCirclePlus size={18} weight="bold" />
            <span>Add {title.slice(0, -1)}</span>
          </button>
        </div>
        
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>NAME</th>
                <th style={S.th}>CAMPUS / DEPARTMENT</th>
                <th style={S.th}>EMAIL</th>
                <th style={S.th}>DATE JOINED</th>
                <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    No {title.toLowerCase()} found. Click the button above to add someone.
                  </td>
                </tr>
              ) : (
                staffList.map(item => (
                  <tr key={item.id} style={S.tr}>
                    <td style={S.tdName}>{item.name}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Buildings size={16} color="#4f46e5" />
                        <span style={{...S.planBadge, background: '#f5f3ff', color: '#4f46e5'}}>
                          {item.campus_name || "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Envelope size={16} color="#64748b" />
                        {item.email}
                      </div>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#64748b" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{...S.td, textAlign: 'right'}}>
                      <button 
                        style={S.deleteBtn} 
                        onClick={() => onDelete(item.id)} 
                        title="Remove Member"
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

      {/* Add Staff Modal */}
      {showAddModal && (
        <div style={S.overlay} onClick={() => setShowAddModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={S.modalTitle}>Create New {title.slice(0, -1)}</h3>
              <div style={{ padding: '8px', background: '#f5f3ff', color: '#4f46e5', borderRadius: '10px' }}>
                <ShieldCheck size={24} weight="duotone" />
              </div>
            </div>
            
            <form onSubmit={(e) => onAdd(e, role)} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Full Name</label>
                <input 
                  placeholder="e.g., Salman Khan" 
                  required
                  value={newItem.name} 
                  onChange={e => setNewItem({...newItem, name: e.target.value})} 
                  style={S.input} 
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Email Address</label>
                <input 
                  placeholder="staff@lancerstech.com" 
                  required 
                  type="email"
                  value={newItem.email} 
                  onChange={e => setNewItem({...newItem, email: e.target.value})} 
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
                  value={newItem.password} 
                  onChange={e => setNewItem({...newItem, password: e.target.value})} 
                  style={S.input} 
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Assign to Campus / Department</label>
                <select 
                  required
                  value={newItem.campus_id} 
                  onChange={e => setNewItem({...newItem, campus_id: e.target.value})} 
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
