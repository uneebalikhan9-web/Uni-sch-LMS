// ==================== HOD / DEAN SHARED STYLES (3-COLUMN LIGHT THEME) ====================
export const HOD_STYLES = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  bgOrb1: {
    position: 'fixed',
    width: '700px',
    height: '700px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.08), transparent 70%)',
    top: '-250px',
    left: '-250px',
    zIndex: 0,
    pointerEvents: 'none'
  },
  bgOrb2: {
    position: 'fixed',
    width: '550px',
    height: '550px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.08), transparent 70%)',
    bottom: '-200px',
    right: '-200px',
    zIndex: 0,
    pointerEvents: 'none'
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 20px',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    zIndex: 999,
    boxShadow: '10px 0 30px -10px rgba(0,0,0,0.15)',
    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '0 8px'
  },
  logoIcon: {
    width: '42px',
    height: '42px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '18px',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#ffffff'
  },
  logoAccent: {
    color: '#818cf8'
  },
  roleBadge: {
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '30px',
    padding: '8px 16px',
    margin: '0 8px 28px 8px',
    fontSize: '12px',
    color: '#c7d2fe',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative'
  },
  liveIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 8px #22c55e',
    position: 'absolute',
    right: '12px'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  navBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'left',
    fontSize: '14px',
    position: 'relative',
    transition: 'all 0.25s ease'
  },
  navBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#ffffff',
    fontWeight: '700',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '20%',
    width: '4px',
    height: '60%',
    background: 'linear-gradient(180deg, #6366f1, #3b82f6)',
    borderRadius: '0 4px 4px 0'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    cursor: 'pointer',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '14px',
    marginTop: '20px',
    transition: 'all 0.25s ease'
  },
  main: {
    flex: 1,
    padding: '40px 36px',
    marginLeft: '280px',
    marginRight: '320px',
    overflowY: 'auto',
    zIndex: 5,
    position: 'relative',
    transition: 'margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  mainCollapsedRight: {
    marginRight: '24px'
  },
  mainCollapsedLeft: {
    marginLeft: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: 0,
    color: '#0f172a',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    color: '#64748b',
    marginTop: '6px',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  badgePill: {
    background: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    padding: '8px 18px',
    borderRadius: '30px',
    fontSize: '0.85rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: (iconBg = '#eff6ff', iconColor = '#2563eb') => ({
    backgroundColor: '#ffffff',
    padding: '20px 24px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
  }),
  metricIconWrapper: (color = '#3b82f6', bg = '#eff6ff') => ({
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
    flexShrink: 0
  }),
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '28px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.03)'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
    color: '#ffffff',
    padding: '10px 22px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    transition: 'all 0.25s ease'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px'
  },
  th: {
    padding: '14px 18px',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontWeight: '700',
    fontSize: '12px',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  td: {
    padding: '16px 18px',
    color: '#1e293b',
    fontSize: '14px',
    borderBottom: '1px solid #f1f5f9',
    fontWeight: '500'
  },
  badge: (bg = '#eff6ff', color = '#2563eb') => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    background: bg,
    color: color
  }),
  rightPanel: {
    width: '320px',
    backgroundColor: '#ffffff',
    borderLeft: '1px solid #e2e8f0',
    padding: '36px 20px',
    position: 'fixed',
    right: 0,
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 999,
    boxShadow: '-10px 0 30px -10px rgba(0,0,0,0.03)',
    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  profileCard: {
    textAlign: 'center',
    background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
    padding: '28px 16px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px'
  },
  avatar: {
    width: '72px',
    height: '72px',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    borderRadius: '24px',
    margin: '0 auto 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '800',
    boxShadow: '0 12px 24px -8px rgba(99, 102, 241, 0.4)'
  }
};
