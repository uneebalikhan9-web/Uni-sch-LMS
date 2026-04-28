import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Envelope, Lock, GraduationCap, ArrowRight, Eye, EyeSlash, ChalkboardTeacher } from "@phosphor-icons/react";
import './SignIn.css'
import API_BASE_URL from '../config/api'
import { useToast } from '../components/Toast'

function TeacherSignIn() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem('user', JSON.stringify(data.user))
        sessionStorage.setItem('token', data.token)
        navigate('/teacher/dashboard')
      } else {
        setError(data.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('Connection error. Please check if your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signin-wrapper">
      <div className="bg-blur-elements">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="signin-glass-card animate-fadeIn">
        {/* Left Branding Side */}
        <div className="branding-section">
          <div className="brand-header">
            <div className="logo-wrapper">
              <GraduationCap size={32} weight="duotone" />
            </div>
            <span className="brand-name">Lancers Tech</span>
          </div>
          
          <div className="branding-body">
            <h1 className="hero-text">Faculty <br /><span>Portal</span></h1>
            <p className="sub-hero">Access your academic dashboard to manage courses, grade assignments, and monitor student progress efficiently.</p>
            
            <div className="feature-stack">
              <div className="feature-pill">
                <ChalkboardTeacher size={22} weight="duotone" />
                <span>Lecture Planning</span>
              </div>
              <div className="feature-pill">
                <GraduationCap size={22} weight="duotone" />
                <span>Student Success</span>
              </div>
            </div>
          </div>

          <div className="branding-footer">
            <p>© 2024 Lancers Tech. Academic Excellence.</p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="form-section">
          <div className="form-title-block">
            <h2>Teacher Login</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="error-toast">
              <Lock size={20} weight="fill" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="signin-form">
            <div className="floating-group">
              <label className="input-label">Email Address</label>
              <div className="input-container">
                <Envelope className="field-icon" size={20} weight="bold" />
                <input 
                  type="email" 
                  name="email"
                  placeholder="name@university.edu" 
                  required 
                  autoComplete="username"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="floating-group">
              <label className="input-label">Password</label>
              <div className="input-container">
                <Lock className="field-icon" size={20} weight="bold" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder="••••••••" 
                  required 
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-aux-options">
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span className="label-text">Remember me for 30 days</span>
              </label>
              <Link to="/forgot-password" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="prime-btn" disabled={loading}>
              {loading ? (
                <div className="loader"></div>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={20} weight="bold" />
                </>
              )}
            </button>
          </form>

          <div className="auth-switch">
            <p>Student? <Link to="/signin">Student Login</Link></p>
            <p>Admin? <Link to="/signin">Admin Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherSignIn
