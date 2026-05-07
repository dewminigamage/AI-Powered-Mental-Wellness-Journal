import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

const PRESET_HABITS = ['Exercise / Workout', 'Meditation', 'Reading', 'Healthy Eating', 'Adequate Sleep (7-9 hrs)', 'Hydration (8 glasses)', 'Social Interaction', 'Study / Learning', 'Journaling', 'Screen-free Time']

export default function HabitLog() {
  const [form, setForm] = useState({ habitName: '', completed: false, durationMinutes: '', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.habitName) { setError('Please enter a habit name.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/habit', { ...form, durationMinutes: form.durationMinutes ? +form.durationMinutes : null })
      navigate('/habits')
    } catch { setError('Failed to save habit.') }
    finally { setLoading(false) }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h3 className="fw-bold mb-1"><i className="bi bi-check2-circle text-success me-2"></i>Log a Habit</h3>
          <p className="text-muted mb-4">Track what you did today</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Habit</label>
              <select className="form-select mb-2" onChange={e => e.target.value && setForm({ ...form, habitName: e.target.value })}>
                <option value="">— Select a preset habit —</option>
                {PRESET_HABITS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <input className="form-control" placeholder="Or type a custom habit..." value={form.habitName}
                onChange={e => setForm({ ...form, habitName: e.target.value })} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Did you complete it?</label>
              <div className="d-flex gap-4">
                <div className="form-check">
                  <input type="radio" className="form-check-input" id="yes" checked={form.completed} onChange={() => setForm({ ...form, completed: true })} />
                  <label className="form-check-label" htmlFor="yes"><i className="bi bi-check-circle-fill text-success me-1"></i>Yes, completed!</label>
                </div>
                <div className="form-check">
                  <input type="radio" className="form-check-input" id="no" checked={!form.completed} onChange={() => setForm({ ...form, completed: false })} />
                  <label className="form-check-label" htmlFor="no"><i className="bi bi-x-circle text-muted me-1"></i>Not yet</label>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Duration (minutes) <span className="text-muted fw-normal">(optional)</span></label>
              <input type="number" className="form-control" min="1" max="1440" placeholder="e.g. 30"
                value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Notes <span className="text-muted fw-normal">(optional)</span></label>
              <textarea className="form-control" rows="2" placeholder="How did it go?"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-success flex-fill py-2 fw-semibold" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle me-2"></i>}Save Habit
              </button>
              <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
