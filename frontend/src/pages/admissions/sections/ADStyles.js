export const S = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    color: '#1e293b',
    position: 'relative',
    overflow: 'hidden'
  },
  bgOrb1: { position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(var(--primary-rgb, 79, 70, 229),0.08) 0%, transparent 70%)', zIndex: 0 },
  bgOrb2: { position: 'absolute', bottom: '-10%', right: '-5%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)', zIndex: 0 },
  bgOrb3: { position: 'absolute', top: '20%', right: '15%', width: '30%', height: '30%', background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 70%)', zIndex: 0 },

  sidebar: {
    width: '280px',
    background: '#0f172a',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 100,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '20px 0 40px -20px rgba(0,0,0,0.3)',
    borderRight: '1px solid rgba(255,255,255,0.05)'
  },
  logoWrapper: { padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '8px' },
  logoIcon: { background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)', width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 8px 16px -4px rgba(var(--primary-rgb, 79, 70, 229),0.4)' },
  logoText: { fontSize: '1.6rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  logoAccent: { color: '#818cf8' },
  sidebarSubtitle: { color: '#94a3b8', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 },

  nav: { padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '12px',
    color: '#94a3b8',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: 'transparent',
    width: '100%',
    position: 'relative'
  },
  navBtnActive: {
    background: 'rgba(var(--primary-rgb, 79, 70, 229), 0.1)',
    color: 'white',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)'
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    width: '4px',
    height: '20px',
    background: '#818cf8',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 15px rgba(129,140,248,0.8)'
  },

  main: { flex: 1, padding: '40px 48px', zIndex: 1, position: 'relative', overflowY: 'auto', maxHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' },
  title: { fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '0.95rem', color: '#64748b', fontWeight: 500, marginTop: '4px' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '24px' },
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
    padding: '8px 20px',
    borderRadius: '100px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  userName: { fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' },

  card: {
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    padding: '32px',
    border: '1px solid #ffffff',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.03)',
    marginBottom: '24px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  cardTitle: { fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' },

  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' },
  metricCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.02)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden'
  },
  metricIcon: { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  metricValue: { fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.8px', marginBottom: '4px' },
  metricLabel: { fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 },

  badge: {
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusVerified: { background: '#dcfce7', color: '#15803d' },
  statusPending: { background: '#fef3c7', color: '#b45309' },
  statusRejected: { background: '#fee2e2', color: '#b91c1c' },

  btnPrimary: {
    background: 'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '14px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 10px 20px -5px rgba(var(--primary-rgb, 79, 70, 229),0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnSecondary: {
    background: 'white',
    color: 'var(--primary-color, #4f46e5)',
    padding: '12px 24px',
    borderRadius: '14px',
    fontWeight: 700,
    border: '1px solid #e0e7ff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
  th: { padding: '16px 20px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' },
  tr: { background: 'white', transition: 'all 0.2s ease', borderRadius: '16px' },
  td: { padding: '20px', fontSize: '0.95rem', fontWeight: 500, color: '#1e293b' },
  firstTd: { borderRadius: '16px 0 0 16px', borderLeft: '1px solid #f1f5f9', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' },
  lastTd: { borderRadius: '0 16px 16px 0', borderRight: '1px solid #f1f5f9', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' },

  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc', gap: '20px' },
  spinner: { width: '50px', height: '50px', border: '4px solid #f1f5f9', borderTopColor: 'var(--primary-color, #4f46e5)', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  sidebarBottom: { padding: '20px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    color: '#ef4444',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left'
  }
};
