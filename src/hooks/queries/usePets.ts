import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export interface Pet {
  id: string
  owner_id: string
  store_id: string
  name: string
  species: string
  breed?: string
  sex?: string
  date_of_birth?: string
  weight?: number
  microchip_number?: string
  photo_url?: string
  allergies?: string
  condition: string
  is_sterilized: boolean
  color?: string
  notes?: string
  created_at: string
  updated_at: string
  owner?: {
    id: string
    first_name: string
    last_name?: string
    phone?: string
    email?: string
  }
}

export function usePets() {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['pets', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase
        .from('pets')
        .select('*, owner:owners(id, first_name, last_name, phone, email)')
        .eq('store_id', storeId)
        .eq('condition', 'active')
        .order('name')
      if (error) throw error
      return (data || []) as Pet[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function usePet(petId: string | undefined) {
  return useQuery({
    queryKey: ['pet', petId],
    queryFn: async () => {
      if (!petId) return null
      const { data, error } = await supabase
        .from('pets')
        .select('*, owner:owners(id, first_name, last_name, phone, email)')
        .eq('id', petId)
        .maybeSingle()
      if (error) throw error
      return data as Pet | null
    },
    enabled: !!petId && isConfigured,
  })
}

export function useCreatePet() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async (pet: Partial<Pet>) => {
      const { data, error } = await supabase
        .from('pets')
        .insert({ ...pet, store_id: activeStore?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pets'] })
      qc.invalidateQueries({ queryKey: ['owners'] })
    },
  })
}

export function useUpdatePet() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Pet> & { id: string }) => {
      const { data, error } = await supabase
        .from('pets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['pets'] })
      qc.invalidateQueries({ queryKey: ['pet', data.id] })
    },
  })
}
