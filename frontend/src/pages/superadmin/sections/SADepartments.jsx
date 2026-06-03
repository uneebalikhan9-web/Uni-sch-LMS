import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import { S } from "./SAStyles";

export default function SADepartments({ 
  departments, 
  editingItem, setEditingItem,
  showAddModal, setShowAddModal,
  newDepartment, setNewDepartment,
  onAdd, onDelete
}) {
  return (
    <>
      <div style={S.tableCard}>
        <div style={S.tableHeader}>
          <h2 style={S.tableTitle}>Faculties & Departments</h2>
          <button 
            onClick={() => { setEditingItem(null); setShowAddModal(true); }} 
            style={S.addBtn} className="add-btn"
          >
            <Plus size={18} weight="bold" />
            <span>Add Faculty</span>
          </button>
        </div>
        <div style={S.tableContainer} className="table-container">
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>NAME</th>
                <th style={S.th}>LOCATION</th>
                <th style={S.th}>STUDENTS</th>
                <th style={S.th}>TEACHERS</th>
                <th style={{...S.th, textAlign: 'right'}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(c => (
                <tr key={c.id} style={S.tr}>
                  <td style={S.tdName}>{c.name}</td>
                  <td style={S.td}>{c.location || '—'}</td>
                  <td style={S.td}>{c.student_count || 0}</td>
                  <td style={S.td}>{c.teacher_count || 0}</td>
                  <td style={{...S.td, textAlign: 'right'}}>
                    <div style={S.actionButtons}>
                      <button 
                        style={S.editBtn} className="edit-btn"
                        onClick={() => { setEditingItem({...c}); setShowAddModal(true); }}
                        title="Edit Department"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button 
                        style={S.deleteBtn} className="delete-btn"
                        onClick={() => onDelete(c.id)}
                        title="Delete Department"
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

      {/* Add/Edit Department Modal */}
      {showAddModal && (
        <div style={S.overlay} onClick={() => { setShowAddModal(false); setEditingItem(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
            <h3 style={S.modalTitle}>{editingItem ? 'Edit Department' : 'Add New Department'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.modalClose}>×</button>
            </div>
            <form onSubmit={onAdd} style={S.modalForm}>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Department Name</label>
                <input 
                  placeholder="e.g., Main Department" required 
                  value={editingItem ? editingItem.name : newDepartment.name} 
                  onChange={e => editingItem 
                    ? setEditingItem({...editingItem, name: e.target.value}) 
                    : setNewDepartment({...newDepartment, name: e.target.value})} 
                  style={S.input}
                />
              </div>
              <div style={S.inputGroup}>
                <label style={S.inputLabel}>Location</label>
                <input 
                  placeholder="e.g., New York" 
                  value={editingItem ? editingItem.location : newDepartment.location} 
                  onChange={e => editingItem 
                    ? setEditingItem({...editingItem, location: e.target.value}) 
                    : setNewDepartment({...newDepartment, location: e.target.value})} 
                  style={S.input}
                />
              </div>
              {editingItem && (
                <div style={S.checkboxGroup}>
                  <input 
                    type="checkbox" id="activeCheckbox"
                    checked={editingItem.is_active} 
                    onChange={e => setEditingItem({...editingItem, is_active: e.target.checked})} 
                    style={S.checkbox}
                  />
                  <label htmlFor="activeCheckbox" style={S.checkboxLabel}>Active Department</label>
                </div>
              )}
              <div style={S.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); setEditingItem(null); }} style={S.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={S.saveBtn}>
                  {editingItem ? 'Update Faculty' : 'Create Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
