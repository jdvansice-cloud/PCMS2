import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom'
import { Heart, LayoutDashboard, PawPrint, Calendar, FileText, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { TenantProvider, useTenant } from '../../context/TenantContext'

function PortalLayoutInner() {
  const { slug } = useParams()
  const { authUser, signOut } = useAuth()
  const { company } = useTenant()
  const navigate = useNavigate()
  const [mobileMenu, setMobileMenu] = useState(false)
  const base = `/portal/${slug}`

  const customerName = authUser?.customerProfile
    ? `${authUser.customerProfile.first_name} ${authUser.customerProfile.last_name || ''}`
    : 'Cliente'

  const navItems = [
    { to: `${base}/dashboard`, icon: <LayoutDashboard size={18} />, label: 'Inicio' },
    { to: `${base}/pets`, icon: <PawPrint size={18} />, label: 'Mis Mascotas' },
    { to: `${base}/appointments`, icon: <Calendar size={18} />, label: 'Mis Citas' },
    { to: `${base}/records`, icon: <FileText size={18} />, label: 'Historial' },
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate(`/portal/${slug}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-sm hidden sm:block">
              {company?.name || 'Mi Veterinaria'}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }>
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:block">{customerName}</span>
            <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400" title="Cerrar sesion">
              <LogOut size={18} />
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenu && (
          <nav className="md:hidden border-t border-slate-100 px-4 py-2 space-y-1 animate-slide-up">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} onClick={() => setMobileMenu(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-600'
                  }`
                }>
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export function PortalLayout() {
  return (
    <TenantProvider>
      <PortalLayoutInner />
    </TenantProvider>
  )
}
