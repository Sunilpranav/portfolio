import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getCollection, addDocument, updateDocument, deleteDocument, orderBy } from '../../firebase/firestore'
import { uploadFile } from '../../firebase/storage'
import { useToast } from '../../context/ToastContext'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiUpload, FiStar } from 'react-icons/fi'

interface Project {
  id: string
  title: string
  description: string
  image?: string
  tags: string[]
  liveUrl?: string
  githubUrl?: string
  featured: boolean
}

interface ProjectForm {
  title: string
  description: string
  tags: string
  liveUrl: string
  githubUrl: string
  featured: boolean
}

const AdminProjects: React.FC = () => {
  const { toast } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectForm>()

  const fetchProjects = async () => {
    const data = await getCollection('projects', orderBy('createdAt', 'desc'))
    setProjects(data as Project[])
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const openAdd = () => {
    setEditing(null)
    setImageFile(null)
    setImagePreview('')
    reset({ title: '', description: '', tags: '', liveUrl: '', githubUrl: '', featured: false })
    setShowForm(true)
  }

  const openEdit = (p: Project) => {
    setEditing(p)
    setImagePreview(p.image || '')
    setImageFile(null)
    setValue('title', p.title)
    setValue('description', p.description)
    setValue('tags', p.tags.join(', '))
    setValue('liveUrl', p.liveUrl || '')
    setValue('githubUrl', p.githubUrl || '')
    setValue('featured', p.featured)
    setShowForm(true)
  }

  const onSubmit = async (data: ProjectForm) => {
    setSaving(true)
    try {
      let imageUrl = editing?.image || ''
      if (imageFile) {
        imageUrl = await uploadFile(`projects/${Date.now()}-${imageFile.name}`, imageFile)
      }

      const payload = {
        title: data.title,
        description: data.description,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        featured: data.featured,
        image: imageUrl,
      }

      if (editing) {
        await updateDocument('projects', editing.id, payload)
        toast('Project updated!', 'success')
      } else {
        await addDocument('projects', payload)
        toast('Project added!', 'success')
      }
      setShowForm(false)
      fetchProjects()
    } catch {
      toast('Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    try {
      await deleteDocument('projects', id)
      toast('Project deleted.', 'info')
      fetchProjects()
    } catch {
      toast('Failed to delete.', 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your portfolio projects.</p>
        </div>
        <button id="add-project-btn" className="btn-primary" onClick={openAdd}><FiPlus /> Add Project</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{editing ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Image */}
              <div className="form-group">
                <label className="form-label">Project Image</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {imagePreview && <img src={imagePreview} alt="preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />}
                  <label htmlFor="project-img" className="btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                    <FiUpload /> Upload Image
                  </label>
                  <input id="project-img" type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }
                    }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-title">Title *</label>
                <input id="proj-title" className="form-input" placeholder="My Awesome Project"
                  {...register('title', { required: 'Title required' })} />
                {errors.title && <span className="error-text">{errors.title.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-desc">Description *</label>
                <textarea id="proj-desc" className="form-input form-textarea" placeholder="Describe your project..."
                  {...register('description', { required: 'Description required' })} />
                {errors.description && <span className="error-text">{errors.description.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-tags">Tags (comma-separated) *</label>
                <input id="proj-tags" className="form-input" placeholder="React, Firebase, TypeScript"
                  {...register('tags', { required: 'At least one tag' })} />
                {errors.tags && <span className="error-text">{errors.tags.message}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-live">Live URL</label>
                  <input id="proj-live" className="form-input" placeholder="https://..." {...register('liveUrl')} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="proj-github">GitHub URL</label>
                  <input id="proj-github" className="form-input" placeholder="https://github.com/..." {...register('githubUrl')} />
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem' }}>
                <input id="proj-featured" type="checkbox" {...register('featured')} />
                <label htmlFor="proj-featured" className="form-label" style={{ margin: 0 }}>
                  <FiStar style={{ display: 'inline', marginRight: '0.3rem', color: '#f59e0b' }} />
                  Mark as Featured
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                  <FiCheck /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects list */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '16px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {projects.map(p => (
            <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                height: '140px',
                background: p.image ? `url(${p.image}) center/cover` : 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {!p.image && <span style={{ fontSize: '2.5rem' }}>🚀</span>}
                {p.featured && (
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '50px', padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                    ⭐ Featured
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>{p.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {p.description.length > 80 ? p.description.slice(0, 80) + '...' : p.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                  {p.tags.slice(0, 4).map(t => <span key={t} className="tag" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEdit(p)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '0.4rem', fontSize: '0.82rem' }}>
                    <FiEdit2 /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
              No projects yet. Click "Add Project" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminProjects
