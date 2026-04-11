export interface BusinessHours {
  id: number
  day_of_week: number // 0=Sunday, 1=Monday, ..., 6=Saturday
  is_open: boolean
  open_time: string // HH:MM
  close_time: string // HH:MM
  slot_duration_minutes: number
}

export interface DrAvailability {
  id: number
  day_of_week: number // 0=Sunday, 1=Monday, ..., 6=Saturday
  is_available: boolean
  start_time: string // HH:MM
  end_time: string // HH:MM
  slot_duration_minutes: number
}

export interface GroomingSettings {
  id: number
  max_daily_slots: number
  updated_at: string
}

export interface BlockedDate {
  id: number
  blocked_date: string // YYYY-MM-DD
  reason: string | null
}

export interface WebBooking {
  id: number
  service: string
  booking_date: string // YYYY-MM-DD
  booking_time: string | null // HH:MM or null for grooming
  pet_name: string
  pet_type: string
  pet_size: string | null
  owner_name: string
  owner_phone: string
  owner_email: string | null
  notes: string | null
  needs_pickup: boolean
  pickup_lat: number | null
  pickup_lng: number | null
  pickup_address: string | null
  source: 'online' | 'admin'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
}

export interface Route {
  id: number
  route_date: string
  name: string
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
}

export interface RouteStop {
  id: number
  route_id: number
  booking_id: number
  stop_order: number
  estimated_time: string | null
  status: 'pending' | 'picked_up' | 'delivered'
  booking?: WebBooking
}

export const GROOMING_SERVICES = ['bath', 'bathCut', 'catBath']

export function isGroomingService(service: string): boolean {
  return GROOMING_SERVICES.includes(service)
}
