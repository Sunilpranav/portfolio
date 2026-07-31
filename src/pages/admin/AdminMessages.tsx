import React, { useEffect, useState } from 'react'
import { getCollection, updateDocument, deleteDocument, orderBy } from '../../firebase/firestore'
import { useToast } from '../../context/ToastContext'
import { FiMail, FiTrash2, FiX } from 'react-icons/fi'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt?: { seconds: number }
}

const AdminMessages: React.FC = () => {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Message | null>(null)

  const fetchMessages = async () => {
    const data = await getCollection('messages', orderBy('createdAt', 'desc'))
    setMessages(data as Message[])
    setLoading(false)
  }

  useEffect(() => { fetchMessages() }, [])

  const markRead = async (msg: Message) => {
    if (!msg.read) {
      await updateDocument('messages', msg.id, { read: true })
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m))
    }
    setSelected(msg)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return
    try {
      await deleteDocument('messages', id)
      toast('Message deleted.', 'info')
      if (selected?.id === id) setSelected(null)
      fetchMessages()
    } catch {
      toast('Failed to delete.', 'error')
    }
  }

  const unreadCount = messages.filter(m => !m.read).length

  const formatDate = (msg: Message) => {
    if (!msg.createdAt?.seconds) return ''
    return new Date(msg.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Messages</h1>
          {unreadCount > 0 && (
            <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: '50px', padding: '0.1rem 0.6rem', fontSize: '0.78rem', fontWeight: 700 }}>
              {unreadCount} new
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact form submissions from your portfolio.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          {/* Message list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderLeft: `3px solid ${!msg.read ? 'var(--accent)' : 'transparent'}`,
                  background: selected?.id === msg.id ? 'rgba(99,102,241,0.05)' : undefined,
                }}
                onClick={() => markRead(msg)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{msg.name}</strong>
                      {!msg.read && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.subject}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.message}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem', flexShrink: 0 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(msg)}</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(msg.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.9rem' }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <FiMail style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.75rem' }} />
                No messages yet.
              </div>
            )}
          </div>

          {/* Message detail */}
          {selected && (
            <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Message Detail</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}><FiX /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>FROM</div>
                  <div style={{ fontWeight: 600 }}>{selected.name}</div>
                  <a href={`mailto:${selected.email}`} style={{ color: 'var(--accent)', fontSize: '0.88rem', textDecoration: 'none' }}>{selected.email}</a>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>SUBJECT</div>
                  <div style={{ fontSize: '0.9rem' }}>{selected.subject}</div>
                </div>
                {selected.createdAt && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>DATE</div>
                    <div style={{ fontSize: '0.85rem' }}>{formatDate(selected)}</div>
                  </div>
                )}
                <div className="divider" style={{ margin: '0.25rem 0' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>MESSAGE</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                </div>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn-primary" style={{ justifyContent: 'center' }}>
                  <FiMail /> Reply via Email
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminMessages
