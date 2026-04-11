import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa'

// Fix leaflet default marker icon
const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface Props {
  onSelect: (location: { lat: number; lng: number; address: string }) => void
  onBack: () => void
}

// Juan Díaz, Panama center
const DEFAULT_CENTER: [number, number] = [9.0, -79.47]
const DEFAULT_ZOOM = 13

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPicker({ onSelect, onBack }: Props) {
  const { t } = useTranslation()
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  function handleMapClick(lat: number, lng: number) {
    setPosition([lat, lng])
    reverseGeocode(lat, lng)
  }

  async function reverseGeocode(lat: number, lng: number) {
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      if (data.display_name) {
        setAddress(data.display_name)
      }
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    }
    setLoading(false)
  }

  // Try to get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setPosition([latitude, longitude])
          reverseGeocode(latitude, longitude)
        },
        () => {} // silently fail
      )
    }
  }, [])

  function handleConfirm() {
    if (!position) return
    onSelect({
      lat: position[0],
      lng: position[1],
      address: address || `${position[0].toFixed(5)}, ${position[1].toFixed(5)}`,
    })
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
        {t('booking.pickupLocation')}
      </h3>
      <p className="text-gray-500 text-sm text-center mb-4">
        {t('booking.pickupLocationHint')}
      </p>

      <div className="rounded-2xl overflow-hidden border border-gray-200 mb-4" style={{ height: 350 }}>
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {position && <Marker position={position} icon={markerIcon} />}
        </MapContainer>
      </div>

      {position && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-start gap-2">
          <FaMapMarkerAlt className="text-primary mt-1 shrink-0" />
          <p className="text-sm text-gray-700">
            {loading ? t('booking.loadingAddress') : address}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <FaArrowLeft className="text-xs" /> {t('booking.back')}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!position}
          className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-40 cursor-pointer"
        >
          {t('booking.confirmLocation')}
        </button>
      </div>
    </div>
  )
}
