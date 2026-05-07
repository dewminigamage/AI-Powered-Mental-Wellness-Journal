import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'

export default function HabitHistory() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/habit/history').then(r => setLogs(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  const grouped = logs.reduce((acc, h) => {
    const day = new Date(h.loggedAt).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    if (!acc[day]) acc[day] = []
    acc[day].push(h)
    return acc
  }, {})

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Habit History</h2>
          <p className="text-muted">All your logged habits</p>
        </div>
        <Link to="/habits/log" className="btn btn-primary"><i className="bi bi-plus-circle me-2"></i>Log Habit</Link>
      </div>

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([day, items]) => (
          <div key={day} className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
              <h6 className="fw-bold text-muted">{day}</h6>
            </div>
            <div className="card-body pt-2">
              {items.map((h, i) => (
                <div key={h.id} className={`d-flex align-items-center gap-3 mb-2 pb-2 ${i < items.length - 1 ? 'border-bottom' : ''}`}>
                  <i className={`bi ${h.completed ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-danger'} fs-5`}></i>
                  <span className="fw-semibold flex-grow-1">{h.habitName}</span>
                  {h.durationMinutes && <span className="text-muted small">{h.durationMinutes} min</span>}
                  {h.notes && <span className="text-muted small fst-italic">{h.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-calendar-x text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3">No habits logged yet</h4>
          <Link to="/habits/log" className="btn btn-primary mt-2">Log Your First Habit</Link>
        </div>
      )}
    </>
  )
}
