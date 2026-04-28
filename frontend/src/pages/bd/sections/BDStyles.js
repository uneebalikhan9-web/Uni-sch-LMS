export const S = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  bgOrb1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
    top: '-200px',
    right: '-100px',
    zIndex: 0,
    animation: 'float 20s infinite alternate',
  },

  bgOrb2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(129, 140, 248, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
    bottom: '-100px',
    left: '-100px',
    zIndex: 0,
    animation: 'float 25s infinite alternate-reverse',
  },

  bgOrb3: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
    top: '20%',
    left: '20%',
    zIndex: 0,
    animation: 'pulse 15s infinite',
  },

  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
    padding: '32px 20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    zIndex: 100,
    transition: 'all 0.3s ease',
    boxShadow: '10px 0 30px -10px rgba(15, 23, 42, 0.3)',
  },

  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
    padding: '0 12px',
  },

  logoText: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.5px',
  },

  bdBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '12px',
    color: '#a5b4fc',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },

  liveIndicator: {
    width: '8px',
    height: '8px',
    background: '#22c55e',
    borderRadius: '50%',
    boxShadow: '0 0 10px #22c55e',
  },

  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px',
  },

  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '14px',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    width: '100%',
  },

  navBtnActive: {
    background: 'rgba(79, 70, 229, 0.15)',
    color: '#fff',
  },

  activeIndicator: {
    position: 'absolute',
    left: '0',
    width: '4px',
    height: '20px',
    background: '#4f46e5',
    borderRadius: '0 4px 4px 0',
  },

  navBadge: {
    background: '#4f46e5',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '800',
  },

  logoutBtn: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    borderRadius: '14px',
    color: '#ef4444',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  main: {
    flex: 1,
    marginLeft: '280px',
    marginRight: '320px',
    padding: '40px 48px',
    zIndex: 1,
    transition: 'all 0.3s ease',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '40px',
  },

  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-1px',
  },

  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '8px 0 0',
    fontWeight: '500',
  },

  userName: {
    color: '#0f172a',
    fontWeight: '700',
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 20px -8px rgba(79, 70, 229, 0.5)',
  },

  dateBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#fff',
    borderRadius: '16px',
    color: '#0f172a',
    fontSize: '0.9rem',
    fontWeight: '700',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },

  mobileMenuBtn: {
    display: 'none',
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 1000,
    background: '#fff',
    border: '1px solid #e2e8f0',
    padding: '10px',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  // Overview
  overviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },

  metricCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '28px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
    cursor: 'pointer',
  },

  metricIconWrapper: (color) => ({
    width: '60px',
    height: '60px',
    borderRadius: '20px',
    background: `${color}10`,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  }),

  metricContent: {
    flex: 1,
  },

  metricLabel: {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  metricValue: {
    margin: '4px 0',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#0f172a',
  },

  metricTrend: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#22c55e',
  },

  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '24px',
  },

  chartCard: {
    background: '#fff',
    padding: '28px',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
  },

  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },

  chartTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#0f172a',
  },

  pipelineStages: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  stageItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  stageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    fontWeight: '700',
  },

  stageName: {
    textTransform: 'capitalize',
  },

  stageCount: {
    color: '#0f172a',
  },

  progressBarBg: {
    height: '8px',
    background: '#f1f5f9',
    borderRadius: '10px',
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 1s ease-out',
  },

  recentActivityCard: {
    background: '#fff',
    padding: '28px',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
  },

  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  recentTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0f172a',
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  activityItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },

  activityDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#4f46e5',
    marginTop: '6px',
    flexShrink: 0,
    boxShadow: '0 0 10px rgba(79, 70, 229, 0.4)',
  },

  activityContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  activityText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#334155',
  },

  activityTime: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },

  // Tables
  tableCard: {
    background: '#fff',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
  },

  tableContainer: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },

  tableHeadRow: {
    background: '#f8fafc',
  },

  th: {
    padding: '16px 24px',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '1px solid #e2e8f0',
  },

  tableRow: {
    transition: 'background 0.2s ease',
  },

  td: {
    padding: '18px 24px',
    fontSize: '0.9rem',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
    fontWeight: '500',
  },

  tdName: {
    padding: '18px 24px',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    borderBottom: '1px solid #f1f5f9',
  },

  tdSub: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: '2px',
  },

  emptyTableCell: {
    padding: '60px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '1rem',
  },

  statusBadge: {
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '0.75rem',
    fontWeight: '800',
    textTransform: 'capitalize',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },

  dealValue: {
    fontWeight: '800',
    color: '#4f46e5',
    fontSize: '1rem',
  },

  actionGroup: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },

  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Jobs
  jobsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  shareBanner: {
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    borderRadius: '24px',
    padding: '24px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
    boxShadow: '0 20px 25px -5px rgba(30, 27, 75, 0.2)',
  },

  bannerTitle: {
    margin: 0,
    color: '#fff',
    fontWeight: '800',
    fontSize: '1.2rem',
  },

  bannerSubtitle: {
    margin: '4px 0 0',
    color: '#c7d2fe',
    fontSize: '0.95rem',
    fontWeight: '500',
  },

  bannerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },

  bannerCode: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(4px)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '16px',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  bannerCopyBtn: {
    background: '#fff',
    color: '#1e1b4b',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },

  copyLinkBtn: {
    background: 'transparent',
    border: 'none',
    color: '#4f46e5',
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '4px 0',
    display: 'block',
    fontWeight: '700',
    marginTop: '4px',
  },

  slotsBadge: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: '1rem',
  },

  applicantCount: {
    background: '#ede9fe',
    color: '#4f46e5',
    padding: '4px 12px',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '800',
  },

  statusSelect: {
    padding: '8px 12px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
  },

  teacherCount: {
    fontWeight: '800',
    fontSize: '1.1rem',
    color: '#4f46e5',
  },

  // Right Panel
  rightPanel: {
    width: '320px',
    background: '#fff',
    borderLeft: '1px solid #e2e8f0',
    padding: '32px 24px',
    position: 'fixed',
    right: 0,
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '-10px 0 30px -10px rgba(0, 0, 0, 0.05)',
  },

  profileCard: {
    textAlign: 'center',
    padding: '28px',
    background: '#f8fafc',
    borderRadius: '32px',
    border: '1px solid #e2e8f0',
    marginBottom: '32px',
  },

  avatar: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
    color: '#fff',
    borderRadius: '28px',
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '800',
    boxShadow: '0 15px 25px -10px rgba(79, 70, 229, 0.4)',
  },

  profileName: {
    fontSize: '1.2rem',
    fontWeight: '800',
    margin: '0 0 4px',
    color: '#0f172a',
  },

  roleBadge: {
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '0.75rem',
    fontWeight: '800',
    display: 'inline-block',
    marginBottom: '20px',
  },

  profileStats: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '20px 0 0',
    borderTop: '1px solid #e2e8f0',
  },

  profileStat: {
    textAlign: 'center',
  },

  profileStatLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    marginBottom: '4px',
  },

  profileStatValue: {
    fontSize: '1.25rem',
    color: '#0f172a',
    fontWeight: '800',
  },

  quickStatsCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: '28px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  },

  quickStatsTitle: {
    margin: '0 0 20px',
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0f172a',
  },

  quickStatsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  quickStatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
  },

  quickStatLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '600',
  },

  quickStatValue: {
    fontWeight: '800',
    color: '#4f46e5',
  },

  shareCard: {
    background: '#f8fafc',
    borderRadius: '28px',
    padding: '24px',
    border: '1px solid #e2e8f0',
  },

  shareHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    fontWeight: '800',
    color: '#0f172a',
    fontSize: '1rem',
  },

  shareText: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0 0 12px',
    fontWeight: '500',
    lineHeight: '1.5',
  },

  shareCode: {
    display: 'block',
    background: '#fff',
    padding: '14px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    color: '#334155',
    wordBreak: 'break-all',
    marginBottom: '16px',
    border: '1px solid #e2e8f0',
    fontWeight: '600',
  },

  shareBtn: {
    width: '100%',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '16px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  modal: {
    background: '#fff',
    padding: '40px',
    borderRadius: '40px',
    width: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 50px 70px -20px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },

  modalTitle: {
    fontWeight: '800',
    fontSize: '1.5rem',
    color: '#0f172a',
    margin: 0,
  },

  modalClose: {
    background: '#f1f5f9',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '1.3rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    transition: 'all 0.2s ease',
  },

  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  inputLabel: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#475569',
    paddingLeft: '4px',
  },

  input: {
    padding: '14px 20px',
    borderRadius: '18px',
    border: '2px solid #f1f5f9',
    outline: 'none',
    width: '100%',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  row: {
    display: 'flex',
    gap: '16px',
  },

  flex1: {
    flex: 1,
  },

  modalActions: {
    display: 'flex',
    gap: '16px',
    marginTop: '12px',
  },

  cancelBtn: {
    flex: 1,
    padding: '16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '18px',
    fontWeight: '800',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  saveBtn: {
    flex: 2,
    padding: '16px',
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '18px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 10px 20px -8px rgba(79, 70, 229, 0.5)',
  },

  // Loading
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    background: '#f8fafc',
  },

  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '5px solid #e2e8f0',
    borderTop: '5px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#4f46e5',
    letterSpacing: '0.5px',
  },
};
