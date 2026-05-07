import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <>
      {/* Hero */}
      <div className="row align-items-center py-5">
        <div className="col-lg-6">
          <h1 className="display-5 fw-bold text-primary mb-3">Your Mental Wellness Journey Starts Here</h1>
          <p className="lead text-muted mb-4">
            Track your mood, journal your thoughts, build healthy habits, and receive personalized wellness insights —
            all in one safe, private space designed for students.
          </p>
          <div className="d-flex gap-3 flex-wrap">
            <Link to="/register" className="btn btn-primary btn-lg px-4">
              <i className="bi bi-rocket-takeoff me-2"></i>Get Started Free
            </Link>
            <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
              <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
            </Link>
          </div>
        </div>
        <div className="col-lg-6 text-center mt-4 mt-lg-0">
          <div className="p-5 bg-primary bg-opacity-10 rounded-4">
            <i className="bi bi-heart-pulse-fill text-primary" style={{ fontSize: '8rem' }}></i>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="row g-4 py-4">
        <div className="col-12 text-center mb-2">
          <h2 className="fw-bold">Everything You Need for Mental Wellness</h2>
          <p className="text-muted">Simple tools that make a real difference in your daily life</p>
        </div>
        {[
          { icon: 'bi-emoji-smile', color: 'primary', title: 'Mood Tracking', desc: 'Log daily mood and stress levels. See patterns over time with visual charts.' },
          { icon: 'bi-journal-text', color: 'success', title: 'Personal Journal', desc: 'Write freely in your private digital journal. Organize with tags and search.' },
          { icon: 'bi-check2-circle', color: 'warning', title: 'Habit Tracking', desc: 'Build healthy routines. Track exercise, sleep, hydration, and more every day.' },
          { icon: 'bi-lightbulb', color: 'info', title: 'Smart Suggestions', desc: 'Receive personalized wellness tips based on your current mood and patterns.' },
          { icon: 'bi-graph-up-arrow', color: 'danger', title: 'Progress Reports', desc: 'Visualize your wellness journey with weekly and monthly trend charts.' },
          { icon: 'bi-shield-lock', color: 'secondary', title: 'Private & Secure', desc: 'Your data is yours. Journal entries are private by default with full encryption.' },
        ].map(f => (
          <div key={f.title} className="col-md-4">
            <div className="card border-0 shadow-sm h-100 text-center p-4 rounded-4">
              <div className={`text-${f.color} mb-3`}><i className={`bi ${f.icon}`} style={{ fontSize: '2.5rem' }}></i></div>
              <h5 className="fw-bold">{f.title}</h5>
              <p className="text-muted">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-primary text-white rounded-4 p-5 text-center my-4">
        <h3 className="fw-bold mb-2">Ready to take care of your mental health?</h3>
        <p className="mb-4 opacity-75">Join students already using MindWell Journal to build better habits and track their wellbeing.</p>
        <Link to="/register" className="btn btn-light btn-lg px-5">
          Start Your Journey <i className="bi bi-arrow-right ms-2"></i>
        </Link>
      </div>
    </>
  )
}
