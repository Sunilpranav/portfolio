import React, { useEffect, useState } from 'react'
import { getCollection, orderBy } from '../../firebase/firestore'
import { FiAward, FiExternalLink, FiCalendar, FiFileText, FiDownload } from 'react-icons/fi'

interface Certificate {
  id: string
  title: string
  issuer: string
  date: string
  image?: string
  fileType?: 'image' | 'pdf'
  credentialUrl?: string
  skills?: string[]
}

const TAG_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#10b981',
  '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4',
]
const tagColor = (tag: string) => TAG_COLORS[tag.charCodeAt(0) % TAG_COLORS.length]
const isPdf = (url?: string, type?: string) =>
  type === 'pdf' || (!!url && (url.includes('.pdf') || url.includes('application%2Fpdf')))

const Certificates: React.FC = () => {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCollection('certificates', orderBy('date', 'desc'))
      .then(data => setCerts(data as Certificate[]))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="certificates" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Certifications</span>
          <h2 className="section-title">
            My <span className="gradient-text">Credentials</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0 auto 3rem' }}>
            Professional certifications that validate my expertise.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : certs.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'var(--surface)', borderRadius: '20px',
            border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏅</div>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>No certificates added yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Go to <strong>Admin → Certificates</strong> to add your credentials.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {certs.map(cert => {
              const isCertPdf = isPdf(cert.image, cert.fileType)
              return (
                <div key={cert.id}
                  className="card"
                  style={{
                    padding: 0, overflow: 'hidden',
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
                  {/* ── Certificate preview area ── */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '60%',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.18) 50%, rgba(16,185,129,0.12) 100%)',
                  }}>
                    {/* PDF: show embedded iframe */}
                    {isCertPdf && cert.image ? (
                      <iframe
                        src={`${cert.image}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        title={cert.title}
                        style={{
                          position: 'absolute', inset: 0,
                          width: '100%', height: '100%',
                          border: 'none', pointerEvents: 'none',
                        }}
                      />
                    ) : cert.image ? (
                      /* Image */
                      <img
                        src={cert.image}
                        alt={cert.title}
                        style={{
                          position: 'absolute', inset: 0,
                          width: '100%', height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    ) : (
                      /* No file — decorative placeholder */
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                      }}>
                        <div style={{
                          width: '72px', height: '72px', borderRadius: '50%',
                          background: 'rgba(99,102,241,0.15)',
                          border: '2px solid rgba(99,102,241,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '2.2rem', color: 'var(--accent)',
                        }}>
                          <FiAward />
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                          {cert.issuer?.toUpperCase().slice(0, 8)}
                        </span>
                      </div>
                    )}

                    {/* Gradient overlay at bottom */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: '45%',
                      background: 'linear-gradient(to top, rgba(10,10,20,0.55) 0%, transparent 100%)',
                      pointerEvents: 'none',
                    }} />

                    {/* PDF badge */}
                    {isCertPdf && (
                      <div style={{
                        position: 'absolute', top: '0.75rem', left: '0.75rem',
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        background: 'rgba(239,68,68,0.82)', backdropFilter: 'blur(6px)',
                        color: '#fff', borderRadius: '50px',
                        padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700,
                      }}>
                        <FiFileText size={11} /> PDF
                      </div>
                    )}

                    {/* View / Download button — top right */}
                    {cert.image && (
                      <a
                        href={cert.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={isCertPdf ? 'Download PDF' : 'View certificate'}
                        style={{
                          position: 'absolute', top: '0.75rem', right: '0.75rem',
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          background: 'rgba(99,102,241,0.85)', backdropFilter: 'blur(6px)',
                          color: '#fff', borderRadius: '50px',
                          padding: '0.25rem 0.7rem', fontSize: '0.75rem',
                          fontWeight: 600, textDecoration: 'none',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                        {isCertPdf ? <><FiDownload size={12} /> Download</> : <><FiExternalLink size={12} /> View</>}
                      </a>
                    )}

                    {/* Credential URL if different from file */}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View credential"
                        style={{
                          position: 'absolute', bottom: '0.75rem', right: '0.75rem',
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem',
                          fontWeight: 600, textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}>
                        <FiExternalLink size={12} /> Credential
                      </a>
                    )}
                  </div>

                  {/* ── Card body ── */}
                  <div style={{ padding: '1.1rem 1.25rem 1rem' }}>
                    <div style={{
                      height: '3px', width: '40px',
                      background: 'var(--accent-gradient)',
                      borderRadius: '2px', marginBottom: '0.75rem',
                    }} />

                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', lineHeight: 1.35 }}>
                      {cert.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500 }}>
                        {cert.issuer}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        <FiCalendar size={11} /> {cert.date}
                      </span>
                    </div>

                    {cert.skills && cert.skills.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {cert.skills.slice(0, 6).map(s => (
                          <span key={s} title={s} style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: `${tagColor(s)}22`,
                            border: `1.5px solid ${tagColor(s)}55`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.58rem', fontWeight: 800, color: tagColor(s),
                          }}>
                            {s.slice(0, 2).toUpperCase()}
                          </span>
                        ))}
                        {cert.skills.length > 6 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.2rem' }}>
                            +{cert.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
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

export default Certificates
