import { useState, useMemo } from 'react'
import { Search, Plus, FlaskConical, Clock, PawPrint, User, FileText, Eye, ChevronRight, Package, CheckCircle } from 'lucide-react'
import { useLabStudies, useCreateLabStudy, useUpdateLabStudy } from '../hooks/queries/useLaboratory'
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
import { formatDate, formatDateTime } from '../utils/formatters'
import type { LabStudy, LabStatus } from '../hooks/queries/useLaboratory'

const STATUS_CONFIG: Record<LabStatus, { label: string; badge: 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Pendiente', badge: 'warning' },
  in_progress: { label: 'En Proceso', badge: 'info' },
  completed: { label: 'Completado', badge: 'success' },
}

const KANBAN_COLS: { id: LabStatus; title: string; color: string }[] = [
  { id: 'pending', title: 'Pendientes', color: 'bg-amber-100 text-amber-700' },
  { id: 'in_progress', title: 'En Proceso', color: 'bg-blue-100 text-blue-700' },
  { id: 'completed', title: 'Completados', color: 'bg-emerald-100 text-emerald-700' },
]

const NEXT_STATUS: Record<string, LabStatus | null> = { pending: 'in_progress', in_progress: 'completed', completed: null }

export default function LaboratoryPage() {
  const { data: studies = [], isLoading } = useLabStudies()
  const updateStudy = useUpdateLabStudy()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [viewing, setViewing] = useState<LabStudy | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const byStatus = useMemo(() => {
    const g: Record<string, LabStudy[]> = {}
    KANBAN_COLS.forEach(c => { g[c.id] = studies.filter(s => s.status === c.id) })
    return g
  }, [studies])

  const handleDrop = async (targetStatus: LabStatus) => {
    if (!draggedId) return
    const study = studies.find(s => s.id === draggedId)
    if (!study || study.status === targetStatus) { setDraggedId(null); return }
    try {
      const updates: Partial<LabStudy> = { id: draggedId, status: targetStatus }
      if (targetStatus === 'completed') updates.completed_at = new Date().toISOString()
      await updateStudy.mutateAsync(updates as LabStudy & { id: string })
      toast.success(`Estudio movido a ${KANBAN_COLS.find(c => c.id === targetStatus)?.title}`)
    } catch { toast.error('Error al actualizar') }
    setDraggedId(null)
  }

  const moveNext = async (study: LabStudy) => {
    const next = NEXT_STATUS[study.status]
    if (!next) return
    try {
      const updates: Partial<LabStudy> & { id: string } = { id: study.id, status: next }
      if (next === 'completed') updates.completed_at = new Date().toISOString()
      await updateStudy.mutateAsync(updates)
      toast.success(next === 'completed' ? 'Estudio completado' : 'Estudio en proceso')
    } catch { toast.error('Error') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-1 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Laboratorio</h1>
          <p className="text-sm text-slate-500">{studies.filter(s => s.status !== 'completed').length} estudios activos</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Nuevo Estudio</Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-4 h-full min-w-max">
          {KANBAN_COLS.map(col => (
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
                {(byStatus[col.id] || []).map(study => (
                  <div key={study.id} draggable
                    onDragStart={() => setDraggedId(study.id)} onDragEnd={() => setDraggedId(null)}
                    className="bg-white rounded-xl shadow-card border border-slate-200/50 p-3 cursor-grab active:cursor-grabbing hover:shadow-soft transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{study.study_type}</span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <PawPrint size={12} /> {study.pet?.name}
                        </div>
                      </div>
                      <Badge variant={STATUS_CONFIG[study.status].badge}>{STATUS_CONFIG[study.status].label}</Badge>
                    </div>
                    {study.requestedBy && (
                      <div className="text-xs text-slate-400 mb-2 flex items-center gap-1"><User size={11} /> Dr. {study.requestedBy.full_name}</div>
                    )}
                    {study.notes && <p className="text-xs text-slate-500 bg-slate-50 rounded px-2 py-1 mb-2 line-clamp-2">{study.notes}</p>}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={11} />{formatDate(study.requested_at)}</span>
                      <div className="flex gap-1">
                        {study.status !== 'completed' && NEXT_STATUS[study.status] && (
                          <button onClick={() => moveNext(study)} className="px-2 py-1 bg-primary-500 text-white rounded text-[10px] font-medium hover:bg-primary-600">
                            {study.status === 'pending' ? 'Iniciar' : 'Completar'}
                          </button>
                        )}
                        <button onClick={() => setViewing(study)} className="p-1 hover:bg-slate-100 rounded"><Eye size={14} /></button>
                      </div>
                    </div>
                    {study.client_visible && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-600"><CheckCircle size={10} /> Visible al cliente</div>
                    )}
                  </div>
                ))}
                {(byStatus[col.id] || []).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <Package className="w-8 h-8 mb-2 opacity-50" /><p className="text-xs">Sin estudios</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && <NewLabStudyModal onClose={() => setShowForm(false)} />}
      {viewing && (
        <Modal open onClose={() => setViewing(null)} title={`${viewing.study_type} — ${viewing.pet?.name}`} size="md">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">Estado</p><Badge variant={STATUS_CONFIG[viewing.status].badge}>{STATUS_CONFIG[viewing.status].label}</Badge></div>
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">Solicitado</p><p className="font-medium">{formatDateTime(viewing.requested_at)}</p></div>
              {viewing.completed_at && <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">Completado</p><p className="font-medium">{formatDateTime(viewing.completed_at)}</p></div>}
              <div className="bg-slate-50 rounded-lg p-3"><p className="text-xs text-slate-400">Visible al cliente</p><p className="font-medium">{viewing.client_visible ? 'Si' : 'No'}</p></div>
            </div>
            {viewing.results && <div><h3 className="text-sm font-semibold mb-1">Resultados</h3><p className="text-sm bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{viewing.results}</p></div>}
            {viewing.notes && <div><h3 className="text-sm font-semibold mb-1">Notas</h3><p className="text-sm bg-slate-50 rounded-lg p-3">{viewing.notes}</p></div>}
            {viewing.file_urls.length > 0 && <div><h3 className="text-sm font-semibold mb-1">Archivos ({viewing.file_urls.length})</h3>
              <div className="space-y-1">{viewing.file_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-primary-600 hover:underline"><FileText size={14} />Archivo {i + 1}</a>
              ))}</div></div>}
            <div className="flex justify-end"><Button variant="secondary" onClick={() => setViewing(null)}>Cerrar</Button></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function NewLabStudyModal({ onClose }: { onClose: () => void }) {
  const create = useCreateLabStudy()
  const { data: pets = [] } = usePets()
  const { authUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ pet_id: '', study_type: 'Hemograma', notes: '', client_visible: false })
  const set = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({
        pet_id: form.pet_id, study_type: form.study_type,
        requested_by_id: authUser?.staffProfile?.id,
        notes: form.notes || undefined, client_visible: form.client_visible, status: 'pending',
      })
      toast.success('Estudio solicitado')
      onClose()
    } catch { toast.error('Error al solicitar estudio') }
  }

  return (
    <Modal open onClose={onClose} title="Nuevo Estudio de Laboratorio" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Paciente *</label>
          <select value={form.pet_id} onChange={e => set('pet_id', e.target.value)} required className="input text-sm">
            <option value="">Seleccionar...</option>
            {pets.map(p => <option key={p.id} value={p.id}>{p.name} — {p.owner?.first_name} {p.owner?.last_name || ''}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Tipo de estudio *</label>
          <select value={form.study_type} onChange={e => set('study_type', e.target.value)} className="input text-sm">
            {['Hemograma', 'Quimica sanguinea', 'Urinalisis', 'Coprologia', 'Citologia', 'Radiografia', 'Ecografia', 'Electrocardiograma', 'Otro'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input" placeholder="Indicaciones especiales..." />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.client_visible} onChange={e => set('client_visible', e.target.checked)}
            className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
          Visible para el cliente en portal
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={create.isPending}>Solicitar Estudio</Button>
        </div>
      </form>
    </Modal>
  )
}
