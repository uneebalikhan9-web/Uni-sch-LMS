import { S } from "./TDStyles";

export default function TDProfile({ user, courses, students, teacherClasses }) {
  const profileCard = { background:'linear-gradient(135deg, #f5f3ff, #fff)', borderRadius:'32px', padding:'36px', border:'1px solid #e2e8f0' };
  const profileHeader = { textAlign:'center', marginBottom:'24px' };
  const profileAvatar = { width:'90px', height:'90px', borderRadius:'28px', background:'linear-gradient(135deg, var(--primary-color, #4f46e5), #818cf8)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', fontWeight:'800', margin:'0 auto 16px', boxShadow:'0 15px 30px -10px rgba(var(--primary-rgb, 79, 70, 229),0.3)' };
  const profileRole  = { fontSize:'0.9rem', color:'#64748b', fontWeight:'500' };
  const profileStats = { display:'flex', justifyContent:'space-around', padding:'20px', borderTop:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9', margin:'20px 0' };
  const profileStatItem = { textAlign:'center' };
  const infoGrid = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' };
  const infoItem = { background:'#f8fafc', borderRadius:'16px', padding:'16px' };
  const infoLabel = { fontSize:'0.75rem', fontWeight:'700', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' };
  const infoVal = { fontSize:'0.95rem', fontWeight:'700', color:'#0f172a', margin:0 };

  return (
    <div style={profileCard} className="animate-fadeIn">
      <div style={profileHeader}>
        <div style={profileAvatar}>{user.name.charAt(0)}</div>
        <h2 style={{ ...S.profileName, margin:'0 0 4px' }}>{user.name}</h2>
        <span style={profileRole}>Faculty • Computer Science</span>
      </div>
      <div style={profileStats}>
        <div style={profileStatItem}><div style={{ fontSize:'1.5rem', fontWeight:'800', color:'var(--primary-color, #4f46e5)' }}>{courses.length}</div><div style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:'600' }}>Courses</div></div>
        <div style={profileStatItem}><div style={{ fontSize:'1.5rem', fontWeight:'800', color:'var(--primary-color, #4f46e5)' }}>{students.length}</div><div style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:'600' }}>Students</div></div>
        <div style={profileStatItem}><div style={{ fontSize:'1.5rem', fontWeight:'800', color:'var(--primary-color, #4f46e5)' }}>{teacherClasses.length}</div><div style={{ fontSize:'0.75rem', color:'#64748b', fontWeight:'600' }}>Classes</div></div>
      </div>
      <div style={infoGrid}>
        <div style={infoItem}><p style={infoLabel}>Email Address</p><p style={infoVal}>{user.email || 'teacher@lancerstech.com'}</p></div>
        <div style={infoItem}><p style={infoLabel}>Designation</p><p style={{ ...infoVal, textTransform:'capitalize' }}>{user.role || 'Teacher'}</p></div>
        <div style={infoItem}><p style={infoLabel}>Department</p><p style={infoVal}>{user.department_name || 'Computer Science'}</p></div>
        <div style={infoItem}><p style={infoLabel}>Joined</p><p style={infoVal}>January 2024</p></div>
      </div>
    </div>
  );
}
