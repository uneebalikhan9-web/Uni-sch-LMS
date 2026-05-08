import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrincipalDashboard from './principal/PrincipalDashboard'
import SuperAdminDashboard from './superadmin/SuperAdminDashboard'
import BDDashboard from './bd/BDDashboard'
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
import API_BASE_URL from '../config/api'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    const token = sessionStorage.getItem('token')

    if (!userData || !token) {
      navigate('/signin')
      return
    }

    // Verify token with backend for real privacy
    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/verify-token`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (!data.success) {
          throw new Error('Invalid token')
        }
        // Update local state and storage with fresh data from backend (e.g. department_name)
        setUser(data.user)
        sessionStorage.setItem('user', JSON.stringify(data.user))
      } catch (e) {
        console.error("Session verification failed", e)
        sessionStorage.clear()
        navigate('/signin')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.clear() // Remove everything
    navigate('/signin')
  }

  if (verifying) return <div className="loading-screen">Verifying Session...</div>
  if (!user) return null

  // Super Admin — global platform control
  // Safety check for role
  const userRole = user?.role || 'unknown';

  if (userRole === 'super_admin') {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'principal') {
    return <PrincipalDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'bd_agent') {
    return <BDDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'finance_manager') {
    return <FinanceDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'hr_manager') {
    return <HRDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'registrar') {
    return <RegistrarDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'admission_officer') {
    return <AdmissionsDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'exam_controller') {
    return <ExamsDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'librarian') {
    return <LibraryDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'it_admin') {
    return <ITDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'lab_assistant') {
    return <LabAssistantDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'admin') {
    return <PrincipalDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'student') {
    return <StudentDashboard user={user} onLogout={handleLogout} />
  }

  if (userRole === 'teacher') {
    return <TeacherDashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="dashboard-container" style={{ textAlign: 'center', padding: '100px' }}>
      <div className="fin-logo-icon" style={{ margin: '0 auto 20px' }}>LT</div>
      <h2>Detecting Portal: {userRole}</h2>
      <p>Please wait while we redirect you...</p>
      <button 
        onClick={() => { sessionStorage.clear(); window.location.href = '/'; }} 
        style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}
      >
        Reset Session & Login Again
      </button>
    </div>
  )
}

export default Dashboard
