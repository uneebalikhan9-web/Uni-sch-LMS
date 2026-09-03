import React, { useState, useEffect } from 'react';
import { X, CheckCircle, WarningCircle, Info, Trash, PencilSimple } from '@phosphor-icons/react';

const S = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    padding: '20px'
  },
  modal: {
    background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgba(30, 58, 138, 0.25)', overflow: 'hidden',
    animation: 'slideUp 0.3s ease-out'
  },
  header: {
    padding: '24px', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  titleWrapper: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: '700' },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
    width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
  },
  body: { padding: '32px 24px', maxHeight: '60vh', overflowY: 'auto' },
  footer: {
    padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'flex-end', gap: '12px'
  },
  btnCancel: {
    padding: '10px 20px', borderRadius: '12px', background: '#fff', border: '1px solid #cbd5e1',
    color: '#64748b', fontWeight: '600', cursor: 'pointer'
  },
  btnAction: (color) => ({
    padding: '10px 20px', borderRadius: '12px', background: color, border: 'none',
    color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
  }),
  field: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase' },
  valueBox: {
    padding: '12px 16px', background: '#f1f5f9', borderRadius: '12px', color: '#1e293b', fontSize: '0.95rem', border: '1px solid #e2e8f0'
  },
  input: {
    width: '100%', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '2px solid #e2e8f0',
    color: '#1e293b', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
  }
};

export default function RDActionModal({ type, item, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState(item || {});

  useEffect(() => {
    setFormData(item || {});
  }, [item]);

  if (!item) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderContent = () => {
    if (type === 'view') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {Object.entries(item).map(([key, val]) => (
            <div key={key} style={S.field}>
              <span style={S.label}>{key.replace(/_/g, ' ')}</span>
              <div style={S.valueBox}>{val || 'N/A'}</div>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'edit') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(item).map(([key, val]) => (
            <div key={key}>
              <span style={S.label}>{key.replace(/_/g, ' ')}</span>
              <input 
                style={S.input} 
                value={formData[key] || ''} 
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      );
    }

    if (type === 'delete') {
      return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <WarningCircle size={64} color="#ef4444" weight="duotone" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '8px' }}>Confirm Deletion</h3>
          <p style={{ color: '#64748b', lineHeight: '1.6' }}>
            Are you sure you want to permanently delete this record? This action cannot be undone and will reflect across the institution's nexus.
          </p>
        </div>
      );
    }
  };

  const getHeaderProps = () => {
    if (type === 'view') return { title: 'Record Details', icon: <Info size={24} />, bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' };
    if (type === 'edit') return { title: 'Modify Record', icon: <PencilSimple size={24} />, bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' };
    if (type === 'delete') return { title: 'Delete Warning', icon: <Trash size={24} />, bg: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)' };
  };

  const hp = getHeaderProps();

  return (
    <div style={S.overlay} onClick={onClose}>
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          input:focus { border-color: #3b82f6 !important; }
        `}
      </style>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{...S.header, background: hp.bg}}>
          <div style={S.titleWrapper}>
            {hp.icon}
            <h3 style={S.title}>{hp.title}</h3>
          </div>
          <button style={S.closeBtn} onClick={onClose}><X size={20} weight="bold" /></button>
        </div>
        
        <div style={S.body}>
          {renderContent()}
        </div>

        <div style={S.footer}>
          <button style={S.btnCancel} onClick={onClose}>
            {type === 'view' ? 'Close' : 'Cancel'}
          </button>
          
          {type === 'edit' && (
            <button style={S.btnAction('#10b981')} onClick={() => onSave(formData)}>
              <CheckCircle size={20} weight="bold" /> Save Changes
            </button>
          )}
          
          {type === 'delete' && (
            <button style={S.btnAction('#ef4444')} onClick={() => onDelete(item)}>
              <Trash size={20} weight="bold" /> Delete Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
