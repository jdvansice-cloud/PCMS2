import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { FaCalendarAlt, FaBan, FaUserMd, FaCut, FaTag, FaSignOutAlt } from 'react-icons/fa'
import AdminCalendar from './AdminCalendar'
import AppointmentList from './AppointmentList'
import BlockedDatesManager from './BlockedDatesManager'
import DrAvailabilityManager from './DrAvailabilityManager'
import GroomingSettingsManager from './GroomingSettingsManager'
import PromoManager from './PromoManager'

type Tab = 'calendar' | 'blocked' | 'drHours' | 'grooming' | 'promo'

interface Props {
  session: Session
}

export default function AdminLayout({ session }: Props) {
  const [tab, setTab] = useState<Tab>('calendar')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const tabs = [
    { key: 'calendar' as Tab, label: 'Citas', icon: FaCalendarAlt },
    { key: 'blocked' as Tab, label: 'Fechas Bloqueadas', icon: FaBan },
    { key: 'drHours' as Tab, label: 'Disponibilidad del Dr.', icon: FaUserMd },
    { key: 'grooming' as Tab, label: 'Peluquería', icon: FaCut },
    { key: 'promo' as Tab, label: 'Promoción', icon: FaTag },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-primary">Vida+ Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{session.user.email}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <FaSignOutAlt className="text-lg" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setSelectedDate(null) }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors cursor-pointer
                ${tab === key ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'calendar' && !selectedDate && (
          <AdminCalendar onSelectDate={setSelectedDate} />
        )}
        {tab === 'calendar' && selectedDate && (
          <AppointmentList date={selectedDate} onBack={() => setSelectedDate(null)} />
        )}
        {tab === 'blocked' && <BlockedDatesManager />}
        {tab === 'drHours' && <DrAvailabilityManager />}
        {tab === 'grooming' && <GroomingSettingsManager />}
        {tab === 'promo' && <PromoManager />}
      </div>
    </div>
  )
}
