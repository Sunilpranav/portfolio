import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getCollection, addDocument, updateDocument, deleteDocument, orderBy } from '../../firebase/firestore'
import { uploadFile } from '../../firebase/storage'
import { useToast } from '../../context/ToastContext'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiUpload, FiAward, FiExternalLink, FiFileText } from 'react-icons/fi'

interface Certificate {
  id: string
  title: string
  issuer: string
  date: string
  credentialUrl?: string
  skills?: string[]
  image?: string        // image URL or PDF URL stored here
  fileType?: 'image' | 'pdf'
}

interface CertForm {
  title: string
  issuer: string
  date: string
  credentialUrl: string
  skills: string
}

const isPdf = (url?: string) => !!url && (url.includes('.pdf') || url.includes('application%2Fpdf'))

const AdminCertificates: React.FC = () => {
  const { toast } = useToast()
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [saving, setSaving] = useState(false)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [certPreview, setCertPreview] = useState('')   // URL for preview (objectURL or stored URL)
  const [fileType, setFileType] = useState<'image' | 'pdf' | ''>('')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CertForm>()

  const fetchCerts = async () => {
    const data = await getCollection('certificates', orderBy('date', 'desc'))
    setCerts(data as Certificate[])
    setLoading(false)
  }

  useEffect(() => { fetchCerts() }, [])

  const openAdd = () => {
    setEditing(null)
    setCertFile(null)
    setCertPreview('')
    setFileType('')
    reset({ title: '', issuer: '', date: '', credentialUrl: '', skills: '' })
    setShowForm(true)
  }

  const openEdit = (c: Certificate) => {
    setEditing(c)
    setCertPreview(c.image || '')
    setCertFile(null)
    setFileType(isPdf(c.image) ? 'pdf' : c.image ? 'image' : '')
    setValue('title', c.title)
    setValue('issuer', c.issuer)
    setValue('date', c.date)
    setValue('credentialUrl', c.credentialUrl || '')
    setValue('skills', (c.skills || []).join(', '))
    setShowForm(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const isPDF = f.type === 'application/pdf'
    if (!f.type.startsWith('image/') && !isPDF) {
      toast('Please upload an image or PDF file.', 'error')
      return
    }
    setCertFile(f)
    setFileType(isPDF ? 'pdf' : 'image')
    if (!isPDF) {
      setCertPreview(URL.createObjectURL(f))
    } else {
      setCertPreview('pdf-selected')
    }
    toast(`"${f.name}" selected. Save to upload.`, 'success')
  }

  const onSubmit = async (data: CertForm) => {
    setSaving(true)
    try {
      let imageUrl = editing?.image || ''
      let savedFileType = editing?.fileType || 'image'

      if (certFile) {
        const ext = certFile.type === 'application/pdf' ? 'pdf' : certFile.name.split('.').pop()
        imageUrl = await uploadFile(`certificates/${Date.now()}-cert.${ext}`, certFile)
        savedFileType = certFile.type === 'application/pdf' ? 'pdf' : 'image'
      }

      const payload = {
        title: data.title,
        issuer: data.issuer,
        date: data.date,
        credentialUrl: data.credentialUrl,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        image: imageUrl,
        fileType: savedFileType,
      }

      if (editing) {
        await updateDocument('certificates', editing.id, payload)
        toast('Certificate updated!', 'success')
      } else {
        await addDocument('certificates', payload)
        toast('Certificate added!', 'success')
      }
      setShowForm(false)
      fetchCerts()
    } catch {
      toast('Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certificate?')) return
    try {
      await deleteDocument('certificates', id)
      toast('Deleted.', 'info')
      fetchCerts()
    } catch {
      toast('Failed to delete.', 'error')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.25rem' }}>Certificates</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload images or PDF certificates — both will preview on your portfolio.</p>
        </div>
        <button id="add-cert-btn" className="btn-primary" onClick={openAdd}><FiPlus /> Add Certificate</button>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{editing ? 'Edit Certificate' : 'Add Certificate'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}><FiX /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* ── Certificate Image or PDF Upload ── */}
              <div className="form-group">
                <label className="form-label">Certificate Image or PDF</label>

                {/* Preview area */}
                {certPreview && certPreview !== 'pdf-selected' && fileType === 'image' && (
                  <img src={certPreview} alt="preview"
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.75rem', border: '1px solid var(--border)' }} />
                )}
                {(certPreview === 'pdf-selected' || (certPreview && fileType === 'pdf')) && (
                  <div style={{
                    width: '100%', height: '80px', borderRadius: '10px', marginBottom: '0.75rem',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  }}>
                    <FiFileText style={{ color: '#ef4444', fontSize: '1.6rem' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.88rem' }}>PDF Certificate</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {certFile ? certFile.name : 'Currently uploaded'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload button */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label htmlFor="cert-file" className="btn-secondary" style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                    <FiUpload /> {certPreview ? 'Change File' : 'Upload Certificate'}
                  </label>
                  <input
                    id="cert-file"
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    Accepts: JPG, PNG, WEBP, PDF
                  </span>
                </div>
              </div>

              {/* Fields */}
              <div className="form-group">
                <label className="form-label" htmlFor="cert-title">Certificate Title *</label>
                <input id="cert-title" className="form-input" placeholder="React Developer Certification"
                  {...register('title', { required: 'Title required' })} />
                {errors.title && <span className="error-text">{errors.title.message}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cert-issuer">Issuer *</label>
                  <input id="cert-issuer" className="form-input" placeholder="Meta / Google / Coursera"
                    {...register('issuer', { required: 'Issuer required' })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cert-date">Date *</label>
                  <input id="cert-date" className="form-input" placeholder="2024"
                    {...register('date', { required: 'Date required' })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cert-url">Credential URL (optional)</label>
                <input id="cert-url" className="form-input" placeholder="https://..."
                  {...register('credentialUrl')} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cert-skills">Skills (comma-separated)</label>
                <input id="cert-skills" className="form-input" placeholder="React, JavaScript, Node"
                  {...register('skills')} />
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

      {/* Certificate List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {certs.map(c => (
            <div key={c.id} className="card">
              {/* Thumbnail preview */}
              {c.image && (
                <div style={{ marginBottom: '0.75rem', borderRadius: '10px', overflow: 'hidden', height: '100px', background: 'var(--bg-tertiary)' }}>
                  {isPdf(c.image) ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px' }}>
                      <FiFileText style={{ color: '#ef4444', fontSize: '1.5rem' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#ef4444' }}>PDF Certificate</div>
                        <a href={c.image} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: 'var(--accent)' }}>View PDF ↗</a>
                      </div>
                    </div>
                  ) : (
                    <img src={c.image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                {!c.image && (
                  <div style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '1.2rem', flexShrink: 0 }}>
                    <FiAward />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.issuer} · {c.date}</p>
                </div>
                {c.credentialUrl && (
                  <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}><FiExternalLink /></a>
                )}
              </div>

              {c.skills && c.skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                  {c.skills.map(s => <span key={s} className="tag" style={{ fontSize: '0.7rem' }}>{s}</span>)}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => openEdit(c)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '0.4rem', fontSize: '0.82rem' }}>
                  <FiEdit2 /> Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="btn-danger" style={{ padding: '0.4rem 0.75rem' }}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
          {certs.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
              No certificates yet. Click "Add Certificate" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminCertificates
