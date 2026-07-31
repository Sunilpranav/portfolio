import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../../firebase/auth'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import {
  FiGrid, FiUser, FiCode, FiFolder, FiAward, FiStar,
  FiMail, FiSettings, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiBookOpen
} from 'react-icons/fi'

const navItems = [
  { to: '/admin', icon: <FiGrid />, label: 'Dashboard', exact: true },
  { to: '/admin/about', icon: <FiUser />, label: 'About' },
  { to: '/admin/skills', icon: <FiCode />, label: 'Skills' },
  { to: '/admin/education', icon: <FiBookOpen />, label: 'Education' },
  { to: '/admin/projects', icon: <FiFolder />, label: 'Projects' },
  { to: '/admin/certificates', icon: <FiAward />, label: 'Certificates' },
  { to: '/admin/achievements', icon: <FiStar />, label: 'Achievements' },
  { to: '/admin/messages', icon: <FiMail />, label: 'Messages' },
  { to: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
]

const AdminLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast('Logged out successfully', 'info')
    navigate('/login')
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar header */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'var(--accent-gradient)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fff',
              fontSize: '0.95rem',
              flexShrink: 0,
            }}>P</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Portfolio Admin</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Content Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {navItems.map(item => {
              const active = isActive(item.to, item.exact)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 400,
                    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                    borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                >
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              width: '100%',
            }}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            View Portfolio ↗
          </a>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.9rem',
              borderRadius: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--danger)',
              fontSize: '0.9rem',
              width: '100%',
            }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
            display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Main content */}
      <div className="admin-content">
        {/* Mobile topbar */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)',
        }} className="mobile-topbar">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '1.1rem',
            }}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <div style={{ fontWeight: 700 }}>Portfolio Admin</div>
        </div>

        <Outlet />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-topbar { display: flex !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  )
}

export default AdminLayout
