import React, { useState } from 'react'
import {
  FiGithub, FiLinkedin, FiTwitter, FiMail, FiGlobe,
  FiYoutube, FiInstagram, FiCodepen, FiSlack, FiTwitch,
  FiLink, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX,
} from 'react-icons/fi'

export interface SocialLink {
  id: string
  platform: string
  label: string
  url: string
}

// Supported platform → icon + color mapping
const PLATFORM_MAP: Record<string, { icon: React.ReactNode; color: string; placeholder: string }> = {
  github:    { icon: <FiGithub />,    color: '#6e7681', placeholder: 'https://github.com/username' },
  linkedin:  { icon: <FiLinkedin />,  color: '#0a66c2', placeholder: 'https://linkedin.com/in/username' },
  twitter:   { icon: <FiTwitter />,   color: '#1d9bf0', placeholder: 'https://twitter.com/username' },
  gmail:     { icon: <FiMail />,      color: '#ea4335', placeholder: 'mailto:you@gmail.com' },
  website:   { icon: <FiGlobe />,     color: '#6366f1', placeholder: 'https://yoursite.com' },
  youtube:   { icon: <FiYoutube />,   color: '#ff0000', placeholder: 'https://youtube.com/@channel' },
  instagram: { icon: <FiInstagram />, color: '#e1306c', placeholder: 'https://instagram.com/username' },
  codepen:   { icon: <FiCodepen />,   color: '#ffffff', placeholder: 'https://codepen.io/username' },
  slack:     { icon: <FiSlack />,     color: '#4a154b', placeholder: 'https://slack.com/...' },
  twitch:    { icon: <FiTwitch />,    color: '#9146ff', placeholder: 'https://twitch.tv/username' },
  leetcode:  { icon: <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>LC</span>, color: '#ffa116', placeholder: 'https://leetcode.com/username' },
  codeforces:{ icon: <span style={{ fontWeight: 800, fontSize: '0.65rem' }}>CF</span>, color: '#1c9ae3', placeholder: 'https://codeforces.com/profile/username' },
  hackerrank:{ icon: <span style={{ fontWeight: 800, fontSize: '0.6rem' }}>HR</span>, color: '#2ec866', placeholder: 'https://hackerrank.com/username' },
  discord:   { icon: <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>D</span>, color: '#5865f2', placeholder: 'https://discord.gg/invite' },
  telegram:  { icon: <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>T</span>, color: '#229ed9', placeholder: 'https://t.me/username' },
  custom:    { icon: <FiLink />,      color: '#64748b', placeholder: 'https://...' },
}

const PLATFORM_OPTIONS = Object.keys(PLATFORM_MAP)

// Get icon for any platform string (case-insensitive)
export const getPlatformInfo = (platform: string) => {
  const key = platform.toLowerCase().replace(/\s+/g, '')
  return PLATFORM_MAP[key] || PLATFORM_MAP.custom
}

interface Props {
  links: SocialLink[]
  onChange: (links: SocialLink[]) => void
}

const SocialLinksManager: React.FC<Props> = ({ links, onChange }) => {
  const [editId, setEditId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ platform: 'github', label: '', url: '' })

  const genId = () => `sl_${Date.now()}`

  const startEdit = (link: SocialLink) => {
    setEditId(link.id)
    setForm({ platform: link.platform, label: link.label, url: link.url })
    setShowAdd(false)
  }

  const cancelEdit = () => {
    setEditId(null)
    setShowAdd(false)
    setForm({ platform: 'github', label: '', url: '' })
  }

  const saveEdit = () => {
    if (!form.url) return
    if (editId) {
      onChange(links.map(l => l.id === editId ? { ...l, ...form } : l))
    } else {
      onChange([...links, { id: genId(), ...form }])
    }
    cancelEdit()
  }

  const deleteLink = (id: string) => {
    onChange(links.filter(l => l.id !== id))
  }

  const isEditing = (id: string) => editId === id

  return (
    <div>
      {/* Existing links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
        {links.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '10px' }}>
            No social links yet. Click "+ Add Link" below.
          </div>
        )}
        {links.map(link => {
          const info = getPlatformInfo(link.platform)
          return (
            <div key={link.id}>
              {isEditing(link.id) ? (
                /* Inline Edit Form */
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--accent)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Platform</label>
                      <select
                        className="form-input"
                        style={{ textTransform: 'capitalize' }}
                        value={form.platform}
                        onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                      >
                        {PLATFORM_OPTIONS.map(p => (
                          <option key={p} value={p} style={{ textTransform: 'capitalize' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Display Label (optional)</label>
                      <input className="form-input" placeholder={form.platform}
                        value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem' }}>URL *</label>
                    <input className="form-input" placeholder={PLATFORM_MAP[form.platform]?.placeholder || 'https://...'}
                      value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.4rem' }} onClick={saveEdit}>
                      <FiCheck /> Save
                    </button>
                    <button type="button" className="btn-secondary" onClick={cancelEdit}>
                      <FiX /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Row */
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem', background: 'var(--bg-tertiary)',
                  borderRadius: '10px', border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    background: `${info.color}20`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: info.color, fontSize: '1rem',
                  }}>
                    {info.icon}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>
                      {link.label || link.platform}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.url}
                    </div>
                  </div>
                  <button type="button" onClick={() => startEdit(link)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '0.3rem', fontSize: '0.95rem' }}>
                    <FiEdit2 />
                  </button>
                  <button type="button" onClick={() => deleteLink(link.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', fontSize: '0.95rem' }}>
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add New Link */}
      {showAdd && !editId ? (
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--accent)', marginBottom: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Platform</label>
              <select className="form-input" value={form.platform}
                onChange={e => setForm(f => ({ ...f, platform: e.target.value }))} style={{ textTransform: 'capitalize' }}>
                {PLATFORM_OPTIONS.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Display Label (optional)</label>
              <input className="form-input" placeholder={form.platform}
                value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>URL *</label>
            <input className="form-input" placeholder={PLATFORM_MAP[form.platform]?.placeholder || 'https://...'}
              value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.4rem' }} onClick={saveEdit}>
              <FiCheck /> Add Link
            </button>
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              <FiX /> Cancel
            </button>
          </div>
        </div>
      ) : (
        !editId && (
          <button type="button" className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => { setShowAdd(true); setForm({ platform: 'github', label: '', url: '' }) }}>
            <FiPlus /> Add Link
          </button>
        )
      )}
    </div>
  )
}

export default SocialLinksManager
