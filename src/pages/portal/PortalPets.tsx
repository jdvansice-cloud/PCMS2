import { PawPrint, Syringe, Scale, Calendar, ChevronRight } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'

export default function PortalPets() {
  // In production, this would use a portal-specific query filtered by the customer's owner_id
  const pets: unknown[] = []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Mis Mascotas</h1>
        <p className="text-sm text-slate-500">Expediente y datos de tus mascotas</p>
      </div>

      {pets.length === 0 ? (
        <EmptyState
          icon={<PawPrint size={48} />}
          title="Sin mascotas registradas"
          description="Tus mascotas apareceran aqui una vez que la clinica las registre en tu cuenta."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pet cards would render here with medical timeline */}
        </div>
      )}

      {/* Info Card */}
      <div className="card p-5 bg-primary-50/50 border-primary-100">
        <h3 className="font-semibold text-primary-900 text-sm mb-2">Informacion importante</h3>
        <ul className="space-y-2 text-sm text-primary-700">
          <li className="flex items-start gap-2">
            <Syringe size={16} className="shrink-0 mt-0.5" />
            <span>Aqui podras ver el carnet de vacunacion de tus mascotas y las proximas fechas de aplicacion.</span>
          </li>
          <li className="flex items-start gap-2">
            <Scale size={16} className="shrink-0 mt-0.5" />
            <span>El historial de peso te ayuda a monitorear la salud de tus mascotas.</span>
          </li>
          <li className="flex items-start gap-2">
            <Calendar size={16} className="shrink-0 mt-0.5" />
            <span>Puedes agendar citas directamente desde la seccion de citas.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
