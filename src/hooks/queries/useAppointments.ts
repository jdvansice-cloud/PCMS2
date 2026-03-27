import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export type AppointmentStatus = 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'

export interface Appointment {
  id: string
  store_id: string
  pet_id: string
  owner_id: string
  veterinarian_id?: string
  type: string
  status: AppointmentStatus
  scheduled_at: string
  arrived_at?: string
  started_at?: string
  completed_at?: string
  no_show_marked_at?: string
  color_code?: string
  notes?: string
  reminder_sent_at?: string
  created_by?: string
  created_at: string
  pet?: { id: string; name: string; species: string; breed?: string; photo_url?: string }
  owner?: { id: string; first_name: string; last_name?: string; phone?: string }
  veterinarian?: { id: string; full_name: string }
}

export function useAppointments(dateFilter?: string) {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['appointments', storeId, dateFilter],
    queryFn: async () => {
      if (!storeId) return []
      let query = supabase
        .from('appointments')
        .select(`
          *,
          pet:pets(id, name, species, breed, photo_url),
          owner:owners(id, first_name, last_name, phone),
          veterinarian:users!appointments_veterinarian_id_fkey(id, full_name)
        `)
        .eq('store_id', storeId)
        .order('scheduled_at', { ascending: true })

      if (dateFilter) {
        const start = `${dateFilter}T00:00:00`
        const end = `${dateFilter}T23:59:59`
        query = query.gte('scheduled_at', start).lte('scheduled_at', end)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as Appointment[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async (appt: Partial<Appointment>) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert({ ...appt, store_id: activeStore?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, ...extras }: { id: string; status: AppointmentStatus; [key: string]: unknown }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() }

      if (status === 'waiting') updates.arrived_at = new Date().toISOString()
      if (status === 'in_progress') updates.started_at = new Date().toISOString()
      if (status === 'completed') updates.completed_at = new Date().toISOString()
      if (status === 'no_show') updates.no_show_marked_at = new Date().toISOString()

      Object.assign(updates, extras)

      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
