import { useState, useEffect, useCallback } from 'react'
import { FaChevronLeft, FaCheck, FaTimes, FaFlag, FaPaw, FaUser, FaPhone, FaEnvelope, FaStickyNote, FaPlus, FaEdit } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import type { WebBooking } from '../../lib/types'
import AppointmentFormModal from './AppointmentFormModal'

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

const sizeLabels: Record<string, string> = {
  small: 'Pequeño',
  medium: 'Mediano',
  large: 'Grande',
  xl: 'XL',
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
  const [cancelId, setCancelId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editBooking, setEditBooking] = useState<WebBooking | null>(null)

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

  function openCreate() {
    setEditBooking(null)
    setShowForm(true)
  }

  function openEdit(bk: WebBooking) {
    setEditBooking(bk)
    setShowForm(true)
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

      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold text-gray-800 capitalize">{formattedDate}</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors cursor-pointer text-sm"
        >
          <FaPlus /> Nueva Cita
        </button>
      </div>
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
            <div key={bk.id} className="bg-white rounded-2xl shadow-sm p-5">
              {/* Header: time + status + actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-bold text-lg text-gray-800">{bk.booking_time ? formatTime(bk.booking_time) : 'Sin hora'}</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusColors[bk.status]}`}>
                    {statusLabels[bk.status]}
                  </span>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {serviceLabels[bk.service] || bk.service}
                  </span>
                </div>

                <div className="flex gap-2 shrink-0">
                  {/* Edit button — always visible */}
                  <button
                    onClick={() => openEdit(bk)}
                    className="flex items-center gap-1 text-sm bg-gray-50 text-gray-600 font-bold px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <FaEdit /> Editar
                  </button>

                  {bk.status !== 'cancelled' && bk.status !== 'completed' && (
                    <>
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
                        onClick={() => setCancelId(bk.id)}
                        className="flex items-center gap-1 text-sm bg-red-50 text-red-600 font-bold px-3 py-2 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <FaTimes /> Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <FaPaw className="text-primary text-xs flex-shrink-0" />
                  <span><strong>{bk.pet_name}</strong> ({bk.pet_type}){bk.pet_size && ` — ${sizeLabels[bk.pet_size] || bk.pet_size}`}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaUser className="text-primary text-xs flex-shrink-0" />
                  <span>{bk.owner_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <FaPhone className="text-primary text-xs flex-shrink-0" />
                  <a href={`tel:${bk.owner_phone}`} className="hover:underline">{bk.owner_phone}</a>
                </div>
                {bk.owner_email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FaEnvelope className="text-primary text-xs flex-shrink-0" />
                    <a href={`mailto:${bk.owner_email}`} className="hover:underline">{bk.owner_email}</a>
                  </div>
                )}
                {bk.notes && (
                  <div className="flex items-start gap-2 text-gray-500 sm:col-span-2">
                    <FaStickyNote className="text-primary text-xs flex-shrink-0 mt-0.5" />
                    <span>{bk.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimes className="text-2xl text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Cancelar cita</h3>
            <p className="text-gray-500 text-sm mb-6">
              Esta acción no se puede deshacer. La cita será marcada como cancelada.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelId(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                No, volver
              </button>
              <button
                onClick={async () => {
                  await updateStatus(cancelId, 'cancelled')
                  setCancelId(null)
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit appointment modal */}
      <AppointmentFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditBooking(null) }}
        onSaved={fetchBookings}
        date={date}
        booking={editBooking}
      />
    </div>
  )
}
