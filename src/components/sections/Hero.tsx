import React, { useEffect, useState, useRef, useCallback } from 'react'
import { FiArrowDown, FiGithub, FiLinkedin, FiDownload } from 'react-icons/fi'
import { getDocument } from '../../firebase/firestore'
import { downloadResume } from '../../utils/resumeHelper'
import Typewriter from '../Typewriter'

interface HeroData {
  displayName?: string
  heroTitle?: string
  heroTagline?: string
  githubUrl?: string
  linkedinUrl?: string
  resumeUrl?: string
  availableForWork?: boolean
}

const Hero: React.FC = () => {
  const [data, setData] = useState<HeroData | null>(null)
  const loaded = data !== null
  const staggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getDocument('settings', 'main').then(d => {
      setData((d as HeroData) ?? {})
    })
  }, [])

  /* ── Stagger-in once data has loaded ─────────────────── */
  const revealHero = useCallback(() => {
    if (!staggerRef.current) return
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    const items = staggerRef.current.querySelectorAll<HTMLElement>('.hero-stagger')
    items.forEach((el, i) => {
      if (motionOk) {
        el.style.transitionDelay = `${i * 0.15}s`
      }
      // Use rAF so the browser has painted the opacity:0 state first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add('hero-visible')
        })
      })
    })
  }, [])

  useEffect(() => {
    if (loaded) revealHero()
  }, [loaded, revealHero])

  // Use safe defaults only after data arrives
  const name = data?.displayName || 'Your Name'
  const title = data?.heroTitle || 'Full Stack Developer'
  const tagline = data?.heroTagline || 'I build scalable, production-ready web applications with modern technologies. Passionate about clean code, great UX, and continuous learning.'
  const githubUrl = data?.githubUrl || 'https://github.com/Sunilpranav'
  const linkedinUrl = data?.linkedinUrl || 'https://www.linkedin.com/in/sunilpranav-s21/'
  const resumeUrl = data?.resumeUrl || '/resume.pdf'
  const available = data?.availableForWork !== false

  return (
    <section
      id="home"
      className="grid-bg noise"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '70px',
      }}
    >
      {/* Glow orbs */}
      <div className="glow-orb" style={{ width: '500px', height: '500px', background: 'rgba(99,102,241,0.12)', top: '-100px', right: '-100px' }} />
      <div className="glow-orb" style={{ width: '400px', height: '400px', background: 'rgba(139,92,246,0.08)', bottom: '-50px', left: '-100px' }} />

      {/* Content — invisible until data has loaded, then stagger-in */}
      <div
        ref={staggerRef}
        className="section-container"
        style={{ position: 'relative', zIndex: 1, width: '100%', visibility: loaded ? 'visible' : 'hidden' }}
      >
        <div style={{ maxWidth: '700px' }}>
          {/* Badge */}
          {available && (
            <div className="hero-stagger" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '50px',
              padding: '0.35rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--accent)',
              fontWeight: 500,
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Available for opportunities
            </div>
          )}

          <div className="hero-stagger">
            <h1 style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: '1.25rem',
            }}>
              Hi, I'm{' '}
              <span className="gradient-text">{name}</span>
              <br />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75em', fontWeight: 700 }}>
                <Typewriter text={title} active={loaded} />
              </span>
            </h1>
          </div>

          <p className="hero-stagger" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.15rem',
            lineHeight: 1.7,
            maxWidth: '540px',
            marginBottom: '2rem',
          }}>
            {tagline}
          </p>

          {/* CTA Buttons */}
          <div className="hero-stagger" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <a
              href="#projects"
              className="btn-primary"
              onClick={e => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="btn-secondary"
              onClick={e => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }) }}
            >
              Contact Me
            </a>
            <button
              type="button"
              onClick={() => downloadResume(resumeUrl, `${name.replace(/\s+/g, '_')}_Resume.pdf`)}
              className="btn-secondary"
              style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiDownload /> Resume
            </button>
          </div>

          {/* Social links */}
          <div className="hero-stagger" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Find me on</span>
            {[
              { icon: <FiGithub />, href: githubUrl, label: 'GitHub' },
              { icon: <FiLinkedin />, href: linkedinUrl, label: 'LinkedIn' },
            ].map(s => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '1.25rem',
                  transition: 'color 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-stagger" style={{
          position: 'absolute',
          bottom: '-5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          animation: 'bounce 2s infinite',
        }}>
          <FiArrowDown />
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bounce { 0%, 100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
      `}</style>
    </section>
  )
}

export default Hero
