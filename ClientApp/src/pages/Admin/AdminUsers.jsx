import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const handleToggle = async userId => {
    const { data } = await api.post(`/admin/toggle-user/${userId}`)
    setUsers(users.map(u => u.id === userId ? { ...u, isActive: data.isActive } : u))
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Manage Users</h2>
          <p className="text-muted">{users.length} total user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/admin" className="btn btn-outline-secondary"><i className="bi bi-arrow-left me-2"></i>Back</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr><th>Name</th><th>Email</th><th>Student ID</th><th>Department</th><th>Joined</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="fw-semibold">{u.fullName}</td>
                  <td className="text-muted small">{u.email}</td>
                  <td className="text-muted small">{u.studentId || '—'}</td>
                  <td className="text-muted small">{u.department || '—'}</td>
                  <td className="text-muted small">{new Date(u.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>
                    <span className={`badge ${u.isActive ? 'bg-success bg-opacity-20 text-success' : 'bg-secondary bg-opacity-20 text-secondary'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => handleToggle(u.id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
