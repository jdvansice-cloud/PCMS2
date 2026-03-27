import { useState } from 'react'
import { Calendar, Clock, Plus, Stethoscope, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { useToast } from '../../components/Toast'

const STATUS_LABELS: Record<string, { label: string; variant: 'info' | 'warning' | 'success' | 'error' | 'default' }> = {
  scheduled: { label: 'Programada', variant: 'info' },
  waiting: { label: 'En espera', variant: 'warning' },
  in_progress: { label: 'En consulta', variant: 'info' },
  completed: { label: 'Completada', variant: 'success' },
  no_show: { label: 'No asistio', variant: 'error' },
  cancelled: { label: 'Cancelada', variant: 'default' },
}

export default function PortalAppointments() {
  const [showBooking, setShowBooking] = useState(false)
  const toast = useToast()
  // In production: fetch appointments for this customer
  const appointments: unknown[] = []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Mis Citas</h1>
          <p className="text-sm text-slate-500">Historial y proximas citas</p>
        </div>
        <Button onClick={() => setShowBooking(true)} icon={<Plus size={16} />}>
          Agendar Cita
        </Button>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} />}
          title="Sin citas"
          description="No tienes citas programadas. Agenda una nueva cita con tu veterinario."
          action={<Button onClick={() => setShowBooking(true)} size="sm">Agendar Cita</Button>}
        />
      ) : (
        <div className="space-y-3">
          {/* Appointment cards would render here */}
        </div>
      )}

      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}
    </div>
  )
}

function BookingModal({ onClose }: { onClose: () => void }) {
  const toast = useToast()
  const [form, setForm] = useState({
    pet_id: '', date: '', time: '09:00', type: 'consulta', notes: '',
  })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Conecta Supabase para agendar citas desde el portal')
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Agendar Cita" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Mascota *</label>
          <select value={form.pet_id} onChange={e => set('pet_id', e.target.value)} required className="input text-sm">
            <option value="">Seleccionar mascota...</option>
            {/* Populated from customer's pets */}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Fecha *" type="date" value={form.date} onChange={e => set('date', e.target.value)} required
            min={new Date().toISOString().split('T')[0]} />
          <Input label="Hora preferida *" type="time" value={form.time} onChange={e => set('time', e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Tipo de cita</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className="input text-sm">
            <option value="consulta">Consulta general</option>
            <option value="vacunacion">Vacunacion</option>
            <option value="revision">Revision</option>
            <option value="estetica">Estetica / Grooming</option>
            <option value="urgencia">Urgencia</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Motivo o notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className="input"
            placeholder="Describe brevemente el motivo de la cita..." />
        </div>

        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
          La cita queda sujeta a confirmacion por la clinica. Recibiras una notificacion por correo.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Solicitar Cita</Button>
        </div>
      </form>
    </Modal>
  )
}
