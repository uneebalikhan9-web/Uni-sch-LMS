import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Restore "Remember Me" session from localStorage ONCE before React mounts.
// This is the correct place for this logic (not inside a component body).
if (localStorage.getItem('token') && !sessionStorage.getItem('token')) {
  sessionStorage.setItem('user', localStorage.getItem('user'))
  sessionStorage.setItem('token', localStorage.getItem('token'))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
