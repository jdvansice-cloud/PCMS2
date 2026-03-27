import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export type GroomingStatus = 'pending' | 'in_progress' | 'completed'

export interface GroomingSession {
  id: string
  store_id: string
  pet_id: string
  owner_id: string
  groomer_id?: string
  service_type: string
  status: GroomingStatus
  observations?: string
  special_instructions?: string
  waiver_signed_at?: string
  waiver_signature_url?: string
  before_photo_url?: string
  after_photo_url?: string
  commission_rate?: number
  commission_amount?: number
  completed_at?: string
  notification_sent_at?: string
  created_at: string
  pet?: { id: string; name: string; species: string; breed?: string; photo_url?: string }
  owner?: { id: string; first_name: string; last_name?: string; phone?: string }
  groomer?: { id: string; full_name: string }
}

export function useGroomingSessions() {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['grooming', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('grooming_sessions')
        .select(`
          *,
          pet:pets(id, name, species, breed, photo_url),
          owner:owners(id, first_name, last_name, phone),
          groomer:users!grooming_sessions_groomer_id_fkey(id, full_name)
        `)
        .eq('store_id', storeId)
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data || []) as GroomingSession[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useCreateGrooming() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async (session: Partial<GroomingSession>) => {
      const { data, error } = await supabase
        .from('grooming_sessions')
        .insert({ ...session, store_id: activeStore?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grooming'] }),
  })
}

export function useUpdateGroomingStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, ...extras }: { id: string; status: GroomingStatus; [key: string]: unknown }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
      if (status === 'completed') updates.completed_at = new Date().toISOString()
      Object.assign(updates, extras)

      const { data, error } = await supabase
        .from('grooming_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grooming'] }),
  })
}
