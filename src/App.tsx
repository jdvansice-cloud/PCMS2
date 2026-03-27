import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { FullPageSpinner } from './components/ui'
import { AppLayout } from './components/layout/AppLayout'
import { PortalLayout } from './components/layout/PortalLayout'
import { useAuth } from './context/AuthContext'

// Lazy-loaded pages
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ClientsPage = lazy(() => import('./pages/ClientsPage'))
const PetsPage = lazy(() => import('./pages/PetsPage'))
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'))
const MedicalRecordsPage = lazy(() => import('./pages/MedicalRecordsPage'))
const PreventiveCardPage = lazy(() => import('./pages/PreventiveCardPage'))
const LaboratoryPage = lazy(() => import('./pages/LaboratoryPage'))
const GroomingPage = lazy(() => import('./pages/GroomingPage'))
const HospitalizationPage = lazy(() => import('./pages/HospitalizationPage'))
const POSPage = lazy(() => import('./pages/POSPage'))
const InventoryPage = lazy(() => import('./pages/InventoryPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const PortalLogin = lazy(() => import('./pages/portal/PortalLogin'))
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'))
const PortalPets = lazy(() => import('./pages/portal/PortalPets'))
const PortalAppointments = lazy(() => import('./pages/portal/PortalAppointments'))
const PortalRecords = lazy(() => import('./pages/portal/PortalRecords'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authUser, loading } = useAuth()

  if (loading) return <FullPageSpinner text="Verificando sesion..." />
  // TODO: Re-enable auth guard once Supabase is connected
  // if (!authUser || authUser.role === 'customer') {
  //   return <Navigate to="/" replace />
  // }
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { authUser, loading } = useAuth()

  if (loading) return <FullPageSpinner text="Cargando..." />
  // If logged in as staff, redirect to dashboard
  // We don't auto-redirect because we don't know the slug
  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<FullPageSpinner text="Cargando..." />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <PublicRoute>
            <LandingRedirect />
          </PublicRoute>
        } />
        <Route path="/login/:slug" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={<OnboardingPage />} />
        <Route path="/admin" element={<AdminPage />} />

        {/* Staff app routes */}
        <Route path="/app/:slug" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="pets" element={<PetsPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="medical" element={<MedicalRecordsPage />} />
          <Route path="preventive" element={<PreventiveCardPage />} />
          <Route path="laboratory" element={<LaboratoryPage />} />
          <Route path="grooming" element={<GroomingPage />} />
          <Route path="hospitalization" element={<HospitalizationPage />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Portal routes */}
        <Route path="/portal/:slug" element={<PortalLogin />} />
        <Route path="/portal/:slug" element={<PortalLayout />}>
          <Route path="dashboard" element={<PortalDashboard />} />
          <Route path="pets" element={<PortalPets />} />
          <Route path="appointments" element={<PortalAppointments />} />
          <Route path="records" element={<PortalRecords />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function LandingRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white text-2xl">🏥</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">PCMS</h1>
        <p className="text-slate-500 mb-8">
          Sistema de Gestion de Clinicas Veterinarias
        </p>
        <div className="flex flex-col gap-3">
          <a href="/register"
            className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-semibold shadow-md inline-block">
            Registrar mi Clinica
          </a>
          <p className="text-sm text-slate-400">
            ¿Ya tienes cuenta? Accede en <code className="bg-slate-100 px-2 py-1 rounded">/login/tu-clinica</code>
          </p>
        </div>
      </div>
    </div>
  )
}
