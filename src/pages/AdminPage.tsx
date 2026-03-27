import { useState } from 'react'
import { Shield, Building, Users, Activity, Search, ExternalLink, ToggleLeft, ToggleRight, Heart } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useQuery } from '@tanstack/react-query'
import { supabase, isConfigured } from '../lib/supabase'

interface OrgRow {
  id: string
  name: string
  slug: string
  created_at: string
  stores: { id: string }[]
  users: { id: string }[]
  subscriptions: { plan: string; status: string }[]
}

export default function AdminPage() {
  const [search, setSearch] = useState('')

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['admin_orgs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, slug, created_at, stores(id), users(id), subscriptions(plan, status)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as OrgRow[]
    },
    enabled: isConfigured,
  })

  const filtered = search.trim()
    ? orgs.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.slug.includes(search.toLowerCase()))
    : orgs

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 text-sm">PCMS Admin</span>
          </div>
          <a href="/" className="text-sm text-slate-500 hover:text-slate-700">Ir al inicio</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Building size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Organizaciones</p>
                <p className="text-2xl font-bold text-slate-900">{orgs.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Usuarios totales</p>
                <p className="text-2xl font-bold text-slate-900">{orgs.reduce((sum, o) => sum + (o.users?.length || 0), 0)}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Sucursales</p>
                <p className="text-2xl font-bold text-slate-900">{orgs.reduce((sum, o) => sum + (o.stores?.length || 0), 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orgs List */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Organizaciones</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..." className="input pl-9 py-1.5 text-sm w-60" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12">
              <EmptyState icon={<Building size={40} />}
                title={search ? 'Sin resultados' : 'Sin organizaciones'}
                description={search ? 'Intenta con otra busqueda' : 'Las clinicas registradas apareceran aqui'} />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Clinica</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Sucursales</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Usuarios</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase w-20">Ir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(org => {
                  const sub = org.subscriptions?.[0]
                  return (
                    <tr key={org.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Heart size={16} className="text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{org.name}</p>
                            <p className="text-xs text-slate-400">/{org.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={sub?.plan === 'enterprise' ? 'error' : sub?.plan === 'pro' ? 'info' : 'default'}>
                          {sub?.plan || 'free'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm">{org.stores?.length || 0}</td>
                      <td className="py-3 px-4 text-center text-sm">{org.users?.length || 0}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={sub?.status === 'active' ? 'success' : 'warning'}>
                          {sub?.status === 'active' ? 'Activo' : sub?.status || 'Sin plan'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <a href={`/app/${org.slug}/dashboard`} target="_blank" rel="noopener"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600 inline-block">
                          <ExternalLink size={16} />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
