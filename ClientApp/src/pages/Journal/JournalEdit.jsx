import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function JournalEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '', tags: '', isPrivate: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = f => e => setForm({ ...form, [f]: f === 'isPrivate' ? e.target.checked : e.target.value })

  useEffect(() => {
    api.get(`/journal/${id}`).then(r => setForm({ title: r.data.title, content: r.data.content, tags: r.data.tags || '', isPrivate: r.data.isPrivate }))
      .catch(() => navigate('/journal')).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try { await api.put(`/journal/${id}`, form); navigate(`/journal/${id}`) }
    catch { setError('Failed to update entry.') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h3 className="fw-bold mb-4"><i className="bi bi-pencil-square text-primary me-2"></i>Edit Entry</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Title</label>
              <input className="form-control form-control-lg" value={form.title} onChange={set('title')} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Content</label>
              <textarea className="form-control" rows={12} value={form.content} onChange={set('content')} required />
            </div>
            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label fw-semibold">Tags</label>
                <input className="form-control" value={form.tags} onChange={set('tags')} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Privacy</label>
                <div className="form-check mt-2">
                  <input type="checkbox" className="form-check-input" id="isPrivate" checked={form.isPrivate} onChange={set('isPrivate')} />
                  <label className="form-check-label" htmlFor="isPrivate">Keep private</label>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-fill py-2 fw-semibold" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-floppy me-2"></i>}Save Changes
              </button>
              <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
