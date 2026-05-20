import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatCircle, PaperPlaneTilt, SignOut, ArrowLeft, MagnifyingGlass, CaretLeft, ShieldCheck, Pulse, CheckCircle } from '@phosphor-icons/react'
import { io } from 'socket.io-client'
import API_BASE_URL from '../config/api'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import './Chat.css'

const API = `${API_BASE_URL}/api`
const SOCKET_URL = API_BASE_URL

function Chat() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [chatUsers, setChatUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [search, setSearch] = useState('') 
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const { showToast } = useToast()
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  })
  const typingTimeoutRef = useRef(null)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    const token = sessionStorage.getItem('token')
    if (!userData || !token) {
      navigate('/signin')
      return
    }
    try {
      const u = JSON.parse(userData)
      setUser(u)
      if (u.role === 'super_admin') {
        navigate('/dashboard')
        return
      }
    } catch (e) {
      navigate('/signin')
      return
    }
  }, [navigate])

  useEffect(() => {
    if (!user) return
    const token = sessionStorage.getItem('token')
    fetch(`${API}/chat/conversations`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setChatUsers(data.conversations || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (!user) return
    const token = sessionStorage.getItem('token')
    socketRef.current = io(SOCKET_URL, { 
      transports: ['websocket', 'polling'],
      auth: { token } // Securely pass token during handshake
    })
    
    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [user])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    const onMsg = (msg) => {
      setChatUsers(prev => {
        const isMsgForSelected = selectedUser && msg.sender_id === selectedUser.id
        return prev.map(u => {
          if (u.id === msg.sender_id && !isMsgForSelected) {
            return {
              ...u,
              last_message: msg.message,
              last_message_at: msg.created_at,
              unread_count: (u.unread_count || 0) + 1
            }
          }
          if (u.id === msg.sender_id || u.id === msg.receiver_id) {
             return {
              ...u,
              last_message: msg.message,
              last_message_at: msg.created_at
            }
          }
          return u
        }).sort((a, b) => {
          const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
          const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
          return tb - ta
        })
      })

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id)
        if (exists) return prev
        const withUser = (msg.sender_id === user?.id && msg.receiver_id === selectedUser?.id) ||
          (msg.receiver_id === user?.id && msg.sender_id === selectedUser?.id)
        if (selectedUser && withUser) return [...prev, msg]
        return prev
      })
    }
    socket.on('chat:message', onMsg)

    const onTyping = ({ sender_id }) => {
      if (selectedUser && sender_id === selectedUser.id) {
        setIsTyping(true)
      }
    }
    const onStopTyping = ({ sender_id }) => {
      if (selectedUser && sender_id === selectedUser.id) {
        setIsTyping(false)
      }
    }

    socket.on('chat:typing', onTyping)
    socket.on('chat:stop_typing', onStopTyping)

    return () => {
      socket.off('chat:message', onMsg)
      socket.off('chat:typing', onTyping)
      socket.off('chat:stop_typing', onStopTyping)
    }
  }, [user?.id, selectedUser?.id])

  useEffect(() => {
    if (!user || !selectedUser) return
    const token = sessionStorage.getItem('token')
    setMessages([])
    fetch(`${API}/chat/messages/${selectedUser.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMessages(data.messages || [])
      })
    
    if (selectedUser.unread_count > 0) {
      fetch(`${API}/chat/read/${selectedUser.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        setChatUsers(prev =>
          prev.map(u =>
            u.id === selectedUser.id ? { ...u, unread_count: 0 } : u
          )
        )
      }).catch(() => {})
    }
    setIsTyping(false) // Reset on user change
  }, [user, selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = newMessage.trim()
    if (!text || !selectedUser || !user) return
    setSending(true)
    const token = sessionStorage.getItem('token')
    try {
      const res = await fetch(`${API}/chat/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiver_id: selectedUser.id, message: text })
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) => [...prev, data.message])
        setChatUsers(prev => {
          const updated = prev.map(u =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  last_message: data.message.message,
                  last_message_at: data.message.created_at,
                }
              : u
          )
          return [...updated].sort((a, b) => {
            const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
            const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
            return tb - ta
          })
        })
        setNewMessage('')
      } else {
        showToast(data.message || 'Failed to send', 'error')
      }
    } catch (err) {
      showToast('Failed to send message', 'error')
    }
    setSending(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    navigate('/signin')
  }

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return chatUsers
    return chatUsers.filter(u =>
      u.name.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    )
  }, [chatUsers, search])

  const getAvatarColor = (name) => {
    const colors = ['#7c3aed', '#8b5cf6', '#a78bfa', '#4c1d95', '#1e1b4b', '#c084fc', '#4f46e5', '#6366f1']
    let hash = 0
    for (let i = 0; i < name.length; i++) {
       hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const getInitials = (name) => {
    if (!name || name === 'undefined') return '?'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
    return (name.slice(0, 2) || '?').toUpperCase()
  }

  const groupMessagesByDate = (msgs) => {
    const groups = {}
    msgs.forEach(m => {
      const date = new Date(m.created_at).toLocaleDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(m)
    })
    return groups
  }

  const formatHeaderDate = (dateStr) => {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    if (!socketRef.current || !selectedUser) return

    socketRef.current.emit('chat:typing', { sender_id: user.id, receiver_id: selectedUser.id })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('chat:stop_typing', { sender_id: user.id, receiver_id: selectedUser.id })
    }, 2000)
  }

  if (!user) return null

  return (
    <div className="chat-page">
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        isDanger={true}
      />
      <header className="chat-header">
        <div className="chat-header-left">
          <button className="chat-back-btn" onClick={() => navigate('/dashboard')} title="Back">
            <ArrowLeft size={20} weight="bold" />
          </button>
          <div className="chat-title-group">
            <h1>LMS Connect</h1>
            <p>{user.name || 'Admin'} · {user.role?.replace('_', ' ') || 'Staff'}</p>
          </div>
        </div>
        <button className="chat-logout-btn" onClick={handleLogout}>
          <SignOut size={18} weight="bold" /> Sign Out
        </button>
      </header>

      <div className={`chat-layout ${selectedUser ? 'conversation-active' : ''}`}>
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span className="chat-sidebar-label">Recent Messages</span>
            <div className="chat-search-wrap">
              <MagnifyingGlass size={18} weight="bold" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="chat-loading"><p>Loading...</p></div>
          ) : (
            <div className="chat-user-list">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  className={`chat-user-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                  onClick={() => setSelectedUser(u)}
                >
                  <div
                    className="chat-avatar-circle"
                    style={{ background: getAvatarColor(u.name) }}
                  >
                    {getInitials(u.name)}
                  </div>
                  <div className="chat-user-info-box">
                    <span className="name">{u.name || 'User'}</span>
                    <span className="meta">{u.last_message || u.role?.replace('_', ' ') || 'New Conversation'}</span>
                  </div>
                  {u.unread_count > 0 && (
                    <span className="unread-count-pill">{u.unread_count}</span>
                  )}
                </button>
              ))}
            </div>
          )}
          {!loading && chatUsers.length === 0 && (
            <div className="chat-empty"><p>No conversations found.</p></div>
          )}
        </aside>

        <main className="chat-main-area">
          {!selectedUser ? (
            <div className="chat-empty-state animate-fadeIn">
              <div className="premium-empty-icon-wrapper">
                <ChatCircle size={64} weight="duotone" className="floating-icon" />
              </div>
              <h2 className="premium-title">LMS Connect</h2>
              <p className="premium-subtitle">Ready to assist. Select a conversation to begin.</p>
              <div className="chat-badge-group">
                <div className="chat-badge"><ShieldCheck size={14} weight="fill" /> Secure</div>
                <div className="chat-badge"><Pulse size={14} weight="fill" /> Active</div>
              </div>
            </div>
          ) : (
            <>
              <div className="conv-header">
                <button className="conv-header-back-mobile" onClick={() => setSelectedUser(null)}>
                  <CaretLeft size={20} weight="bold" />
                </button>
                <div
                  className="chat-avatar-circle"
                  style={{ background: getAvatarColor(selectedUser.name) }}
                >
                  {getInitials(selectedUser.name)}
                </div>
                <div className="conv-header-info">
                  <h2>{selectedUser.name || 'User'}</h2>
                  <div className="status-row">
                    {isTyping ? (
                      <span className="typing-indicator-text">is typing...</span>
                    ) : (
                      <span className="online-status"><span className="status-dot"></span> Active Now</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="message-viewport">
                {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                  <div key={date} className="msg-date-group">
                    <div className="msg-date-divider">
                      <span>{formatHeaderDate(date)}</span>
                    </div>
                    {msgs.map((m) => (
                      <div
                        key={m.id}
                        className={`msg-bubble ${m.sender_id === user.id ? 'sent' : 'received'}`}
                      >
                        <span className="msg-text">{m.message}</span>
                        <span className="msg-time">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {m.sender_id === user.id && (
                             <CheckCircle size={12} weight={m.read_at ? "fill" : "regular"} className="read-icon" />
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="msg-bubble received typing-bubble">
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-footer">
                <form className="input-box-wrapper" onSubmit={handleSend}>
                  <input
                    type="text"
                    placeholder={`Message ${selectedUser.name.split(' ')[0]}...`}
                    value={newMessage}
                    onChange={handleTyping}
                    disabled={sending}
                  />
                  <button type="submit" className="send-btn-circle" disabled={sending || !newMessage.trim()}>
                    <PaperPlaneTilt size={18} weight="fill" />
                  </button>
                </form>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Chat
