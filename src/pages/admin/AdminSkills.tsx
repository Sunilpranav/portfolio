import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getCollection, addDocument, updateDocument, deleteDocument, orderBy } from '../../firebase/firestore'
import { useToast } from '../../context/ToastContext'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi'

interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
}

interface SkillForm {
  name: string
  category: string
  proficiency: number
}

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Other']

const AdminSkills: React.FC = () => {
  const { toast } = useToast()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Skill | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SkillForm>({
    defaultValues: { proficiency: 80 }
  })

  const fetchSkills = async () => {
    const data = await getCollection('skills', orderBy('category'))
    setSkills(data as Skill[])
    setLoading(false)
  }

  useEffect(() => { fetchSkills() }, [])

  const openAdd = () => {
    setEditing(null)
    reset({ name: '', category: 'Frontend', proficiency: 80 })
    setShowForm(true)
  }

  const openEdit = (skill: Skill) => {
    setEditing(skill)
    setValue('name', skill.name)
    setValue('category', skill.category)
    setValue('proficiency', skill.proficiency)
    setShowForm(true)
  }

  const onSubmit = async (data: SkillForm) => {
    setSaving(true)
    try {
      if (editing) {
        await updateDocument('skills', editing.id, data as unknown as Record<string, unknown>)
        toast('Skill updated!', 'success')
      } else {
        await addDocument('skills', data as unknown as Record<string, unknown>)
        toast('Skill added!', 'success')
      }
      setShowForm(false)
      fetchSkills()
    } catch {
      toast('Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return
    setDeletingId(id)
    try {
      await deleteDocument('skills', id)
      toast('Skill deleted.', 'info')
      fetchSkills()
    } catch {
      toast('Failed to delete.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const grouped = CATEGORIES.reduce<Record<string, Skill[]>>((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Skills</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your technical skills and proficiency levels.</p>
        </div>
        <button id="add-skill-btn" className="btn-primary" onClick={openAdd}><FiPlus /> Add Skill</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{editing ? 'Edit Skill' : 'Add Skill'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label" htmlFor="skill-name">Skill Name *</label>
                <input id="skill-name" className="form-input" placeholder="React"
                  {...register('name', { required: 'Name required' })} />
                {errors.name && <span className="error-text">{errors.name.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="skill-category">Category *</label>
                <select id="skill-category" className="form-input" {...register('category', { required: true })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="skill-proficiency">Proficiency: <strong>{'{value}'}%</strong></label>
                <input id="skill-proficiency" type="range" min={0} max={100} style={{ width: '100%' }}
                  {...register('proficiency', { valueAsNumber: true })} />
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

      {/* Skills list */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {CATEGORIES.filter(c => grouped[c]?.length > 0).map(cat => (
            <div key={cat}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                {cat}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {grouped[cat].map(skill => (
                  <div key={skill.id} className="card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{skill.name}</span>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => openEdit(skill)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '0.2rem', fontSize: '0.9rem' }}>
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleDelete(skill.id)}
                          disabled={deletingId === skill.id}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '0.2rem', fontSize: '0.9rem' }}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ height: '5px', background: 'var(--bg-tertiary)', borderRadius: '3px', flex: 1, marginRight: '0.5rem', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${skill.proficiency}%`, background: 'var(--accent-gradient)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>{skill.proficiency}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {skills.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No skills yet. Click "Add Skill" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminSkills
