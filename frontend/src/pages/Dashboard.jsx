import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { Wrench } from "@phosphor-icons/react";
import PrincipalDashboard from './principal/PrincipalDashboard'
import SuperAdminDashboard from './superadmin/SuperAdminDashboard'
import BDDashboard from './bd/BDDashboard'
import MasterAdminDashboard from './masteradmin/MasterAdminDashboard'
import StudentDashboard from './student/StudentDashboard'
import TeacherDashboard from './teacher/TeacherDashboard'
import FinanceDashboard from './finance/FinanceDashboard'
import HRDashboard from './hr/HRDashboard'
import RegistrarDashboard from './registrar/RegistrarDashboard'
import AdmissionsDashboard from './admissions/AdmissionsDashboard'
import ExamsDashboard from './exams/ExamsDashboard'
import LibraryDashboard from './library/LibraryDashboard'
import ITDashboard from './it/ITDashboard'
import LabAssistantDashboard from './lab/LabAssistantDashboard'
import RectorDashboard from './rector/RectorDashboard'
import API_BASE_URL from '../config/api'
import './Dashboard.css'

// LOW-03 FIX: Role-to-Dashboard map — adding a new role is now 1 line instead of 4 lines
const ROLE_COMPONENTS = {
  master_admin:     MasterAdminDashboard,
  super_admin:      SuperAdminDashboard,
  principal:        PrincipalDashboard,
  admin:            PrincipalDashboard,   // admin falls back to principal dashboard
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
      if (socketRef.current) socketRef.current.disconnect()
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
  }, [user]);

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear() // Remove everything
    navigate('/signin')
  }

  if (isMaintenanceMode) return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', padding: '24px' }}>
      <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '24px', borderRadius: '50%', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Wrench size={64} weight="duotone" color="#ef4444" />
      </div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', color: '#f8fafc', letterSpacing: '-0.5px' }}>
        System <span style={{ color: '#ef4444' }}>Under Maintenance</span>
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '540px', textAlign: 'center', marginBottom: '40px', lineHeight: '1.6' }}>
        We are currently performing scheduled maintenance to upgrade our global infrastructure and deliver a better experience. Please check back later. We appreciate your patience!
      </p>
      <button onClick={handleLogout} style={{ padding: '14px 32px', background: 'linear-gradient(135deg, var(--primary-color, #4f46e5) 0%, #4338ca 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.05rem', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 14px rgba(var(--primary-rgb, 79, 70, 229), 0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
        Return to Login
      </button>
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
