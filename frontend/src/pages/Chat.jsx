import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatCircle, PaperPlaneTilt, SignOut, ArrowLeft, MagnifyingGlass, CaretLeft } from '@phosphor-icons/react'
import { io } from 'socket.io-client'
import './Chat.css'

const API = 'http://localhost:5000/api'
const SOCKET_URL = 'http://localhost:5000'

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
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] })
    const socket = socketRef.current
    socket.emit('chat:join', user.id)
    return () => {
      socket.disconnect()
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
    return () => socket.off('chat:message', onMsg)
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
        alert(data.message || 'Failed to send')
      }
    } catch (err) {
      alert('Failed to send message')
    }
    setSending(false)
  }

  const handleLogout = () => {
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
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase().replace(' ', '')
  }

  if (!user) return null

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="chat-header-left">
          <button className="chat-back-btn" onClick={() => navigate('/dashboard')} title="Back">
            <ArrowLeft size={20} weight="bold" />
          </button>
          <div className="chat-title-group">
            <h1>LMS Connect</h1>
            <p>{user.name} · {user.role.replace('_', ' ')}</p>
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
                    <span className="name">{u.name}</span>
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
              <div className="empty-icon-box">
                <ChatCircle size={56} weight="duotone" />
              </div>
              <h2>Secure Messaging</h2>
              <p>Select a student or staff member from the list<br/>to start a professional conversation.</p>
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
                  <h2>{selectedUser.name}</h2>
                  <span>{selectedUser.role?.replace('_', ' ')}</span>
                </div>
              </div>
              
              <div className="message-viewport">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`msg-bubble ${m.sender_id === user.id ? 'sent' : 'received'}`}
                  >
                    <span className="msg-text">{m.message}</span>
                    <span className="msg-time">
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-footer">
                <form className="input-box-wrapper" onSubmit={handleSend}>
                  <input
                    type="text"
                    placeholder={`Message ${selectedUser.name.split(' ')[0]}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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
