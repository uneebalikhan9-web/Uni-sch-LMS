// ==================== RECTOR/PRO-VC SHARED STYLES ====================
export const S = {
  container: { display:'flex', minHeight:'100vh', backgroundColor:'#f0f4f8', fontFamily:"'Plus Jakarta Sans', sans-serif", position:'relative', overflow:'hidden' },
  bgOrb1: { position:'fixed', width:'800px', height:'800px', borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, rgba(30,58,138,0.08), transparent 70%)', top:'-300px', left:'-300px', zIndex:0, animation:'float 25s infinite alternate ease-in-out' },
  bgOrb2: { position:'fixed', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle at 70% 70%, rgba(59,130,246,0.08), transparent 70%)', bottom:'-250px', right:'-250px', zIndex:0, animation:'float 30s infinite alternate ease-in-out' },
  
  sidebar: { width:'280px', background:'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)', color:'#fff', display:'flex', flexDirection:'column', padding:'32px 20px', position:'fixed', height:'100vh', overflowY:'auto', zIndex:10, boxShadow:'10px 0 30px -10px rgba(0,0,0,0.2)' },
  logoWrapper: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px', padding:'0 8px' },
  logoIcon: { width:'40px', height:'40px', background:'rgba(255,255,255,0.15)', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow:'0 8px 16px rgba(0,0,0,0.1)' },
  logoText: { fontSize:'1.4rem', fontWeight:'800', letterSpacing:'-0.02em', color:'#fff' },
  logoAccent: { color:'#93c5fd' },
  
  rectorBadge: { background:'rgba(255,255,255,0.08)', borderRadius:'30px', padding:'8px 16px', margin:'0 8px 32px 8px', fontSize:'12px', color:'#bfdbfe', display:'flex', alignItems:'center', gap:'8px', border:'1px solid rgba(255,255,255,0.15)', backdropFilter:'blur(10px)' },
  liveIndicator: { width:'8px', height:'8px', borderRadius:'50%', background:'#10b981', animation:'pulse 1.5s infinite' },
  
  nav: { flex:1, display:'flex', flexDirection:'column', gap:'6px' },
  navBtn: { width:'100%', display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px', borderRadius:'16px', border:'none', cursor:'pointer', backgroundColor:'transparent', color:'#bfdbfe', fontWeight:'600', textAlign:'left', fontSize:'15px', position:'relative', transition:'all 0.3s ease' },
  navBtnActive: { backgroundColor:'rgba(255,255,255,0.1)', color:'#fff', boxShadow:'inset 0 2px 4px rgba(0,0,0,0.1)' },
  activeIndicator: { position:'absolute', left:0, top:'25%', width:'4px', height:'50%', background:'#60a5fa', borderRadius:'0 4px 4px 0' },
  
  main: { flex:1, padding:'48px', marginLeft:'280px', overflowY:'auto', zIndex:5, position:'relative' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px' },
  title: { fontSize:'2.2rem', fontWeight:'800', margin:0, color:'#1e3a8a', letterSpacing:'-0.02em' },
  subtitle: { color:'#64748b', marginTop:'6px', fontSize:'1.1rem', fontWeight:'500' },
  
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'24px', marginBottom:'40px' },
  metricCard: { backgroundColor:'#fff', padding:'24px', borderRadius:'28px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'16px', transition:'all 0.3s ease', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.05)' },
  metricIcon: (color) => ({ width:'56px', height:'56px', borderRadius:'18px', background:`${color}10`, display:'flex', alignItems:'center', justifyContent:'center', color }),
  metricValue: { fontSize:'1.8rem', fontWeight:'800', color:'#0f172a', margin:'4px 0' },
  metricLabel: { fontSize:'0.85rem', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' },
  
  contentGrid: { display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px' },
  card: { backgroundColor:'#fff', padding:'32px', borderRadius:'32px', border:'1px solid #e2e8f0', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize:'1.25rem', fontWeight:'800', color:'#1e3a8a', marginBottom:'24px', display:'flex', alignItems:'center', gap:'10px' },
  
  table: { width:'100%', borderCollapse:'separate', borderSpacing:'0 8px' },
  th: { textAlign:'left', padding:'12px 16px', color:'#64748b', fontSize:'0.75rem', fontWeight:'800', textTransform:'uppercase', letterSpacing:'0.05em' },
  tr: { background:'#f8fafc', transition:'all 0.2s ease' },
  td: { padding:'16px', fontSize:'0.9rem', color:'#334155', fontWeight:'600' },
  tdFirst: { borderRadius:'12px 0 0 12px' },
  tdLast: { borderRadius:'0 12px 12px 0' },
  
  statusBadge: (bg, color) => ({ padding:'4px 12px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'700', background:bg, color:color }),
  
  loadingContainer: { height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', background:'#f0f4f8' },
  loadingSpinner: { width:'50px', height:'50px', border:'4px solid #e2e8f0', borderTop:'4px solid #1e3a8a', borderRadius:'50%', animation:'spin 1s linear infinite' },
  
  logoutBtn: { display:'flex', alignItems:'center', gap:'12px', padding:'16px 18px', background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)', cursor:'pointer', borderRadius:'16px', fontWeight:'700', fontSize:'15px', marginTop:'auto', transition:'all 0.3s ease' },
};
