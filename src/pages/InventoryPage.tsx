import { useState, useMemo } from 'react'
import { Search, Plus, Package, AlertTriangle, Edit, BarChart3, Truck, Calendar } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useSuppliers, useCreateSupplier } from '../hooks/queries/useProducts'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/Toast'
import { formatCurrency, formatDate } from '../utils/formatters'
import type { Product } from '../hooks/queries/useProducts'

const TYPE_LABELS: Record<string, string> = {
  service: 'Servicio', retail: 'Producto', medication: 'Medicamento', vaccine: 'Vacuna', food: 'Alimento',
}

export default function InventoryPage() {
  const { data: products = [], isLoading } = useProducts()
  const { data: suppliers = [] } = useSuppliers()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [tab, setTab] = useState<'products' | 'alerts'>('products')

  const filtered = useMemo(() => {
    let result = products
    if (typeFilter) result = result.filter(p => p.product_type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.barcode?.includes(q) || p.sku?.includes(q))
    }
    return result
  }, [products, typeFilter, search])

  const lowStock = useMemo(() => products.filter(p => p.product_type !== 'service' && p.stock <= p.min_stock), [products])
  const expiring = useMemo(() => {
    const in30d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    return products.filter(p => p.expiry_date && p.expiry_date <= in30d)
  }, [products])

  const handleSave = async (data: Partial<Product>) => {
    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, ...data })
        toast.success('Producto actualizado')
      } else {
        await createProduct.mutateAsync(data)
        toast.success('Producto creado')
      }
      setShowForm(false); setEditing(null)
    } catch { toast.error('Error al guardar') }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Inventario</h1>
          <p className="text-sm text-slate-500">{products.length} productos</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }} icon={<Plus size={16} />}>Nuevo Producto</Button>
      </div>

      {/* Alerts Banner */}
      {(lowStock.length > 0 || expiring.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lowStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer" onClick={() => setTab('alerts')}>
              <AlertTriangle size={20} className="text-red-500 shrink-0" />
              <div><p className="text-sm font-medium text-red-800">{lowStock.length} productos con stock bajo</p>
                <p className="text-xs text-red-600">Requieren reabastecimiento</p></div>
            </div>
          )}
          {expiring.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer" onClick={() => setTab('alerts')}>
              <Calendar size={20} className="text-amber-500 shrink-0" />
              <div><p className="text-sm font-medium text-amber-800">{expiring.length} productos por caducar</p>
                <p className="text-xs text-amber-600">En los proximos 30 dias</p></div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('products')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'products' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
          Productos
        </button>
        <button onClick={() => setTab('alerts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${tab === 'alerts' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
          Alertas {(lowStock.length + expiring.length) > 0 && <Badge variant="error">{lowStock.length + expiring.length}</Badge>}
        </button>
      </div>

      {tab === 'products' && (
        <>
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, codigo de barras..." className="input pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[{ id: '', label: 'Todos' }, ...Object.entries(TYPE_LABELS).map(([id, label]) => ({ id, label }))].map(t => (
                <button key={t.id} onClick={() => setTypeFilter(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${t.id === typeFilter ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Table */}
          {filtered.length === 0 ? (
            <EmptyState icon={<Package size={48} />} title="Sin productos"
              description="Agrega tu primer producto o servicio"
              action={<Button onClick={() => setShowForm(true)} size="sm">Agregar</Button>} />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Producto</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Precio</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Costo</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Caducidad</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase w-20">Accion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(p => {
                      const isLow = p.product_type !== 'service' && p.stock <= p.min_stock
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-900 text-sm">{p.name}</p>
                            {p.barcode && <p className="text-xs text-slate-400">{p.barcode}</p>}
                          </td>
                          <td className="py-3 px-4"><Badge variant="default">{TYPE_LABELS[p.product_type] || p.product_type}</Badge></td>
                          <td className="py-3 px-4 text-right text-sm font-medium">{formatCurrency(p.price)}</td>
                          <td className="py-3 px-4 text-right text-sm text-slate-500">{formatCurrency(p.cost_price)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`text-sm font-medium ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                              {p.product_type === 'service' ? '—' : p.stock}
                            </span>
                            {isLow && <Badge variant="error" className="ml-2">Bajo</Badge>}
                          </td>
                          <td className="py-3 px-4 text-center text-sm text-slate-500 hidden lg:table-cell">
                            {p.expiry_date ? formatDate(p.expiry_date) : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button onClick={() => { setEditing(p); setShowForm(true) }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit size={16} /></button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'alerts' && (
        <div className="space-y-4">
          {lowStock.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Stock Bajo</h3>
              <div className="space-y-2">
                {lowStock.map(p => (
                  <div key={p.id} className="card p-3 flex items-center justify-between border-l-4 border-l-red-400">
                    <div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-slate-400">{TYPE_LABELS[p.product_type]}</p></div>
                    <div className="text-right"><p className="text-sm font-bold text-red-600">{p.stock} uds</p><p className="text-xs text-slate-400">Min: {p.min_stock}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {expiring.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2"><Calendar size={16} /> Por Caducar</h3>
              <div className="space-y-2">
                {expiring.map(p => (
                  <div key={p.id} className="card p-3 flex items-center justify-between border-l-4 border-l-amber-400">
                    <div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-slate-400">Lote: {p.lot_number || '—'}</p></div>
                    <div className="text-right"><p className="text-sm font-bold text-amber-600">{formatDate(p.expiry_date!)}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {lowStock.length === 0 && expiring.length === 0 && (
            <EmptyState icon={<AlertTriangle size={40} />} title="Sin alertas" description="Todo el inventario esta en orden" />
          )}
        </div>
      )}

      {showForm && (
        <ProductFormModal product={editing} suppliers={suppliers} onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={handleSave} loading={createProduct.isPending || updateProduct.isPending} />
      )}
    </div>
  )
}

function ProductFormModal({ product, suppliers, onClose, onSave, loading }: {
  product: Product | null; suppliers: { id: string; name: string }[];
  onClose: () => void; onSave: (data: Partial<Product>) => void; loading: boolean
}) {
  const [form, setForm] = useState({
    name: product?.name || '', product_type: product?.product_type || 'retail',
    category: product?.category || '', sku: product?.sku || '', barcode: product?.barcode || '',
    price: product?.price?.toString() || '', cost_price: product?.cost_price?.toString() || '',
    wholesale_price: product?.wholesale_price?.toString() || '',
    stock: product?.stock?.toString() || '0', min_stock: product?.min_stock?.toString() || '0',
    lot_number: product?.lot_number || '', expiry_date: product?.expiry_date || '',
    supplier_id: product?.supplier_id || '', is_taxable: product?.is_taxable ?? true,
    is_controlled_senasica: product?.is_controlled_senasica ?? false,
  })
  const set = (f: string, v: unknown) => setForm(p => ({ ...p, [f]: v }))

  return (
    <Modal open onClose={onClose} title={product ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
      <form onSubmit={e => { e.preventDefault(); onSave({
        ...form, price: parseFloat(form.price) || 0, cost_price: parseFloat(form.cost_price) || 0,
        wholesale_price: form.wholesale_price ? parseFloat(form.wholesale_price) : undefined,
        stock: parseInt(form.stock) || 0, min_stock: parseInt(form.min_stock) || 0,
        supplier_id: form.supplier_id || undefined, expiry_date: form.expiry_date || undefined,
      } as unknown as Partial<Product>) }} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.name} onChange={e => set('name', e.target.value)} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Tipo *</label>
            <select value={form.product_type} onChange={e => set('product_type', e.target.value)} className="input text-sm">
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <Input label="SKU" value={form.sku} onChange={e => set('sku', e.target.value)} />
          <Input label="Codigo de barras" value={form.barcode} onChange={e => set('barcode', e.target.value)} />
          <Input label="Precio venta *" type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required />
          <Input label="Costo" type="number" step="0.01" value={form.cost_price} onChange={e => set('cost_price', e.target.value)} />
          <Input label="Precio mayoreo" type="number" step="0.01" value={form.wholesale_price} onChange={e => set('wholesale_price', e.target.value)} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Proveedor</label>
            <select value={form.supplier_id} onChange={e => set('supplier_id', e.target.value)} className="input text-sm">
              <option value="">Sin proveedor</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Input label="Stock" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} />
          <Input label="Stock minimo" type="number" value={form.min_stock} onChange={e => set('min_stock', e.target.value)} />
          <Input label="No. Lote" value={form.lot_number} onChange={e => set('lot_number', e.target.value)} />
          <Input label="Caducidad" type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_taxable as boolean} onChange={e => set('is_taxable', e.target.checked)}
              className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" /> Grava IVA
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_controlled_senasica as boolean} onChange={e => set('is_controlled_senasica', e.target.checked)}
              className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" /> Controlado SENASICA
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{product ? 'Guardar' : 'Crear Producto'}</Button>
        </div>
      </form>
    </Modal>
  )
}
