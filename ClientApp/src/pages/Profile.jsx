import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Profile() {
  const { user, login } = useAuth()
  const [activeTab, setActiveTab] = useState('info')

  // Profile info form
  const [info, setInfo] = useState({
    fullName: user?.fullName || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '',
  })
  const [infoMsg, setInfoMsg] = useState(null) // { type, text }
  const [infoLoading, setInfoLoading] = useState(false)

  // Password form
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwdMsg, setPwdMsg] = useState(null)
  const [pwdLoading, setPwdLoading] = useState(false)

  const handleInfoSubmit = async e => {
    e.preventDefault(); setInfoLoading(true); setInfoMsg(null)
    try {
      const { data } = await api.put('/auth/profile', info)
      // Update stored user with new token
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setInfoMsg({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      const errs = err.response?.data?.errors
      setInfoMsg({ type: 'danger', text: Array.isArray(errs) ? errs.join(' ') : 'Failed to update profile.' })
    } finally { setInfoLoading(false) }
  }

  const handlePwdSubmit = async e => {
    e.preventDefault()
    if (pwd.newPassword !== pwd.confirmPassword) { setPwdMsg({ type: 'danger', text: 'Passwords do not match.' }); return }
    setPwdLoading(true); setPwdMsg(null)
    try {
      const { data } = await api.put('/auth/change-password', pwd)
      setPwdMsg({ type: 'success', text: data.message })
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const errs = err.response?.data?.errors
      setPwdMsg({ type: 'danger', text: Array.isArray(errs) ? errs.join(' ') : err.response?.data?.message || 'Failed to change password.' })
    } finally { setPwdLoading(false) }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        {/* Avatar header */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <div className="d-flex align-items-center gap-4">
            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
              <i className="bi bi-person-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0">{user?.fullName}</h4>
              <p className="text-muted mb-0">{user?.email}</p>
              <div className="mt-1">
                {user?.roles?.map(r => (
                  <span key={r} className="badge bg-primary bg-opacity-10 text-primary me-1">{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-pills mb-4">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
              <i className="bi bi-person me-2"></i>Profile Info
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
              <i className="bi bi-lock me-2"></i>Change Password
            </button>
          </li>
        </ul>

        {/* Profile Info Tab */}
        {activeTab === 'info' && (
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-4">Edit Profile</h5>
            {infoMsg && (
              <div className={`alert alert-${infoMsg.type} alert-dismissible`}>
                <i className={`bi ${infoMsg.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                {infoMsg.text}
                <button type="button" className="btn-close" onClick={() => setInfoMsg(null)}></button>
              </div>
            )}
            <form onSubmit={handleInfoSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input className="form-control" value={info.fullName}
                  onChange={e => setInfo({ ...info, fullName: e.target.value })} required />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Student ID</label>
                  <input className="form-control" value={info.studentId}
                    onChange={e => setInfo({ ...info, studentId: e.target.value })} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Department</label>
                  <input className="form-control" value={info.department}
                    onChange={e => setInfo({ ...info, department: e.target.value })} />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Date of Birth</label>
                <input type="date" className="form-control" value={info.dateOfBirth}
                  onChange={e => setInfo({ ...info, dateOfBirth: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={infoLoading}>
                {infoLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-floppy me-2"></i>}
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold mb-4">Change Password</h5>
            {pwdMsg && (
              <div className={`alert alert-${pwdMsg.type} alert-dismissible`}>
                <i className={`bi ${pwdMsg.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                {pwdMsg.text}
                <button type="button" className="btn-close" onClick={() => setPwdMsg(null)}></button>
              </div>
            )}
            <form onSubmit={handlePwdSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Current Password</label>
                <input type="password" className="form-control" value={pwd.currentPassword}
                  onChange={e => setPwd({ ...pwd, currentPassword: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <input type="password" className="form-control" placeholder="Min. 6 characters" value={pwd.newPassword}
                  onChange={e => setPwd({ ...pwd, newPassword: e.target.value })} required minLength={6} />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Confirm New Password</label>
                <input type="password" className="form-control" value={pwd.confirmPassword}
                  onChange={e => setPwd({ ...pwd, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={pwdLoading}>
                {pwdLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-lock me-2"></i>}
                Change Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
