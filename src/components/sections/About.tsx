import React, { useEffect, useState } from 'react'
import { getDocument } from '../../firebase/firestore'
import { FiUser, FiMapPin, FiCalendar, FiCode } from 'react-icons/fi'

interface AboutData {
  name?: string
  title?: string
  bio?: string
  location?: string
  experience?: string
  age?: string
  image?: string
  interests?: string[]
}

const About: React.FC = () => {
  const [data, setData] = useState<AboutData>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocument('about', 'main')
      .then(d => { if (d) setData(d as AboutData) })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { icon: <FiCode />, label: 'Experience', value: data.experience || '2+ Years' },
    { icon: <FiMapPin />, label: 'Location', value: data.location || 'India' },
    { icon: <FiCalendar />, label: 'Available', value: 'Full-time' },
    { icon: <FiUser />, label: 'Projects', value: '20+' },
  ]

  return (
    <section id="about" className="section-padding">
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>About Me</span>
          <h2 className="section-title">
            Know Who <span className="gradient-text">I Am</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0 auto 3rem' }}>
            A passionate developer dedicated to building exceptional digital experiences.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Image + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Avatar */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              {loading ? (
                <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1rem' }} />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: data.image ? undefined : 'var(--accent-gradient)',
                  backgroundImage: data.image ? `url(${data.image})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#fff',
                  border: '3px solid var(--border-active)',
                }}>
                  {!data.image && (data.name?.[0] || 'Y')}
                </div>
              )}
              {loading
                ? <div className="skeleton" style={{ height: '1.5rem', width: '60%', margin: '0 auto 0.5rem' }} />
                : <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.25rem' }}>{data.name || 'Your Name'}</h3>
              }
              {loading
                ? <div className="skeleton" style={{ height: '1rem', width: '40%', margin: '0 auto' }} />
                : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{data.title || 'Full Stack Developer'}</p>
              }
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {stats.map(s => (
                <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '1.25rem', display: 'flex', justifyContent: 'center' }}>
                    {s.icon}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{s.value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Who am I?</h3>
              {loading
                ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem', width: `${85 + (i % 3) * 5}%` }} />
                ))
                : <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  {data.bio || 'I\'m a passionate full-stack developer who loves building products that make a difference. I have experience with modern web technologies and a strong focus on user experience, performance, and clean code. I\'m always eager to learn new technologies and collaborate on interesting projects.'}
                </p>
              }
            </div>

            {/* Interests */}
            {(data.interests || ['Web Development', 'Open Source', 'Machine Learning', 'UI/UX Design', 'System Design']).length > 0 && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Interests</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(data.interests || ['Web Development', 'Open Source', 'Machine Learning', 'UI/UX Design', 'System Design']).map(i => (
                    <span key={i} className="tag">{i}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
