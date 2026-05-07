import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import api from '../../api/client'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/dashboard'), api.get('/admin/trends')])
      .then(([d, t]) => { setData(d.data); setTrends(t.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
  if (!data) return null

  const trendChart = trends.length ? {
    labels: trends.map(t => t.date),
    datasets: [
      { label: 'Avg Mood', data: trends.map(t => t.avgMood), borderColor: '#0d6efd', tension: 0.4 },
      { label: 'Avg Stress', data: trends.map(t => t.avgStress), borderColor: '#ffc107', tension: 0.4, yAxisID: 'y2' },
    ]
  } : null

  const moodDist = Object.keys(data.moodDistribution).length ? {
    labels: Object.keys(data.moodDistribution),
    datasets: [{ data: Object.values(data.moodDistribution), backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#0d6efd'] }]
  } : null

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0"><i className="bi bi-shield-check text-primary me-2"></i>Admin Dashboard</h2>
          <p className="text-muted">Platform wellness overview</p>
        </div>
        <Link to="/admin/users" className="btn btn-outline-primary"><i className="bi bi-people me-2"></i>Manage Users</Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Students', value: data.totalUsers, color: 'primary' },
          { label: 'Active This Week', value: data.activeUsersThisWeek, color: 'success' },
          { label: 'Avg Mood (7d)', value: data.platformAverageMood, color: 'info' },
          { label: 'Avg Stress (7d)', value: data.platformAverageStress, color: 'warning' },
        ].map(s => (
          <div key={s.label} className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
              <div className={`text-${s.color} fs-1 fw-bold`}>{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {trendChart && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-transparent border-0 pt-3 pb-0"><h5 className="fw-bold">Platform Mood Trends (30 days)</h5></div>
              <div className="card-body">
                <Line data={trendChart} options={{ responsive: true, scales: { y: { min: 1, max: 5, title: { display: true, text: 'Mood' } }, y2: { min: 1, max: 10, position: 'right', title: { display: true, text: 'Stress' }, grid: { drawOnChartArea: false } } } }} />
              </div>
            </div>
          )}
          {moodDist && (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-transparent border-0 pt-3 pb-0"><h5 className="fw-bold">Mood Distribution (This Week)</h5></div>
              <div className="card-body" style={{ maxHeight: 300 }}>
                <Doughnut data={moodDist} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-4">
          {data.highStressUsers.length > 0 && (
            <div className="card border-0 shadow-sm rounded-4 mb-4 border-start border-warning border-4">
              <div className="card-header bg-transparent border-0 pt-3 pb-0">
                <h5 className="fw-bold text-warning"><i className="bi bi-exclamation-triangle me-2"></i>High Stress Alert</h5>
              </div>
              <div className="card-body">
                <p className="text-muted small mb-3">Students reporting stress ≥ 8/10 this week:</p>
                {data.highStressUsers.map((u, i) => (
                  <div key={i} className="d-flex align-items-center gap-2 mb-2">
                    <i className="bi bi-person-fill text-muted"></i>
                    <span className="small">{u.name} ({u.department})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-transparent border-0 pt-3 pb-0"><h5 className="fw-bold">Recent Registrations</h5></div>
            <div className="card-body">
              {data.recentUsers.map(u => (
                <div key={u.id} className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2"><i className="bi bi-person text-primary"></i></div>
                  <div>
                    <div className="fw-semibold small">{u.fullName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.department} · {new Date(u.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
              ))}
              <Link to="/admin/users" className="btn btn-sm btn-outline-secondary w-100">View All Users</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
