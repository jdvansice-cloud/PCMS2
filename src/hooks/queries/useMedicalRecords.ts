import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export interface MedicalRecord {
  id: string
  pet_id: string
  store_id: string
  appointment_id?: string
  veterinarian_id?: string
  vital_signs: Record<string, unknown>
  examination?: string
  diagnosis?: string
  treatment?: string
  notes?: string
  draft?: Record<string, unknown>
  is_draft: boolean
  created_at: string
  updated_at: string
  pet?: { id: string; name: string; species: string; breed?: string }
  veterinarian?: { id: string; full_name: string }
  prescriptions?: Prescription[]
}

export interface Prescription {
  id: string
  medical_record_id: string
  medications: MedicationItem[]
  signature_url?: string
  senasica_format: boolean
  notes?: string
  created_at: string
}

export interface MedicationItem {
  name: string
  dose: string
  frequency: string
  duration: string
  instructions?: string
}

export function useMedicalRecords(petId?: string) {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['medical_records', storeId, petId],
    queryFn: async () => {
      if (!storeId) return []
      let query = supabase
        .from('medical_records')
        .select(`
          *,
          pet:pets(id, name, species, breed),
          veterinarian:users!medical_records_veterinarian_id_fkey(id, full_name),
          prescriptions(*)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

      if (petId) query = query.eq('pet_id', petId)

      const { data, error } = await query
      if (error) throw error
      return (data || []) as MedicalRecord[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useCreateMedicalRecord() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async (record: Partial<MedicalRecord>) => {
      const { data, error } = await supabase
        .from('medical_records')
        .insert({ ...record, store_id: activeStore?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medical_records'] })
    },
  })
}

export function useUpdateMedicalRecord() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedicalRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('medical_records')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medical_records'] })
    },
  })
}
