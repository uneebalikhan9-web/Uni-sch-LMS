import React from 'react';
import { Plus, Trash, PencilSimple, Flask, MagnifyingGlass } from '@phosphor-icons/react';

const LabInventory = () => {
  const items = [
    { id: 1, name: 'Digital Oscilloscope', category: 'Electronics', stock: 12, condition: 'Good' },
    { id: 2, name: 'Sulphuric Acid (H2SO4)', category: 'Chemicals', stock: '5 Liters', condition: 'Stock Low' },
    { id: 3, name: 'Compound Microscope', category: 'Biology', stock: 24, condition: 'Maintenance Required' },
    { id: 4, name: 'Centrifuge Machine', category: 'General', stock: 4, condition: 'Good' }
  ];

  return (
    <div className="lab-inventory-section">
      <div className="lab-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Laboratory Equipment & Stocks</h2>
            <p style={{ color: 'var(--lab-text-muted)', fontSize: '0.9rem' }}>Comprehensive tracking of physical assets and chemical inventory.</p>
          </div>
          <button className="lab-logout-btn" style={{ background: 'var(--lab-primary)', color: 'white', width: 'auto', padding: '10px 20px' }}>
            <Plus size={18} weight="bold" /> Add New Item
          </button>
        </div>

        <div className="lab-table-container">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ padding: 8, background: '#f1f5f9', borderRadius: 8, color: 'var(--lab-primary)' }}>
                            <Flask size={20} weight="duotone" />
                        </div>
                        <span style={{ fontWeight: 700 }}>{item.name}</span>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td style={{ fontWeight: 800 }}>{item.stock}</td>
                  <td>
                    <span style={{ 
                        fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                        background: item.condition === 'Good' ? '#dcfce7' : item.condition === 'Stock Low' ? '#ffedd5' : '#fee2e2',
                        color: item.condition === 'Good' ? '#15803d' : item.condition === 'Stock Low' ? '#9a3412' : '#991b1b'
                    }}>{item.condition}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button style={{ border: 'none', background: 'transparent', color: 'var(--lab-text-muted)', cursor: 'pointer' }}><PencilSimple size={18} weight="bold" /></button>
                        <button style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><Trash size={18} weight="bold" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LabInventory;
