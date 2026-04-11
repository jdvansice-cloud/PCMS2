import { useState, useEffect, useCallback } from 'react'
import { FaPlus, FaRoute, FaTruck, FaTrash, FaArrowUp, FaArrowDown, FaMagic, FaCheck, FaMapMarkerAlt } from 'react-icons/fa'
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import { Icon, DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../../lib/supabase'
import type { Route, RouteStop, WebBooking } from '../../lib/types'

const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function createNumberIcon(num: number) {
  return new DivIcon({
    html: `<div style="background:#017AAB;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

// Clinic location (Juan Díaz)
const CLINIC: [number, number] = [9.0, -79.47]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En ruta',
  completed: 'Completada',
}

export default function RouteManager() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [stops, setStops] = useState<RouteStop[]>([])
  const [unassigned, setUnassigned] = useState<WebBooking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)

    // Fetch routes for selected date
    const { data: routeData } = await supabase
      .from('routes')
      .select('*')
      .eq('route_date', date)
      .order('created_at')

    setRoutes(routeData || [])

    // Fetch all pickup bookings for date that aren't cancelled
    const { data: bookings } = await supabase
      .from('web_bookings')
      .select('*')
      .eq('booking_date', date)
      .eq('needs_pickup', true)
      .neq('status', 'cancelled')

    // Get assigned booking IDs from route_stops
    const { data: allStops } = await supabase
      .from('route_stops')
      .select('booking_id, route_id')

    const assignedIds = new Set((allStops || []).map(s => s.booking_id))
    setUnassigned((bookings || []).filter(b => !assignedIds.has(b.id)) as WebBooking[])

    setLoading(false)
  }, [date])

  useEffect(() => { fetchData() }, [fetchData])

  // Fetch stops when a route is selected
  useEffect(() => {
    if (!selectedRoute) { setStops([]); return }

    async function fetchStops() {
      const { data } = await supabase
        .from('route_stops')
        .select('*')
        .eq('route_id', selectedRoute!.id)
        .order('stop_order')

      if (data) {
        // Fetch booking data for each stop
        const bookingIds = data.map(s => s.booking_id)
        const { data: bookings } = await supabase
          .from('web_bookings')
          .select('*')
          .in('id', bookingIds)

        const bookingMap = new Map((bookings || []).map(b => [b.id, b]))
        setStops(data.map(s => ({ ...s, booking: bookingMap.get(s.booking_id) as WebBooking })))
      }
    }
    fetchStops()
  }, [selectedRoute])

  async function createRoute() {
    const { data } = await supabase
      .from('routes')
      .insert({ route_date: date, name: `Ruta ${routes.length + 1}` })
      .select()
      .single()

    if (data) {
      setRoutes([...routes, data])
      setSelectedRoute(data)
    }
  }

  async function deleteRoute(routeId: number) {
    await supabase.from('routes').delete().eq('id', routeId)
    if (selectedRoute?.id === routeId) setSelectedRoute(null)
    fetchData()
  }

  async function addStopToRoute(booking: WebBooking) {
    if (!selectedRoute) return
    const nextOrder = stops.length + 1

    await supabase.from('route_stops').insert({
      route_id: selectedRoute.id,
      booking_id: booking.id,
      stop_order: nextOrder,
    })

    // Refresh
    setUnassigned(prev => prev.filter(b => b.id !== booking.id))
    const newStop: RouteStop = {
      id: 0, // will be refreshed
      route_id: selectedRoute.id,
      booking_id: booking.id,
      stop_order: nextOrder,
      estimated_time: null,
      status: 'pending',
      booking,
    }
    setStops([...stops, newStop])
    fetchData()
  }

  async function removeStop(stopId: number) {
    await supabase.from('route_stops').delete().eq('id', stopId)
    fetchData()
    // Refresh stops
    setStops(prev => prev.filter(s => s.id !== stopId))
  }

  async function moveStop(index: number, direction: 'up' | 'down') {
    const newStops = [...stops]
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= newStops.length) return

    // Swap orders
    const tempOrder = newStops[index].stop_order
    newStops[index].stop_order = newStops[swapIdx].stop_order
    newStops[swapIdx].stop_order = tempOrder;

    [newStops[index], newStops[swapIdx]] = [newStops[swapIdx], newStops[index]]
    setStops(newStops)

    // Persist
    await Promise.all(newStops.map(s =>
      supabase.from('route_stops').update({ stop_order: s.stop_order }).eq('id', s.id)
    ))
  }

  async function optimizeRoute() {
    if (stops.length < 2) return

    // Simple nearest-neighbor from clinic
    const remaining = [...stops]
    const optimized: RouteStop[] = []
    let current = CLINIC

    while (remaining.length > 0) {
      let nearestIdx = 0
      let nearestDist = Infinity

      remaining.forEach((stop, i) => {
        const bk = stop.booking
        if (!bk?.pickup_lat || !bk?.pickup_lng) return
        const dist = Math.sqrt(
          Math.pow(bk.pickup_lat - current[0], 2) +
          Math.pow(bk.pickup_lng - current[1], 2)
        )
        if (dist < nearestDist) {
          nearestDist = dist
          nearestIdx = i
        }
      })

      const next = remaining.splice(nearestIdx, 1)[0]
      next.stop_order = optimized.length + 1
      optimized.push(next)
      if (next.booking?.pickup_lat && next.booking?.pickup_lng) {
        current = [next.booking.pickup_lat, next.booking.pickup_lng]
      }
    }

    setStops(optimized)

    // Persist new order
    await Promise.all(optimized.map(s =>
      supabase.from('route_stops').update({ stop_order: s.stop_order }).eq('id', s.id)
    ))
  }

  async function updateRouteStatus(routeId: number, status: string) {
    await supabase.from('routes').update({ status }).eq('id', routeId)
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, status: status as Route['status'] } : r))
    if (selectedRoute?.id === routeId) {
      setSelectedRoute(prev => prev ? { ...prev, status: status as Route['status'] } : null)
    }
  }

  // Build polyline points: clinic → stop1 → stop2 → ... → clinic
  const routePoints: [number, number][] = [CLINIC]
  stops.forEach(s => {
    if (s.booking?.pickup_lat && s.booking?.pickup_lng) {
      routePoints.push([s.booking.pickup_lat, s.booking.pickup_lng])
    }
  })
  if (stops.length > 0) routePoints.push(CLINIC)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaRoute className="text-primary" /> Rutas de Recolección
        </h2>
        <input
          type="date"
          value={date}
          onChange={e => { setDate(e.target.value); setSelectedRoute(null) }}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Routes list + stops */}
          <div className="space-y-4">
            {/* Routes for the day */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Rutas del día</h3>
              <button
                onClick={createRoute}
                className="flex items-center gap-1 text-sm bg-primary text-white font-bold px-3 py-1.5 rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
              >
                <FaPlus className="text-xs" /> Nueva Ruta
              </button>
            </div>

            {routes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No hay rutas para este día</p>
            ) : (
              <div className="space-y-2">
                {routes.map(route => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
                      selectedRoute?.id === route.id ? 'border-primary shadow-md' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FaTruck className="text-primary" />
                        <span className="font-bold text-gray-800">{route.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[route.status]}`}>
                          {statusLabels[route.status]}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {route.status === 'pending' && (
                          <button
                            onClick={e => { e.stopPropagation(); updateRouteStatus(route.id, 'in_progress') }}
                            className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-lg hover:bg-blue-100 cursor-pointer"
                          >
                            Iniciar
                          </button>
                        )}
                        {route.status === 'in_progress' && (
                          <button
                            onClick={e => { e.stopPropagation(); updateRouteStatus(route.id, 'completed') }}
                            className="text-xs bg-green-50 text-green-600 font-bold px-2 py-1 rounded-lg hover:bg-green-100 cursor-pointer"
                          >
                            <FaCheck className="inline text-[10px]" /> Completar
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); deleteRoute(route.id) }}
                          className="text-xs bg-red-50 text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-100 cursor-pointer"
                        >
                          <FaTrash className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected route stops */}
            {selectedRoute && (
              <>
                <div className="flex items-center justify-between mt-4">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    Paradas ({stops.length})
                  </h3>
                  {stops.length >= 2 && (
                    <button
                      onClick={optimizeRoute}
                      className="flex items-center gap-1 text-sm bg-yellow-50 text-yellow-700 font-bold px-3 py-1.5 rounded-xl hover:bg-yellow-100 transition-colors cursor-pointer"
                    >
                      <FaMagic className="text-xs" /> Optimizar
                    </button>
                  )}
                </div>

                {stops.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-2">Agrega paradas desde las citas sin asignar</p>
                ) : (
                  <div className="space-y-2">
                    {stops.map((stop, i) => (
                      <div key={stop.id || i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {stop.booking?.pet_name} — {stop.booking?.owner_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                            <FaMapMarkerAlt className="text-[10px]" />
                            {stop.booking?.pickup_address || 'Sin dirección'}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => moveStop(i, 'up')}
                            disabled={i === 0}
                            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                          >
                            <FaArrowUp className="text-xs text-gray-500" />
                          </button>
                          <button
                            onClick={() => moveStop(i, 'down')}
                            disabled={i === stops.length - 1}
                            className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 cursor-pointer"
                          >
                            <FaArrowDown className="text-xs text-gray-500" />
                          </button>
                          <button
                            onClick={() => removeStop(stop.id)}
                            className="p-1.5 rounded-lg hover:bg-red-100 cursor-pointer"
                          >
                            <FaTrash className="text-xs text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Unassigned pickups */}
                {unassigned.length > 0 && (
                  <>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-4">
                      Sin asignar ({unassigned.length})
                    </h3>
                    <div className="space-y-2">
                      {unassigned.map(bk => (
                        <div key={bk.id} className="bg-white border border-dashed border-gray-300 rounded-xl p-3 flex items-center gap-3">
                          <FaTruck className="text-gray-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{bk.pet_name} — {bk.owner_name}</p>
                            <p className="text-xs text-gray-500 truncate">{bk.pickup_address || 'Sin dirección'}</p>
                          </div>
                          <button
                            onClick={() => addStopToRoute(bk)}
                            className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1.5 rounded-lg hover:bg-primary/20 cursor-pointer shrink-0"
                          >
                            <FaPlus className="inline text-[10px]" /> Agregar
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right: Map */}
          <div className="rounded-2xl overflow-hidden border border-gray-200" style={{ height: 500 }}>
            <MapContainer
              center={CLINIC}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Clinic marker */}
              <Marker position={CLINIC} icon={markerIcon}>
                <Popup>Veterinaria Vida+</Popup>
              </Marker>

              {/* Stop markers */}
              {stops.map((stop, i) => {
                if (!stop.booking?.pickup_lat || !stop.booking?.pickup_lng) return null
                return (
                  <Marker
                    key={stop.id || i}
                    position={[stop.booking.pickup_lat, stop.booking.pickup_lng]}
                    icon={createNumberIcon(i + 1)}
                  >
                    <Popup>
                      <strong>Parada {i + 1}</strong><br />
                      {stop.booking.pet_name} — {stop.booking.owner_name}<br />
                      <span className="text-xs text-gray-500">{stop.booking.pickup_address}</span>
                    </Popup>
                  </Marker>
                )
              })}

              {/* Unassigned markers (gray) */}
              {unassigned.map(bk => {
                if (!bk.pickup_lat || !bk.pickup_lng) return null
                return (
                  <Marker
                    key={`u-${bk.id}`}
                    position={[bk.pickup_lat, bk.pickup_lng]}
                    icon={markerIcon}
                    opacity={0.5}
                  >
                    <Popup>
                      <strong>Sin asignar</strong><br />
                      {bk.pet_name} — {bk.owner_name}
                    </Popup>
                  </Marker>
                )
              })}

              {/* Route polyline */}
              {routePoints.length > 1 && (
                <Polyline
                  positions={routePoints}
                  color="#017AAB"
                  weight={3}
                  dashArray="8 4"
                />
              )}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  )
}
