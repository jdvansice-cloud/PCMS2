import { useQuery } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export interface StaffUser {
  id: string
  full_name: string
  email: string
  role: string
  commission_rate?: number
  license_number?: string
  is_active: boolean
}

export function useStaffUsers(role?: string) {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['staff_users', storeId, role],
    queryFn: async () => {
      if (!storeId) return []
      let query = supabase
        .from('users')
        .select('id, full_name, email, role, commission_rate, license_number, is_active')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('full_name')

      if (role) query = query.eq('role', role)

      const { data, error } = await query
      if (error) throw error
      return (data || []) as StaffUser[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useVeterinarians() {
  return useStaffUsers('veterinarian')
}
