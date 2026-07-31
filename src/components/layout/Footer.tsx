import React, { useEffect, useState } from 'react'
import { FiMail } from 'react-icons/fi'
import { getDocument } from '../../firebase/firestore'
import { SocialLink, getPlatformInfo } from '../SocialLinksManager'

interface FooterSettings {
  displayName?: string
  footerTagline?: string
  contactEmail?: string
  socialLinks?: SocialLink[]
}

const Footer: React.FC = () => {
  const year = new Date().getFullYear()
  const [settings, setSettings] = useState<FooterSettings>({})

  useEffect(() => {
    getDocument('settings', 'main').then(d => {
      if (d) setSettings(d as FooterSettings)
    })
  }, [])

  const name = settings.displayName || 'Portfolio'
  const tagline = settings.footerTagline || 'Built with React + Firebase'
  const email = settings.contactEmail ? `mailto:${settings.contactEmail}` : '#contact'

  // Build social links: use dynamic list if available, fallback to email icon
  const socialLinks: SocialLink[] = settings.socialLinks && settings.socialLinks.length > 0
    ? settings.socialLinks
    : []

  return (
    <footer style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      padding: '2.5rem 1.5rem',
      position: 'relative',
      zIndex: 2,
    }}>
      <div className="section-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{name}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tagline}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Dynamic social links from admin */}
          {socialLinks.map(link => {
            const info = getPlatformInfo(link.platform)
            return (
              <a
                key={link.id}
                href={link.url}
                aria-label={link.label || link.platform}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                title={link.label || link.platform}
                style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1rem', textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = info.color
                  e.currentTarget.style.color = info.color
                  e.currentTarget.style.background = `${info.color}15`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.background = 'var(--bg-tertiary)'
                }}
              >
                {info.icon}
              </a>
            )
          })}

          {/* Always show email icon if none added or no email link in list */}
          {socialLinks.length === 0 && (
            <a href={email} aria-label="Email"
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1rem', textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}>
              <FiMail />
            </a>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          © {year} {name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
