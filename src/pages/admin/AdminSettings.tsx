import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getDocument, setDocument } from '../../firebase/firestore'
import { uploadFile } from '../../firebase/storage'
import { useToast } from '../../context/ToastContext'
import { FiSave, FiUpload, FiFileText, FiUser, FiType, FiAlignLeft, FiMail, FiMapPin, FiKey, FiShare2 } from 'react-icons/fi'
import SocialLinksManager, { SocialLink } from '../../components/SocialLinksManager'

interface SettingsForm {
  displayName: string
  heroTitle: string
  heroTagline: string
  footerTagline: string
  contactEmail: string
  contactLocation: string
  availableForWork: boolean
  resumeUrl: string
  emailjsServiceId: string
  emailjsTemplateId: string
  emailjsPublicKey: string
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [currentResumeUrl, setCurrentResumeUrl] = useState('')
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsForm>()

  useEffect(() => {
    getDocument('settings', 'main').then(data => {
      if (data) {
        reset(data as unknown as SettingsForm)
        const d = data as Record<string, unknown>
        if (d.resumeUrl) setCurrentResumeUrl(d.resumeUrl as string)
        if (Array.isArray(d.socialLinks)) setSocialLinks(d.socialLinks as SocialLink[])
      }
    }).finally(() => setLoading(false))
  }, [reset])

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast('Please upload a PDF file only.', 'error')
      return
    }
    setResumeFile(file)
    toast(`"${file.name}" selected. Save settings to upload.`, 'success')
  }

  const onSubmit = async (data: SettingsForm) => {
    setSaving(true)
    try {
      let resumeUrl = currentResumeUrl

      if (resumeFile) {
        setResumeUploading(true)
        resumeUrl = await uploadFile(`resume/resume-${Date.now()}.pdf`, resumeFile)
        setResumeUploading(false)
        setCurrentResumeUrl(resumeUrl)
      }

      await setDocument('settings', 'main', {
        ...(data as unknown as Record<string, unknown>),
        resumeUrl,
        socialLinks,
      })
      toast('Settings saved!', 'success')
    } catch {
      toast('Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />)}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your Hero section, resume, and social links.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

          {/* Hero Section Editor */}
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiUser style={{ color: 'var(--accent)' }} /> Hero Section
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              This controls the name, title, and description shown on the homepage hero.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="sett-name">
                <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}><FiUser /></span>
                Your Name *
              </label>
              <input id="sett-name" className="form-input" placeholder="e.g. Sunilpranav"
                {...register('displayName', { required: 'Name is required' })} />
              {errors.displayName && <span className="error-text">{errors.displayName.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sett-herotitle">
                <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}><FiType /></span>
                Hero Title / Role *
              </label>
              <input id="sett-herotitle" className="form-input" placeholder="e.g. Full Stack Developer"
                {...register('heroTitle', { required: 'Hero title is required' })} />
              {errors.heroTitle && <span className="error-text">{errors.heroTitle.message}</span>}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Shown below your name: "Hi, I'm [Name] / [Hero Title]"</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sett-tagline">
                <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}><FiAlignLeft /></span>
                Hero Description
              </label>
              <textarea id="sett-tagline" className="form-input form-textarea" rows={3}
                placeholder="e.g. I build scalable, production-ready web apps with modern technologies..."
                {...register('heroTagline')} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Shown as the paragraph under your name on the homepage.</span>
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
              <input id="sett-available" type="checkbox" {...register('availableForWork')} />
              <label htmlFor="sett-available" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                Show "Available for opportunities" badge
              </label>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sett-footer-tagline">
                <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}>©</span>
                Footer Tagline
              </label>
              <input id="sett-footer-tagline" className="form-input"
                placeholder="e.g. Built with React + Firebase"
                {...register('footerTagline')} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Shown below your name in the footer.</span>
            </div>
          </div>

          {/* Resume Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ border: currentResumeUrl ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiFileText style={{ color: 'var(--accent)' }} /> Resume / CV
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                Upload a PDF resume. The "Resume" button on the hero section will link to it.
              </p>

              {/* Current resume status */}
              {currentResumeUrl && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '10px', marginBottom: '1rem'
                }}>
                  <FiFileText style={{ color: '#10b981', fontSize: '1.2rem', flexShrink: 0 }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Resume Uploaded ✓</div>
                    <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                      View current resume
                    </a>
                  </div>
                </div>
              )}

              {/* Selected file preview */}
              {resumeFile && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '10px', marginBottom: '1rem'
                }}>
                  <FiFileText style={{ color: 'var(--accent)', fontSize: '1.2rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{resumeFile.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(resumeFile.size / 1024).toFixed(1)} KB — PDF
                    </div>
                  </div>
                </div>
              )}

              <label htmlFor="resume-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiUpload />
                {resumeFile ? 'Change Resume PDF' : currentResumeUrl ? 'Replace Resume PDF' : 'Upload Resume PDF'}
              </label>
              <input
                id="resume-upload"
                type="file"
                accept="application/pdf"
                style={{ display: 'none' }}
                onChange={handleResumeChange}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                PDF format only. Max 5MB recommended.
              </p>
            </div>

            {/* Dynamic Social Links */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiShare2 style={{ color: 'var(--accent)' }} /> Social Links
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                Add any platform — GitHub, LinkedIn, LeetCode, Instagram, YouTube, or custom. Shown in nav &amp; footer.
              </p>
              <SocialLinksManager links={socialLinks} onChange={setSocialLinks} />
            </div>

            {/* Contact Info */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMail style={{ color: 'var(--accent)' }} /> Contact Info
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                Shown in the "Get in Touch" section on your portfolio homepage.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-contact-email">
                  <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}><FiMail /></span>
                  Your Email (shown publicly) *
                </label>
                <input id="sett-contact-email" className="form-input" type="email"
                  placeholder="yourname@gmail.com"
                  {...register('contactEmail', { required: 'Email is required' })} />
                {errors.contactEmail && <span className="error-text">{errors.contactEmail.message}</span>}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>This email is displayed on the contact section and receives form replies.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-location">
                  <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}><FiMapPin /></span>
                  Location
                </label>
                <input id="sett-location" className="form-input"
                  placeholder="e.g. Mumbai, India"
                  {...register('contactLocation')} />
              </div>
            </div>

            {/* EmailJS Gmail Config */}
            <div className="card" style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiKey style={{ color: '#f59e0b' }} /> Gmail Forwarding (EmailJS)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                When someone submits the contact form, these keys forward a copy directly to your Gmail inbox.
                Get free keys at <a href="https://emailjs.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>emailjs.com</a>.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-ejs-service">Service ID</label>
                <input id="sett-ejs-service" className="form-input" placeholder="e.g. service_abc123"
                  {...register('emailjsServiceId')} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-ejs-template">Template ID</label>
                <input id="sett-ejs-template" className="form-input" placeholder="e.g. template_xyz789"
                  {...register('emailjsTemplateId')} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-ejs-key">Public Key</label>
                <input id="sett-ejs-key" className="form-input" placeholder="e.g. user_XXXXXXXXXXXXXXXX"
                  {...register('emailjsPublicKey')} />
              </div>

              <div style={{
                padding: '0.75rem', background: 'rgba(245,158,11,0.08)',
                borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)'
              }}>
                💡 <strong>Quick setup:</strong> Sign up at emailjs.com → Add Gmail as email service → Create template with fields: <code>from_name</code>, <code>from_email</code>, <code>subject</code>, <code>message</code>, <code>to_email</code> → Copy the IDs here.
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
            <FiSave /> {resumeUploading ? 'Uploading Resume...' : saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettings
