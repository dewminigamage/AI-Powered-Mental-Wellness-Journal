import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/client'

export default function JournalList() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [tag, setTag] = useState(searchParams.get('tag') || '')

  const fetchEntries = async () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (tag) params.tag = tag
    const { data } = await api.get('/journal', { params })
    setEntries(data)
    setLoading(false)
  }

  useEffect(() => { fetchEntries() }, [searchParams])

  const handleSearch = e => {
    e.preventDefault()
    setSearchParams({ ...(search && { search }), ...(tag && { tag }) })
  }

  const handleDelete = async id => {
    if (!confirm('Delete this entry?')) return
    await api.delete(`/journal/${id}`)
    setEntries(entries.filter(e => e.id !== id))
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">My Journal</h2>
          <p className="text-muted">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <Link to="/journal/create" className="btn btn-primary"><i className="bi bi-plus-circle me-2"></i>New Entry</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-2 align-items-end">
            <div className="col-md-8">
              <input className="form-control" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="col-md-2">
              <input className="form-control" placeholder="Filter by tag" value={tag} onChange={e => setTag(e.target.value)} />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-outline-primary w-100">Search</button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : entries.length > 0 ? (
        <div className="row g-3">
          {entries.map(e => (
            <div key={e.id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <Link to={`/journal/${e.id}`} className="h5 fw-bold text-decoration-none text-dark d-block mb-1">{e.title}</Link>
                      <div className="text-muted small mb-2">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(e.entryDate).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                        {e.isPrivate && <span className="ms-2"><i className="bi bi-lock-fill"></i> Private</span>}
                      </div>
                      <p className="text-muted mb-2">{e.preview}</p>
                      {e.tags && e.tags.split(',').map(t => (
                        <button key={t} onClick={() => { setTag(t.trim()); setSearchParams({ tag: t.trim() }) }}
                          className="badge bg-primary bg-opacity-10 text-primary border-0 me-1">
                          {t.trim()}
                        </button>
                      ))}
                    </div>
                    <div className="ms-3 d-flex gap-2">
                      <Link to={`/journal/${e.id}/edit`} className="btn btn-sm btn-outline-secondary"><i className="bi bi-pencil"></i></Link>
                      <button onClick={() => handleDelete(e.id)} className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-journal-x text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3">No journal entries found</h4>
          <Link to="/journal/create" className="btn btn-primary mt-2">Write Your First Entry</Link>
        </div>
      )}
    </>
  )
}
