import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight, FaPaw, FaUser, FaPhone } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import type { WebBooking } from '../../lib/types'

interface Props {
  onSelectDate: (date: string) => void
}

interface DayCounts {
  [date: string]: { pending: number; confirmed: number; completed: number }
}

const serviceLabels: Record<string, string> = {
  bath: 'Baño',
  bathCut: 'Baño y Corte',
  catBath: 'Baño de Gatos',
  vetConsult: 'Consulta Veterinaria',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function formatDateShort(dateStr: string) {
  const dateObj = new Date(dateStr + 'T00:00:00')
  return dateObj.toLocaleDateString('es-PA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminCalendar({ onSelectDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [counts, setCounts] = useState<DayCounts>({})
  const [upcoming, setUpcoming] = useState<WebBooking[]>([])
  const [loadingUpcoming, setLoadingUpcoming] = useState(true)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  useEffect(() => {
    async function fetchCounts() {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

      const { data } = await supabase
        .from('web_bookings')
        .select('booking_date, status')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .neq('status', 'cancelled')

      if (data) {
        const c: DayCounts = {}
        data.forEach(a => {
          if (!c[a.booking_date]) c[a.booking_date] = { pending: 0, confirmed: 0, completed: 0 }
          const status = a.status as 'pending' | 'confirmed' | 'completed'
          c[a.booking_date][status]++
        })
        setCounts(c)
      }
    }
    fetchCounts()
  }, [year, month, daysInMonth])

  // Fetch upcoming appointments (today + next 14 days)
  useEffect(() => {
    async function fetchUpcoming() {
      setLoadingUpcoming(true)
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const future = new Date(today)
      future.setDate(future.getDate() + 14)
      const futureStr = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`

      const { data } = await supabase
        .from('web_bookings')
        .select('*')
        .gte('booking_date', todayStr)
        .lte('booking_date', futureStr)
        .neq('status', 'cancelled')
        .neq('status', 'completed')
        .order('booking_date')
        .order('booking_time')

      if (data) setUpcoming(data as WebBooking[])
      setLoadingUpcoming(false)
    }
    fetchUpcoming()
  }, [])

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  // Group upcoming by date
  const groupedUpcoming: Record<string, WebBooking[]> = {}
  upcoming.forEach(bk => {
    if (!groupedUpcoming[bk.booking_date]) groupedUpcoming[bk.booking_date] = []
    groupedUpcoming[bk.booking_date].push(bk)
  })

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <FaChevronLeft className="text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(d => (
            <div key={d} className="text-center font-bold text-sm text-gray-400 py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const c = counts[dateStr]
            const total = c ? c.pending + c.confirmed + c.completed : 0
            const today = new Date()
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

            return (
              <button
                key={day}
                onClick={() => onSelectDate(dateStr)}
                className={`p-2 rounded-lg text-center hover:bg-gray-50 transition-colors cursor-pointer relative
                  ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <span className="text-sm font-medium text-gray-700">{day}</span>
                {total > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {c!.pending > 0 && <div className="w-2 h-2 rounded-full bg-yellow-400" title={`${c!.pending} pendientes`} />}
                    {c!.confirmed > 0 && <div className="w-2 h-2 rounded-full bg-green-500" title={`${c!.confirmed} confirmadas`} />}
                    {c!.completed > 0 && <div className="w-2 h-2 rounded-full bg-blue-400" title={`${c!.completed} completadas`} />}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex gap-4 mt-4 text-xs text-gray-500 justify-center">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Pendiente</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Confirmada</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Completada</span>
        </div>
      </div>

      {/* Upcoming appointments list */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Citas Próximas</h2>

        {loadingUpcoming ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : upcoming.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No hay citas próximas</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedUpcoming).map(([dateStr, bookings]) => (
              <div key={dateStr}>
                <button
                  onClick={() => onSelectDate(dateStr)}
                  className="text-sm font-bold text-primary mb-2 capitalize hover:underline cursor-pointer"
                >
                  {formatDateShort(dateStr)} — {bookings.length} cita(s)
                </button>
                <div className="space-y-2">
                  {bookings.map(bk => (
                    <div
                      key={bk.id}
                      onClick={() => onSelectDate(dateStr)}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="font-bold text-gray-800 text-sm w-20 shrink-0">
                          {bk.booking_time ? formatTime(bk.booking_time) : 'Sin hora'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColors[bk.status]}`}>
                          {statusLabels[bk.status]}
                        </span>
                        <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                          {serviceLabels[bk.service] || bk.service}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-0 sm:ml-auto shrink-0">
                        <span className="flex items-center gap-1">
                          <FaPaw className="text-primary text-xs" />
                          {bk.pet_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUser className="text-primary text-xs" />
                          {bk.owner_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaPhone className="text-primary text-xs" />
                          {bk.owner_phone}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
