import React from 'react'
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

const Home: React.FC = () => {
  return (
    <>
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
    </>
  )
}

export default Home
