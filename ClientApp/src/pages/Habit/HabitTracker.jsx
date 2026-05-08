import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'

export default function HabitTracker() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/habit').then(r => setHabits(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  const completed = habits.filter(h => h.completed).length
  const pct = habits.length ? Math.round(completed * 100 / habits.length) : 0

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Today's Habits</h2>
          <p className="text-muted">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/habits/history" className="btn btn-outline-secondary"><i className="bi bi-clock-history me-2"></i>History</Link>
          <Link to="/habits/log" className="btn btn-primary"><i className="bi bi-plus-circle me-2"></i>Log Habit</Link>
        </div>
      </div>

      {habits.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 mb-4 p-3">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">Progress today</span>
            <span className="text-muted">{completed} / {habits.length} completed</span>
          </div>
          <div className="progress" style={{ height: 12 }}>
            <div className="progress-bar bg-success" style={{ width: `${pct}%` }}></div>
          </div>
        </div>
      )}

      {habits.length > 0 ? (
        <div className="row g-3">
          {habits.map(h => (
            <div key={h.id} className="col-md-6">
              <div className={`card border-0 shadow-sm rounded-4 p-3 h-100 ${h.completed ? 'border-start border-success border-3' : ''}`}>
                <div className="d-flex align-items-center gap-3">
                  <i className={`bi ${h.completed ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'} fs-3`}></i>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{h.habitName}</div>
                    {h.durationMinutes && <div className="text-muted small"><i className="bi bi-clock me-1"></i>{h.durationMinutes} minutes</div>}
                    {h.notes && <div className="text-muted small mt-1">{h.notes}</div>}
                  </div>
                  <span className={`badge ${h.completed ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                    {h.completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-check2-circle text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3">No habits logged today</h4>
          <Link to="/habits/log" className="btn btn-primary mt-2">Log a Habit</Link>
        </div>
      )}
    </>
  )
}
