import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import './Toast.css'

// ─────────────────────────────────────────
// Context
// ─────────────────────────────────────────
const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ─────────────────────────────────────────
// Provider
// ─────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, visible: true }])

    // Auto-dismiss
    setTimeout(() => {
      setToasts(prev =>
        prev.map(t => t.id === id ? { ...t, visible: false } : t)
      )
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 400)
    }, duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 400)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─────────────────────────────────────────
// Single Toast Item
// ─────────────────────────────────────────
const ICONS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#22c55e" fillOpacity="0.15" />
      <path d="M6 10.5L8.5 13L14 7.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#ef4444" fillOpacity="0.15" />
      <path d="M7 7L13 13M13 7L7 13" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#f59e0b" fillOpacity="0.15" />
      <path d="M10 6V11" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1" fill="#f59e0b" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#3b82f6" fillOpacity="0.15" />
      <path d="M10 9V14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="1" fill="#3b82f6" />
    </svg>
  ),
}

function ToastItem({ toast, onDismiss }) {
  return (
    <div className={`toast-item toast-${toast.type} ${toast.visible ? 'toast-enter' : 'toast-exit'}`}>
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default ToastProvider
