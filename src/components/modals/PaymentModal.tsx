import { useState } from 'react'
import { X, Banknote, CreditCard, Smartphone, Building2, Gift, Check, Trash2, Plus } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

const paymentMethods = [
  { id: 'cash', name: 'Efectivo', icon: Banknote, primary: true },
  { id: 'card', name: 'Tarjeta', icon: CreditCard, primary: true },
  { id: 'transfer', name: 'Transferencia', icon: Building2 },
  { id: 'yappy', name: 'Yappy', icon: Smartphone },
  { id: 'gift_card', name: 'Tarjeta Regalo', icon: Gift },
]

export interface PaymentEntry {
  method: string
  methodName: string
  amount: number
  reference?: string
  cashTendered?: number
  changeGiven?: number
}

interface PaymentModalProps {
  total: number
  subtotal: number
  taxAmount: number
  onClose: () => void
  onComplete: (result: { payments: PaymentEntry[]; totalPaid: number; change: number }) => void
}

export function PaymentModal({ total, subtotal, taxAmount, onClose, onComplete }: PaymentModalProps) {
  const [payments, setPayments] = useState<PaymentEntry[]>([])
  const [activeMethod, setActiveMethod] = useState<string | null>(null)

  const [cashAmount, setCashAmount] = useState('')
  const [cashTendered, setCashTendered] = useState('')
  const [cardAmount, setCardAmount] = useState('')
  const [cardReference, setCardReference] = useState('')
  const [otherAmount, setOtherAmount] = useState('')
  const [processing, setProcessing] = useState(false)

  const totalPaid = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) / 100
  const remaining = Math.round(Math.max(0, total - totalPaid) * 100) / 100
  const overpaid = Math.round(Math.max(0, totalPaid - total) * 100) / 100

  const handleMethodSelect = (methodId: string) => {
    setActiveMethod(methodId)
    const r = remaining.toFixed(2)
    if (methodId === 'cash') { setCashAmount(r); setCashTendered('') }
    else if (methodId === 'card') { setCardAmount(r); setCardReference('') }
    else { setOtherAmount(r) }
  }

  const cashChange = cashTendered && cashAmount
    ? Math.max(0, parseFloat(cashTendered) - parseFloat(cashAmount)) : 0

  const addPayment = () => {
    if (!activeMethod) return
    let entry: PaymentEntry | null = null

    if (activeMethod === 'cash') {
      const amt = Math.min(parseFloat(cashAmount) || 0, remaining)
      if (amt <= 0) return
      entry = { method: 'cash', methodName: 'Efectivo', amount: amt,
        cashTendered: parseFloat(cashTendered) || amt,
        changeGiven: Math.max(0, (parseFloat(cashTendered) || amt) - amt) }
      setCashAmount(''); setCashTendered('')
    } else if (activeMethod === 'card') {
      const amt = Math.min(parseFloat(cardAmount) || 0, remaining)
      if (amt <= 0 || !cardReference.trim()) return
      entry = { method: 'card', methodName: 'Tarjeta', amount: amt, reference: cardReference.trim() }
      setCardAmount(''); setCardReference('')
    } else {
      const amt = Math.min(parseFloat(otherAmount) || 0, remaining)
      if (amt <= 0) return
      const info = paymentMethods.find(m => m.id === activeMethod)
      entry = { method: activeMethod, methodName: info?.name || activeMethod, amount: amt }
      setOtherAmount('')
    }

    if (entry) { setPayments([...payments, entry]); setActiveMethod(null) }
  }

  const removePayment = (i: number) => setPayments(payments.filter((_, idx) => idx !== i))
  const canProcess = remaining === 0

  const handleProcess = () => {
    if (!canProcess) return
    setProcessing(true)
    setTimeout(() => {
      onComplete({ payments, totalPaid, change: overpaid })
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl shadow-elevated w-full max-w-lg max-h-[calc(100vh-5rem)] flex flex-col animate-scale-in"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Pago</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {/* Amount Summary */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Total a Pagar</span>
              <span className="text-2xl font-bold text-slate-800">{formatCurrency(total)}</span>
            </div>
            {subtotal !== total && (
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>IVA</span><span>{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {payments.length > 0 && (
              <>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Pagado</span><span className="text-success-600 font-medium">{formatCurrency(totalPaid)}</span></div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
                  <span className="font-medium text-slate-700">{remaining > 0 ? 'Restante' : 'Cambio'}</span>
                  <span className={`font-bold ${remaining > 0 ? 'text-warning-600' : 'text-success-600'}`}>{formatCurrency(remaining > 0 ? remaining : overpaid)}</span>
                </div>
              </>
            )}
          </div>

          {/* Added Payments */}
          {payments.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pagos Agregados</p>
              <div className="space-y-2">
                {payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-success-50 border border-success-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success-600" />
                      <span className="text-sm font-medium text-slate-700">{p.methodName}</span>
                      {p.reference && <span className="text-xs text-slate-500">#{p.reference}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{formatCurrency(p.amount)}</span>
                      <button onClick={() => removePayment(i)} className="p-1 text-slate-400 hover:text-error-500 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Method Selection */}
          {remaining > 0 && !activeMethod && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {payments.length > 0 ? 'Agregar Otro Pago' : 'Metodo de Pago'}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {paymentMethods.filter(m => m.primary).map(m => {
                  const Icon = m.icon
                  return (
                    <button key={m.id} onClick={() => handleMethodSelect(m.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all text-left">
                      <Icon className="w-5 h-5 text-slate-600" /><span className="font-medium text-sm text-slate-700">{m.name}</span>
                    </button>
                  )
                })}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.filter(m => !m.primary).map(m => {
                  const Icon = m.icon
                  return (
                    <button key={m.id} onClick={() => handleMethodSelect(m.id)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all text-center">
                      <Icon className="w-5 h-5 text-slate-500" /><span className="text-xs text-slate-600">{m.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active Method Input */}
          {activeMethod === 'cash' && remaining > 0 && (
            <div className="mb-4 bg-slate-50 rounded-xl p-4">
              <h3 className="font-medium text-sm text-slate-700 mb-3">Efectivo</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="text-xs text-slate-500">Monto</label>
                  <input type="number" value={cashAmount} onChange={e => setCashAmount(e.target.value)} className="input mt-1" step="0.01" /></div>
                <div><label className="text-xs text-slate-500">Recibido</label>
                  <input type="number" value={cashTendered} onChange={e => setCashTendered(e.target.value)} className="input mt-1" step="0.01" /></div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {[20, 50, 100, 200, 500].map(d => (
                  <button key={d} onClick={() => setCashTendered(prev => ((parseFloat(prev) || 0) + d).toFixed(2))}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:border-primary-400 hover:bg-primary-50 transition-colors">
                    ${d}
                  </button>
                ))}
              </div>
              {cashChange > 0 && (
                <div className="text-sm font-medium text-success-600 bg-success-50 rounded-lg px-3 py-2">Cambio: {formatCurrency(cashChange)}</div>
              )}
              <div className="flex gap-2 mt-3">
                <button onClick={() => setActiveMethod(null)} className="btn-secondary flex-1 text-sm py-2">Cancelar</button>
                <button onClick={addPayment} className="btn-primary flex-1 text-sm py-2"
                  disabled={!(parseFloat(cashAmount) > 0)}>
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
          )}

          {activeMethod === 'card' && remaining > 0 && (
            <div className="mb-4 bg-slate-50 rounded-xl p-4">
              <h3 className="font-medium text-sm text-slate-700 mb-3">Tarjeta</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="text-xs text-slate-500">Monto</label>
                  <input type="number" value={cardAmount} onChange={e => setCardAmount(e.target.value)} className="input mt-1" step="0.01" /></div>
                <div><label className="text-xs text-slate-500">Referencia *</label>
                  <input type="text" value={cardReference} onChange={e => setCardReference(e.target.value)} className="input mt-1" placeholder="Ultimos 4 digitos" /></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveMethod(null)} className="btn-secondary flex-1 text-sm py-2">Cancelar</button>
                <button onClick={addPayment} className="btn-primary flex-1 text-sm py-2"
                  disabled={!(parseFloat(cardAmount) > 0 && cardReference.trim())}>
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
          )}

          {activeMethod && activeMethod !== 'cash' && activeMethod !== 'card' && remaining > 0 && (
            <div className="mb-4 bg-slate-50 rounded-xl p-4">
              <h3 className="font-medium text-sm text-slate-700 mb-3">{paymentMethods.find(m => m.id === activeMethod)?.name}</h3>
              <div className="mb-3">
                <label className="text-xs text-slate-500">Monto</label>
                <input type="number" value={otherAmount} onChange={e => setOtherAmount(e.target.value)} className="input mt-1" step="0.01" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveMethod(null)} className="btn-secondary flex-1 text-sm py-2">Cancelar</button>
                <button onClick={addPayment} className="btn-primary flex-1 text-sm py-2"
                  disabled={!(parseFloat(otherAmount) > 0)}>
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button onClick={handleProcess} disabled={!canProcess || processing}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              canProcess ? 'bg-success-500 text-white hover:bg-success-600 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}>
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </span>
            ) : canProcess ? (
              `Completar Pago — ${formatCurrency(total)}`
            ) : (
              `Falta ${formatCurrency(remaining)}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
