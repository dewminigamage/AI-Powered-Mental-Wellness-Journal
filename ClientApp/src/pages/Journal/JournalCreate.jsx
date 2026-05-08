import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function JournalCreate() {
  const [form, setForm] = useState({ title: '', content: '', tags: '', isPrivate: true })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const set = f => e => setForm({ ...form, [f]: f === 'isPrivate' ? e.target.checked : e.target.value })

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try { await api.post('/journal', form); navigate('/journal') }
    catch { setError('Failed to save entry.') }
    finally { setLoading(false) }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h3 className="fw-bold mb-1"><i className="bi bi-journal-plus text-success me-2"></i>New Journal Entry</h3>
          <p className="text-muted mb-4">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Title</label>
              <input className="form-control form-control-lg" placeholder="Give your entry a title..." value={form.title} onChange={set('title')} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Write your thoughts</label>
              <textarea className="form-control" rows={12} placeholder="What's on your mind today? Write freely..." value={form.content} onChange={set('content')} required />
            </div>
            <div className="row">
              <div className="col-md-8 mb-3">
                <label className="form-label fw-semibold">Tags <span className="text-muted fw-normal">(comma-separated)</span></label>
                <input className="form-control" placeholder="e.g. grateful, stressed, study" value={form.tags} onChange={set('tags')} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-semibold">Privacy</label>
                <div className="form-check mt-2">
                  <input type="checkbox" className="form-check-input" id="isPrivate" checked={form.isPrivate} onChange={set('isPrivate')} />
                  <label className="form-check-label" htmlFor="isPrivate">Keep this private</label>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success flex-fill py-2 fw-semibold" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-floppy me-2"></i>}Save Entry
              </button>
              <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
