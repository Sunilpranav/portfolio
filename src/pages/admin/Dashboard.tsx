import React, { useEffect, useState } from 'react'
import { getCollection } from '../../firebase/firestore'
import { Link } from 'react-router-dom'
import {
  FiFolder, FiAward, FiCode, FiMail, FiStar, FiUser,
  FiArrowRight, FiTrendingUp, FiBookOpen
} from 'react-icons/fi'

interface StatCard {
  label: string
  collection: string
  icon: React.ReactNode
  color: string
  link: string
}

const statCards: StatCard[] = [
  { label: 'Projects', collection: 'projects', icon: <FiFolder />, color: '#6366f1', link: '/admin/projects' },
  { label: 'Skills', collection: 'skills', icon: <FiCode />, color: '#8b5cf6', link: '/admin/skills' },
  { label: 'Education', collection: 'education', icon: <FiBookOpen />, color: '#06b6d4', link: '/admin/education' },
  { label: 'Certificates', collection: 'certificates', icon: <FiAward />, color: '#10b981', link: '/admin/certificates' },
  { label: 'Achievements', collection: 'achievements', icon: <FiStar />, color: '#f59e0b', link: '/admin/achievements' },
  { label: 'Messages', collection: 'messages', icon: <FiMail />, color: '#ec4899', link: '/admin/messages' },
]

const quickLinks = [
  { to: '/admin/about', icon: <FiUser />, label: 'Edit About', desc: 'Update bio, title, and interests' },
  { to: '/admin/education', icon: <FiBookOpen />, label: 'Manage Education', desc: 'Manage your degrees and colleges' },
  { to: '/admin/projects', icon: <FiFolder />, label: 'Add Project', desc: 'Showcase a new project' },
  { to: '/admin/certificates', icon: <FiAward />, label: 'Add Certificate', desc: 'Add a new credential' },
]

const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchCounts = async () => {
      const results: Record<string, number> = {}
      await Promise.allSettled(
        statCards.map(async s => {
          const data = await getCollection(s.collection)
          results[s.collection] = data.length
        })
      )
      setCounts(results)
      setLoadingStats(false)
    }
    fetchCounts()
  }, [])

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Welcome back! Here's an overview of your portfolio content.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(s => (
          <Link
            key={s.collection}
            to={s.link}
            style={{ textDecoration: 'none' }}
          >
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${s.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.color,
                fontSize: '1.3rem',
                margin: '0 auto 0.75rem',
              }}>
                {s.icon}
              </div>
              {loadingStats
                ? <div className="skeleton" style={{ height: '2rem', width: '40px', margin: '0 auto 0.25rem' }} />
                : <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem', color: s.color }}>
                  {counts[s.collection] ?? 0}
                </div>
              }
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FiTrendingUp style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Quick Actions</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {quickLinks.map(ql => (
            <Link
              key={ql.to}
              to={ql.to}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(99,102,241,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}>
                  {ql.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.1rem' }}>{ql.label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{ql.desc}</div>
                </div>
                <FiArrowRight style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Status card */}
      <div className="card glass-card" style={{ background: 'rgba(99,102,241,0.04)', borderColor: 'rgba(99,102,241,0.15)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', flexShrink: 0, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Your portfolio is <strong style={{ color: '#10b981' }}>live</strong>. All changes are saved to Firebase in real-time.
          </span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ marginLeft: 'auto', whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
            View Portfolio ↗
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
