import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const MOODS = [
  { value: 1, label: 'Very Sad', emoji: '😢' },
  { value: 2, label: 'Sad', emoji: '😔' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Happy', emoji: '😊' },
  { value: 5, label: 'Very Happy', emoji: '😄' },
]

export default function MoodLog() {
  const [form, setForm] = useState({ mood: 0, stressLevel: 5, anxietyLevel: 5, notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.mood) { setError('Please select a mood.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/mood', form)
      navigate('/dashboard')
    } catch { setError('Failed to save mood. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h3 className="fw-bold mb-1"><i className="bi bi-emoji-smile text-primary me-2"></i>How are you feeling?</h3>
          <p className="text-muted mb-4">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Mood Selector */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Select your mood</label>
              <div className="d-flex justify-content-between gap-2">
                {MOODS.map(m => (
                  <div key={m.value} className="text-center flex-fill">
                    <input type="radio" className="btn-check" id={`mood_${m.value}`} name="mood"
                      checked={form.mood === m.value} onChange={() => setForm({ ...form, mood: m.value })} />
                    <label className={`btn btn-outline-primary w-100 py-3 ${form.mood === m.value ? 'active' : ''}`} htmlFor={`mood_${m.value}`}>
                      <div style={{ fontSize: '2rem' }}>{m.emoji}</div>
                      <div className="small">{m.label}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Stress */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Stress Level: <span className="text-primary">{form.stressLevel}</span>/10
              </label>
              <input type="range" className="form-range" min="1" max="10"
                value={form.stressLevel} onChange={e => setForm({ ...form, stressLevel: +e.target.value })} />
              <div className="d-flex justify-content-between text-muted small"><span>Very low</span><span>Very high</span></div>
            </div>

            {/* Anxiety */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Anxiety Level: <span className="text-danger">{form.anxietyLevel}</span>/10
              </label>
              <input type="range" className="form-range" min="1" max="10"
                value={form.anxietyLevel} onChange={e => setForm({ ...form, anxietyLevel: +e.target.value })} />
              <div className="d-flex justify-content-between text-muted small"><span>Very low</span><span>Very high</span></div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Notes <span className="text-muted fw-normal">(optional)</span></label>
              <textarea className="form-control" rows="3" placeholder="What's on your mind today?"
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-fill py-2 fw-semibold" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle me-2"></i>}
                Save Check-in
              </button>
              <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
