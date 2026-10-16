import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { getDocument, setDocument } from '../../firebase/firestore'
import { uploadFile } from '../../firebase/storage'
import { useToast } from '../../context/ToastContext'
import {
  FiSave,
  FiUpload,
  FiFileText,
  FiUser,
  FiType,
  FiAlignLeft,
  FiMail,
  FiMapPin,
  FiKey,
  FiShare2,
  FiEye,
  FiDownload,
  FiTrash2,
  FiCheck,
  FiX,
  FiRefreshCw,
} from 'react-icons/fi'
import SocialLinksManager, { SocialLink } from '../../components/SocialLinksManager'
import { viewResume, downloadResume, formatFileSize } from '../../utils/resumeHelper'

interface SettingsForm {
  displayName: string
  heroTitle: string
  heroTagline: string
  footerTagline: string
  contactEmail: string
  contactLocation: string
  availableForWork: boolean
  resumeUrl: string
  resumeFileName?: string
  resumeUpdatedAt?: string
  resumeFileSize?: number
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
  const [currentResumeFileName, setCurrentResumeFileName] = useState('')
  const [currentResumeUpdatedAt, setCurrentResumeUpdatedAt] = useState('')
  const [currentResumeFileSize, setCurrentResumeFileSize] = useState<number | undefined>(undefined)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsForm>()

