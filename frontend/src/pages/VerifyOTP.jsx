import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock, ArrowRight, ShieldCheck, ArrowsCounterClockwise, GraduationCap } from "@phosphor-icons/react";
import './VerifyOTP.css'
import API_BASE_URL from '../config/api'
import { useToast } from '../components/Toast'

function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { showToast } = useToast()
  
  const email = location.state?.email

  useEffect(() => {
    if (!email) {
      navigate('/signin')
    }
  }, [email, navigate])

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length < 6) {
      showToast('Please enter the full 6-digit code', 'error')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue })
      })

      const data = await response.json()

      if (data.success) {
        sessionStorage.setItem('user', JSON.stringify(data.user))
        sessionStorage.setItem('token', data.token)
        showToast('Verification successful!', 'success')
        
        if (data.user.role === 'superadmin' || data.user.role === 'super_admin') {
          navigate('/dashboard')
        } else if (data.user.role === 'teacher') {
          navigate('/teacher/dashboard')
        } else {
          navigate('/dashboard')
        }
      } else {
        showToast(data.message || 'Verification failed', 'error')
      }
    } catch (err) {
      showToast('Connection error', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/signin`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, resend_only: true })
      })
      showToast('New code sent to your email!', 'success')
    } catch (err) {
      showToast('Failed to resend code', 'error')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="otp-wrapper">
      <div className="bg-blur-elements">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="otp-glass-card animate-fadeIn">
        <div className="otp-branding">
          <div className="brand-header">
            <div className="logo-wrapper">
              <GraduationCap size={32} weight="duotone" />
            </div>
            <span className="brand-name">HITech</span>
          </div>
          <div className="branding-body">
            <h1 className="hero-text">Verify <br /><span>Identity</span></h1>
            <p className="sub-hero">A 6-digit verification code has been sent to <strong>{email}</strong>. Please enter it below to continue.</p>
          </div>
          <div className="branding-footer">
            <p>© 2026 HITech LMS. Security Suite.</p>
          </div>
        </div>

        <div className="otp-form-section">
          <div className="form-title-block">
            <h2>Two-Step Verification</h2>
            <p>Enter the code from your email</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-form">
            {error && <div className="error-toast">{error}</div>}
            {message && <div className="success-toast" style={{background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px'}}>{message}</div>}

            <div style={{display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px'}}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={e => handleChange(e.target, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  className="otp-input"
                />
              ))}
            </div>

            <button type="submit" className="prime-btn" disabled={loading}>
              {loading ? <span className="loader"></span> : <>Verify Code <ArrowRight weight="bold" /></>}
            </button>

            <button 
              type="button" 
              className="resend-btn" 
              onClick={handleResend} 
              disabled={resending}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '20px auto 0',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <ArrowsCounterClockwise size={18} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Resending...' : 'Resend Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
