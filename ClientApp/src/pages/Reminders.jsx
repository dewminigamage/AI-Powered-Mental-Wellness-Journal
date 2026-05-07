import { useState, useEffect } from 'react'
import api from '../api/client'

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const emptyForm = { title: '', message: '', reminderTime: '08:00', daysOfWeek: 'Mon,Tue,Wed,Thu,Fri' }

function ReminderForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleDay = day => {
    const days = form.daysOfWeek ? form.daysOfWeek.split(',').filter(Boolean) : []
    const next = days.includes(day) ? days.filter(d => d !== day) : [...days, day]
    setForm({ ...form, daysOfWeek: next.join(',') })
  }

  const selectedDays = form.daysOfWeek ? form.daysOfWeek.split(',').filter(Boolean) : []

  const handleSubmit = async e => {
    e.preventDefault()
    if (!selectedDays.length) { setError('Select at least one day.'); return }
    setSaving(true); setError('')
    try { await onSave(form) }
    catch (err) { setError(err.response?.data?.message || 'Failed to save reminder.') }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <div className="mb-3">
        <label className="form-label fw-semibold">Title</label>
        <input className="form-control" placeholder="e.g. Morning Meditation" value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })} required />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Message</label>
        <textarea className="form-control" rows={2} placeholder="Reminder message..."
          value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Time</label>
        <input type="time" className="form-control" value={form.reminderTime}
          onChange={e => setForm({ ...form, reminderTime: e.target.value })} required />
      </div>
      <div className="mb-4">
        <label className="form-label fw-semibold">Repeat on</label>
        <div className="d-flex gap-2 flex-wrap">
          {ALL_DAYS.map(day => (
            <button key={day} type="button"
              className={`btn btn-sm ${selectedDays.includes(day) ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => toggleDay(day)}>
              {day}
            </button>
          ))}
        </div>
      </div>
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary flex-fill" disabled={saving}>
          {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-floppy me-2"></i>}
          Save Reminder
        </button>
        <button type="button" className="btn btn-outline-secondary px-4" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // reminder object being edited

  const load = () => api.get('/reminder').then(r => setReminders(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleCreate = async form => {
    const { data } = await api.post('/reminder', form)
    setReminders([...reminders, data])
    setShowForm(false)
  }

  const handleEdit = async form => {
    const { data } = await api.put(`/reminder/${editing.id}`, form)
    setReminders(reminders.map(r => r.id === editing.id ? { ...r, ...data } : r))
    setEditing(null)
  }

  const handleToggle = async id => {
    const { data } = await api.patch(`/reminder/${id}/toggle`)
    setReminders(reminders.map(r => r.id === id ? { ...r, isActive: data.isActive } : r))
  }

  const handleDelete = async id => {
    if (!confirm('Delete this reminder?')) return
    await api.delete(`/reminder/${id}`)
    setReminders(reminders.filter(r => r.id !== id))
  }

  const formatTime = t => {
    if (!t) return ''
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0"><i className="bi bi-bell text-primary me-2"></i>Wellness Reminders</h2>
          <p className="text-muted">Set daily reminders to support your wellbeing</p>
        </div>
        {!showForm && !editing && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-circle me-2"></i>New Reminder
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 border-start border-primary border-3">
          <h5 className="fw-bold mb-3">New Reminder</h5>
          <ReminderForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Reminders list */}
      {reminders.length > 0 ? (
        <div className="row g-3">
          {reminders.map(r => (
            <div key={r.id} className="col-md-6">
              {editing?.id === r.id ? (
                <div className="card border-0 shadow-sm rounded-4 p-4 border-start border-warning border-3">
                  <h5 className="fw-bold mb-3">Edit Reminder</h5>
                  <ReminderForm
                    initial={{ title: r.title, message: r.message, reminderTime: r.reminderTime?.substring(0, 5) || '08:00', daysOfWeek: r.daysOfWeek }}
                    onSave={handleEdit}
                    onCancel={() => setEditing(null)}
                  />
                </div>
              ) : (
                <div className={`card border-0 shadow-sm rounded-4 p-3 h-100 ${!r.isActive ? 'opacity-50' : ''}`}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className={`rounded-circle p-2 ${r.isActive ? 'bg-primary bg-opacity-10' : 'bg-secondary bg-opacity-10'}`}>
                        <i className={`bi bi-bell${r.isActive ? '-fill' : ''} ${r.isActive ? 'text-primary' : 'text-muted'}`}></i>
                      </div>
                      <div>
                        <div className="fw-semibold">{r.title}</div>
                        <div className="text-muted small"><i className="bi bi-clock me-1"></i>{formatTime(r.reminderTime)}</div>
                      </div>
                    </div>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" checked={r.isActive} onChange={() => handleToggle(r.id)} />
                    </div>
                  </div>

                  <p className="text-muted small mb-2">{r.message}</p>

                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {ALL_DAYS.map(day => (
                      <span key={day} className={`badge ${r.daysOfWeek?.includes(day) ? 'bg-primary bg-opacity-10 text-primary' : 'bg-light text-muted'}`}>
                        {day}
                      </span>
                    ))}
                  </div>

                  <div className="d-flex gap-2 mt-auto">
                    <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => { setShowForm(false); setEditing(r) }}>
                      <i className="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !showForm && (
        <div className="text-center py-5">
          <i className="bi bi-bell-slash text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3">No reminders yet</h4>
          <p className="text-muted">Set daily reminders to keep your wellness routine on track.</p>
          <button className="btn btn-primary mt-2" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-circle me-2"></i>Create Your First Reminder
          </button>
        </div>
      )}
    </>
  )
}
