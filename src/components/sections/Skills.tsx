import React, { useEffect, useState } from 'react'
import { getCollection, orderBy } from '../../firebase/firestore'

interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
  icon?: string
}

const categoryColors: Record<string, string> = {
  Frontend: '#6366f1',
  Backend: '#8b5cf6',
  Database: '#10b981',
  DevOps: '#f59e0b',
  Tools: '#ec4899',
  Other: '#64748b',
}

const Skills: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    getCollection('skills', orderBy('proficiency', 'desc'))
      .then(data => setSkills(data as Skill[]))
      .catch(() => setSkills([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['All', ...Array.from(new Set(skills.map(s => s.category)))]
  const filtered = activeCategory === 'All' ? skills : skills.filter(s => s.category === activeCategory)

  return (
    <section id="skills" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Skills</span>
          <h2 className="section-title">
            My Technical <span className="gradient-text">Arsenal</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
            Technologies and tools I use to bring ideas to life.
          </p>

          {skills.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '50px',
                    border: '1px solid',
                    borderColor: activeCategory === cat ? 'var(--accent)' : 'var(--border)',
                    background: activeCategory === cat ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: activeCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'var(--surface)', borderRadius: '20px',
            border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No skills added yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Go to <strong>Admin → Skills</strong> to add your tech stack.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {filtered.map(skill => {
              const color = categoryColors[skill.category] || '#6366f1'
              return (
                <div key={skill.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{skill.name}</div>
                      <span style={{
                        fontSize: '0.72rem', padding: '0.15rem 0.5rem',
                        borderRadius: '50px', background: `${color}18`, color, fontWeight: 500,
                      }}>
                        {skill.category}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color }}>{skill.proficiency}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${skill.proficiency}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                      borderRadius: '3px', transition: 'width 1s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default Skills
