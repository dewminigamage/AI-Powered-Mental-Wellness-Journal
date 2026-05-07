import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const moodEmoji = m => ['', '😢', '😔', '😐', '😊', '😄'][m] || '😐'
const moodLabel = m => ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'][m] || 'Unknown'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
  if (!data) return null

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const firstName = user?.fullName?.split(' ')[0] || 'there'

  const chartData = data.recentMoods.length ? {
    labels: [...data.recentMoods].reverse().map(m => new Date(m.loggedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      { label: 'Mood (1-5)', data: [...data.recentMoods].reverse().map(m => m.mood), borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
      { label: 'Stress (1-10)', data: [...data.recentMoods].reverse().map(m => m.stressLevel), borderColor: '#ffc107', tension: 0.4, yAxisID: 'y2' },
    ]
  } : null

  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Good {greeting}, {firstName}! 👋</h2>
          <p className="text-muted">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/mood/log" className="btn btn-primary"><i className="bi bi-plus-circle me-2"></i>Log Mood</Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'bi-emoji-smile', color: 'primary', label: 'Avg Mood (7d)', value: data.averageMoodThisWeek > 0 ? data.averageMoodThisWeek.toFixed(1) : '—' },
          { icon: 'bi-activity', color: 'warning', label: 'Avg Stress (7d)', value: data.averageStressThisWeek > 0 ? data.averageStressThisWeek.toFixed(1) : '—' },
          { icon: 'bi-journal-check', color: 'success', label: 'Journal Streak', value: `${data.journalStreakDays} day${data.journalStreakDays !== 1 ? 's' : ''}` },
          { icon: 'bi-check2-all', color: 'info', label: 'Habits Today', value: `${data.habitsCompletedToday} done` },
        ].map(s => (
          <div key={s.label} className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
              <div className="d-flex align-items-center gap-3">
                <div className={`bg-${s.color} bg-opacity-10 rounded-3 p-3`}>
                  <i className={`bi ${s.icon} text-${s.color} fs-4`}></i>
                </div>
                <div>
                  <div className="text-muted small">{s.label}</div>
                  <div className="fw-bold fs-4">{s.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Today's mood */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-0 pt-3 pb-0"><h5 className="fw-bold">Today's Check-in</h5></div>
            <div className="card-body">
              {data.todayMood ? (
                <div className="d-flex align-items-center gap-4">
                  <div className="text-center">
                    <div style={{ fontSize: '3rem' }}>{moodEmoji(data.todayMood.mood)}</div>
                    <div className="text-muted small">{moodLabel(data.todayMood.mood)}</div>
                  </div>
                  <div className="flex-grow-1">
                    {[{ label: 'Stress', value: data.todayMood.stressLevel, color: 'warning' }, { label: 'Anxiety', value: data.todayMood.anxietyLevel, color: 'danger' }].map(b => (
                      <div key={b.label} className="mb-2">
                        <div className="d-flex justify-content-between small mb-1">
                          <span>{b.label} Level</span><span className="fw-bold">{b.value}/10</span>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                          <div className={`progress-bar bg-${b.color}`} style={{ width: `${b.value * 10}%` }}></div>
                        </div>
                      </div>
                    ))}
                    {data.todayMood.notes && <p className="text-muted small mt-2 mb-0"><i className="bi bi-chat-quote me-1"></i>{data.todayMood.notes}</p>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted mb-3">You haven't logged your mood today.</p>
                  <Link to="/mood/log" className="btn btn-primary"><i className="bi bi-emoji-smile me-2"></i>Log Now</Link>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          {chartData && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-transparent border-0 pt-3 pb-0"><h5 className="fw-bold">Mood This Week</h5></div>
              <div className="card-body">
                <Line data={chartData} options={{ responsive: true, scales: { y: { min: 1, max: 5, title: { display: true, text: 'Mood' } }, y2: { min: 1, max: 10, position: 'right', title: { display: true, text: 'Stress' }, grid: { drawOnChartArea: false } } } }} />
              </div>
            </div>
          )}

          {/* Journal */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Journal Entries</h5>
              <Link to="/journal/create" className="btn btn-sm btn-outline-primary"><i className="bi bi-plus me-1"></i>New</Link>
            </div>
            <div className="card-body">
              {data.recentEntries.length > 0 ? (
                <>
                  {data.recentEntries.map(e => (
                    <div key={e.id} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                      <div className="bg-success bg-opacity-10 rounded-3 p-2 d-flex align-items-center"><i className="bi bi-journal text-success"></i></div>
                      <div>
                        <Link to={`/journal/${e.id}`} className="fw-semibold text-decoration-none text-dark d-block">{e.title}</Link>
                        <div className="text-muted small">{new Date(e.entryDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        {e.tags && e.tags.split(',').map(t => <span key={t} className="badge bg-light text-muted me-1 mt-1">{t.trim()}</span>)}
                      </div>
                    </div>
                  ))}
                  <Link to="/journal" className="btn btn-sm btn-outline-secondary w-100">View All Entries</Link>
                </>
              ) : (
                <p className="text-muted text-center py-2">No entries yet. <Link to="/journal/create">Write your first!</Link></p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Tips */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-transparent border-0 pt-3 pb-0">
              <h5 className="fw-bold"><i className="bi bi-lightbulb-fill text-warning me-2"></i>Wellness Tips</h5>
            </div>
            <div className="card-body">
              {data.suggestedTips.length > 0 ? data.suggestedTips.map(t => (
                <div key={t.id} className="border rounded-3 p-3 mb-3">
                  <div className="fw-semibold mb-1">{t.title}</div>
                  <p className="text-muted small mb-0">{t.content}</p>
                  <span className="badge bg-primary bg-opacity-10 text-primary mt-2">{t.category}</span>
                </div>
              )) : <p className="text-muted small">Log your mood to get personalized tips!</p>}
            </div>
          </div>

          {/* Habits */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Today's Habits</h5>
              <Link to="/habits/log" className="btn btn-sm btn-outline-primary"><i className="bi bi-plus me-1"></i>Log</Link>
            </div>
            <div className="card-body">
              {data.todayHabits.length > 0 ? data.todayHabits.map(h => (
                <div key={h.id} className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${h.completed ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}></i>
                  <span className={!h.completed ? 'text-muted' : ''}>{h.habitName}</span>
                  {h.durationMinutes && <span className="ms-auto text-muted small">{h.durationMinutes} min</span>}
                </div>
              )) : <p className="text-muted small text-center py-2">No habits logged today.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
