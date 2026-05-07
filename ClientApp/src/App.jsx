import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MoodLog from './pages/MoodLog'
import MoodHistory from './pages/MoodHistory'
import JournalList from './pages/Journal/JournalList'
import JournalCreate from './pages/Journal/JournalCreate'
import JournalDetail from './pages/Journal/JournalDetail'
import JournalEdit from './pages/Journal/JournalEdit'
import HabitTracker from './pages/Habit/HabitTracker'
import HabitLog from './pages/Habit/HabitLog'
import HabitHistory from './pages/Habit/HabitHistory'
import Reminders from './pages/Reminders'
import Profile from './pages/Profile'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="mood/log" element={<MoodLog />} />
              <Route path="mood/history" element={<MoodHistory />} />
              <Route path="journal" element={<JournalList />} />
              <Route path="journal/create" element={<JournalCreate />} />
              <Route path="journal/:id" element={<JournalDetail />} />
              <Route path="journal/:id/edit" element={<JournalEdit />} />
              <Route path="habits" element={<HabitTracker />} />
              <Route path="habits/log" element={<HabitLog />} />
              <Route path="habits/history" element={<HabitHistory />} />
              <Route path="reminders" element={<Reminders />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsers />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
