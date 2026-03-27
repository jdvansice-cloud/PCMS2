import { useState } from 'react'
import { Settings, Building, Clock, Palette, Bell, Shield, Database, CreditCard, Save } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useTenant } from '../context/TenantContext'
import { useToast } from '../components/Toast'

type SettingsTab = 'clinic' | 'schedule' | 'notifications' | 'billing'

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'clinic', label: 'Clinica', icon: <Building size={18} /> },
  { id: 'schedule', label: 'Horarios', icon: <Clock size={18} /> },
  { id: 'notifications', label: 'Notificaciones', icon: <Bell size={18} /> },
  { id: 'billing', label: 'Facturacion', icon: <CreditCard size={18} /> },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('clinic')
  const { company, plan } = useTenant()
  const toast = useToast()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Ajustes</h1>
        <p className="text-sm text-slate-500">Configuracion de {company?.name || 'la clinica'}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'clinic' && <ClinicSettings />}
          {activeTab === 'schedule' && <ScheduleSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'billing' && <BillingSettings plan={plan} />}
        </div>
      </div>
    </div>
  )
}

function ClinicSettings() {
  const { company } = useTenant()
  const toast = useToast()
  const [form, setForm] = useState({
    name: company?.name || '', phone: (company?.phone as string) || '',
    email: (company?.email as string) || '', address: (company?.address as string) || '',
    ruc: company?.ruc || '', tax_rate: (company?.tax_rate as number)?.toString() || '16',
    website: (company?.website as string) || '',
  })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Building size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-slate-900">Datos de la Clinica</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nombre de la clinica" value={form.name} onChange={e => set('name', e.target.value)} />
        <Input label="Telefono" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <Input label="Correo" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        <Input label="Sitio web" value={form.website} onChange={e => set('website', e.target.value)} />
        <Input label="RFC / RUC" value={form.ruc} onChange={e => set('ruc', e.target.value)} />
        <Input label="Tasa de IVA (%)" type="number" step="0.01" value={form.tax_rate} onChange={e => set('tax_rate', e.target.value)} />
        <div className="sm:col-span-2">
          <Input label="Direccion" value={form.address} onChange={e => set('address', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.info('Conecta Supabase para guardar cambios')} icon={<Save size={16} />}>
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}

function ScheduleSettings() {
  const DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Clock size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-slate-900">Horarios de Operacion</h2>
      </div>

      <div className="space-y-3">
        {DAYS.map((day, i) => (
          <div key={day} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
            <span className="w-28 text-sm font-medium text-slate-700">{day}</span>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={i < 6}
                className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-xs text-slate-500">Abierto</span>
            </label>
            <Input type="time" defaultValue="08:00" className="w-28 !py-1.5 text-sm" />
            <span className="text-slate-400">a</span>
            <Input type="time" defaultValue={i < 5 ? '18:00' : '14:00'} className="w-28 !py-1.5 text-sm" />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button icon={<Save size={16} />}>Guardar Horarios</Button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Bell size={20} className="text-primary-500" />
        <h2 className="text-lg font-semibold text-slate-900">Notificaciones</h2>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Recordatorio de citas (24h antes)', description: 'Envia un correo al cliente un dia antes de su cita', defaultOn: true },
          { label: 'Confirmacion de cita', description: 'Envia confirmacion al agendar una cita', defaultOn: true },
          { label: 'Cumpleaños de mascotas', description: 'Felicitacion personalizada al cliente', defaultOn: false },
          { label: 'Estetica lista', description: 'Notificar al propietario cuando su mascota esta lista', defaultOn: true },
          { label: 'Resultados de laboratorio', description: 'Notificar cuando los resultados estan listos', defaultOn: false },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
              <div className="w-10 h-5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button icon={<Save size={16} />}>Guardar</Button>
      </div>
    </div>
  )
}

function BillingSettings({ plan }: { plan: string }) {
  const PLANS = [
    { id: 'starter', name: 'Starter', price: '$29/mes', features: ['Dashboard', 'Clientes y Pacientes', 'Citas', 'Consultas', 'POS', 'Inventario'] },
    { id: 'pro', name: 'Pro', price: '$59/mes', features: ['Todo en Starter', 'Estetica', 'Hospitalizacion', 'Laboratorio', 'Reportes', 'Portal del Cliente', 'Lealtad y Gift Cards'] },
    { id: 'enterprise', name: 'Enterprise', price: '$99/mes', features: ['Todo en Pro', 'Multi-sucursal', 'Marca personalizada', 'Acceso API', 'Soporte prioritario'] },
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard size={20} className="text-primary-500" />
          <h2 className="text-lg font-semibold text-slate-900">Plan Actual</h2>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-bold text-slate-900 capitalize">{plan}</span>
          <span className="badge badge-success">Activo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(p => (
          <div key={p.id} className={`card p-5 ${p.id === plan ? 'ring-2 ring-primary-500' : ''}`}>
            <h3 className="font-bold text-slate-900">{p.name}</h3>
            <p className="text-2xl font-bold text-primary-600 mt-1">{p.price}</p>
            <ul className="mt-4 space-y-2">
              {p.features.map(f => (
                <li key={f} className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0" />{f}
                </li>
              ))}
            </ul>
            {p.id === plan ? (
              <div className="mt-4 text-center text-xs text-primary-600 font-medium py-2 bg-primary-50 rounded-lg">Plan actual</div>
            ) : (
              <Button variant="outline" size="sm" className="w-full mt-4">
                {PLANS.indexOf(p) > PLANS.findIndex(x => x.id === plan) ? 'Mejorar' : 'Cambiar'}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
