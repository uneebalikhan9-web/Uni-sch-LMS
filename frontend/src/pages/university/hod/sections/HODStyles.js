export const HOD_STYLES = {
  container: {
    minHeight: '100vh',
    background: '#0B0F19',
    color: '#F8FAFC',
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    padding: '24px 32px',
    boxSizing: 'border-box',
    position: 'relative'
  },
  headerCard: {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px 32px',
    backdropFilter: 'blur(16px)',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navRow: {
    display: 'flex',
    gap: '8px',
    background: 'rgba(15, 23, 42, 0.6)',
    padding: '6px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '28px',
    overflowX: 'auto'
  },
  navTab: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    background: active ? 'linear-gradient(135deg, #438FFE 0%, #3B82F6 100%)' : 'transparent',
    color: active ? '#FFFFFF' : '#94A3B8',
    boxShadow: active ? '0 4px 14px rgba(59, 130, 246, 0.35)' : 'none'
  }),
  card: {
    background: 'rgba(17, 24, 39, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    marginBottom: '24px'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '28px'
  },
  statCard: (borderColor = '#3B82F6') => ({
    background: 'rgba(15, 23, 42, 0.75)',
    border: `1px solid rgba(255, 255, 255, 0.08)`,
    borderLeft: `4px solid ${borderColor}`,
    borderRadius: '14px',
    padding: '20px',
    backdropFilter: 'blur(10px)'
  }),
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #438FFE 0%, #2563EB 100%)',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px'
  },
  th: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#E2E8F0'
  },
  badge: (bg = 'rgba(59, 130, 246, 0.15)', color = '#60A5FA') => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    background: bg,
    color: color
  })
};
