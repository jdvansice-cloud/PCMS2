import { useState, useEffect } from 'react'
import { FaTag } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

export default function PromoManager() {
  const [percent, setPercent] = useState(0)
  const [label, setLabel] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('promo_settings')
        .select('*')
        .limit(1)
        .single()

      if (data) {
        setPercent(data.discount_percent)
        setLabel(data.label || '')
        setIsActive(data.is_active)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  async function save() {
    setSaving(true)
    setSaved(false)

    const { data: existing } = await supabase
      .from('promo_settings')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      await supabase
        .from('promo_settings')
        .update({
          discount_percent: percent,
          label,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Promoción / Descuento</h2>
        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar'}
        </button>
      </div>

      <div className="space-y-5">
        {/* Active toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="w-5 h-5 accent-primary"
          />
          <span className="font-bold text-gray-700">Promoción activa</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
            {isActive ? 'VISIBLE' : 'OCULTO'}
          </span>
        </label>

        {/* Discount percent */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Porcentaje de descuento</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={percent}
              onChange={e => setPercent(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <div className="bg-gray-50 rounded-xl px-4 py-2 font-bold text-lg text-primary min-w-16 text-center">
              {percent}%
            </div>
          </div>
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Etiqueta (opcional)</label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Ej: Reserva en línea, Semana Santa, etc."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Preview */}
        {isActive && percent > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-2 font-medium">Vista previa:</p>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold text-sm px-5 py-2 rounded-full shadow-sm">
              <FaTag />
              {percent}% de descuento{label && ` — ${label}`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
