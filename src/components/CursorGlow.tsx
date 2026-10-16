import React, { useEffect, useRef, useState } from 'react'

const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // Only run on desktop devices with fine pointer and no reduced-motion preference
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches

    if (!finePointer || !motionOk) {
      setEnabled(false)
      return
    }

    setEnabled(true)

    let mouseX = -500
    let mouseY = -500
    let rafId: number | null = null

    const updatePosition = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${mouseX - 250}px, ${mouseY - 250}px, 0)`
      }
      rafId = null
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      setVisible(true)
      if (rafId === null) {
        rafId = requestAnimationFrame(updatePosition)
      }
    }

    const onMouseLeave = () => {
      setVisible(false)
    }

    const onMouseEnter = () => {
      setVisible(true)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    window.addEventListener('blur', onMouseLeave)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('blur', onMouseLeave)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  if (!enabled) return null

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease',
        willChange: 'transform',
        transform: 'translate3d(-500px, -500px, 0)',
        background: 'radial-gradient(circle 250px at center, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.05) 45%, transparent 70%)',
      }}
    />
  )
}

export default CursorGlow
