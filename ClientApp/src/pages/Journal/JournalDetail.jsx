import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function JournalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/journal/${id}`).then(r => setEntry(r.data)).catch(() => navigate('/journal')).finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/journal/${id}`)
    navigate('/journal')
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
  if (!entry) return null

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-1"></i>Back
          </button>
          <div className="d-flex gap-2">
            <Link to={`/journal/${id}/edit`} className="btn btn-sm btn-outline-primary"><i className="bi bi-pencil me-1"></i>Edit</Link>
            <button onClick={handleDelete} className="btn btn-sm btn-outline-danger"><i className="bi bi-trash me-1"></i>Delete</button>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="mb-3 text-muted small">
            <i className="bi bi-calendar3 me-1"></i>
            {new Date(entry.entryDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {entry.isPrivate && <span className="ms-3"><i className="bi bi-lock-fill me-1"></i>Private</span>}
          </div>
          <h1 className="fw-bold mb-4">{entry.title}</h1>
          <div className="journal-content">{entry.content}</div>
          {entry.tags && (
            <div className="mt-4 pt-3 border-top">
              {entry.tags.split(',').map(t => (
                <Link key={t} to={`/journal?tag=${t.trim()}`} className="badge bg-primary bg-opacity-10 text-primary text-decoration-none me-1 mb-1">
                  {t.trim()}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
