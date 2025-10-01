import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { AdminAuthProvider } from './hooks/useAdminAuth'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import RoleSelection from './pages/RoleSelection'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminSignIn from './pages/AdminSignIn'
import SmartRedirect from './pages/SmartRedirect'
import AcademyDashboard from './pages/AcademyDashboard'
import ChessClasses from './pages/ChessClasses'
import ArtsClasses from './pages/ArtsClasses'
import KarateClasses from './pages/KarateClasses'
import DanceMusicClasses from './pages/DanceMusicClasses'

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/academy" element={<AcademyDashboard />} />
            <Route path="/admin/signin" element={<AdminSignIn />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/smart-redirect" element={<SmartRedirect />} />
            <Route path="/chess-classes" element={<ChessClasses />} />
            <Route path="/arts-classes" element={<ArtsClasses />} />
            <Route path="/karate-classes" element={<KarateClasses />} />
            <Route path="/dance-music-classes" element={<DanceMusicClasses />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App
