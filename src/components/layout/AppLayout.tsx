import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TenantProvider } from '../../context/TenantContext'
import { Menu } from 'lucide-react'

function AppLayoutInner() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless open */}
      <div className={`hidden lg:block`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div className={`lg:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <main
        className={`transition-all duration-300 ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        }`}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-slate-200 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-slate-900 text-sm">PCMS</span>
        </div>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export function AppLayout() {
  return (
    <TenantProvider>
      <AppLayoutInner />
    </TenantProvider>
  )
}
