import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export type PreventiveType = 'vaccine' | 'deworming' | 'ectoparasite'

export interface PreventiveTreatment {
  id: string
  pet_id: string
  store_id: string
  type: PreventiveType
  product_name: string
  laboratory?: string
  lot_number?: string
  dose?: string
  weight_at_treatment?: number
  applied_at: string
  next_due_at?: string
  certificate_url?: string
  reminder_sent_at?: string
  applied_by?: string
  notes?: string
  created_at: string
  pet?: { id: string; name: string; species: string; breed?: string; photo_url?: string }
  appliedByUser?: { id: string; full_name: string }
}

export function usePreventiveTreatments(petId?: string, type?: PreventiveType) {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['preventive', storeId, petId, type],
    queryFn: async () => {
      if (!storeId) return []
      let query = supabase
        .from('preventive_treatments')
        .select('*, pet:pets(id, name, species, breed, photo_url), appliedByUser:users!preventive_treatments_applied_by_fkey(id, full_name)')
        .eq('store_id', storeId)
        .order('applied_at', { ascending: false })

      if (petId) query = query.eq('pet_id', petId)
      if (type) query = query.eq('type', type)

      const { data, error } = await query
      if (error) throw error
      return (data || []) as PreventiveTreatment[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useCreatePreventive() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async (treatment: Partial<PreventiveTreatment>) => {
      const { data, error } = await supabase
        .from('preventive_treatments')
        .insert({ ...treatment, store_id: activeStore?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['preventive'] })
    },
  })
}
