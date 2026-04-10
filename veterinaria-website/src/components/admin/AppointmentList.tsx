import { useState, useEffect, useCallback } from 'react'
import { FaChevronLeft, FaCheck, FaTimes, FaFlag } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import type { WebBooking } from '../../lib/types'

interface Props {
  date: string
  onBack: () => void
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
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function AppointmentList({ date, onBack }: Props) {
  const [bookings, setBookings] = useState<WebBooking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    const { data } = await supabase
      .from('web_bookings')
      .select('*')
      .eq('booking_date', date)
      .order('booking_time')

    if (data) setBookings(data as WebBooking[])
    setLoading(false)
  }, [date])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  async function updateStatus(id: number, status: string) {
    await supabase.from('web_bookings').update({ status }).eq('id', id)
    fetchBookings()
  }

  const dateObj = new Date(date + 'T00:00:00')
  const formattedDate = dateObj.toLocaleDateString('es-PA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      <button onClick={onBack} className="text-primary font-medium mb-4 flex items-center gap-1 hover:underline cursor-pointer">
        <FaChevronLeft className="text-xs" /> Volver al calendario
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-1 capitalize">{formattedDate}</h2>
      <p className="text-gray-500 text-sm mb-6">{bookings.filter(b => b.status !== 'cancelled').length} cita(s)</p>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
          No hay citas para este día
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(bk => (
            <div key={bk.id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-gray-800">{formatTime(bk.booking_time)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[bk.status]}`}>
                    {statusLabels[bk.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>{serviceLabels[bk.service] || bk.service}</strong> — {bk.pet_name} ({bk.pet_type})
                </p>
                <p className="text-sm text-gray-500">
                  {bk.owner_name} · {bk.owner_phone}
                  {bk.owner_email && ` · ${bk.owner_email}`}
                </p>
                {bk.notes && <p className="text-sm text-gray-400 mt-1">📝 {bk.notes}</p>}
              </div>

              {bk.status !== 'cancelled' && bk.status !== 'completed' && (
                <div className="flex gap-2 shrink-0">
                  {bk.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(bk.id, 'confirmed')}
                      className="flex items-center gap-1 text-sm bg-green-50 text-green-600 font-bold px-3 py-2 rounded-xl hover:bg-green-100 transition-colors cursor-pointer"
                    >
                      <FaCheck /> Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(bk.id, 'completed')}
                    className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 font-bold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <FaFlag /> Completar
                  </button>
                  <button
                    onClick={() => updateStatus(bk.id, 'cancelled')}
                    className="flex items-center gap-1 text-sm bg-red-50 text-red-600 font-bold px-3 py-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    <FaTimes /> Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
