import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  )
}
