import { supabaseStaff as supabase } from './supabase'

export type UserRole = 'admin' | 'veterinarian' | 'groomer' | 'receptionist' | 'customer'

export interface StaffProfile {
  id: string
  full_name: string
  email: string
  role: Exclude<UserRole, 'customer'>
  store_id: string
  company_id?: string
  is_active: boolean
  is_platform_admin?: boolean
  avatar_url?: string
  commission_rate?: number
  license_number?: string
  signature_url?: string
}

export interface CustomerProfile {
  id: string
  customer_auth_id: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  store_id: string
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  isPlatformAdmin?: boolean
  staffProfile?: StaffProfile
  customerProfile?: CustomerProfile
}

export async function resolveAuthUser(
  authId: string,
  email: string,
): Promise<AuthUser | null> {
  const staffProfile = await lookupStaff(authId, email)
  if (staffProfile) {
    return {
      id: authId,
      email,
      role: staffProfile.role,
      isPlatformAdmin: staffProfile.is_platform_admin === true,
      staffProfile,
    }
  }

  const customerProfile = await lookupCustomer(authId)
  if (customerProfile) {
    return {
      id: authId,
      email,
      role: 'customer',
      customerProfile,
    }
  }

  return null
}

async function lookupStaff(authId: string, email: string): Promise<StaffProfile | null> {
  try {
    if (authId) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle()
      if (data) return data as StaffProfile
    }

    if (email) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (data) {
        if (!data.auth_id && authId) {
          await supabase
            .from('users')
            .update({ auth_id: authId })
            .eq('id', data.id)
          data.auth_id = authId
        }
        return data as StaffProfile
      }
    }
  } catch {
    // Silently fail — will try customer lookup
  }

  return null
}

async function lookupCustomer(authId: string): Promise<CustomerProfile | null> {
  try {
    const { data } = await supabase
      .from('customer_auth')
      .select('id, auth_id, customer_id, store_id, owners(id, first_name, last_name, email, phone, store_id)')
      .eq('auth_id', authId)
      .maybeSingle()

    if (!data) return null
    const owner = (data as Record<string, unknown>).owners as Record<string, string> | null
    if (!owner) return null

    return {
      id: owner.id,
      customer_auth_id: data.id,
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email,
      phone: owner.phone,
      store_id: owner.store_id,
    }
  } catch {
    return null
  }
}
