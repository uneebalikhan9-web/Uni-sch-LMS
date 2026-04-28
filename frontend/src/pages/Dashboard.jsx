import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrincipalDashboard from './principal/PrincipalDashboard'
import SuperAdminDashboard from './superadmin/SuperAdminDashboard'
import BDDashboard from './bd/BDDashboard'
import StudentDashboard from './student/StudentDashboard'
import TeacherDashboard from './teacher/TeacherDashboard'
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
  if (user.role === 'super_admin') {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} />
  }

  // HOD — campus-level admin (replaces old 'admin' role)
  if (user.role === 'principal') {
    return <PrincipalDashboard user={user} onLogout={handleLogout} />
  }

  // BD Agent — business development portal
  if (user.role === 'bd_agent') {
    return <BDDashboard user={user} onLogout={handleLogout} />
  }

  // Legacy admin role (backward compat)
  if (user.role === 'admin') {
    return <PrincipalDashboard user={user} onLogout={handleLogout} />
  }

  if (user.role === 'student') {
    return <StudentDashboard user={user} onLogout={handleLogout} />
  }

  if (user.role === 'teacher') {
    return <TeacherDashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="dashboard-container">
      <h2>Unknown Role: {user.role}</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard
