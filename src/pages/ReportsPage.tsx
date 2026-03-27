import { useState } from 'react'
import {
  BarChart3, DollarSign, ShoppingCart, Users, PawPrint, Scissors,
  Hotel, Package, Calendar, TrendingUp, Download, FileSpreadsheet,
  ChevronRight, Clock, CreditCard, Banknote,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useTenant } from '../context/TenantContext'
import { formatCurrency, formatDate } from '../utils/formatters'

type ReportType = 'sales' | 'cash_register' | 'commissions' | 'inventory' | 'clients' | 'appointments'

interface ReportConfig {
  id: ReportType
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const REPORTS: ReportConfig[] = [
  { id: 'sales', title: 'Ventas', description: 'Ventas por periodo, metodo de pago y categoria', icon: <DollarSign size={22} />, color: 'text-emerald-600 bg-emerald-100' },
  { id: 'cash_register', title: 'Corte de Caja', description: 'Apertura, cierre y movimientos de caja', icon: <ShoppingCart size={22} />, color: 'text-blue-600 bg-blue-100' },
  { id: 'commissions', title: 'Comisiones', description: 'Comisiones por veterinario y estilista', icon: <Users size={22} />, color: 'text-purple-600 bg-purple-100' },
  { id: 'inventory', title: 'Inventario', description: 'Stock actual, movimientos y caducidades', icon: <Package size={22} />, color: 'text-amber-600 bg-amber-100' },
  { id: 'clients', title: 'Clientes', description: 'Nuevos clientes, frecuencia de visita, VIP', icon: <PawPrint size={22} />, color: 'text-pink-600 bg-pink-100' },
  { id: 'appointments', title: 'Citas', description: 'Asistencia, no-shows, tipos de consulta', icon: <Calendar size={22} />, color: 'text-cyan-600 bg-cyan-100' },
]

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500">Informes operativos y de gestion</p>
        </div>
      </div>

      {!activeReport ? (
        /* Report Selection Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORTS.map(report => (
            <button key={report.id} onClick={() => setActiveReport(report.id)}
              className="card p-5 text-left hover:shadow-soft transition-all group">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.color}`}>
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{report.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{report.description}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-400 mt-1 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Active Report View */
        <ReportView
          type={activeReport}
          dateRange={dateRange}
          onDateChange={setDateRange}
          onBack={() => setActiveReport(null)}
        />
      )}
    </div>
  )
}

function ReportView({ type, dateRange, onDateChange, onBack }: {
  type: ReportType
  dateRange: { from: string; to: string }
  onDateChange: (range: { from: string; to: string }) => void
  onBack: () => void
}) {
  const config = REPORTS.find(r => r.id === type)!
  const { company } = useTenant()

  // Demo data for visual preview
  const demoSalesData = [
    { label: 'Consultas', value: 0, pct: 0 },
    { label: 'Estetica', value: 0, pct: 0 },
    { label: 'Productos', value: 0, pct: 0 },
    { label: 'Medicamentos', value: 0, pct: 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.color}`}>{config.icon}</div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">{config.title}</h2>
            <p className="text-sm text-slate-500">{company?.name}</p>
          </div>
        </div>
        <Button variant="outline" icon={<Download size={16} />} size="sm">Exportar Excel</Button>
      </div>

      {/* Date Range */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">Desde:</label>
            <input type="date" value={dateRange.from} onChange={e => onDateChange({ ...dateRange, from: e.target.value })} className="input w-auto text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-500">Hasta:</label>
            <input type="date" value={dateRange.to} onChange={e => onDateChange({ ...dateRange, to: e.target.value })} className="input w-auto text-sm" />
          </div>
          <div className="flex gap-2 ml-auto">
            {['Hoy', 'Semana', 'Mes', 'Año'].map(preset => (
              <button key={preset} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {type === 'sales' && <SalesReport />}
      {type === 'cash_register' && <CashRegisterReport />}
      {type === 'commissions' && <CommissionsReport />}
      {type === 'inventory' && <InventoryReport />}
      {type === 'clients' && <ClientsReport />}
      {type === 'appointments' && <AppointmentsReport />}
    </div>
  )
}

function SalesReport() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ventas totales', value: '$0.00', icon: <DollarSign size={20} />, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Transacciones', value: '0', icon: <ShoppingCart size={20} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Ticket promedio', value: '$0.00', icon: <TrendingUp size={20} />, color: 'text-purple-600 bg-purple-50' },
          { label: 'Descuentos', value: '$0.00', icon: <DollarSign size={20} />, color: 'text-red-600 bg-red-50' },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
              <div><p className="text-xs text-slate-400">{stat.label}</p><p className="text-xl font-bold text-slate-900">{stat.value}</p></div>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Ventas por Metodo de Pago</h3>
        <div className="space-y-3">
          {[
            { method: 'Efectivo', icon: <Banknote size={16} />, amount: 0, count: 0 },
            { method: 'Tarjeta', icon: <CreditCard size={16} />, amount: 0, count: 0 },
            { method: 'Transferencia', icon: <TrendingUp size={16} />, amount: 0, count: 0 },
          ].map(item => (
            <div key={item.method} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3"><span className="text-slate-400">{item.icon}</span><span className="text-sm font-medium">{item.method}</span></div>
              <div className="text-right"><p className="text-sm font-semibold">{formatCurrency(item.amount)}</p><p className="text-xs text-slate-400">{item.count} transacciones</p></div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function CashRegisterReport() {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Historial de Cortes</h3>
      <div className="text-center py-12 text-slate-400">
        <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay cortes de caja en este periodo</p>
      </div>
    </div>
  )
}

function CommissionsReport() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Veterinarios</h3>
        <div className="text-center py-8 text-slate-400"><p className="text-sm">Sin datos de comisiones</p></div>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Scissors size={18} className="text-purple-500" /> Estilistas</h3>
        <div className="text-center py-8 text-slate-400"><p className="text-sm">Sin datos de comisiones</p></div>
      </div>
    </div>
  )
}

function InventoryReport() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: 'Valor total stock', value: '$0.00', color: 'text-emerald-600' },
        { label: 'Productos activos', value: '0', color: 'text-blue-600' },
        { label: 'Stock bajo / Caducando', value: '0 / 0', color: 'text-red-600' },
      ].map(s => (
        <div key={s.label} className="card p-4">
          <p className="text-xs text-slate-400">{s.label}</p>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function ClientsReport() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: 'Total clientes', value: '0' },
        { label: 'Nuevos (periodo)', value: '0' },
        { label: 'Clientes VIP', value: '0' },
      ].map(s => (
        <div key={s.label} className="card p-4">
          <p className="text-xs text-slate-400">{s.label}</p>
          <p className="text-2xl font-bold text-slate-900">{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function AppointmentsReport() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: 'Total citas', value: '0', color: 'text-blue-600' },
        { label: 'Completadas', value: '0', color: 'text-emerald-600' },
        { label: 'No asistieron', value: '0', color: 'text-red-600' },
        { label: 'Canceladas', value: '0', color: 'text-slate-600' },
      ].map(s => (
        <div key={s.label} className="card p-4">
          <p className="text-xs text-slate-400">{s.label}</p>
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}
