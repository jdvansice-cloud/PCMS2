import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabaseStaff, supabasePortal } from '../lib/supabase'
import { resolveAuthUser } from '../lib/auth'
import type { AuthUser } from '../lib/auth'
import type { Session, User } from '@supabase/supabase-js'

interface AuthContextValue {
  session: Session | null
  user: User | null
  authUser: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<unknown>
  signInWithOtp: (email: string) => Promise<unknown>
  verifyOtp: (email: string, token: string) => Promise<unknown>
  signOut: () => Promise<void>
  updatePassword: (newPassword: string) => Promise<unknown>
  isAdmin: boolean
  isVet: boolean
  isStaff: boolean
  isCustomer: boolean
  isPlatformAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const isPortalRoute = location.pathname.startsWith('/portal')
  const activeClient = isPortalRoute ? supabasePortal : supabaseStaff

  useEffect(() => {
    let mounted = true

    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false)
    }, 4000)

    const handleAuthChange = async (_event: string, session: Session | null) => {
      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const resolved = await resolveAuthUser(session.user.id, session.user.email || '')
        if (mounted) setAuthUser(resolved)
      } else {
        setAuthUser(null)
      }

      if (mounted) {
        setLoading(false)
      }
    }

    const { data: { subscription: staffSub } } = supabaseStaff.auth.onAuthStateChange(
      (event, sess) => {
        if (!location.pathname.startsWith('/portal')) {
          handleAuthChange(event, sess)
        }
      }
    )

    const { data: { subscription: portalSub } } = supabasePortal.auth.onAuthStateChange(
      (event, sess) => {
        if (location.pathname.startsWith('/portal')) {
          handleAuthChange(event, sess)
        }
      }
    )

    activeClient.auth.getSession().then(({ data: { session } }) => {
      if (mounted) handleAuthChange('INITIAL_SESSION', session)
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      staffSub.unsubscribe()
      portalSub.unsubscribe()
    }
  }, [isPortalRoute])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await activeClient.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signInWithOtp = async (email: string) => {
    const { data, error } = await activeClient.auth.signInWithOtp({ email })
    if (error) throw error
    return data
  }

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await activeClient.auth.verifyOtp({ email, token, type: 'email' })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    try {
      setSession(null)
      setUser(null)
      setAuthUser(null)
      await activeClient.auth.signOut()
    } catch (err) {
      console.error('SignOut error:', err)
    }
  }

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await activeClient.auth.updateUser({ password: newPassword })
    if (error) throw error
    return data
  }

  const value: AuthContextValue = {
    session,
    user,
    authUser,
    loading,
    signIn,
    signInWithOtp,
    verifyOtp,
    signOut,
    updatePassword,
    isAdmin: authUser?.role === 'admin',
    isVet: authUser?.role === 'veterinarian' || authUser?.role === 'admin',
    isStaff: authUser ? authUser.role !== 'customer' : false,
    isCustomer: authUser?.role === 'customer',
    isPlatformAdmin: authUser?.isPlatformAdmin === true,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
