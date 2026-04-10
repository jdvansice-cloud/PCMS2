import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

interface Props {
  onSelectDate: (date: string) => void
}

interface DayCounts {
  [date: string]: { pending: number; confirmed: number; completed: number }
}

export default function AdminCalendar({ onSelectDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [counts, setCounts] = useState<DayCounts>({})

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

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  return (
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
  )
}
