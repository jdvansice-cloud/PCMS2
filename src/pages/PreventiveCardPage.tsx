import { useState, useMemo } from 'react'
import { Search, Plus, Syringe, Bug, ShieldCheck, PawPrint, Calendar, FlaskConical, Clock, User } from 'lucide-react'
import { usePreventiveTreatments, useCreatePreventive } from '../hooks/queries/usePreventive'
import { usePets } from '../hooks/queries/usePets'
import { useStaffUsers } from '../hooks/queries/useUsers'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatters'
import type { PreventiveType } from '../hooks/queries/usePreventive'

const TYPE_CONFIG: Record<PreventiveType, { label: string; icon: React.ReactNode; color: string; badge: string }> = {
  vaccine: { label: 'Vacuna', icon: <Syringe size={16} />, color: 'text-blue-600 bg-blue-100', badge: 'info' },
  deworming: { label: 'Desparasitacion', icon: <Bug size={16} />, color: 'text-purple-600 bg-purple-100', badge: 'default' },
  ectoparasite: { label: 'Ectoparasito', icon: <ShieldCheck size={16} />, color: 'text-emerald-600 bg-emerald-100', badge: 'success' },
}

export default function PreventiveCardPage() {
  const [typeFilter, setTypeFilter] = useState<PreventiveType | ''>('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { data: treatments = [], isLoading } = usePreventiveTreatments(undefined, typeFilter || undefined)

  const filtered = useMemo(() => {
    if (!search.trim()) return treatments
    const q = search.toLowerCase()
    return treatments.filter(t =>
      t.pet?.name?.toLowerCase().includes(q) ||
      t.product_name.toLowerCase().includes(q) ||
      t.laboratory?.toLowerCase().includes(q)
    )
  }, [search, treatments])

  const upcoming = useMemo(() => {
    const now = new Date()
    const in30d = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return treatments.filter(t => t.next_due_at && new Date(t.next_due_at) <= in30d && new Date(t.next_due_at) >= now)
  }, [treatments])

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Carnet Preventivo</h1>
          <p className="text-sm text-slate-500">{treatments.length} tratamientos registrados</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Nuevo Tratamiento</Button>
      </div>

      {/* Upcoming Alerts */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Calendar size={16} /> {upcoming.length} tratamiento{upcoming.length > 1 ? 's' : ''} por vencer en 30 dias
          </h3>
          <div className="flex flex-wrap gap-2">
            {upcoming.slice(0, 5).map(t => (
              <span key={t.id} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
                {t.pet?.name} — {t.product_name} ({formatDate(t.next_due_at!)})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por paciente, producto o laboratorio..." className="input pl-10" />
        </div>
        <div className="flex gap-2">
          {(['', 'vaccine', 'deworming', 'ectoparasite'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                t === typeFilter ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {t === '' ? 'Todos' : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Syringe size={48} />} title="Sin tratamientos"
          description="Registra el primer tratamiento preventivo"
          action={<Button onClick={() => setShowForm(true)} size="sm">Registrar</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const cfg = TYPE_CONFIG[t.type]
            const isOverdue = t.next_due_at && new Date(t.next_due_at) < new Date()
            return (
              <div key={t.id} className="card p-4 hover:shadow-soft transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{t.product_name}</span>
                      <Badge variant={cfg.badge as 'info' | 'default' | 'success'}>{cfg.label}</Badge>
                      {t.lot_number && <span className="text-xs text-slate-400">Lote: {t.lot_number}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <PawPrint size={12} /> {t.pet?.name}
                      {t.laboratory && <><span className="mx-1">·</span><FlaskConical size={12} /> {t.laboratory}</>}
                      {t.weight_at_treatment && <><span className="mx-1">·</span>{t.weight_at_treatment} kg</>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={12} />Aplicado: {formatDate(t.applied_at)}</span>
                      {t.next_due_at && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                          <Calendar size={12} />Proxima: {formatDate(t.next_due_at)} {isOverdue ? '(Vencido)' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && <NewPreventiveModal onClose={() => setShowForm(false)} />}
    </div>
  )
}

function NewPreventiveModal({ onClose }: { onClose: () => void }) {
  const create = useCreatePreventive()
  const { data: pets = [] } = usePets()
  const { data: vets = [] } = useStaffUsers('veterinarian')
  const { authUser } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({
    pet_id: '', type: 'vaccine' as PreventiveType, product_name: '', laboratory: '',
    lot_number: '', dose: '', weight_at_treatment: '',
    applied_at: new Date().toISOString().split('T')[0],
    next_due_at: '', notes: '',
  })
  const set = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({
        pet_id: form.pet_id, type: form.type, product_name: form.product_name,
        laboratory: form.laboratory || undefined, lot_number: form.lot_number || undefined,
        dose: form.dose || undefined,
        weight_at_treatment: form.weight_at_treatment ? parseFloat(form.weight_at_treatment) : undefined,
        applied_at: `${form.applied_at}T12:00:00`,
        next_due_at: form.next_due_at ? `${form.next_due_at}T12:00:00` : undefined,
        applied_by: authUser?.staffProfile?.id, notes: form.notes || undefined,
      })
      toast.success('Tratamiento registrado')
      onClose()
    } catch { toast.error('Error al registrar') }
  }

  return (
    <Modal open onClose={onClose} title="Nuevo Tratamiento Preventivo" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Paciente *</label>
            <select value={form.pet_id} onChange={e => set('pet_id', e.target.value)} required className="input text-sm">
              <option value="">Seleccionar...</option>
              {pets.map(p => <option key={p.id} value={p.id}>{p.name} — {p.owner?.first_name} {p.owner?.last_name || ''}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Tipo *</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="input text-sm">
              <option value="vaccine">Vacuna</option>
              <option value="deworming">Desparasitacion</option>
              <option value="ectoparasite">Ectoparasito</option>
            </select>
          </div>
          <Input label="Producto *" value={form.product_name} onChange={e => set('product_name', e.target.value)} required />
          <Input label="Laboratorio" value={form.laboratory} onChange={e => set('laboratory', e.target.value)} />
          <Input label="No. Lote" value={form.lot_number} onChange={e => set('lot_number', e.target.value)} />
          <Input label="Dosis" value={form.dose} onChange={e => set('dose', e.target.value)} placeholder="ej: 1ml" />
          <Input label="Peso (kg)" type="number" step="0.01" value={form.weight_at_treatment} onChange={e => set('weight_at_treatment', e.target.value)} />
          <Input label="Fecha aplicacion *" type="date" value={form.applied_at} onChange={e => set('applied_at', e.target.value)} required />
          <Input label="Proxima dosis" type="date" value={form.next_due_at} onChange={e => set('next_due_at', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={create.isPending}>Registrar</Button>
        </div>
      </form>
    </Modal>
  )
}
