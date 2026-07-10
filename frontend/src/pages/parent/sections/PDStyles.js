export const S = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#f4f7fe', // Modern sleek background
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    overflow: 'hidden'
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #111827 0%, #1e1b4b 100%)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    zIndex: 10,
    position: 'relative',
    overflow: 'hidden'
  },
  sidebarDecoration: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)',
    pointerEvents: 'none'
  },
  sidebarHeader: {
    padding: '35px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    position: 'relative',
    zIndex: 1
  },
  logo: {
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '22px',
    boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 28px',
    cursor: 'pointer',
    color: '#94a3b8',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontSize: '15px',
    fontWeight: 600,
    borderLeft: '4px solid transparent',
    position: 'relative',
    overflow: 'hidden'
  },
  navItemActive: {
    background: 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 100%)',
    color: '#fff',
    borderLeft: '4px solid #818cf8',
    boxShadow: 'inset 0px 1px 0px rgba(255,255,255,0.02)'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative'
  },
  mainBackgroundGlob: {
    position: 'absolute',
    top: '-10%',
    left: '20%',
    width: '60%',
    height: '60%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, rgba(244,247,254,0) 70%)',
    pointerEvents: 'none',
    zIndex: 0
  },
  header: {
    height: '90px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 45px',
    borderBottom: '1px solid rgba(255,255,255,0.5)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)',
    zIndex: 5
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '45px',
    zIndex: 1,
    position: 'relative'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
    border: '1px solid rgba(255,255,255,1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  childSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff',
    padding: '10px 20px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
    transition: 'all 0.3s ease'
  },
  select: {
    border: 'none',
    background: 'transparent',
    fontSize: '15px',
    fontWeight: 700,
    color: '#1e293b',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    fontFamily: 'inherit'
  },
  statCard: {
    background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
    borderRadius: '24px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    border: '1px solid #f1f5f9',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  statCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.06)'
  },
  iconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0',
    letterSpacing: '-1px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 700,
    margin: '4px 0 0 0',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 12px'
  },
  th: {
    textAlign: 'left',
    padding: '12px 24px',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    borderBottom: '2px solid #f1f5f9'
  },
  td: {
    padding: '20px 24px',
    background: '#fff',
    color: '#334155',
    fontSize: '15px',
    fontWeight: 600,
    borderTop: '1px solid #f8fafc',
    borderBottom: '1px solid #f8fafc',
    transition: 'background 0.2s ease'
  },
  tdFirst: {
    borderTopLeftRadius: '16px',
    borderBottomLeftRadius: '16px',
    borderLeft: '1px solid #f8fafc'
  },
  tdLast: {
    borderTopRightRadius: '16px',
    borderBottomRightRadius: '16px',
    borderRight: '1px solid #f8fafc'
  },
  badge: {
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.5px'
  }
};
