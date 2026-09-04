// Ultra-Professional Monochrome (Black & White) Executive Theme for HOD / Dean Command Center
export const HOD_STYLES = {
  container: {
    minHeight: '100vh',
    background: '#FAFAFA',
    color: '#09090B',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '28px 36px',
    boxSizing: 'border-box'
  },
  headerCard: {
    background: '#FFFFFF',
    border: '1px solid #E4E4E7',
    borderRadius: '14px',
    padding: '20px 28px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
  },
  navRow: {
    display: 'flex',
    gap: '6px',
    background: '#FFFFFF',
    padding: '6px',
    borderRadius: '12px',
    border: '1px solid #E4E4E7',
    marginBottom: '24px',
    overflowX: 'auto',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
  },
  navTab: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '8px',
    border: active ? '1px solid #09090B' : '1px solid transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? '600' : '500',
    transition: 'all 0.15s ease',
    background: active ? '#09090B' : 'transparent',
    color: active ? '#FFFFFF' : '#71717A',
    boxShadow: active ? '0 2px 6px rgba(0, 0, 0, 0.15)' : 'none'
  }),
  card: {
    background: '#FFFFFF',
    border: '1px solid #E4E4E7',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    paddingBottom: '14px',
    borderBottom: '1px solid #F4F4F5'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  statCard: {
    background: '#FFFFFF',
    border: '1px solid #E4E4E7',
    borderRadius: '12px',
    padding: '20px 22px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#09090B',
    color: '#FFFFFF',
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #09090B',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#FFFFFF',
    color: '#09090B',
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #E4E4E7',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px'
  },
  th: {
    padding: '12px 16px',
    borderBottom: '1px solid #E4E4E7',
    background: '#F9FAFB',
    color: '#52525B',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid #F4F4F5',
    color: '#18181B'
  },
  badge: (bg = '#F4F4F5', color = '#18181B', border = '#E4E4E7') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    background: bg,
    color: color,
    border: `1px solid ${border}`
  }),
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    background: '#FFFFFF',
    color: '#09090B',
    border: '1px solid #D4D4D8',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    padding: '9px 14px',
    borderRadius: '8px',
    background: '#FFFFFF',
    color: '#09090B',
    border: '1px solid #D4D4D8',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer'
  }
};
