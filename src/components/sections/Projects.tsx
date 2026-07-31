import React, { useEffect, useState } from 'react'
import { getCollection, orderBy } from '../../firebase/firestore'
import { FiExternalLink, FiGithub, FiStar } from 'react-icons/fi'

interface Project {
  id: string
  title: string
  description: string
  image?: string
  tags: string[]
  liveUrl?: string
  githubUrl?: string
  featured?: boolean
}

// Tag color palette
const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4',
]
const tagColor = (tag: string) => TAG_COLORS[tag.charCodeAt(0) % TAG_COLORS.length]

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    getCollection('projects', orderBy('createdAt', 'desc'))
      .then(data => setProjects(data as Project[]))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const allTags = ['All', ...Array.from(new Set(projects.flatMap(p => p.tags || [])))]
  const filtered = filter === 'All' ? projects : projects.filter(p => p.tags?.includes(filter))

  return (
    <section id="projects" className="section-padding">
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Projects</span>
          <h2 className="section-title">
            Things I've <span className="gradient-text">Built</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
            A curated selection of projects that reflect my skills and passion.
          </p>

          {projects.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {allTags.slice(0, 8).map(tag => (
                <button key={tag} onClick={() => setFilter(tag)} style={{
                  padding: '0.35rem 0.9rem', borderRadius: '50px', border: '1px solid',
                  borderColor: filter === tag ? 'var(--accent)' : 'var(--border)',
                  background: filter === tag ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: filter === tag ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s',
                }}>
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '420px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'var(--surface)', borderRadius: '20px',
            border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No projects added yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Go to <strong>Admin → Projects</strong> to showcase your work.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(project => (
              <article key={project.id}
                className="card"
                style={{
                  padding: 0, overflow: 'hidden', cursor: 'pointer',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(99,102,241,0.15)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = ''
                }}
              >
                {/* ── Large image preview ── */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '58%',       // ≈ 16:9 aspect ratio
                  background: project.image
                    ? undefined
                    : 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.18) 100%)',
                  overflow: 'hidden',
                }}>
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    }}>
                      <span style={{ fontSize: '3.5rem' }}>🚀</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No preview image</span>
                    </div>
                  )}

                  {/* Featured badge */}
                  {project.featured && (
                    <div style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      background: 'rgba(245,158,11,0.88)', backdropFilter: 'blur(6px)',
                      borderRadius: '50px', padding: '0.2rem 0.6rem',
                      fontSize: '0.72rem', color: '#fff', fontWeight: 700,
                    }}>
                      <FiStar /> Featured
                    </div>
                  )}
                </div>

                {/* ── Card body ── */}
                <div style={{ padding: '1.25rem 1.25rem 1rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.45rem', lineHeight: 1.3 }}>
                    {project.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1rem' }}>
                    {project.description}
                  </p>

                  {/* ── Bottom row: tags left, links right ── */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    {/* Tech tag icons (coloured circles with initials) */}
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {(project.tags || []).slice(0, 5).map(tag => (
                        <span key={tag} title={tag} style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: `${tagColor(tag)}22`,
                          border: `1.5px solid ${tagColor(tag)}55`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 800, color: tagColor(tag),
                          cursor: 'default',
                        }}>
                          {tag.slice(0, 2).toUpperCase()}
                        </span>
                      ))}
                      {(project.tags || []).length > 5 && (
                        <span style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'rgba(100,116,139,0.15)',
                          border: '1.5px solid rgba(100,116,139,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)',
                        }}>
                          +{(project.tags || []).length - 5}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                          <FiGithub /> Code
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            color: 'var(--accent)', fontSize: '0.82rem',
                            fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                          Check Live Site <FiExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Projects
