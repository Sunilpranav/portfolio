import React, { useEffect, useState } from 'react'
import { getCollection, orderBy } from '../../firebase/firestore'
import { FiTrendingUp } from 'react-icons/fi'

interface Achievement {
  id: string
  title: string
  description: string
  date?: string
  icon?: string
}

const defaultAchievements: Achievement[] = [
  { id: '1', title: 'Top 10 in National Hackathon', description: 'Ranked in the top 10 out of 500+ teams in a 24-hour hackathon, building an AI-powered solution.', date: '2024', icon: '🏆' },
  { id: '2', title: 'Open Source Contributor', description: 'Contributed 15+ pull requests to popular open-source repositories with 2000+ GitHub stars.', date: '2024', icon: '🌟' },
  { id: '3', title: 'University Rank 1', description: 'Achieved the highest GPA in the Computer Science department for the academic year 2023-24.', date: '2023', icon: '🎓' },
  { id: '4', title: '1000+ LeetCode Problems', description: 'Solved over 1000 problems on LeetCode with a rating of 1800+, demonstrating strong DSA skills.', date: '2024', icon: '💻' },
]

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCollection('achievements', orderBy('date', 'desc'))
      .then(data => setAchievements(data.length > 0 ? data as Achievement[] : defaultAchievements))
      .catch(() => setAchievements(defaultAchievements))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="achievements" className="section-padding">
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Achievements</span>
          <h2 className="section-title">
            Milestones & <span className="gradient-text">Wins</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0 auto 3rem' }}>
            Key highlights from my academic and professional journey.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {achievements.map((a, i) => (
              <div key={a.id} className="card" style={{
                borderLeft: '3px solid',
                borderLeftColor: i % 2 === 0 ? 'var(--accent)' : 'var(--accent-2)',
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `rgba(99,102,241,0.1)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    flexShrink: 0,
                  }}>
                    {a.icon || <FiTrendingUp />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.title}</h3>
                      {a.date && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', flexShrink: 0 }}>{a.date}</span>}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{a.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Achievements
