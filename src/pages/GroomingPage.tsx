import { useState, useMemo } from 'react'
import { Plus, Scissors, GripVertical, PawPrint, User, Phone, ChevronDown, ChevronRight, Package, FileSignature } from 'lucide-react'
import { useGroomingSessions, useCreateGrooming, useUpdateGroomingStatus } from '../hooks/queries/useGrooming'
import { useOwners } from '../hooks/queries/useOwners'
import { usePets } from '../hooks/queries/usePets'
import { useStaffUsers } from '../hooks/queries/useUsers'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/Toast'
import { formatTime } from '../utils/formatters'
import type { GroomingSession, GroomingStatus } from '../hooks/queries/useGrooming'

const COLUMNS: { id: GroomingStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'Pendientes', color: 'bg-amber-100 text-amber-700' },
  { id: 'in_progress', title: 'En Progreso', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'completed', title: 'Completadas', color: 'bg-emerald-100 text-emerald-700' },
]
const NEXT: Record<string, GroomingStatus | null> = { pending: 'in_progress', in_progress: 'completed', completed: null }

export default function GroomingPage() {
  const { data: sessions = [], isLoading } = useGroomingSessions()
  const updateStatus = useUpdateGroomingStatus()
  const toast = useToast()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const byStatus = useMemo(() => {
    const g: Record<string, GroomingSession[]> = {}
    COLUMNS.forEach(c => { g[c.id] = sessions.filter(s => s.status === c.id) })
    return g
  }, [sessions])

  const handleDrop = async (targetStatus: GroomingStatus) => {
    if (!draggedId) return
    const s = sessions.find(x => x.id === draggedId)
    if (!s || s.status === targetStatus) { setDraggedId(null); return }
    try {
      await updateStatus.mutateAsync({ id: draggedId, status: targetStatus })
      toast.success(`Servicio movido a ${COLUMNS.find(c => c.id === targetStatus)?.title}`)
    } catch { toast.error('Error al actualizar') }
    setDraggedId(null)
  }

  const moveNext = async (s: GroomingSession) => {
    const next = NEXT[s.status]
    if (!next) return
    try {
      await updateStatus.mutateAsync({ id: s.id, status: next })
      if (next === 'completed') toast.success('Servicio completado')
    } catch { toast.error('Error') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-1 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Estetica</h1>
          <p className="text-sm text-slate-500">{sessions.filter(s => s.status !== 'completed').length} servicios activos</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Nuevo Servicio</Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map(col => (
            <div key={col.id}
              className={`w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-2xl transition-colors ${draggedId ? 'ring-2 ring-primary-500/30 bg-primary-50/30' : ''}`}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
              onDrop={e => { e.preventDefault(); handleDrop(col.id) }}>
              <div className="p-3 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">{col.title}</h3>
                  <span className={`badge ${col.color}`}>{(byStatus[col.id] || []).length}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                {(byStatus[col.id] || []).map(session => (
                  <GroomingCard key={session.id} session={session}
                    onDragStart={() => setDraggedId(session.id)} onDragEnd={() => setDraggedId(null)}
                    onMoveNext={() => moveNext(session)} hasNext={!!NEXT[session.status]} />
                ))}
                {(byStatus[col.id] || []).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Package className="w-8 h-8 mb-2 opacity-50" /><p className="text-xs">Sin servicios</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && <NewGroomingModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

function GroomingCard({ session, onDragStart, onDragEnd, onMoveNext, hasNext }: {
  session: GroomingSession; onDragStart: () => void; onDragEnd: () => void; onMoveNext: () => void; hasNext: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
      className="bg-white rounded-xl shadow-card border border-slate-200/50 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-soft transition-shadow">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 text-sm">{session.pet?.name}</span>
              <p className="text-xs text-slate-500 capitalize">{session.pet?.species} {session.pet?.breed ? `· ${session.pet.breed}` : ''}</p>
            </div>
          </div>
          <Badge variant="info">{session.service_type}</Badge>
        </div>
        {session.owner && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <User size={12} /> {session.owner.first_name} {session.owner.last_name || ''}
            {session.owner.phone && <span className="ml-auto flex items-center gap-1"><Phone size={11} />{session.owner.phone}</span>}
          </div>
        )}
        {session.groomer && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-primary-600"><Scissors size={12} /> {session.groomer.full_name}</div>
        )}
        {session.special_instructions && (
          <div className="mt-2 text-xs text-slate-500 bg-amber-50 border border-amber-100 rounded px-2 py-1 line-clamp-2">{session.special_instructions}</div>
        )}
        {session.waiver_signed_at && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600"><FileSignature size={12} /> Responsiva firmada</div>
        )}
      </div>
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 bg-slate-50 text-xs text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
        {expanded ? 'Menos' : 'Mas'}<ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-100 animate-slide-up">
          {session.observations && <p className="text-xs text-slate-600 mb-2 bg-slate-50 rounded p-2">{session.observations}</p>}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-slate-50 rounded-lg p-2"><p className="text-slate-400">Comision</p><p className="font-semibold text-slate-700">{session.commission_rate ? `${session.commission_rate}%` : '—'}</p></div>
            <div className="bg-slate-50 rounded-lg p-2"><p className="text-slate-400">Hora</p><p className="font-semibold text-slate-700">{formatTime(session.created_at)}</p></div>
          </div>
          {hasNext && (
            <button onClick={onMoveNext} className="w-full btn-primary text-xs py-2">
              {session.status === 'pending' ? 'Iniciar Servicio' : 'Completar'}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function NewGroomingModal({ onClose }: { onClose: () => void }) {
  const create = useCreateGrooming()
  const { data: owners = [] } = useOwners()
  const { data: pets = [] } = usePets()
  const { data: groomers = [] } = useStaffUsers('groomer')
  const toast = useToast()
  const [form, setForm] = useState({ owner_id: '', pet_id: '', groomer_id: '', service_type: 'Baño completo', special_instructions: '', observations: '' })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))
  const ownerPets = useMemo(() => pets.filter(p => p.owner_id === form.owner_id), [form.owner_id, pets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({
        owner_id: form.owner_id, pet_id: form.pet_id,
        groomer_id: form.groomer_id || undefined,
        service_type: form.service_type,
        special_instructions: form.special_instructions || undefined,
        observations: form.observations || undefined, status: 'pending',
      })
      toast.success('Servicio creado')
      onClose()
    } catch { toast.error('Error al crear') }
  }

  return (
    <Modal open onClose={onClose} title="Nuevo Servicio de Estetica" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Propietario *</label>
          <select value={form.owner_id} onChange={e => { set('owner_id', e.target.value); set('pet_id', '') }} required className="input text-sm">
            <option value="">Seleccionar...</option>
            {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name || ''}</option>)}
          </select>
        </div>
        {form.owner_id && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Mascota *</label>
            <select value={form.pet_id} onChange={e => set('pet_id', e.target.value)} required className="input text-sm">
              <option value="">Seleccionar...</option>
              {ownerPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Servicio *</label>
            <select value={form.service_type} onChange={e => set('service_type', e.target.value)} className="input text-sm">
              {['Baño completo', 'Baño y corte', 'Corte de uñas', 'Limpieza dental', 'Deslanado', 'Baño medicado', 'Otro'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Estilista</label>
            <select value={form.groomer_id} onChange={e => set('groomer_id', e.target.value)} className="input text-sm">
              <option value="">Sin asignar</option>
              {groomers.map(g => <option key={g.id} value={g.id}>{g.full_name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Instrucciones especiales</label>
          <textarea value={form.special_instructions} onChange={e => set('special_instructions', e.target.value)} rows={2} className="input" placeholder="Mascota agresiva, corte especifico, etc." />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={create.isPending}>Crear Servicio</Button>
        </div>
      </form>
    </Modal>
  )
}
