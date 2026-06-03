import { Plus, Trash, Buildings, Users, Envelope, ShieldCheck, Calendar, UserCirclePlus, PencilSimple } from "@phosphor-icons/react";
import { S } from "./SAStyles";

export default function SAStaffManagement({
  title, role, icon: Icon,
  staffList, departments,
  showAddModal, setShowAddModal,
  newItem, setNewItem,
  onAdd, onDelete,
  editingItem, setEditingItem
}) {
  const handleOpenEdit = (item) => {
    setEditingItem({ ...item, password: "" });
    setShowAddModal(true);
  };

  return (
    <>
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', background: '#f5f3ff', color: 'var(--primary-color, #4f46e5)', borderRadius: '12px' }}>
              <Icon size={24} weight="duotone" />
            </div>
            <h2 style={S.tableTitle}>{title}</h2>
          </div>
          <button 
            onClick={() => { setEditingItem(null); setShowAddModal(true); }} 
            style={S.addBtn} 
            className="add-btn"
          >
            <UserCirclePlus size={18} weight="bold" />
            <span>Add {title.slice(0, -1)}</span>
          </button>
        </div>
        
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>NAME</th>
                <th style={S.th}>CAMPUS</th>
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
                        <Buildings size={16} color="var(--primary-color, #4f46e5)" />
                        <span style={{...S.planBadge, background: '#f5f3ff', color: 'var(--primary-color, #4f46e5)'}}>
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
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          style={{...S.deleteBtn, color: 'var(--primary-color, #4f46e5)', borderColor: '#e0e7ff'}} 
                          onClick={() => handleOpenEdit(item)} 
                          title="Edit Member"
                          className="edit-btn"
                        >
                          <PencilSimple size={16} />
                        </button>
                        <button 
                          style={S.deleteBtn} 
                          onClick={() => onDelete(item.id)} 
                          title="Remove Member"
                          className="delete-btn"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {showAddModal && (
        <div style={S.overlay} onClick={() => { setShowAddModal(false); setEditingItem(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>{editingItem ? `Edit ${title.slice(0, -1)}` : `Create New ${title.slice(0, -1)}`}</h3>
                <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.modalClose}>×</button>
              </div>
              <div style={{ padding: '8px', background: '#f5f3ff', color: 'var(--primary-color, #4f46e5)', borderRadius: '10px' }}>
                <ShieldCheck size={24} weight="duotone" />
              </div>
            </div>
            
            <form onSubmit={(e) => onAdd(e, role)} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Full Name</label>
                <input 
                  placeholder="e.g., Salman Khan" 
                  required
                  value={editingItem ? editingItem.name : newItem.name} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} 
                  style={S.input} 
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Email Address</label>
                <input 
                  placeholder="staff@lancerstech.com" 
                  required 
                  type="email"
                  value={editingItem ? editingItem.email : newItem.email} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, email: e.target.value}) : setNewItem({...newItem, email: e.target.value})} 
                  style={S.input} 
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Password {editingItem && "(leave blank to keep current)"}</label>
                <input 
                  placeholder="••••••••" 
                  required={!editingItem}
                  type="password" 
                  autoComplete="new-password"
                  value={editingItem ? editingItem.password : newItem.password} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, password: e.target.value}) : setNewItem({...newItem, password: e.target.value})} 
                  style={S.input} 
                />
              </div>
              
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Assign to Campus</label>
                <select 
                  required
                  value={editingItem ? editingItem.campus_id : newItem.campus_id} 
                  onChange={e => editingItem ? setEditingItem({...editingItem, campus_id: e.target.value}) : setNewItem({...newItem, campus_id: e.target.value})} 
                  style={S.input}
                >
                  <option value="">Select a Campus...</option>
                  {departments.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.cancelBtn}>Cancel</button>
                <button type="submit" style={S.saveBtn}>{editingItem ? "Update Account" : "Create Account"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
