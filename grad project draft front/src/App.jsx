import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import LandingPage from './pages/LandingPage'
import ComplianceCheck from './pages/ComplianceCheck'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Network from './pages/Network'
import Settings from './pages/Settings'
import Logs from './pages/Logs'

// Simple auth check
function RequireAuth({ children }) {
  const token = localStorage.getItem('vpn_token')
  if (!token) return <Navigate to="/auth" replace />
  return children
}

function App() {
  const isElectron = window.navigator.userAgent.toLowerCase().includes('electron')

  return (
    <Routes>
      <Route path="/" element={
        isElectron ? <Navigate to="/auth" replace /> : <Navigate to="/landing" replace />
      } />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />

      {/* Compliance Gate — must pass before entering the app */}
      <Route path="/compliance" element={
        <RequireAuth><ComplianceCheck /></RequireAuth>
      } />

      <Route path="/app" element={
        <RequireAuth><AppShell /></RequireAuth>
      }>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="network" element={<Network />} />
        <Route path="settings" element={<Settings />} />
        <Route path="logs" element={<Logs />} />
      </Route>
    </Routes>
  )
}

export default App
