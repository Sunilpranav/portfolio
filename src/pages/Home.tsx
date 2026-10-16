import React, { useEffect, useRef } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Skills from '../components/sections/Skills'
import Projects from '../components/sections/Projects'
import Certificates from '../components/sections/Certificates'
import Achievements from '../components/sections/Achievements'
import Education from '../components/sections/Education'
import Contact from '../components/sections/Contact'
import ParticleBackground from '../components/ParticleBackground'
import CursorGlow from '../components/CursorGlow'
import BackToTop from '../components/BackToTop'
import { useScrollReveal } from '../utils/useScrollReveal'
import { useCardTilt } from '../utils/useCardTilt'
import { useCountUp } from '../utils/useCountUp'

const Home: React.FC = () => {
  const progressRef = useRef<HTMLDivElement>(null)

  // Scroll-reveal for all sections except Hero
  useScrollReveal()

  // 3D card tilt & cursor spotlight
  useCardTilt()

  // Count-up animation for data-count-to numbers
  useCountUp()

  // Scroll-progress bar
  useEffect(() => {
    const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches
    if (!motionOk) return

    const bar = progressRef.current
    if (!bar) return

    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? scrollTop / docHeight : 0
      bar.style.transform = `scaleX(${pct})`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Scroll progress indicator */}
      <div ref={progressRef} className="scroll-progress" style={{ width: '100%', transform: 'scaleX(0)' }} />

      {/* Interactive desktop cursor glow */}
      <CursorGlow />

      {/* Global blue dot animation visible across all sections */}
      <ParticleBackground />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certificates />
        <Achievements />
        <Education />
        <Contact />
      </main>
      <Footer />

      {/* Back to top floating button */}
      <BackToTop />
    </>
  )
}

export default Home
