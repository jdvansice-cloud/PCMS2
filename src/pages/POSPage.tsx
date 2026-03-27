import { useState, useMemo } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart, User, Tag, Percent, Package } from 'lucide-react'
import { useProducts } from '../hooks/queries/useProducts'
import { useOwners } from '../hooks/queries/useOwners'
import { useCreateSale } from '../hooks/queries/useSales'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { PaymentModal } from '../components/modals/PaymentModal'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { useTenant } from '../context/TenantContext'
import { formatCurrency } from '../utils/formatters'
import type { Product } from '../hooks/queries/useProducts'
import type { PaymentEntry } from '../components/modals/PaymentModal'

interface CartItem {
  product: Product
  quantity: number
  discount: number
}

const PRODUCT_TYPES: { id: string; label: string }[] = [
  { id: '', label: 'Todos' },
  { id: 'service', label: 'Servicios' },
  { id: 'retail', label: 'Productos' },
  { id: 'medication', label: 'Medicamentos' },
  { id: 'vaccine', label: 'Vacunas' },
  { id: 'food', label: 'Alimentos' },
]

export default function POSPage() {
  const { data: products = [], isLoading } = useProducts()
  const { data: owners = [] } = useOwners()
  const createSale = useCreateSale()
  const toast = useToast()
  const { authUser } = useAuth()
  const { company } = useTenant()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedOwner, setSelectedOwner] = useState<string>('')
  const [showPayment, setShowPayment] = useState(false)
  const [saleDiscount, setSaleDiscount] = useState(0)

  const taxRate = (company?.tax_rate as number) || 16

  const filteredProducts = useMemo(() => {
    let result = products
    if (typeFilter) result = result.filter(p => p.product_type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.barcode?.includes(q) || p.sku?.includes(q))
    }
    return result
  }, [products, typeFilter, search])

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.product.id === product.id)
    if (existing) {
      setCart(cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, { product, quantity: 1, discount: 0 }])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.product.id !== productId) return i
      const newQty = Math.max(1, i.quantity + delta)
      return { ...i, quantity: newQty }
    }))
  }

  const removeFromCart = (productId: string) => setCart(cart.filter(i => i.product.id !== productId))

  const subtotal = cart.reduce((sum, i) => sum + (i.product.price * i.quantity - i.discount), 0)
  const discountTotal = saleDiscount + cart.reduce((sum, i) => sum + i.discount, 0)
  const taxableAmount = subtotal - saleDiscount
  const taxAmount = cart.some(i => i.product.is_taxable) ? Math.round(taxableAmount * (taxRate / 100) * 100) / 100 : 0
  const total = Math.round((taxableAmount + taxAmount) * 100) / 100

  const handlePaymentComplete = async (result: { payments: PaymentEntry[]; totalPaid: number; change: number }) => {
    try {
      await createSale.mutateAsync({
        owner_id: selectedOwner || undefined,
        lines: cart.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: i.product.price,
          discount: i.discount,
          line_total: i.product.price * i.quantity - i.discount,
        })),
        payments: result.payments,
        subtotal,
        discount_amount: discountTotal,
        tax_amount: taxAmount,
        total,
        created_by: authUser?.staffProfile?.id,
      })
      toast.success('Venta completada')
      setCart([])
      setSelectedOwner('')
      setSaleDiscount(0)
      setShowPayment(false)
    } catch {
      toast.error('Error al procesar la venta')
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4 animate-fade-in">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <h1 className="text-2xl font-display font-bold text-slate-900">Caja</h1>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto, codigo de barras..." className="input pl-10" />
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {PRODUCT_TYPES.map(t => (
            <button key={t.id} onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                t.id === typeFilter ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{t.label}</button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredProducts.length === 0 ? (
            <EmptyState icon={<Package size={40} />} title="Sin productos" description="Agrega productos en Inventario" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <button key={product.id} onClick={() => addToCart(product)}
                  className="product-tile text-left p-3">
                  <p className="font-medium text-slate-900 text-sm truncate">{product.name}</p>
                  <p className="text-xs text-slate-400 capitalize mt-0.5">{product.product_type}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary-600">{formatCurrency(product.price)}</span>
                    {product.product_type !== 'service' && (
                      <span className={`text-xs ${product.stock <= product.min_stock ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                        Stock: {product.stock}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl shadow-card flex flex-col max-h-[50vh] lg:max-h-full">
        <div className="p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <ShoppingCart size={18} /> Cuenta
            </h2>
            <Badge variant="info">{cart.length} items</Badge>
          </div>
          {/* Owner selector */}
          <select value={selectedOwner} onChange={e => setSelectedOwner(e.target.value)} className="input text-sm">
            <option value="">Cliente general</option>
            {owners.map(o => <option key={o.id} value={o.id}>{o.first_name} {o.last_name || ''}</option>)}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Agrega productos</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(item.product.price)} c/u</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-semibold text-sm text-slate-900 w-16 text-right">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
                <button onClick={() => removeFromCart(item.product.id)}
                  className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>

        {/* Totals + Pay */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 shrink-0 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-sm"><span className="text-slate-500">Descuento</span><span className="text-red-500">-{formatCurrency(discountTotal)}</span></div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-sm"><span className="text-slate-500">IVA ({taxRate}%)</span><span>{formatCurrency(taxAmount)}</span></div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
              <span>Total</span><span className="text-primary-600">{formatCurrency(total)}</span>
            </div>
            <Button onClick={() => setShowPayment(true)} className="w-full" size="lg">
              Cobrar {formatCurrency(total)}
            </Button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={total}
          subtotal={subtotal}
          taxAmount={taxAmount}
          onClose={() => setShowPayment(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  )
}
