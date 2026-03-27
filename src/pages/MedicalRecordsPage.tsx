import { useState, useMemo } from 'react'
import {
  Search, Plus, Stethoscope, FileText, Clock, PawPrint,
  User, ChevronRight, Heart, Thermometer, Eye,
} from 'lucide-react'
import { useMedicalRecords, useCreateMedicalRecord, useUpdateMedicalRecord } from '../hooks/queries/useMedicalRecords'
import { usePets } from '../hooks/queries/usePets'
import { useStaffUsers } from '../hooks/queries/useUsers'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/Toast'
import { formatDate, formatDateTime } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import type { MedicalRecord } from '../hooks/queries/useMedicalRecords'

export default function MedicalRecordsPage() {
  const { data: records = [], isLoading } = useMedicalRecords()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState<MedicalRecord | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      r.pet?.name?.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q) ||
      r.veterinarian?.full_name?.toLowerCase().includes(q)
    )
  }, [search, records])

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Consultas</h1>
          <p className="text-sm text-slate-500">{records.length} registros medicos</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Nueva Consulta</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por paciente, diagnostico o veterinario..." className="input pl-10" />
      </div>

      {/* Records List */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Stethoscope size={48} />} title="Sin registros"
          description="Crea una nueva consulta para comenzar el expediente clinico"
          action={<Button onClick={() => setShowForm(true)} size="sm">Nueva Consulta</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(record => (
            <div key={record.id}
              className="card p-4 hover:shadow-soft transition-shadow cursor-pointer"
              onClick={() => setViewing(record)}
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Stethoscope size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{record.pet?.name}</span>
                    <span className="text-xs text-slate-400 capitalize">{record.pet?.species}</span>
                    {record.is_draft && <Badge variant="warning">Borrador</Badge>}
                  </div>
                  {record.diagnosis && (
                    <p className="text-sm text-slate-600 line-clamp-1">{record.diagnosis}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    {record.veterinarian && (
                      <span className="flex items-center gap-1"><User size={12} />Dr. {record.veterinarian.full_name}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock size={12} />{formatDate(record.created_at)}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0 mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Record Modal */}
      {showForm && <NewRecordModal onClose={() => setShowForm(false)} />}

      {/* View Record Modal */}
      {viewing && <ViewRecordModal record={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

/* ======================== New Record Modal ======================== */
function NewRecordModal({ onClose }: { onClose: () => void }) {
  const createRecord = useCreateMedicalRecord()
  const { data: pets = [] } = usePets()
  const { data: vets = [] } = useStaffUsers('veterinarian')
  const { authUser } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({
    pet_id: '',
    veterinarian_id: authUser?.staffProfile?.id || '',
    temperature: '',
    heart_rate: '',
    weight: '',
    respiratory_rate: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRecord.mutateAsync({
        pet_id: form.pet_id,
        veterinarian_id: form.veterinarian_id || undefined,
        vital_signs: {
          temperature: form.temperature ? parseFloat(form.temperature) : null,
          heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
          weight: form.weight ? parseFloat(form.weight) : null,
          respiratory_rate: form.respiratory_rate ? parseInt(form.respiratory_rate) : null,
        },
        examination: form.examination || undefined,
        diagnosis: form.diagnosis || undefined,
        treatment: form.treatment || undefined,
        notes: form.notes || undefined,
        is_draft: false,
      })
      toast.success('Consulta registrada')
      onClose()
    } catch {
      toast.error('Error al guardar la consulta')
    }
  }

  return (
    <Modal open onClose={onClose} title="Nueva Consulta" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient + Vet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Paciente *</label>
            <select value={form.pet_id} onChange={e => set('pet_id', e.target.value)} required className="input text-sm">
              <option value="">Seleccionar...</option>
              {pets.map(p => <option key={p.id} value={p.id}>{p.name} — {p.owner?.first_name} {p.owner?.last_name || ''}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Veterinario</label>
            <select value={form.veterinarian_id} onChange={e => set('veterinarian_id', e.target.value)} className="input text-sm">
              <option value="">Seleccionar...</option>
              {vets.map(v => <option key={v.id} value={v.id}>Dr. {v.full_name}</option>)}
            </select>
          </div>
        </div>

        {/* Vital Signs */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Heart size={16} className="text-red-500" /> Signos Vitales
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input label="Temp. (°C)" type="number" step="0.1" value={form.temperature} onChange={e => set('temperature', e.target.value)} placeholder="38.5" />
            <Input label="FC (bpm)" type="number" value={form.heart_rate} onChange={e => set('heart_rate', e.target.value)} placeholder="120" />
            <Input label="Peso (kg)" type="number" step="0.01" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="5.00" />
            <Input label="FR (rpm)" type="number" value={form.respiratory_rate} onChange={e => set('respiratory_rate', e.target.value)} placeholder="20" />
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Examen Clinico</label>
            <textarea value={form.examination} onChange={e => set('examination', e.target.value)} rows={3} className="input"
              placeholder="Descripcion del examen fisico..." />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Diagnostico</label>
            <textarea value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} rows={2} className="input"
              placeholder="Diagnostico presuntivo o definitivo..." />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Tratamiento</label>
            <textarea value={form.treatment} onChange={e => set('treatment', e.target.value)} rows={3} className="input"
              placeholder="Plan de tratamiento, medicamentos, indicaciones..." />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Notas Adicionales</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input"
              placeholder="Observaciones, seguimiento..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={createRecord.isPending}>Guardar Consulta</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ======================== View Record Modal ======================== */
function ViewRecordModal({ record, onClose }: { record: MedicalRecord; onClose: () => void }) {
  const vs = record.vital_signs as Record<string, number | null> || {}

  return (
    <Modal open onClose={onClose} title={`Consulta — ${record.pet?.name || 'Paciente'}`} size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Stethoscope size={22} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{record.pet?.name}</p>
            <p className="text-sm text-slate-500 capitalize">{record.pet?.species} {record.pet?.breed ? `· ${record.pet.breed}` : ''}</p>
            <p className="text-xs text-slate-400">{formatDateTime(record.created_at)}{record.veterinarian ? ` — Dr. ${record.veterinarian.full_name}` : ''}</p>
          </div>
        </div>

        {/* Vital Signs */}
        {(vs.temperature || vs.heart_rate || vs.weight || vs.respiratory_rate) && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Signos Vitales</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Temperatura', value: vs.temperature ? `${vs.temperature}°C` : '—', icon: <Thermometer size={14} /> },
                { label: 'Frec. Cardiaca', value: vs.heart_rate ? `${vs.heart_rate} bpm` : '—', icon: <Heart size={14} /> },
                { label: 'Peso', value: vs.weight ? `${vs.weight} kg` : '—', icon: <PawPrint size={14} /> },
                { label: 'Frec. Resp.', value: vs.respiratory_rate ? `${vs.respiratory_rate} rpm` : '—', icon: <Eye size={14} /> },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">{item.icon}<span className="text-xs">{item.label}</span></div>
                  <p className="text-sm font-semibold text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Data */}
        {[
          { label: 'Examen Clinico', value: record.examination },
          { label: 'Diagnostico', value: record.diagnosis },
          { label: 'Tratamiento', value: record.treatment },
          { label: 'Notas', value: record.notes },
        ].filter(s => s.value).map(section => (
          <div key={section.label}>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{section.label}</h3>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{section.value}</p>
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  )
}
