import { useState, useMemo } from 'react'
import {
  Calendar, Plus, GripVertical, Clock, PawPrint, User,
  ChevronDown, ChevronRight, Package, Phone, Stethoscope,
} from 'lucide-react'
import { useAppointments, useCreateAppointment, useUpdateAppointmentStatus } from '../hooks/queries/useAppointments'
import { useOwners } from '../hooks/queries/useOwners'
import { usePets } from '../hooks/queries/usePets'
import { useStaffUsers } from '../hooks/queries/useUsers'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/Toast'
import { formatTime, formatRelativeTime } from '../utils/formatters'
import type { Appointment, AppointmentStatus } from '../hooks/queries/useAppointments'

const KANBAN_COLUMNS: { id: AppointmentStatus; title: string; color: string }[] = [
  { id: 'scheduled', title: 'Programadas', color: 'bg-blue-100 text-blue-700' },
  { id: 'in_progress', title: 'En Progreso', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'completed', title: 'Completadas', color: 'bg-emerald-100 text-emerald-700' },
]

const STATUS_FLOW: Record<string, AppointmentStatus | null> = {
  scheduled: 'in_progress',
  waiting: 'in_progress',
  in_progress: 'completed',
  completed: null,
}

export default function AppointmentsPage() {
  const today = new Date().toISOString().split('T')[0]
  const [dateFilter, setDateFilter] = useState(today)
  const { data: appointments = [], isLoading } = useAppointments(dateFilter)
  const updateStatus = useUpdateAppointmentStatus()
  const toast = useToast()

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const byStatus = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {}
    KANBAN_COLUMNS.forEach(col => {
      grouped[col.id] = appointments
        .filter(a => a.status === col.id || (col.id === 'scheduled' && a.status === 'waiting'))
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    })
    return grouped
  }, [appointments])

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDragEnd = () => setDraggedId(null)

  const handleDrop = async (targetStatus: AppointmentStatus) => {
    if (!draggedId) return
    const appt = appointments.find(a => a.id === draggedId)
    if (!appt || appt.status === targetStatus) { setDraggedId(null); return }
    try {
      await updateStatus.mutateAsync({ id: draggedId, status: targetStatus })
      toast.success(`Cita movida a ${KANBAN_COLUMNS.find(c => c.id === targetStatus)?.title}`)
    } catch {
      toast.error('Error al actualizar la cita')
    }
    setDraggedId(null)
  }

  const moveToNext = async (appt: Appointment) => {
    const next = STATUS_FLOW[appt.status]
    if (!next) return
    try {
      await updateStatus.mutateAsync({ id: appt.id, status: next })
      toast.success(`Cita movida a ${KANBAN_COLUMNS.find(c => c.id === next)?.title}`)
    } catch {
      toast.error('Error al mover la cita')
    }
  }

  const inProgressCount = appointments.filter(a => ['scheduled', 'waiting', 'in_progress'].includes(a.status)).length

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Citas</h1>
          <p className="text-sm text-slate-500">{inProgressCount} citas activas hoy</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="input w-auto text-sm" />
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Nueva Cita</Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-4 h-full min-w-max">
          {KANBAN_COLUMNS.map(column => (
            <div
              key={column.id}
              className={`w-80 flex-shrink-0 flex flex-col bg-slate-100/50 rounded-2xl transition-colors ${
                draggedId && draggedId !== column.id ? 'ring-2 ring-primary-500/30 bg-primary-50/30' : ''
              }`}
              onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
              onDrop={e => { e.preventDefault(); handleDrop(column.id) }}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-700">{column.title}</h3>
                  <span className={`badge ${column.color}`}>{(byStatus[column.id] || []).length}</span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                {(byStatus[column.id] || []).map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onDragStart={() => handleDragStart(appt.id)}
                    onDragEnd={handleDragEnd}
                    onMoveNext={() => moveToNext(appt)}
                    hasNext={!!STATUS_FLOW[appt.status]}
                  />
                ))}
                {(byStatus[column.id] || []).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Package className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Sin citas</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showForm && <NewAppointmentModal onClose={() => setShowForm(false)} dateFilter={dateFilter} />}
    </div>
  )
}

