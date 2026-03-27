import { useState } from 'react'
import { FileText, Stethoscope, Syringe, FlaskConical, Clock, PawPrint, ChevronDown } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'

type RecordTab = 'consultations' | 'vaccines' | 'lab'

const TABS: { id: RecordTab; label: string; icon: React.ReactNode }[] = [
  { id: 'consultations', label: 'Consultas', icon: <Stethoscope size={16} /> },
  { id: 'vaccines', label: 'Vacunas', icon: <Syringe size={16} /> },
  { id: 'lab', label: 'Laboratorio', icon: <FlaskConical size={16} /> },
]

export default function PortalRecords() {
  const [activeTab, setActiveTab] = useState<RecordTab>('consultations')
  // In production: fetch records for this customer's pets (only client_visible ones)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Historial Medico</h1>
        <p className="text-sm text-slate-500">Consultas, vacunas y estudios de tus mascotas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'consultations' && (
        <EmptyState
          icon={<Stethoscope size={48} />}
          title="Sin consultas"
          description="El historial de consultas de tus mascotas aparecera aqui."
        />
      )}

      {activeTab === 'vaccines' && (
        <EmptyState
          icon={<Syringe size={48} />}
          title="Sin vacunas registradas"
          description="El carnet de vacunacion de tus mascotas aparecera aqui con fechas de proxima aplicacion."
        />
      )}

      {activeTab === 'lab' && (
        <EmptyState
          icon={<FlaskConical size={48} />}
          title="Sin estudios de laboratorio"
          description="Los resultados de laboratorio marcados como visibles por tu veterinario apareceran aqui."
        />
      )}

      {/* Legend */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Sobre tu historial</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <Stethoscope size={14} className="text-blue-500 shrink-0 mt-0.5" />
            <span><strong>Consultas:</strong> Diagnosticos, tratamientos y notas de cada visita.</span>
          </div>
          <div className="flex items-start gap-2">
            <Syringe size={14} className="text-purple-500 shrink-0 mt-0.5" />
            <span><strong>Vacunas:</strong> Registro completo con lote, laboratorio y proxima fecha.</span>
          </div>
          <div className="flex items-start gap-2">
            <FlaskConical size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Laboratorio:</strong> Resultados de estudios compartidos por tu veterinario.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
