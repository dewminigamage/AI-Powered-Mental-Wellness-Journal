import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <NavLink className="navbar-brand fw-bold" to="/">
            <i className="bi bi-heart-pulse-fill me-2"></i>MindWell Journal
          </NavLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMain">
            {user ? (
              <>
                <ul className="navbar-nav me-auto">
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/dashboard">
                      <i className="bi bi-speedometer2 me-1"></i>Dashboard
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/mood/log">
                      <i className="bi bi-emoji-smile me-1"></i>Log Mood
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/journal">
                      <i className="bi bi-journal-text me-1"></i>Journal
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/habits">
                      <i className="bi bi-check2-circle me-1"></i>Habits
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/mood/history">
                      <i className="bi bi-graph-up me-1"></i>Progress
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/reminders">
                      <i className="bi bi-bell me-1"></i>Reminders
                    </NavLink>
                  </li>
                  {isAdmin && (
                    <li className="nav-item">
                      <NavLink className="nav-link" to="/admin">
                        <i className="bi bi-shield-check me-1"></i>Admin
                      </NavLink>
                    </li>
                  )}
                </ul>
                <ul className="navbar-nav">
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                      <i className="bi bi-person-circle me-1"></i>
                      {user.fullName?.split(' ')[0]}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <span className="dropdown-item-text small text-muted">{user.email}</span>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <NavLink className="dropdown-item" to="/profile">
                          <i className="bi bi-person me-2"></i>My Profile
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item" to="/reminders">
                          <i className="bi bi-bell me-2"></i>Reminders
                        </NavLink>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"></i>Logout
                        </button>
                      </li>
                    </ul>
                  </li>
                </ul>
              </>
            ) : (
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="btn btn-light btn-sm ms-2" to="/register">Get Started</NavLink>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>

      <main className="py-4">
        <div className="container page-enter">
          <Outlet />
        </div>
      </main>

      <footer className="bg-light border-top py-3 mt-5">
        <div className="container text-center text-muted small">
          <i className="bi bi-heart-fill text-danger me-1"></i>
          MindWell Journal — Supporting student mental wellness
        </div>
      </footer>
    </>
  )
}
