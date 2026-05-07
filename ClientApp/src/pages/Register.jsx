import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '', studentId: '', department: '', dateOfBirth: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const set = field => e => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return }
    setError(''); setLoading(true)
    try {
      await register({ fullName: form.fullName, email: form.email, password: form.password, studentId: form.studentId, department: form.department, dateOfBirth: form.dateOfBirth })
      navigate('/dashboard')
    } catch (err) {
      const errs = err.response?.data?.errors
      setError(Array.isArray(errs) ? errs.join(' ') : 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-7">
        <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">
          <div className="text-center mb-4">
            <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '3rem' }}></i>
            <h2 className="fw-bold mt-2">Create Your Account</h2>
            <p className="text-muted">Start your mental wellness journey today</p>
          </div>

          {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Full Name</label>
                <input className="form-control" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Student ID</label>
                <input className="form-control" placeholder="e.g. S12345" value={form.studentId} onChange={set('studentId')} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Department</label>
                <input className="form-control" placeholder="e.g. Computer Science" value={form.department} onChange={set('department')} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" className="form-control" placeholder="you@university.edu" value={form.email} onChange={set('email')} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Date of Birth</label>
                <input type="date" className="form-control" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Password</label>
                <input type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Confirm Password</label>
                <input type="password" className="form-control" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mt-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-person-check me-2"></i>}
              Create Account
            </button>
          </form>

          <hr className="my-3" />
          <p className="text-center text-muted mb-0">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
