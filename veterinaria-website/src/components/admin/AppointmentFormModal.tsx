import { useState, useEffect } from 'react'
import { FaTimes, FaTruck, FaMapMarkerAlt } from 'react-icons/fa'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../../lib/supabase'
import { isGroomingService } from '../../lib/types'
import type { WebBooking } from '../../lib/types'

const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

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
  const [needsPickup, setNeedsPickup] = useState(booking?.needs_pickup || false)
  const [pickupLat, setPickupLat] = useState<number | null>(booking?.pickup_lat || null)
  const [pickupLng, setPickupLng] = useState<number | null>(booking?.pickup_lng || null)
  const [pickupAddress, setPickupAddress] = useState(booking?.pickup_address || '')
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
      setNeedsPickup(booking.needs_pickup || false)
      setPickupLat(booking.pickup_lat || null)
      setPickupLng(booking.pickup_lng || null)
      setPickupAddress(booking.pickup_address || '')
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
      setNeedsPickup(false)
      setPickupLat(null)
      setPickupLng(null)
      setPickupAddress('')
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
      needs_pickup: needsPickup,
      pickup_lat: needsPickup ? pickupLat : null,
      pickup_lng: needsPickup ? pickupLng : null,
      pickup_address: needsPickup ? pickupAddress || null : null,
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

          <hr className="border-gray-100" />

          {/* Pickup toggle + map */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={needsPickup}
                onChange={e => setNeedsPickup(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
              />
              <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <FaTruck className="text-green-600" /> Servicio a domicilio
              </span>
            </label>
          </div>

          {needsPickup && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                <FaMapMarkerAlt className="inline text-primary mr-1" />
                Ubicación de recogida
              </label>
              <div className="rounded-xl overflow-hidden border border-gray-200 mb-2" style={{ height: 200 }}>
                <MapContainer
                  center={pickupLat && pickupLng ? [pickupLat, pickupLng] : [9.0, -79.47]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onLocationSelect={async (lat, lng) => {
                    setPickupLat(lat)
                    setPickupLng(lng)
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
                        { headers: { 'Accept-Language': 'es' } }
                      )
                      const data = await res.json()
                      if (data.display_name) setPickupAddress(data.display_name)
                    } catch {
                      setPickupAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                    }
                  }} />
                  {pickupLat && pickupLng && (
                    <Marker position={[pickupLat, pickupLng]} icon={markerIcon} />
                  )}
                </MapContainer>
              </div>
              {pickupAddress && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-[10px] text-primary" />
                  {pickupAddress}
                </p>
              )}
              <input
                type="text"
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                placeholder="Dirección (o toca el mapa)"
                className="w-full mt-2 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

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
