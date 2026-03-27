import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Calendar,
  Stethoscope,
  Syringe,
  FlaskConical,
  Scissors,
  Hotel,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  ChevronLeft,
  Heart,
} from 'lucide-react'
import { useTenant } from '../../context/TenantContext'
import { useAuth } from '../../context/AuthContext'
import { hasFeature } from '../../lib/features'
import { getInitials } from '../../utils/formatters'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  feature?: string
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { slug, plan, company } = useTenant()
  const { authUser, signOut } = useAuth()
  const navigate = useNavigate()
  const base = `/app/${slug}`

  const navItems: NavItem[] = [
    { to: `${base}/dashboard`, icon: <LayoutDashboard size={20} />, label: 'Panel' },
    { to: `${base}/clients`, icon: <Users size={20} />, label: 'Clientes' },
    { to: `${base}/pets`, icon: <PawPrint size={20} />, label: 'Pacientes' },
    { to: `${base}/appointments`, icon: <Calendar size={20} />, label: 'Citas' },
    { to: `${base}/medical`, icon: <Stethoscope size={20} />, label: 'Consultas' },
    { to: `${base}/preventive`, icon: <Syringe size={20} />, label: 'Carnet', feature: 'preventive' },
    { to: `${base}/laboratory`, icon: <FlaskConical size={20} />, label: 'Laboratorio', feature: 'laboratory' },
    { to: `${base}/grooming`, icon: <Scissors size={20} />, label: 'Estetica', feature: 'grooming' },
    { to: `${base}/hospitalization`, icon: <Hotel size={20} />, label: 'Hospital', feature: 'hospitalization' },
    { to: `${base}/pos`, icon: <ShoppingCart size={20} />, label: 'Caja' },
    { to: `${base}/inventory`, icon: <Package size={20} />, label: 'Inventario' },
    { to: `${base}/reports`, icon: <BarChart3 size={20} />, label: 'Reportes', feature: 'reports' },
    { to: `${base}/users`, icon: <UserCog size={20} />, label: 'Usuarios' },
    { to: `${base}/settings`, icon: <Settings size={20} />, label: 'Ajustes' },
  ]

  const visibleItems = navItems.filter(
    (item) => !item.feature || hasFeature(plan, item.feature)
  )

  const handleSignOut = async () => {
    await signOut()
    navigate(`/login/${slug}`)
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 shrink-0">
        <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shrink-0">
          <Heart size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-display font-bold text-slate-900 text-sm truncate">
              {company?.name || 'PCMS'}
            </h1>
            <p className="text-[10px] text-slate-400 truncate">Gestion Veterinaria</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-transform ${
            collapsed ? 'rotate-180' : ''
          }`}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-3 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 p-3 shrink-0">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(authUser?.staffProfile?.full_name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {authUser?.staffProfile?.full_name || 'Usuario'}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">
                {authUser?.role === 'veterinarian' ? 'Veterinario' :
                 authUser?.role === 'admin' ? 'Administrador' :
                 authUser?.role === 'receptionist' ? 'Recepcionista' :
                 authUser?.role === 'groomer' ? 'Estilista' : authUser?.role}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              title="Cerrar sesion"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
