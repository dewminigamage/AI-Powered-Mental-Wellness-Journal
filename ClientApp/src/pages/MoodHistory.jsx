import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import api from '../api/client'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const moodEmoji = m => ['', '😢', '😔', '😐', '😊', '😄'][m] || '😐'
const moodLabel = m => ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'][m] || ''

export default function MoodHistory() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/mood/history').then(r => setLogs(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  const ordered = [...logs].reverse()
  const chartData = ordered.length ? {
    labels: ordered.map(m => new Date(m.loggedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      { label: 'Mood (1-5)', data: ordered.map(m => m.mood), borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.1)', fill: true, tension: 0.4, yAxisID: 'y' },
      { label: 'Stress (1-10)', data: ordered.map(m => m.stressLevel), borderColor: '#ffc107', tension: 0.4, yAxisID: 'y2' },
      { label: 'Anxiety (1-10)', data: ordered.map(m => m.anxietyLevel), borderColor: '#dc3545', tension: 0.4, yAxisID: 'y2' },
    ]
  } : null

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Mood History & Progress</h2>
          <p className="text-muted">Your emotional journey over time</p>
        </div>
        <Link to="/mood/log" className="btn btn-primary"><i className="bi bi-plus-circle me-2"></i>Log Mood</Link>
      </div>

      {logs.length > 0 ? (
        <>
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body">
              <Line data={chartData} options={{
                responsive: true,
                scales: {
                  y: { min: 1, max: 5, title: { display: true, text: 'Mood Level' } },
                  y2: { min: 1, max: 10, position: 'right', title: { display: true, text: 'Stress / Anxiety' }, grid: { drawOnChartArea: false } }
                }
              }} />
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-3"><h5 className="fw-bold mb-0">All Logs</h5></div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr><th>Date</th><th>Mood</th><th>Stress</th><th>Anxiety</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="text-muted small">{new Date(log.loggedAt).toLocaleString('en', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{moodEmoji(log.mood)} {moodLabel(log.mood)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress" style={{ height: 6, width: 80 }}>
                            <div className="progress-bar bg-warning" style={{ width: `${log.stressLevel * 10}%` }}></div>
                          </div>
                          <span className="small">{log.stressLevel}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress" style={{ height: 6, width: 80 }}>
                            <div className="progress-bar bg-danger" style={{ width: `${log.anxietyLevel * 10}%` }}></div>
                          </div>
                          <span className="small">{log.anxietyLevel}</span>
                        </div>
                      </td>
                      <td className="text-muted small">{log.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-graph-up text-muted" style={{ fontSize: '4rem' }}></i>
          <h4 className="mt-3">No mood logs yet</h4>
          <p className="text-muted">Start tracking your mood to see your progress over time.</p>
          <Link to="/mood/log" className="btn btn-primary">Log Your First Mood</Link>
        </div>
      )}
    </>
  )
}
