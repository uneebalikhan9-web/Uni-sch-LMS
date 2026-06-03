import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Envelope, Lock, GraduationCap, ArrowRight, Eye, EyeSlash, ChartLineUp, Users, WarningCircle, Globe } from "@phosphor-icons/react";
import './SignIn.css'
import API_BASE_URL from '../config/api'
import { useToast } from '../components/Toast'
import { useTenantBranding } from '../hooks/useTenantBranding'

function SignIn() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // Eye toggle state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const { showToast } = useToast()
  
  const branding = useTenantBranding()

  // Fetch maintenance status on load
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/status`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.maintenance_mode) {
          setIsMaintenanceMode(true)
        }
      })
      .catch(err => console.error('Failed to fetch status', err))
  }, [])

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
      const response = await fetch(`${API_BASE_URL}/api/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // --- OTP REDIRECT TEMPORARILY DISABLED ---
        // if (data.otp_required) {
        //   navigate('/verify-otp', { state: { email: formData.email } })
        //   return
        // }

        sessionStorage.setItem('user', JSON.stringify(data.user))
        sessionStorage.setItem('token', data.token)
        
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('token', data.token)
        } else {
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
        
        if (data.user.role === 'teacher') {
          navigate('/teacher/dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        if (data.pending) {
          setError('⏳ Your account is pending teacher approval. Please wait for a teacher to approve your registration request.')
        } else {
          setError(data.message || 'Invalid email or password')
        }
      }
    } catch (err) {
      setError('Connection error. Please check if your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {isMaintenanceMode && (
        <div style={{ width: '100%', background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 100%)', color: '#fff', padding: '14px 24px', textAlign: 'center', zIndex: 9999, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)', borderBottom: '1px solid #991b1b' }}>
          <WarningCircle size={22} weight="fill" color="#fca5a5" />
          <span style={{ fontSize: '0.95rem', fontWeight: '500', letterSpacing: '0.3px' }}>
            <strong style={{ fontWeight: '700', marginRight: '6px' }}>System Maintenance:</strong> 
            The platform is currently undergoing scheduled upgrades. Login is temporarily restricted to Global HQ Administrators.
          </span>
        </div>
      )}
      <div className="signin-wrapper" style={{ height: isMaintenanceMode ? 'calc(100vh - 48px)' : '100vh' }}>
      {/* Dynamic Background Orbs */}
      <div className="bg-blur-elements">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="signin-glass-card animate-fadeIn">
        {/* Left Branding Side */}
        <div className="branding-section">
          <div className="brand-header">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt="Tenant Logo" style={{ maxHeight: '80px', maxWidth: '200px', width: 'auto', height: 'auto', objectFit: 'contain' }} />
            ) : (
              <div className="logo-wrapper" style={{ background: branding.primary_color ? `${branding.primary_color}15` : undefined, color: branding.primary_color || 'var(--primary-color)' }}>
                <GraduationCap size={32} weight="duotone" />
              </div>
            )}
            {!branding.logo_url && <span className="brand-name">Lancers Tech</span>}
          </div>
          
          <div className="branding-body">
            <h1 className="hero-text">Welcome <br /><span>Back</span></h1>
            <p className="sub-hero">Sign in to manage your students, track performance, and lead your institution effectively.</p>
            
            <div className="feature-stack">
              <div className="feature-pill">
                <Users size={22} weight="duotone" />
                <span>Team Management</span>
              </div>
              <div className="feature-pill">
                <ChartLineUp size={22} weight="duotone" />
                <span>Live Analytics</span>
              </div>
            </div>
          </div>
          
          <div className="branding-footer">
            <p>© 2026 Lancers Tech LMS. Professional Suite.</p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="form-section">
          <div className="form-title-block">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="signin-form">
            {error && <div className="error-toast">{error}</div>}
            <div className="floating-group">
              <label className="input-label">Email Address</label>
              <div className="input-container">
                <Envelope size={20} className="field-icon" />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="name@university.edu" 
                  autoComplete="username"
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="floating-group">
              <label className="input-label">Password</label>
              <div className="input-container">
                <Lock size={20} className="field-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="••••••••" 
                  autoComplete="current-password"
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-aux-options">
              <label className="custom-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="checkmark"></span>
                <span className="label-text">Remember me</span>
              </label>
              {/* <Link to="/forgot-password" className="forgot-link">Forgot password?</Link> */}
            </div>

              <button type="submit" className="prime-btn" disabled={loading} style={{ background: branding.primary_color ? `linear-gradient(135deg, ${branding.primary_color}dd 0%, ${branding.primary_color} 100%)` : undefined, boxShadow: branding.primary_color ? `0 4px 14px ${branding.primary_color}66` : undefined }}>
                {loading ? <span className="loader"></span> : <>Sign In <ArrowRight weight="bold" /></>}
              </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default SignIn
