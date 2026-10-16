import React, { useState, useEffect } from 'react'
import { FiArrowUp } from 'react-icons/fi'

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    window.scrollTo({
      top: 0,
      behavior: motionOk ? 'smooth' : 'auto',
    })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Back to top"
      title="Back to top"
      className="back-to-top"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: 'var(--accent-gradient)',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        zIndex: 90,
        opacity: visible ? 1 : 0,
        transform: visible
          ? isHovered
            ? 'translateY(-3px)'
            : 'translateY(0)'
          : 'translateY(16px)',
        pointerEvents: visible ? 'auto' : 'none',
        boxShadow: isHovered
          ? '0 8px 25px rgba(99, 102, 241, 0.5)'
          : '0 4px 15px rgba(99, 102, 241, 0.3)',
        transition: 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease',
      }}
    >
      <FiArrowUp />
    </button>
  )
}

export default BackToTop
