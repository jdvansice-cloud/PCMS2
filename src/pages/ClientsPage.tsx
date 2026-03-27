import { useState, useMemo } from 'react'
import { Search, Plus, User, Phone, Mail, Eye, Edit, PawPrint, ChevronRight, X } from 'lucide-react'
import { useOwners, useCreateOwner, useUpdateOwner } from '../hooks/queries/useOwners'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/Toast'
import { formatPhone, getInitials } from '../utils/formatters'
import type { Owner } from '../hooks/queries/useOwners'

export default function ClientsPage() {
  const { data: owners = [], isLoading } = useOwners()
  const createOwner = useCreateOwner()
  const updateOwner = useUpdateOwner()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Owner | null>(null)
  const [selected, setSelected] = useState<Owner | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return owners
    const q = search.toLowerCase()
    return owners.filter(o => {
      const name = `${o.first_name} ${o.last_name || ''}`.toLowerCase()
      return name.includes(q) || o.phone?.includes(q) || o.email?.toLowerCase().includes(q)
    })
  }, [search, owners])

  const handleSave = async (data: Partial<Owner>) => {
    try {
      if (editing) {
        await updateOwner.mutateAsync({ id: editing.id, ...data })
        toast.success('Cliente actualizado')
      } else {
        await createOwner.mutateAsync(data)
        toast.success('Cliente creado')
      }
      setShowForm(false)
      setEditing(null)
    } catch {
      toast.error('Error al guardar el cliente')
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">{owners.length} clientes registrados</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }} icon={<Plus size={16} />}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, telefono o email..."
          className="input pl-10"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<User size={48} />}
          title={search ? 'Sin resultados' : 'Sin clientes'}
          description={search ? 'Intenta con otra busqueda' : 'Agrega tu primer cliente para comenzar'}
          action={!search ? <Button onClick={() => setShowForm(true)} size="sm">Agregar Cliente</Button> : undefined}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Telefono</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Email</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Mascotas</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(`${owner.first_name} ${owner.last_name || ''}`)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{owner.first_name} {owner.last_name}</p>
                          {owner.is_vip && <Badge variant="warning" className="mt-0.5">VIP</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {owner.phone ? (
                        <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" />{formatPhone(owner.phone)}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                      {owner.email ? (
                        <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" />{owner.email}</span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                        <PawPrint size={14} className="text-slate-400" />
                        {(owner.pets || []).length}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelected(owner)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Ver">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setEditing(owner); setShowForm(true) }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Editar">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <OwnerFormModal
          owner={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={handleSave}
          loading={createOwner.isPending || updateOwner.isPending}
        />
      )}

      {/* Detail Modal */}
      {selected && (
        <OwnerDetailModal
          owner={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setShowForm(true); setSelected(null) }}
        />
      )}
    </div>
  )
}

/* ======================== Form Modal ======================== */
function OwnerFormModal({ owner, onClose, onSave, loading }: {
  owner: Owner | null; onClose: () => void; onSave: (data: Partial<Owner>) => void; loading: boolean
}) {
  const [form, setForm] = useState({
    first_name: owner?.first_name || '',
    last_name: owner?.last_name || '',
    email: owner?.email || '',
    phone: owner?.phone || '',
    phone_whatsapp: owner?.phone_whatsapp || '',
    id_type: owner?.id_type || '',
    id_number: owner?.id_number || '',
    notes: owner?.notes || '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  return (
    <Modal open onClose={onClose} title={owner ? 'Editar Cliente' : 'Nuevo Cliente'} size="lg">
      <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
          <Input label="Apellido" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
          <Input label="Telefono" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <Input label="WhatsApp" type="tel" value={form.phone_whatsapp} onChange={e => set('phone_whatsapp', e.target.value)} />
          <Input label="Correo" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Tipo ID</label>
              <select value={form.id_type} onChange={e => set('id_type', e.target.value)} className="input text-sm">
                <option value="">—</option>
                <option value="ine">INE</option>
                <option value="curp">CURP</option>
                <option value="cedula">Cedula</option>
                <option value="passport">Pasaporte</option>
                <option value="ruc">RUC</option>
              </select>
            </div>
            <Input label="No. ID" value={form.id_number} onChange={e => set('id_number', e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Notas</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={2}
            className="input"
            placeholder="Notas adicionales..."
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{owner ? 'Guardar' : 'Crear Cliente'}</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ======================== Detail Modal ======================== */
function OwnerDetailModal({ owner, onClose, onEdit }: { owner: Owner; onClose: () => void; onEdit: () => void }) {
  return (
    <Modal open onClose={onClose} title={`${owner.first_name} ${owner.last_name || ''}`} size="lg">
      <div className="space-y-6">
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {owner.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-slate-400" />
              <span>{formatPhone(owner.phone)}</span>
            </div>
          )}
          {owner.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-slate-400" />
              <span>{owner.email}</span>
            </div>
          )}
        </div>

        {/* Pets */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <PawPrint size={16} className="text-primary-500" />
            Mascotas ({(owner.pets || []).length})
          </h3>
          {(owner.pets || []).length === 0 ? (
            <p className="text-sm text-slate-500">No tiene mascotas registradas</p>
          ) : (
            <div className="space-y-2">
              {(owner.pets || []).map(pet => (
                <div key={pet.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <PawPrint size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{pet.name}</p>
                    <p className="text-xs text-slate-500">{pet.species} {pet.breed ? `/ ${pet.breed}` : ''}</p>
                  </div>
                  <Badge variant={pet.condition === 'active' ? 'success' : 'error'}>
                    {pet.condition === 'active' ? 'Activo' : 'Finado'}
                  </Badge>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        {owner.notes && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Notas</h3>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{owner.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button onClick={onEdit} icon={<Edit size={16} />}>Editar</Button>
        </div>
      </div>
    </Modal>
  )
}