/* ======================== Appointment Card ======================== */
function AppointmentCard({ appointment, onDragStart, onDragEnd, onMoveNext, hasNext }: {
  appointment: Appointment; onDragStart: () => void; onDragEnd: () => void
  onMoveNext: () => void; hasNext: boolean
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-white rounded-xl shadow-card border border-slate-200/50 overflow-hidden cursor-grab active:cursor-grabbing hover:shadow-soft transition-shadow"
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{appointment.pet?.name || 'Paciente'}</span>
                {appointment.status === 'waiting' && <Badge variant="warning">En espera</Badge>}
              </div>
              <p className="text-xs text-slate-500 capitalize">{appointment.pet?.species} {appointment.pet?.breed ? `· ${appointment.pet.breed}` : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-600">{formatTime(appointment.scheduled_at)}</p>
            <p className="text-[10px] text-slate-400">{appointment.type || 'Consulta'}</p>
          </div>
        </div>

        {/* Owner */}
        {appointment.owner && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <User size={12} className="text-slate-400" />
            {appointment.owner.first_name} {appointment.owner.last_name || ''}
            {appointment.owner.phone && (
              <span className="ml-auto flex items-center gap-1"><Phone size={11} />{appointment.owner.phone}</span>
            )}
          </div>
        )}

        {/* Vet */}
        {appointment.veterinarian && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-primary-600">
            <Stethoscope size={12} /> Dr. {appointment.veterinarian.full_name}
          </div>
        )}

        {appointment.notes && (
          <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1 line-clamp-2">{appointment.notes}</div>
        )}
      </div>

      {/* Expand */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-1.5 bg-slate-50 text-xs text-slate-500 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1">
        {expanded ? 'Menos' : 'Mas'}
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-100 animate-slide-up">
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-400">Llegada</p>
              <p className="font-semibold text-slate-700">{appointment.arrived_at ? formatTime(appointment.arrived_at) : 'Pendiente'}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-slate-400">Inicio</p>
              <p className="font-semibold text-slate-700">{appointment.started_at ? formatTime(appointment.started_at) : 'Pendiente'}</p>
            </div>
          </div>
          {hasNext && (
            <button onClick={onMoveNext} className="w-full btn-primary text-xs py-2">
              {appointment.status === 'scheduled' ? 'Iniciar Consulta' : 'Completar'}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ======================== New Appointment Modal ======================== */
function NewAppointmentModal({ onClose, dateFilter }: { onClose: () => void; dateFilter: string }) {
  const createAppt = useCreateAppointment()
  const { data: owners = [] } = useOwners()
  const { data: pets = [] } = usePets()
  const { data: vets = [] } = useStaffUsers('veterinarian')
  const toast = useToast()

  const [form, setForm] = useState({
    owner_id: '',
    pet_id: '',
    veterinarian_id: '',
    type: 'consulta',
    date: dateFilter,
    time: '09:00',
    notes: '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const ownerPets = useMemo(() => pets.filter(p => p.owner_id === form.owner_id), [form.owner_id, pets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAppt.mutateAsync({
        owner_id: form.owner_id,
        pet_id: form.pet_id,
        veterinarian_id: form.veterinarian_id || undefined,
        type: form.type,
        scheduled_at: `${form.date}T${form.time}:00`,
        notes: form.notes || undefined,
        status: 'scheduled',
      })
      toast.success('Cita creada')
      onClose()
    } catch {
      toast.error('Error al crear la cita')
    }
  }

  return (
    <Modal open onClose={onClose} title="Nueva Cita" size="md">
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
            <label className="block text-sm font-medium text-slate-700">Paciente *</label>
            <select value={form.pet_id} onChange={e => set('pet_id', e.target.value)} required className="input text-sm">
              <option value="">Seleccionar mascota...</option>
              {ownerPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha *" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
          <Input label="Hora *" type="time" value={form.time} onChange={e => set('time', e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Tipo</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="input text-sm">
              <option value="consulta">Consulta</option>
              <option value="vacunacion">Vacunacion</option>
              <option value="cirugia">Cirugia</option>
              <option value="estetica">Estetica</option>
              <option value="urgencia">Urgencia</option>
              <option value="revision">Revision</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Veterinario</label>
            <select value={form.veterinarian_id} onChange={e => set('veterinarian_id', e.target.value)} className="input text-sm">
              <option value="">Sin asignar</option>
              {vets.map(v => <option key={v.id} value={v.id}>Dr. {v.full_name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input" placeholder="Motivo de la cita..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={createAppt.isPending}>Agendar Cita</Button>
        </div>
      </form>
    </Modal>
  )
}
