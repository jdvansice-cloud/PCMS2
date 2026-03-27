import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export type StayType = 'hospitalization' | 'boarding' | 'pension'

export interface KennelStay {
  id: string
  store_id: string
  pet_id: string
  owner_id: string
  veterinarian_id?: string
  kennel_number?: string
  type: StayType
  reason?: string
  diagnosis?: string
  status: 'active' | 'discharged'
  daily_rate?: number
  total_charged: number
  sale_id?: string
  admitted_at: string
  discharged_at?: string
  created_at: string
  pet?: { id: string; name: string; species: string; breed?: string; photo_url?: string }
  owner?: { id: string; first_name: string; last_name?: string; phone?: string }
  veterinarian?: { id: string; full_name: string }
  daily_logs?: DailyLog[]
}

export interface DailyLog {
  id: string
  kennel_stay_id: string
  logged_by_id?: string
  vital_signs: Record<string, unknown>
  feeding?: string
  medication?: string
  behavior?: string
  notes?: string
  logged_at: string
  loggedBy?: { id: string; full_name: string }
}

export function useKennelStays() {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['kennel_stays', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase
        .from('kennel_stays')
        .select(`
          *,
          pet:pets(id, name, species, breed, photo_url),
          owner:owners(id, first_name, last_name, phone),
          veterinarian:users!kennel_stays_veterinarian_id_fkey(id, full_name)
        `)
        .eq('store_id', storeId)
        .eq('status', 'active')
        .order('admitted_at', { ascending: false })
      if (error) throw error
      return (data || []) as KennelStay[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useCreateKennelStay() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async (stay: Partial<KennelStay>) => {
      const { data, error } = await supabase
        .from('kennel_stays')
        .insert({ ...stay, store_id: activeStore?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kennel_stays'] }),
  })
}

export function useDischargeKennel() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('kennel_stays')
        .update({ status: 'discharged', discharged_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kennel_stays'] }),
  })
}

export function useCreateDailyLog() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (log: Partial<DailyLog>) => {
      const { data, error } = await supabase
        .from('kennel_daily_logs')
        .insert(log)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kennel_stays'] }),
  })
}
