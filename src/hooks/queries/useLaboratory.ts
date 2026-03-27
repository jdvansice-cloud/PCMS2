import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export type LabStatus = 'pending' | 'in_progress' | 'completed'

export interface LabStudy {
  id: string
  pet_id: string
  store_id: string
  medical_record_id?: string
  requested_by_id?: string
  study_type: string
  status: LabStatus
  results?: string
  file_urls: string[]
  notes?: string
  client_visible: boolean
  requested_at: string
  completed_at?: string
  pet?: { id: string; name: string; species: string; breed?: string; photo_url?: string }
  requestedBy?: { id: string; full_name: string }
}

export function useLabStudies(status?: LabStatus) {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['lab_studies', storeId, status],
    queryFn: async () => {
      if (!storeId) return []
      let query = supabase
        .from('lab_studies')
        .select('*, pet:pets(id, name, species, breed, photo_url), requestedBy:users!lab_studies_requested_by_id_fkey(id, full_name)')
        .eq('store_id', storeId)
        .order('requested_at', { ascending: false })

      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) throw error
      return (data || []) as LabStudy[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useCreateLabStudy() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async (study: Partial<LabStudy>) => {
      const { data, error } = await supabase
        .from('lab_studies')
        .insert({ ...study, store_id: activeStore?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab_studies'] }),
  })
}

export function useUpdateLabStudy() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LabStudy> & { id: string }) => {
      const { data, error } = await supabase
        .from('lab_studies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lab_studies'] }),
  })
}
