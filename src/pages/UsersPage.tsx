import { useState, useMemo } from 'react'
import { Search, Plus, UserCog, Shield, Edit, ToggleLeft, ToggleRight } from 'lucide-react'
import { useStaffUsers } from '../hooks/queries/useUsers'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/Toast'
import { getInitials } from '../utils/formatters'
import { supabase, isConfigured } from '../lib/supabase'
import { useTenant } from '../context/TenantContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const ROLE_LABELS: Record<string, { label: string; color: 'info' | 'success' | 'warning' | 'error' }> = {
  admin: { label: 'Administrador', color: 'error' },
  veterinarian: { label: 'Veterinario', color: 'info' },
  groomer: { label: 'Estilista', color: 'warning' },
  receptionist: { label: 'Recepcionista', color: 'success' },
}

export default function UsersPage() {
  const { data: users = [], isLoading } = useStaffUsers()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [search, users])

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500">{users.length} usuarios registrados</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Nuevo Usuario</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..." className="input pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<UserCog size={48} />} title="Sin usuarios"
          description="Agrega el primer usuario del equipo"
          action={<Button onClick={() => setShowForm(true)} size="sm">Agregar</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(user => {
            const roleConfig = ROLE_LABELS[user.role] || { label: user.role, color: 'default' as const }
            return (
              <div key={user.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {getInitials(user.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={roleConfig.color}>{roleConfig.label}</Badge>
                      {user.is_active ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="default">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                </div>
                {(user.commission_rate || user.license_number) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    {user.commission_rate && (
                      <div><span className="text-slate-400">Comision:</span> <span className="font-medium">{user.commission_rate}%</span></div>
                    )}
                    {user.license_number && (
                      <div><span className="text-slate-400">Cedula Prof:</span> <span className="font-medium">{user.license_number}</span></div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && <NewUserModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

function NewUserModal({ onClose }: { onClose: () => void }) {
  const { activeStore, company } = useTenant()
  const qc = useQueryClient()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '', email: '', role: 'receptionist', phone: '',
    commission_rate: '', license_number: '',
  })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfigured) { toast.info('Conecta Supabase para crear usuarios'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('users').insert({
        full_name: form.full_name, email: form.email, role: form.role,
        phone: form.phone || undefined,
        commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : undefined,
        license_number: form.license_number || undefined,
        store_id: activeStore?.id, company_id: company?.id, is_active: true,
      })
      if (error) throw error
      qc.invalidateQueries({ queryKey: ['staff_users'] })
      toast.success('Usuario creado')
      onClose()
    } catch { toast.error('Error al crear usuario') }
    finally { setLoading(false) }
  }

  return (
    <Modal open onClose={onClose} title="Nuevo Usuario" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre completo *" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
        <Input label="Correo electronico *" type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Rol *</label>
            <select value={form.role} onChange={e => set('role', e.target.value)} className="input text-sm">
              <option value="admin">Administrador</option>
              <option value="veterinarian">Veterinario</option>
              <option value="groomer">Estilista</option>
              <option value="receptionist">Recepcionista</option>
            </select>
          </div>
          <Input label="Telefono" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Comision (%)" type="number" step="0.01" value={form.commission_rate} onChange={e => set('commission_rate', e.target.value)} />
          <Input label="Cedula profesional" value={form.license_number} onChange={e => set('license_number', e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Crear Usuario</Button>
        </div>
      </form>
    </Modal>
  )
}
