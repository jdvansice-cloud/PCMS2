import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables — running in demo mode')
}

const commonOptions = {
  global: { headers: { 'x-client-info': 'pcms2' } },
}

// Staff client — isolated session storage
export const supabaseStaff = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    ...commonOptions,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'sb-staff-auth-token',
    },
  }
)

// Customer portal client — isolated session storage
export const supabasePortal = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    ...commonOptions,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'sb-portal-auth-token',
    },
  }
)

// Default export for data queries (uses staff client)
export const supabase = supabaseStaff

export const isConfigured = !!(supabaseUrl && supabaseKey)
