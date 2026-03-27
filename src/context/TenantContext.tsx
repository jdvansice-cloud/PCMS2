import { createContext, useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabaseStaff, isConfigured } from '../lib/supabase'
import { FullPageSpinner } from '../components/ui'

interface Company {
  id: string
  name: string
  slug: string
  logo_url?: string
  ruc?: string
  tax_rate?: number
  [key: string]: unknown
}

interface Store {
  id: string
  name: string
  company_id: string
  is_active: boolean
  address?: string
  phone?: string
  [key: string]: unknown
}

interface Subscription {
  id: string
  plan: 'starter' | 'pro' | 'enterprise'
  status: string
}

interface TenantContextValue {
  company: Company | null
  stores: Store[]
  activeStore: Store | null
  slug: string
  plan: 'starter' | 'pro' | 'enterprise'
  subscription: Subscription | null
  loading: boolean
  error: string | null
  setActiveStore: (storeId: string) => void
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { slug } = useParams<{ slug: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [activeStore, setActiveStoreState] = useState<Store | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setError('No se especifico la organizacion')
      setLoading(false)
      return
    }

    let cancelled = false

    const resolve = async () => {
      // Demo mode when Supabase is not configured
      if (!isConfigured) {
        const demoCompany: Company = {
          id: 'demo-company-id',
          name: slug!.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug: slug!,
          logo_url: undefined,
        }
        const demoStore: Store = {
          id: 'demo-store-id',
          name: 'Sucursal Principal',
          company_id: demoCompany.id,
          is_active: true,
        }
        setCompany(demoCompany)
        setStores([demoStore])
        setActiveStoreState(demoStore)
        setSubscription({ id: 'demo-sub', plan: 'enterprise', status: 'active' })
        setLoading(false)
        return
      }

      try {
        const { data: companyData, error: companyError } = await supabaseStaff
          .from('companies')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (cancelled) return

        if (companyError || !companyData) {
          setError('Organizacion no encontrada')
          setLoading(false)
          return
        }

        setCompany(companyData as Company)

        const { data: storesData } = await supabaseStaff
          .from('stores')
          .select('*')
          .eq('company_id', companyData.id)
          .eq('is_active', true)
          .order('name')

        if (cancelled) return

        const storesList = (storesData as Store[]) || []
        setStores(storesList)

        const savedStoreId = localStorage.getItem(`tenant-store-${slug}`)
        const saved = storesList.find((s) => s.id === savedStoreId)
        setActiveStoreState(saved || storesList[0] || null)

        const { data: subData } = await supabaseStaff
          .from('subscriptions')
          .select('*')
          .eq('company_id', companyData.id)
          .maybeSingle()

        if (cancelled) return

        setSubscription(subData as Subscription | null)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError('Error al cargar la organizacion')
          setLoading(false)
        }
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [slug])

  const setActiveStore = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId)
    if (store) {
      setActiveStoreState(store)
      if (slug) localStorage.setItem(`tenant-store-${slug}`, storeId)
    }
  }

  const plan = subscription?.plan || 'starter'

  if (loading) {
    return <FullPageSpinner text="Cargando clinica..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="text-4xl mb-4">🏥</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">{error}</h2>
          <p className="text-slate-500 mb-6">
            La URL <code className="bg-slate-100 px-2 py-1 rounded text-sm">/{slug}</code> no corresponde a ninguna clinica registrada.
          </p>
          <a href="/" className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium inline-block">
            Ir al inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <TenantContext.Provider
      value={{
        company,
        stores,
        activeStore,
        slug: slug || '',
        plan: plan as 'starter' | 'pro' | 'enterprise',
        subscription,
        loading,
        error,
        setActiveStore,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