  useEffect(() => {
    getDocument('settings', 'main')
      .then((data) => {
        if (data) {
          reset(data as unknown as SettingsForm)
          const d = data as Record<string, unknown>
          if (d.resumeUrl) setCurrentResumeUrl(d.resumeUrl as string)
          if (d.resumeFileName) setCurrentResumeFileName(d.resumeFileName as string)
          if (d.resumeUpdatedAt) setCurrentResumeUpdatedAt(d.resumeUpdatedAt as string)
          if (typeof d.resumeFileSize === 'number') setCurrentResumeFileSize(d.resumeFileSize)
          if (Array.isArray(d.socialLinks)) setSocialLinks(d.socialLinks as SocialLink[])
        }
      })
      .finally(() => setLoading(false))
  }, [reset])

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast('Please upload a PDF file only.', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('PDF file size should be less than 10MB.', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setResumeFile(file)
    toast(`"${file.name}" selected. Click "Upload & Replace Resume Now" to apply immediately.`, 'success')
  }

  // Direct 1-click upload and replace right from the resume card
  const handleDirectUploadResume = async () => {
    if (!resumeFile) return
    setResumeUploading(true)
    try {
      const fileName = resumeFile.name
      const fileSize = resumeFile.size
      const updatedAt = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

      const uploadedUrl = await uploadFile(`resume/resume-${Date.now()}.pdf`, resumeFile)

      const existingSettings = (await getDocument('settings', 'main')) || {}
      await setDocument('settings', 'main', {
        ...existingSettings,
        resumeUrl: uploadedUrl,
        resumeFileName: fileName,
        resumeUpdatedAt: updatedAt,
        resumeFileSize: fileSize,
      })

      setCurrentResumeUrl(uploadedUrl)
      setCurrentResumeFileName(fileName)
      setCurrentResumeUpdatedAt(updatedAt)
      setCurrentResumeFileSize(fileSize)
      setResumeFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      toast(`Resume replaced successfully with "${fileName}"!`, 'success')
    } catch (err) {
      console.error('Resume upload failed:', err)
      toast('Failed to upload resume. Please try again.', 'error')
    } finally {
      setResumeUploading(false)
    }
  }

  const handleCancelResumeSelection = () => {
    setResumeFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast('Selection cancelled.', 'info')
  }

  const handleRemoveResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume? Visitors will no longer see a resume download button.')) {
      return
    }
    try {
      const existingSettings = (await getDocument('settings', 'main')) || {}
      await setDocument('settings', 'main', {
        ...existingSettings,
        resumeUrl: '',
        resumeFileName: '',
        resumeUpdatedAt: '',
        resumeFileSize: 0,
      })
      setCurrentResumeUrl('')
      setCurrentResumeFileName('')
      setCurrentResumeUpdatedAt('')
      setCurrentResumeFileSize(undefined)
      setResumeFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast('Resume removed successfully.', 'success')
    } catch {
      toast('Failed to remove resume.', 'error')
    }
  }

  const onSubmit = async (data: SettingsForm) => {
    setSaving(true)
    try {
      let resumeUrl = currentResumeUrl
      let resumeFileName = currentResumeFileName
      let resumeUpdatedAt = currentResumeUpdatedAt
      let resumeFileSize = currentResumeFileSize

      if (resumeFile) {
        setResumeUploading(true)
        resumeUrl = await uploadFile(`resume/resume-${Date.now()}.pdf`, resumeFile)
        resumeFileName = resumeFile.name
        resumeUpdatedAt = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        resumeFileSize = resumeFile.size
        setResumeUploading(false)
        setCurrentResumeUrl(resumeUrl)
        setCurrentResumeFileName(resumeFileName)
        setCurrentResumeUpdatedAt(resumeUpdatedAt)
        setCurrentResumeFileSize(resumeFileSize)
        setResumeFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }

      await setDocument('settings', 'main', {
        ...(data as unknown as Record<string, unknown>),
        resumeUrl,
        resumeFileName,
        resumeUpdatedAt,
        resumeFileSize,
        socialLinks,
      })
      toast('Settings saved successfully!', 'success')
    } catch (err) {
      console.error('Failed to save settings:', err)
      toast('Failed to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
          ))}
      </div>
    )

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your Hero section, resume, and social links.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Hero Section Editor */}
          <div className="card">
            <h3
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FiUser style={{ color: 'var(--accent)' }} /> Hero Section
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              This controls the name, title, and description shown on the homepage hero.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="sett-name">
                <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}>
                  <FiUser />
                </span>
                Your Name *
              </label>
              <input
                id="sett-name"
                className="form-input"
                placeholder="e.g. Sunilpranav"
                {...register('displayName', { required: 'Name is required' })}
              />
              {errors.displayName && <span className="error-text">{errors.displayName.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sett-herotitle">
                <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}>
                  <FiType />
                </span>
                Hero Title / Role *
              </label>
              <input
                id="sett-herotitle"
                className="form-input"
                placeholder="e.g. Full Stack Developer"
                {...register('heroTitle', { required: 'Hero title is required' })}
              />
              {errors.heroTitle && <span className="error-text">{errors.heroTitle.message}</span>}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Shown below your name: "Hi, I'm [Name] / [Hero Title]"
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sett-tagline">
                <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}>
                  <FiAlignLeft />
                </span>
                Hero Description
              </label>
              <textarea
                id="sett-tagline"
                className="form-input form-textarea"
                rows={3}
                placeholder="e.g. I build scalable, production-ready web apps with modern technologies..."
                {...register('heroTagline')}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Shown as the paragraph under your name on the homepage.
              </span>
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
              <input
                id="sett-footer-tagline"
                className="form-input"
                placeholder="e.g. Built with React + Firebase"
                {...register('footerTagline')}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Shown below your name in the footer.
              </span>
            </div>
          </div>

          {/* Resume Upload & Management */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              className="card"
              style={{
                border: currentResumeUrl
                  ? '1px solid rgba(16,185,129,0.3)'
                  : '1px solid var(--border)',
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FiFileText style={{ color: 'var(--accent)' }} /> Resume / CV
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                Upload a PDF resume. Visitors can view and download it directly from your portfolio hero section.
              </p>

              {/* Active resume status */}
              {currentResumeUrl ? (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'rgba(16,185,129,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}
                    >
                      <FiFileText />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                          Active Resume ✓
                        </span>
                        {currentResumeUpdatedAt && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)',
                              background: 'var(--surface)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              border: '1px solid var(--border)',
                            }}
                          >
                            Updated {currentResumeUpdatedAt}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          marginTop: '4px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {currentResumeFileName || 'Uploaded Resume.pdf'}
                      </div>
                      {currentResumeFileSize ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {formatFileSize(currentResumeFileSize)}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions for current active resume */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      paddingTop: '0.6rem',
                      borderTop: '1px solid rgba(16,185,129,0.15)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => viewResume(currentResumeUrl)}
                      className="btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                      }}
                      title="Open resume in new tab"
                    >
                      <FiEye /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadResume(currentResumeUrl, currentResumeFileName || 'resume.pdf')}
                      className="btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                      }}
                      title="Download PDF"
                    >
                      <FiDownload /> Download
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="btn-secondary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                        color: '#ef4444',
                        borderColor: 'rgba(239,68,68,0.25)',
                      }}
                      title="Remove Resume"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '1.25rem 1rem',
                    border: '1px dashed var(--border)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    marginBottom: '1.25rem',
                    background: 'rgba(255,255,255,0.01)',
                  }}
                >
                  <FiFileText
                    style={{ fontSize: '1.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}
                  />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No resume uploaded yet</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Select a PDF file below to publish your resume on your portfolio.
                  </div>
                </div>
              )}

              {/* Selected replacement file preview & instant upload */}
              {resumeFile && (
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '12px',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'rgba(99,102,241,0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        fontSize: '1.25rem',
                        flexShrink: 0,
                      }}
                    >
                      <FiUpload />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--accent)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Selected to Replace
                      </span>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          wordBreak: 'break-all',
                          marginTop: '2px',
                        }}
                      >
                        {resumeFile.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {formatFileSize(resumeFile.size)} — PDF
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleDirectUploadResume}
                      disabled={resumeUploading}
                      className="btn-primary"
                      style={{
                        fontSize: '0.85rem',
                        padding: '0.45rem 1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: resumeUploading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {resumeUploading ? (
                        <>
                          <FiRefreshCw style={{ animation: 'spin 1s linear infinite' }} /> Uploading &amp; Replacing...
                        </>
                      ) : (
                        <>
                          <FiCheck /> Upload &amp; Replace Resume Now
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelResumeSelection}
                      disabled={resumeUploading}
                      className="btn-secondary"
                      style={{
                        fontSize: '0.85rem',
                        padding: '0.45rem 0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer',
                      }}
                    >
                      <FiX /> Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* File selector input button */}
              <div>
                <input
                  ref={fileInputRef}
                  id="resume-upload"
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleResumeChange}
                />
                <label
                  htmlFor="resume-upload"
                  className="btn-secondary"
                  style={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: 'fit-content',
                  }}
                >
                  <FiUpload />
                  {resumeFile
                    ? 'Choose Different PDF'
                    : currentResumeUrl
                    ? 'Replace Resume PDF'
                    : 'Upload Resume PDF'}
                </label>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.75rem' }}>
                  PDF format only. Max 10MB recommended.
                </p>
              </div>
            </div>

            {/* Dynamic Social Links */}
            <div className="card">
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FiShare2 style={{ color: 'var(--accent)' }} /> Social Links
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                Add any platform — GitHub, LinkedIn, LeetCode, Instagram, YouTube, or custom. Shown in nav &amp;
                footer.
              </p>
              <SocialLinksManager links={socialLinks} onChange={setSocialLinks} />
            </div>

            {/* Contact Info */}
            <div className="card">
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FiMail style={{ color: 'var(--accent)' }} /> Contact Info
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                Shown in the "Get in Touch" section on your portfolio homepage.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-contact-email">
                  <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}>
                    <FiMail />
                  </span>
                  Your Email (shown publicly) *
                </label>
                <input
                  id="sett-contact-email"
                  className="form-input"
                  type="email"
                  placeholder="yourname@gmail.com"
                  {...register('contactEmail', { required: 'Email is required' })}
                />
                {errors.contactEmail && <span className="error-text">{errors.contactEmail.message}</span>}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  This email is displayed on the contact section and receives form replies.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-location">
                  <span style={{ color: 'var(--accent)', marginRight: '0.35rem', verticalAlign: 'middle' }}>
                    <FiMapPin />
                  </span>
                  Location
                </label>
                <input
                  id="sett-location"
                  className="form-input"
                  placeholder="e.g. Mumbai, India"
                  {...register('contactLocation')}
                />
              </div>
            </div>

            {/* EmailJS Gmail Config */}
            <div
              className="card"
              style={{
                border: '1px solid rgba(245,158,11,0.2)',
                background: 'rgba(245,158,11,0.03)',
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <FiKey style={{ color: '#f59e0b' }} /> Gmail Forwarding (EmailJS)
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                When someone submits the contact form, these keys forward a copy directly to your Gmail inbox.
                Get free keys at{' '}
                <a
                  href="https://emailjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  emailjs.com
                </a>
                .
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-ejs-service">
                  Service ID
                </label>
                <input
                  id="sett-ejs-service"
                  className="form-input"
                  placeholder="e.g. service_abc123"
                  {...register('emailjsServiceId')}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-ejs-template">
                  Template ID
                </label>
                <input
                  id="sett-ejs-template"
                  className="form-input"
                  placeholder="e.g. template_xyz789"
                  {...register('emailjsTemplateId')}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="sett-ejs-key">
                  Public Key
                </label>
                <input
                  id="sett-ejs-key"
                  className="form-input"
                  placeholder="e.g. user_XXXXXXXXXXXXXXXX"
                  {...register('emailjsPublicKey')}
                />
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  background: 'rgba(245,158,11,0.08)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                💡 <strong>Quick setup:</strong> Sign up at emailjs.com → Add Gmail as email service → Create
                template with fields: <code>from_name</code>, <code>from_email</code>, <code>subject</code>,{' '}
                <code>message</code>, <code>to_email</code> → Copy the IDs here.
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || resumeUploading}
            style={{ opacity: saving || resumeUploading ? 0.7 : 1 }}
          >
            <FiSave /> {resumeUploading ? 'Uploading Resume...' : saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettings
