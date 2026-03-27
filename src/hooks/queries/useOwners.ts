import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export interface Owner {
  id: string
  store_id: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  phone_whatsapp?: string
  id_type?: string
  id_number?: string
  address?: Record<string, string>
  account_balance: number
  is_vip: boolean
  notes?: string
  created_at: string
  updated_at: string
  pets?: Pet[]
}

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
}

export function useOwners() {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['owners', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase
        .from('owners')
        .select('*, pets(id, name, species, breed, sex, condition, photo_url)')
        .eq('store_id', storeId)
        .order('first_name')
      if (error) throw error
      return (data || []) as Owner[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useOwner(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['owner', ownerId],
    queryFn: async () => {
      if (!ownerId) return null
      const { data, error } = await supabase
        .from('owners')
        .select('*, pets(*)')
        .eq('id', ownerId)
        .maybeSingle()
      if (error) throw error
      return data as Owner | null
    },
    enabled: !!ownerId && isConfigured,
  })
}

export function useCreateOwner() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async (owner: Partial<Owner>) => {
      const { data, error } = await supabase
        .from('owners')
        .insert({ ...owner, store_id: activeStore?.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owners'] })
    },
  })
}

export function useUpdateOwner() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Owner> & { id: string }) => {
      const { data, error } = await supabase
        .from('owners')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['owners'] })
      qc.invalidateQueries({ queryKey: ['owner', data.id] })
    },
  })
}

export function useDeleteOwner() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('owners').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owners'] })
    },
  })
}
