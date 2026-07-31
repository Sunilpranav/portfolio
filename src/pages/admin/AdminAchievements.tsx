import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getCollection, addDocument, updateDocument, deleteDocument, orderBy } from '../../firebase/firestore'
import { useToast } from '../../context/ToastContext'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiTrendingUp } from 'react-icons/fi'

interface Achievement {
  id: string
  title: string
  description: string
  date?: string
  icon?: string
}

interface AchievForm {
  title: string
  description: string
  date: string
  icon: string
}

const EMOJI_OPTIONS = ['🏆', '🌟', '🎓', '💻', '🏅', '🚀', '🎯', '📚', '💡', '🔥']

const AdminAchievements: React.FC = () => {
  const { toast } = useToast()
  const [items, setItems] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AchievForm>({
    defaultValues: { icon: '🏆' }
  })

  const fetchItems = async () => {
    const data = await getCollection('achievements', orderBy('date', 'desc'))
    setItems(data as Achievement[])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const openAdd = () => {
    setEditing(null)
    reset({ title: '', description: '', date: '', icon: '🏆' })
    setShowForm(true)
  }

  const openEdit = (a: Achievement) => {
    setEditing(a)
    setValue('title', a.title)
    setValue('description', a.description)
    setValue('date', a.date || '')
    setValue('icon', a.icon || '🏆')
    setShowForm(true)
  }

  const onSubmit = async (data: AchievForm) => {
    setSaving(true)
    try {
      if (editing) {
        await updateDocument('achievements', editing.id, data as unknown as Record<string, unknown>)
        toast('Updated!', 'success')
      } else {
        await addDocument('achievements', data as unknown as Record<string, unknown>)
        toast('Achievement added!', 'success')
      }
      setShowForm(false)
      fetchItems()
    } catch {
      toast('Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achievement?')) return
    try {
      await deleteDocument('achievements', id)
      toast('Deleted.', 'info')
      fetchItems()
    } catch {
      toast('Failed.', 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Achievements</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Showcase your milestones and accomplishments.</p>
        </div>
        <button id="add-achievement-btn" className="btn-primary" onClick={openAdd}><FiPlus /> Add Achievement</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{editing ? 'Edit Achievement' : 'Add Achievement'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {EMOJI_OPTIONS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setValue('icon', em)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border)',
                        background: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: '1.25rem',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="achiev-title">Title *</label>
                <input id="achiev-title" className="form-input" placeholder="Top 10 in Hackathon"
                  {...register('title', { required: 'Title required' })} />
                {errors.title && <span className="error-text">{errors.title.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="achiev-desc">Description *</label>
                <textarea id="achiev-desc" className="form-input form-textarea"
                  placeholder="Describe this achievement..."
                  {...register('description', { required: 'Description required' })} />
                {errors.description && <span className="error-text">{errors.description.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="achiev-date">Year</label>
                <input id="achiev-date" className="form-input" placeholder="2024" {...register('date')} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}><FiCheck /> {saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((a, i) => (
            <div key={a.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '3px solid', borderLeftColor: i % 2 === 0 ? 'var(--accent)' : 'var(--accent-2)' }}>
              <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{a.icon || <FiTrendingUp />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.title}</h3>
                  {a.date && <span className="tag" style={{ fontSize: '0.7rem' }}>{a.date}</span>}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{a.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button onClick={() => openEdit(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.95rem' }}><FiEdit2 /></button>
                <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.95rem' }}><FiTrash2 /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No achievements yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminAchievements
