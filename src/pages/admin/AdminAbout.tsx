import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getDocument, setDocument } from '../../firebase/firestore'
import { uploadFile } from '../../firebase/storage'
import { useToast } from '../../context/ToastContext'
import { FiSave, FiUpload } from 'react-icons/fi'

interface AboutForm {
  name: string
  title: string
  bio: string
  location: string
  experience: string
  interests: string
}

const AdminAbout: React.FC = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AboutForm>()

  useEffect(() => {
    getDocument('about', 'main').then(data => {
      if (data) {
        const d = data as Record<string, unknown>
        reset({
          name: d.name as string || '',
          title: d.title as string || '',
          bio: d.bio as string || '',
          location: d.location as string || '',
          experience: d.experience as string || '',
          interests: Array.isArray(d.interests) ? (d.interests as string[]).join(', ') : '',
        })
        if (d.image) setImagePreview(d.image as string)
      }
    }).finally(() => setLoading(false))
  }, [reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: AboutForm) => {
    setSaving(true)
    try {
      let imageUrl = imagePreview

      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadFile(`about/profile-${Date.now()}`, imageFile)
        setUploading(false)
      }

      const interests = data.interests
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      await setDocument('about', 'main', {
        ...data,
        interests,
        image: imageUrl,
      })

      toast('About section updated!', 'success')
    } catch {
      toast('Failed to save. Try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />)}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>About</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your personal information and bio.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Left: Image + basics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem' }}>Profile Photo</h3>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: imagePreview ? undefined : 'var(--accent-gradient)',
                  backgroundImage: imagePreview ? `url(${imagePreview})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  margin: '0 auto 1rem',
                  border: '3px solid var(--border-active)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '2rem',
                  fontWeight: 800,
                }}>
                  {!imagePreview && '?'}
                </div>
                <label htmlFor="profile-upload" className="btn-secondary" style={{ cursor: 'pointer' }}>
                  <FiUpload />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </label>
                <input id="profile-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Quick Info</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="about-location">Location</label>
                <input id="about-location" className="form-input" placeholder="City, Country" {...register('location')} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="about-experience">Experience</label>
                <input id="about-experience" className="form-input" placeholder="2+ Years" {...register('experience')} />
              </div>
            </div>
          </div>

          {/* Right: Main fields */}
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Personal Details</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="about-name">Full Name *</label>
              <input id="about-name" className="form-input" placeholder="Your Full Name"
                {...register('name', { required: 'Name is required' })} />
              {errors.name && <span className="error-text">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="about-title">Professional Title *</label>
              <input id="about-title" className="form-input" placeholder="Full Stack Developer"
                {...register('title', { required: 'Title is required' })} />
              {errors.title && <span className="error-text">{errors.title.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="about-bio">Bio *</label>
              <textarea id="about-bio" className="form-input form-textarea" rows={5}
                placeholder="Write a compelling bio about yourself..."
                {...register('bio', { required: 'Bio is required' })} />
              {errors.bio && <span className="error-text">{errors.bio.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="about-interests">Interests (comma-separated)</label>
              <input id="about-interests" className="form-input" placeholder="Web Dev, Open Source, Machine Learning"
                {...register('interests')} />
            </div>

            <button type="submit" className="btn-primary"
              style={{ marginTop: '0.5rem', opacity: saving ? 0.7 : 1 }}
              disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminAbout
