import React from 'react';
import { Gear, CloudArrowUp, ShieldCheck, Browser, EnvelopeSimple } from '@phosphor-icons/react';

const SystemConfig = ({ config, onSave }) => {
  const [formData, setFormData] = React.useState({
    app_name: config.app_name || '',
    smtp_host: config.smtp_host || '',
    maintenance_mode: config.maintenance_mode || 'false'
  });

  return (
    <div className="system-config-section">
      <div className="it-grid">
        <div className="it-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header" style={{ marginBottom: 24, borderBottom: '1px solid var(--it-border)', paddingBottom: 16 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>General Platform Settings</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--it-text-muted)' }}>Portal Name</label>
              <input 
                type="text" 
                className="it-input" 
                value={formData.app_name} 
                onChange={(e) => setFormData({...formData, app_name: e.target.value})}
                style={{ padding: '12px', borderRadius: 12, border: '1.5px solid var(--it-border)', outline: 'none' }} 
              />
            </div>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--it-text-muted)' }}>SMTP Gateway</label>
              <input 
                type="text" 
                className="it-input" 
                value={formData.smtp_host} 
                onChange={(e) => setFormData({...formData, smtp_host: e.target.value})}
                style={{ padding: '12px', borderRadius: 12, border: '1.5px solid var(--it-border)', outline: 'none' }} 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--it-text-muted)' }}>System Language</label>
              <select style={{ padding: '12px', borderRadius: 12, border: '1.5px solid var(--it-border)', outline: 'none' }}>
                <option>English (United States)</option>
                <option>English (United Kingdom)</option>
                <option>Urdu (Pakistan)</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--it-text-muted)' }}>Maintenance Mode</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div 
                  onClick={() => setFormData({...formData, maintenance_mode: formData.maintenance_mode === 'true' ? 'false' : 'true'})}
                  style={{ 
                    width: 44, height: 24, 
                    background: formData.maintenance_mode === 'true' ? 'var(--it-primary)' : '#e2e8f0', 
                    borderRadius: 12, position: 'relative', cursor: 'pointer',
                    transition: '0.3s'
                  }}
                >
                  <div style={{ 
                    width: 18, height: 18, background: 'white', borderRadius: '50%', 
                    position: 'absolute', top: 3, 
                    left: formData.maintenance_mode === 'true' ? 23 : 3,
                    transition: '0.3s'
                  }}></div>
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--it-text-muted)' }}>{formData.maintenance_mode === 'true' ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--it-border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn-primary" 
              onClick={() => onSave(formData)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--it-primary)', color: 'white', padding: '12px 24px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              <CloudArrowUp size={20} weight="bold" /> Save Changes
            </button>
          </div>
        </div>

        <div className="it-card">
          <div className="card-header" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Security Modules</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 16 }}>
              <ShieldCheck size={24} weight="bold" color="var(--it-success)" />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>Two-Factor Auth</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)' }}>Mandatory for Admin accounts</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 16 }}>
              <Browser size={24} weight="bold" color="var(--it-primary)" />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>CORS Protection</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)' }}>Origin: *.lancerstech.com</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 16 }}>
              <EnvelopeSimple size={24} weight="bold" color="var(--it-warning)" />
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>SMTP Gateway</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--it-text-muted)' }}>Connected: {config.smtp_host || 'Not Configured'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
