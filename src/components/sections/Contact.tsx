import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { addDocument, getDocument } from '../../firebase/firestore'
import { FiMail, FiUser, FiMessageSquare, FiSend, FiMapPin, FiGithub, FiLinkedin } from 'react-icons/fi'
import { useToast } from '../../context/ToastContext'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactSettings {
  contactEmail?: string
  contactLocation?: string
  githubUrl?: string
  linkedinUrl?: string
  availableForWork?: boolean
  emailjsServiceId?: string
  emailjsTemplateId?: string
  emailjsPublicKey?: string
}

const Contact: React.FC = () => {
  const { toast } = useToast()
  const [sending, setSending] = useState(false)
  const [settings, setSettings] = useState<ContactSettings>({})

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>()

  useEffect(() => {
    getDocument('settings', 'main').then(d => {
      if (d) setSettings(d as ContactSettings)
    })
  }, [])

  const sendViaEmailJS = async (data: ContactForm, toEmail: string) => {
    // Use EmailJS to forward to Gmail
    const serviceId = settings.emailjsServiceId || import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = settings.emailjsTemplateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = settings.emailjsPublicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey ||
      serviceId === 'mock_service_id' || serviceId.startsWith('mock')) {
      return false // EmailJS not configured
    }

    try {
      const emailjs = await import('@emailjs/browser')
      await emailjs.send(serviceId, templateId, {
        from_name: data.name,
        from_email: data.email,
        subject: data.subject,
        message: data.message,
        to_email: toEmail,
        reply_to: data.email,
      }, publicKey)
      return true
    } catch {
      return false
    }
  }

  const onSubmit = async (data: ContactForm) => {
    setSending(true)
    try {
      // Save to admin messages
      await addDocument('messages', { ...data, read: false })

      // Also forward to Gmail if configured
      const toEmail = settings.contactEmail || import.meta.env.VITE_ADMIN_EMAIL || ''
      if (toEmail) await sendViaEmailJS(data, toEmail)

      toast("Message sent! I'll get back to you soon.", 'success')
      reset()
    } catch {
      toast('Failed to send message. Please try again.', 'error')
    } finally {
      setSending(false)
    }
  }

  const email = settings.contactEmail || 'your.email@example.com'
  const location = settings.contactLocation || 'India'
  const github = settings.githubUrl || 'https://github.com/yourusername'
  const linkedin = settings.linkedinUrl || 'https://linkedin.com/in/yourusername'

  const githubDisplay = github.replace('https://', '').replace('http://', '')
  const linkedinDisplay = linkedin.replace('https://', '').replace('http://', '')

  const contactInfo = [
    { icon: <FiMail />, label: 'Email', value: email, href: `mailto:${email}` },
    { icon: <FiMapPin />, label: 'Location', value: location, href: null },
    { icon: <FiGithub />, label: 'GitHub', value: githubDisplay, href: github.startsWith('http') ? github : `https://${github}` },
    { icon: <FiLinkedin />, label: 'LinkedIn', value: linkedinDisplay, href: linkedin.startsWith('http') ? linkedin : `https://${linkedin}` },
  ]

  return (
    <section id="contact" className="section-padding">
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="tag" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>Contact</span>
          <h2 className="section-title">
            Let's <span className="gradient-text">Connect</span>
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '500px', margin: '0 auto 3rem' }}>
            Have a project in mind or just want to say hi? My inbox is always open.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
          {/* Contact Info */}
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Get in Touch</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contactInfo.map(c => (
                  <div key={c.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: 'rgba(99,102,241,0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)', flexShrink: 0,
                    }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</div>
                      {c.href
                        ? <a href={c.href} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                          >{c.value}</a>
                        : <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{c.value}</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability note */}
            <div className="card glass-card" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', flexShrink: 0, animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Currently available for <strong style={{ color: 'var(--text-primary)' }}>full-time opportunities</strong> and freelance projects.
                </span>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>Send a Message</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">
                  <FiUser style={{ display: 'inline', marginRight: '0.3rem' }} /> Name
                </label>
                <input id="contact-name" className="form-input" placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })} />
                {errors.name && <span className="error-text">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">
                  <FiMail style={{ display: 'inline', marginRight: '0.3rem' }} /> Email
                </label>
                <input id="contact-email" type="email" className="form-input" placeholder="john@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })} />
                {errors.email && <span className="error-text">{errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">Subject</label>
                <input id="contact-subject" className="form-input" placeholder="Project Discussion"
                  {...register('subject', { required: 'Subject is required' })} />
                {errors.subject && <span className="error-text">{errors.subject.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">
                  <FiMessageSquare style={{ display: 'inline', marginRight: '0.3rem' }} /> Message
                </label>
                <textarea id="contact-message" className="form-input form-textarea"
                  placeholder="Tell me about your project..."
                  {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'At least 10 characters' } })} />
                {errors.message && <span className="error-text">{errors.message.message}</span>}
              </div>

              <button id="contact-submit" type="submit" className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: sending ? 0.7 : 1 }}
                disabled={sending}>
                {sending ? 'Sending...' : <><FiSend /> Send Message</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact
