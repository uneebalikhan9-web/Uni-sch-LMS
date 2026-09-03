import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { Wrench } from "@phosphor-icons/react";
import PrincipalDashboard from './principal/PrincipalDashboard'
import HODDashboard from './university/hod/HODDashboard'
import SuperAdminDashboard from './superadmin/SuperAdminDashboard'
import BDDashboard from './bd/BDDashboard'
import MasterAdminDashboard from './masteradmin/MasterAdminDashboard'
import StudentDashboard from './student/StudentDashboard'
import TeacherDashboard from './teacher/TeacherDashboard'
import FinanceDashboard from './finance/FinanceDashboard'
import HRDashboard from './hr/HRDashboard'
import RegistrarDashboard from './university/registrar/RegistrarDashboard'
import AdmissionsDashboard from './admissions/AdmissionsDashboard'
import ExamsDashboard from './exams/ExamsDashboard'
import LibraryDashboard from './library/LibraryDashboard'
import ITDashboard from './it/ITDashboard'
import LabAssistantDashboard from './lab/LabAssistantDashboard'
import RectorDashboard from './university/rector/RectorDashboard'
import ParentDashboard from './parent/ParentDashboard'
import API_BASE_URL from '../config/api'
import './Dashboard.css'

// LOW-03 FIX: Role-to-Dashboard map — adding a new role is now 1 line instead of 4 lines
const ROLE_COMPONENTS = {
  master_admin:     MasterAdminDashboard,
  super_admin:      SuperAdminDashboard,
  principal:        HODDashboard,
  admin:            HODDashboard,
  dean:             HODDashboard,
  hod:              HODDashboard,
  rector:           RectorDashboard,
  bd_agent:         BDDashboard,
  finance_manager:  FinanceDashboard,
  hr_manager:       HRDashboard,
  registrar:        RegistrarDashboard,
  admission_officer: AdmissionsDashboard,
  exam_controller:  ExamsDashboard,
  librarian:        LibraryDashboard,
  it_admin:         ITDashboard,
  lab_assistant:    LabAssistantDashboard,
  student:          StudentDashboard,
  teacher:          TeacherDashboard,
  parent:           ParentDashboard,
};

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [verifying, setVerifying] = useState(true)
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    const token = sessionStorage.getItem('token')

    if (!userData || !token) {
      navigate('/signin')
      return
    }

    const verifyToken = async () => {
      try {
        // Check maintenance mode
        const statusRes = await fetch(`${API_BASE_URL}/api/public/status`)
        const statusData = await statusRes.json()

        const response = await fetch(`${API_BASE_URL}/api/verify-token`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const data = await response.json()
        if (!data.success) {
          if (response.status === 503 || data.message?.includes('maintenance')) {
            setIsMaintenanceMode(true)
            setVerifying(false)
            return
          }
          throw new Error('Invalid token')
        }

        // If maintenance is ON and user is not master_admin
        if (statusData.success && statusData.maintenance_mode && data.user.role !== 'master_admin') {
          setIsMaintenanceMode(true)
          setVerifying(false)
          return
        }

        setUser(data.user)
        sessionStorage.setItem('user', JSON.stringify(data.user))
      } catch (e) {
        console.error('Session verification failed', e)
        localStorage.clear()
        sessionStorage.clear()
        navigate('/signin')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()

    // LOW-05 FIX: Replace 30-second polling with socket.io push event.
    // This eliminates 200+ unnecessary HTTP requests/min across all users.
    const token2 = sessionStorage.getItem('token')
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      auth: { token: token2 }
    })
    socketRef.current.on('system:maintenance', ({ active }) => {
      const currentRole = JSON.parse(sessionStorage.getItem('user'))?.role
      if (currentRole !== 'master_admin') {
        setIsMaintenanceMode(active)
      }
    })

    return () => {
      // Delay disconnect slightly to avoid "WebSocket is closed before the connection is established"
      // during React Strict Mode's rapid mount/unmount cycle in development.
      const currentSocket = socketRef.current;
      if (currentSocket) {
        setTimeout(() => currentSocket.disconnect(), 1000);
      }
    }
  }, [navigate])

  // Apply Tenant Brand Color to the entire Dashboard
  useEffect(() => {
    if (user?.primary_color) {
      const root = document.documentElement;
      const hex = user.primary_color;
      
      // Convert hex to rgb for rgba() usage
      let r = 79, g = 70, b = 229;
      if (hex && hex.match(/^#[0-9a-fA-F]{6}$/)) {
        r = parseInt(hex.slice(1,3), 16);
        g = parseInt(hex.slice(3,5), 16);
        b = parseInt(hex.slice(5,7), 16);
      }
      
      // Overriding common CSS variables used across dashboards
      root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
      root.style.setProperty('--primary-black', user.primary_color);
      root.style.setProperty('--primary-color', user.primary_color);
      root.style.setProperty('--primary', user.primary_color);
      root.style.setProperty('--accent', user.primary_color);
      // Optional: Add a slight opacity version for backgrounds if needed in future
      root.style.setProperty('--primary-light', `${user.primary_color}15`); 
    }

    // Cleanup when dashboard unmounts (logout)
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--primary-rgb');
      root.style.removeProperty('--primary-black');
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--primary-light');
    };
  }, [user]);

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear() // Remove everything
    navigate('/signin')
  }

  if (isMaintenanceMode) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1e232d', color: '#fff', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background Hexagon Shape */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'rgba(255, 255, 255, 0.02)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', zIndex: 0 }}></div>
      
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', color: '#f8fafc', letterSpacing: '-0.5px' }}>
          System Under Maintenance
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '540px', textAlign: 'center', marginBottom: '0px', lineHeight: '1.6' }}>
          We are currently performing scheduled maintenance to upgrade our global infrastructure and deliver a better experience. Please check back later. We appreciate your patience!
        </p>

        {/* Unplugged Cables SVG Animation */}
        <div style={{ width: '100%', maxWidth: '800px', margin: '60px 0', display: 'flex', justifyContent: 'center' }}>
          <svg width="100%" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg">
            {/* Left Cable */}
            <g transform="translate(0, 0)">
              {/* Wire details */}
              <line x1="0" y1="60" x2="230" y2="60" stroke="#0284c7" strokeWidth="6" />
              <line x1="0" y1="52" x2="230" y2="52" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
              <line x1="0" y1="68" x2="230" y2="68" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
              
              {/* Plug Base */}
              <path d="M 200 40 L 230 40 L 240 30 L 250 30 L 250 90 L 240 90 L 230 80 L 200 80 Z" fill="#1e232d" stroke="#0ea5e9" strokeWidth="4" strokeLinejoin="round" />
              
              {/* Plug Head */}
              <rect x="250" y="38" width="20" height="44" fill="#1e232d" stroke="#0ea5e9" strokeWidth="4" />
              
              {/* Plug Pins */}
              <line x1="270" y1="48" x2="295" y2="48" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
              <line x1="270" y1="72" x2="295" y2="72" stroke="#0ea5e9" strokeWidth="6" strokeLinecap="round" />
            </g>
            
            {/* Spark (Yellow) */}
            <path d="M 305 60 Q 315 45 325 60 T 345 60" fill="none" stroke="#eab308" strokeWidth="3" />
            
            {/* Right Cable (Socket) */}
            <g transform="translate(0, 0)">
              {/* Socket Body */}
              <path d="M 390 35 L 360 35 L 350 45 L 350 75 L 360 85 L 390 85 Z" fill="#1e232d" stroke="#0ea5e9" strokeWidth="4" strokeLinejoin="round" />
              
              {/* Wire details */}
              <line x1="390" y1="60" x2="600" y2="60" stroke="#0284c7" strokeWidth="6" />
              <line x1="390" y1="52" x2="600" y2="52" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
              <line x1="390" y1="68" x2="600" y2="68" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
            </g>
          </svg>
        </div>

        <button onClick={handleLogout} style={{ padding: '14px 32px', background: 'transparent', color: '#0ea5e9', border: '2px solid #0ea5e9', borderRadius: '8px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s' }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(14, 165, 233, 0.1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(14, 165, 233, 0.3)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Return to Login
        </button>
      </div>
    </div>
  )

  if (verifying) return <div className="loading-screen">Verifying Session...</div>
  if (!user) return null

  const userRole = user?.role || 'unknown'
  const DashboardComponent = ROLE_COMPONENTS[userRole]

  // LOW-03 FIX: Single lookup instead of 13 if-else blocks.
  if (DashboardComponent) {
    return <DashboardComponent user={user} onLogout={handleLogout} />
  }

  // Unknown / unrecognized role fallback
  return (
    <div className="dashboard-container" style={{ textAlign: 'center', padding: '100px' }}>
      <div className="fin-logo-icon" style={{ margin: '0 auto 20px' }}>LT</div>
      <h2>Unknown Portal Role: <code>{userRole}</code></h2>
      <p>Your account role is not recognized. Please contact your administrator.</p>
      <button
        onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/signin'; }}
        style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'var(--primary-color, #4f46e5)', color: 'white', cursor: 'pointer' }}
      >
        Logout & Login Again
      </button>
    </div>
  )
}

export default Dashboard
