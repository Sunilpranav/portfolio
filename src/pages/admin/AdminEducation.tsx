import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getCollection, addDocument, updateDocument, deleteDocument, orderBy } from '../../firebase/firestore'
import { useToast } from '../../context/ToastContext'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiBookOpen } from 'react-icons/fi'

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

interface EduForm {
  degree: string
  institution: string
  field: string
  cgpa: string
  startYear: string
  endYear: string
  description: string
}

const AdminEducation: React.FC = () => {
  const { toast } = useToast()
  const [eduItems, setEduItems] = useState<EducationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EducationItem | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EduForm>()

  const fetchEdu = async () => {
    const data = await getCollection('education', orderBy('startYear', 'desc'))
    setEduItems(data as EducationItem[])
    setLoading(false)
  }

  useEffect(() => { fetchEdu() }, [])

  const openAdd = () => {
    setEditing(null)
    reset({ degree: '', institution: '', field: '', cgpa: '', startYear: '', endYear: '', description: '' })
    setShowForm(true)
  }

  const openEdit = (item: EducationItem) => {
    setEditing(item)
    setValue('degree', item.degree)
    setValue('institution', item.institution)
    setValue('field', item.field || '')
    setValue('cgpa', item.cgpa || '')
    setValue('startYear', item.startYear)
    setValue('endYear', item.endYear)
    setValue('description', item.description || '')
    setShowForm(true)
  }

  const onSubmit = async (data: EduForm) => {
    setSaving(true)
    try {
      const payload = {
        degree: data.degree,
        institution: data.institution,
        field: data.field,
        cgpa: data.cgpa,
        startYear: data.startYear,
        endYear: data.endYear,
        description: data.description,
      }

      if (editing) {
        await updateDocument('education', editing.id, payload)
        toast('Education updated!', 'success')
      } else {
        await addDocument('education', payload)
        toast('Education entry added!', 'success')
      }
      setShowForm(false)
      fetchEdu()
    } catch {
      toast('Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this education entry?')) return
    try {
      await deleteDocument('education', id)
      toast('Education entry deleted.', 'info')
      fetchEdu()
    } catch {
      toast('Failed to delete.', 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Education</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your academic history and degrees.</p>
        </div>
        <button id="add-edu-btn" className="btn-primary" onClick={openAdd}><FiPlus /> Add Education</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{editing ? 'Edit Education' : 'Add Education'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label" htmlFor="edu-degree">Degree / Program *</label>
                <input id="edu-degree" className="form-input" placeholder="Bachelor of Technology"
                  {...register('degree', { required: 'Degree is required' })} />
                {errors.degree && <span className="error-text">{errors.degree.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edu-inst">Institution *</label>
                <input id="edu-inst" className="form-input" placeholder="University Name"
                  {...register('institution', { required: 'Institution is required' })} />
                {errors.institution && <span className="error-text">{errors.institution.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edu-field">Field of Study</label>
                <input id="edu-field" className="form-input" placeholder="Computer Science & Engineering"
                  {...register('field')} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edu-start">Start Year *</label>
                  <input id="edu-start" className="form-input" placeholder="2021"
                    {...register('startYear', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edu-end">End Year *</label>
                  <input id="edu-end" className="form-input" placeholder="2025"
                    {...register('endYear', { required: 'Required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edu-cgpa">CGPA / Grade</label>
                  <input id="edu-cgpa" className="form-input" placeholder="8.5/10"
                    {...register('cgpa')} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edu-desc">Description</label>
                <textarea id="edu-desc" className="form-input form-textarea" placeholder="Relevant coursework, achievements, or activities..."
                  {...register('description')} />
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

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {eduItems.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(99,102,241,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                fontSize: '1.2rem',
                flexShrink: 0,
              }}><FiBookOpen /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{item.degree}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{item.institution}</p>
                    {item.field && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{item.field}</p>}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className="tag" style={{ fontSize: '0.72rem' }}>{item.startYear} – {item.endYear}</span>
                    {item.cgpa && <span style={{ color: 'var(--success)', fontSize: '0.78rem', marginTop: '0.25rem', fontWeight: 600 }}>CGPA: {item.cgpa}</span>}
                  </div>
                </div>
                {item.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => openEdit(item)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}><FiEdit2 /> Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn-danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
          {eduItems.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No education history added yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminEducation
