import React, { useEffect, useState } from 'react'
import { getCollection, orderBy } from '../../firebase/firestore'
import { FiBookOpen } from 'react-icons/fi'

interface EducationItem {
  id: string
  degree: string
  institution: string
  field?: string
  cgpa?: string
  startYear: string
  endYear: string
  description?: string
}

const defaultEdu: EducationItem[] = [
  {
    id: '1',
    degree: "Bachelor of Technology",
    institution: "Your University",
    field: "Computer Science & Engineering",
    cgpa: "8.5",
    startYear: "2021",
    endYear: "2025",
    description: "Specialized in software development, algorithms, and data structures. Active participant in coding clubs and hackathons.",
  },
]

const Education: React.FC = () => {
  const [items, setItems] = useState<EducationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCollection('education', orderBy('startYear', 'desc'))
      .then(data => setItems(data.length > 0 ? data as EducationItem[] : defaultEdu))
      .catch(() => setItems(defaultEdu))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="education" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Education</span>
          <h2 className="section-title">
            Academic <span className="gradient-text">Background</span>
          </h2>
        </div>

        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {loading
            ? Array(2).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px', marginBottom: '1rem' }} />
            ))
            : items.map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                }}>
                  <FiBookOpen />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.15rem' }}>{item.degree}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.1rem' }}>{item.institution}</p>
                      {item.field && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{item.field}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="tag">{item.startYear} – {item.endYear}</span>
                      {item.cgpa && (
                        <p style={{ color: 'var(--success)', fontSize: '0.82rem', marginTop: '0.3rem', fontWeight: 600 }}>
                          CGPA: {item.cgpa}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  )
}

export default Education
