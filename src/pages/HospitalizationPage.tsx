import { useState, useMemo } from 'react'
import { Plus, Hotel, PawPrint, User, Phone, Clock, Activity, LogOut, ClipboardList, Stethoscope } from 'lucide-react'
import { useKennelStays, useCreateKennelStay, useDischargeKennel, useCreateDailyLog } from '../hooks/queries/useHospitalization'
import { useOwners } from '../hooks/queries/useOwners'
import { usePets } from '../hooks/queries/usePets'
import { useStaffUsers } from '../hooks/queries/useUsers'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/Toast'
import { formatDate, formatRelativeTime, formatCurrency } from '../utils/formatters'
import type { KennelStay, StayType } from '../hooks/queries/useHospitalization'

const TYPE_LABELS: Record<StayType, { label: string; color: string }> = {
  hospitalization: { label: 'Hospitalizacion', color: 'error' },
  boarding: { label: 'Pension', color: 'info' },
  pension: { label: 'Guarderia', color: 'warning' },
}

export default function HospitalizationPage() {
  const { data: stays = [], isLoading } = useKennelStays()
  const discharge = useDischargeKennel()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [showLog, setShowLog] = useState<KennelStay | null>(null)

  const handleDischarge = async (stay: KennelStay) => {
    if (!confirm(`¿Dar de alta a ${stay.pet?.name}?`)) return
    try {
      await discharge.mutateAsync(stay.id)
      toast.success(`${stay.pet?.name} dado de alta`)
    } catch { toast.error('Error al dar de alta') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Hospitalizacion</h1>
          <p className="text-sm text-slate-500">{stays.length} pacientes internados</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Nuevo Ingreso</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['hospitalization', 'boarding', 'pension'] as StayType[]).map(type => {
          const count = stays.filter(s => s.type === type).length
          const cfg = TYPE_LABELS[type]
          return (
            <div key={type} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{cfg.label}</span>
                <Badge variant={cfg.color as 'error' | 'info' | 'warning'}>{count}</Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Grid of Kennels / Stays */}
      {stays.length === 0 ? (
        <EmptyState icon={<Hotel size={48} />} title="Sin pacientes internados"
          description="Registra un nuevo ingreso para comenzar"
          action={<Button onClick={() => setShowForm(true)} size="sm">Nuevo Ingreso</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stays.map(stay => {
            const cfg = TYPE_LABELS[stay.type]
            const daysIn = Math.ceil((new Date().getTime() - new Date(stay.admitted_at).getTime()) / (1000 * 60 * 60 * 24))
            return (
              <div key={stay.id} className="card p-4 border-l-4" style={{ borderLeftColor: stay.type === 'hospitalization' ? '#EF4444' : stay.type === 'boarding' ? '#3B82F6' : '#F59E0B' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <PawPrint size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{stay.pet?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{stay.pet?.species} {stay.pet?.breed ? `· ${stay.pet.breed}` : ''}</p>
                    </div>
                  </div>
                  <Badge variant={cfg.color as 'error' | 'info' | 'warning'}>{cfg.label}</Badge>
                </div>

                {stay.kennel_number && (
                  <div className="text-xs bg-slate-50 rounded-lg px-2 py-1.5 mb-2 font-medium text-slate-600">
                    Jaula: {stay.kennel_number}
                  </div>
                )}

                {stay.owner && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <User size={12} /> {stay.owner.first_name} {stay.owner.last_name || ''}
                    {stay.owner.phone && <span className="ml-auto flex items-center gap-1"><Phone size={11} />{stay.owner.phone}</span>}
                  </div>
                )}

                {stay.veterinarian && (
                  <div className="flex items-center gap-1.5 text-xs text-primary-600 mb-2">
                    <Stethoscope size={12} /> Dr. {stay.veterinarian.full_name}
                  </div>
                )}

                {stay.reason && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{stay.reason}</p>}

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400">Dias</p>
                    <p className="font-bold text-slate-700">{daysIn}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400">Cargo</p>
                    <p className="font-bold text-slate-700">{formatCurrency(stay.total_charged)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowLog(stay)}
                    icon={<ClipboardList size={14} />}>Log</Button>
                  <Button size="sm" variant="danger" className="flex-1" onClick={() => handleDischarge(stay)}
                    icon={<LogOut size={14} />}>Alta</Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && <NewStayModal onClose={() => setShowForm(false)} />}
      {showLog && <DailyLogModal stay={showLog} onClose={() => setShowLog(null)} />}
    </div>
  )
}

function NewStayModal({ onClose }: { onClose: () => void }) {
  const create = useCreateKennelStay()
  const { data: owners = [] } = useOwners()
  const { data: pets = [] } = usePets()
  const { data: vets = [] } = useStaffUsers('veterinarian')
  const toast = useToast()
  const [form, setForm] = useState({ owner_id: '', pet_id: '', veterinarian_id: '', kennel_number: '', type: 'hospitalization' as StayType, reason: '', diagnosis: '', daily_rate: '' })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))
  const ownerPets = useMemo(() => pets.filter(p => p.owner_id === form.owner_id), [form.owner_id, pets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({
        owner_id: form.owner_id, pet_id: form.pet_id,
        veterinarian_id: form.veterinarian_id || undefined,
        kennel_number: form.kennel_number || undefined, type: form.type,
        reason: form.reason || undefined, diagnosis: form.diagnosis || undefined,
        daily_rate: form.daily_rate ? parseFloat(form.daily_rate) : undefined,
        status: 'active',
      })
      toast.success('Paciente ingresado')
      onClose()
    } catch { toast.error('Error al registrar ingreso') }
  }

  return (
    <Modal open onClose={onClose} title="Nuevo Ingreso" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <option value="">Seleccionar...</option>
                {ownerPets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Tipo *</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="input text-sm">
              <option value="hospitalization">Hospitalizacion</option>
              <option value="boarding">Pension</option>
              <option value="pension">Guarderia</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Veterinario</label>
            <select value={form.veterinarian_id} onChange={e => set('veterinarian_id', e.target.value)} className="input text-sm">
              <option value="">Sin asignar</option>
              {vets.map(v => <option key={v.id} value={v.id}>Dr. {v.full_name}</option>)}
            </select>
          </div>
          <Input label="Jaula / Kennel" value={form.kennel_number} onChange={e => set('kennel_number', e.target.value)} placeholder="ej: K-01" />
          <Input label="Tarifa diaria ($)" type="number" step="0.01" value={form.daily_rate} onChange={e => set('daily_rate', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Motivo</label>
          <textarea value={form.reason} onChange={e => set('reason', e.target.value)} rows={2} className="input" placeholder="Motivo de internamiento..." />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Diagnostico</label>
          <textarea value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} rows={2} className="input" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={create.isPending}>Registrar Ingreso</Button>
        </div>
      </form>
    </Modal>
  )
}

function DailyLogModal({ stay, onClose }: { stay: KennelStay; onClose: () => void }) {
  const createLog = useCreateDailyLog()
  const toast = useToast()
  const [form, setForm] = useState({ feeding: '', medication: '', behavior: '', notes: '', temperature: '', heart_rate: '' })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createLog.mutateAsync({
        kennel_stay_id: stay.id,
        vital_signs: {
          temperature: form.temperature ? parseFloat(form.temperature) : null,
          heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
        },
        feeding: form.feeding || undefined, medication: form.medication || undefined,
        behavior: form.behavior || undefined, notes: form.notes || undefined,
      })
      toast.success('Log registrado')
      setForm({ feeding: '', medication: '', behavior: '', notes: '', temperature: '', heart_rate: '' })
    } catch { toast.error('Error al guardar log') }
  }

  return (
    <Modal open onClose={onClose} title={`Log Diario — ${stay.pet?.name}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Temp. (°C)" type="number" step="0.1" value={form.temperature} onChange={e => set('temperature', e.target.value)} />
          <Input label="FC (bpm)" type="number" value={form.heart_rate} onChange={e => set('heart_rate', e.target.value)} />
        </div>
        <div className="space-y-1"><label className="block text-sm font-medium text-slate-700">Alimentacion</label>
          <textarea value={form.feeding} onChange={e => set('feeding', e.target.value)} rows={2} className="input" placeholder="Registro de alimentacion..." /></div>
        <div className="space-y-1"><label className="block text-sm font-medium text-slate-700">Medicacion</label>
          <textarea value={form.medication} onChange={e => set('medication', e.target.value)} rows={2} className="input" placeholder="Medicamentos administrados..." /></div>
        <div className="space-y-1"><label className="block text-sm font-medium text-slate-700">Comportamiento</label>
          <textarea value={form.behavior} onChange={e => set('behavior', e.target.value)} rows={2} className="input" /></div>
        <div className="space-y-1"><label className="block text-sm font-medium text-slate-700">Notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input" /></div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cerrar</Button>
          <Button type="submit" loading={createLog.isPending}>Guardar Log</Button>
        </div>
      </form>
    </Modal>
  )
}
