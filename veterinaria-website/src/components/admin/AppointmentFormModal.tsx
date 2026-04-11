import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import { isGroomingService } from '../../lib/types'
import type { WebBooking } from '../../lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  date: string
  /** If provided, we're editing; otherwise creating */
  booking?: WebBooking | null
}

const services = [
  { key: 'bath', label: 'Baño' },
  { key: 'bathCut', label: 'Baño y Corte' },
  { key: 'catBath', label: 'Baño de Gatos' },
  { key: 'vetConsult', label: 'Consulta Veterinaria' },
]

const statuses = [
  { key: 'pending', label: 'Pendiente' },
  { key: 'confirmed', label: 'Confirmada' },
  { key: 'completed', label: 'Completada' },
  { key: 'cancelled', label: 'Cancelada' },
]

export default function AppointmentFormModal({ open, onClose, onSaved, date, booking }: Props) {
  const isEdit = !!booking

  const [service, setService] = useState(booking?.service || 'bath')
  const [bookingDate, setBookingDate] = useState(booking?.booking_date || date)
  const [bookingTime, setBookingTime] = useState(booking?.booking_time || '')
  const [petName, setPetName] = useState(booking?.pet_name || '')
  const [petType, setPetType] = useState(booking?.pet_type || 'Perro')
  const [petSize, setPetSize] = useState(booking?.pet_size || '')
  const [ownerName, setOwnerName] = useState(booking?.owner_name || '')
  const [ownerPhone, setOwnerPhone] = useState(booking?.owner_phone || '')
  const [ownerEmail, setOwnerEmail] = useState(booking?.owner_email || '')
  const [notes, setNotes] = useState(booking?.notes || '')
  const [status, setStatus] = useState(booking?.status || 'confirmed')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Reset form when booking changes (edit different appointment)
  useEffect(() => {
    if (booking) {
      setService(booking.service)
      setBookingDate(booking.booking_date)
      setBookingTime(booking.booking_time || '')
      setPetName(booking.pet_name)
      setPetType(booking.pet_type)
      setPetSize(booking.pet_size || '')
      setOwnerName(booking.owner_name)
      setOwnerPhone(booking.owner_phone)
      setOwnerEmail(booking.owner_email || '')
      setNotes(booking.notes || '')
      setStatus(booking.status)
    } else {
      setService('bath')
      setBookingDate(date)
      setBookingTime('')
      setPetName('')
      setPetType('Perro')
      setPetSize('')
      setOwnerName('')
      setOwnerPhone('')
      setOwnerEmail('')
      setNotes('')
      setStatus('confirmed')
    }
  }, [booking, date])

  const isGrooming = isGroomingService(service)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!petName.trim() || !ownerName.trim() || !ownerPhone.trim()) {
      setError('Completa los campos obligatorios')
      return
    }

    if (!isGrooming && !bookingTime) {
      setError('Selecciona una hora para la consulta')
      return
    }

    setSaving(true)

    const row = {
      service,
      booking_date: bookingDate,
      booking_time: isGrooming ? null : bookingTime,
      pet_name: petName.trim(),
      pet_type: petType,
      pet_size: petSize || null,
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.trim(),
      owner_email: ownerEmail.trim() || null,
      notes: notes.trim() || null,
      status,
      ...(!isEdit ? { source: 'admin' as const } : {}),
    }

    let err
    if (isEdit && booking) {
      const { error: e } = await supabase
        .from('web_bookings')
        .update(row)
        .eq('id', booking.id)
      err = e
    } else {
      const { error: e } = await supabase
        .from('web_bookings')
        .insert(row)
      err = e
    }

    setSaving(false)

    if (err) {
      setError(err.message)
      return
    }

    onSaved()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-extrabold text-gray-800">
            {isEdit ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Service */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Servicio</label>
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {services.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {!isGrooming && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Hora</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
            {isGrooming && (
              <div className="flex items-end">
                <p className="text-xs text-gray-400 pb-2">Peluquería no requiere hora</p>
              </div>
            )}
          </div>

          {/* Status (always visible for edit, default "confirmed" for new) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key as WebBooking['status'])}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer
                    ${status === s.key
                      ? s.key === 'pending' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300'
                        : s.key === 'confirmed' ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                        : s.key === 'completed' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                        : 'bg-red-100 text-red-700 ring-2 ring-red-300'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Pet info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mascota *</label>
              <input
                type="text"
                value={petName}
                onChange={e => setPetName(e.target.value)}
                placeholder="Nombre de la mascota"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
              <select
                value={petType}
                onChange={e => setPetType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Pet size (grooming dogs) */}
          {isGrooming && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tamaño</label>
              <select
                value={petSize}
                onChange={e => setPetSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">--</option>
                <option value="small">Pequeño (25 lbs o menos)</option>
                <option value="medium">Mediano (26 - 50 lbs)</option>
                <option value="large">Grande (51 - 75 lbs)</option>
                <option value="xl">XL (76 lbs +)</option>
              </select>
            </div>
          )}

          {/* Owner info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dueño *</label>
              <input
                type="text"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                placeholder="Nombre del dueño"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={e => setOwnerPhone(e.target.value)}
                placeholder="6000-0000"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Correo (opcional)</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={e => setOwnerEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
