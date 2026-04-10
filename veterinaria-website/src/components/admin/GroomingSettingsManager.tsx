import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function GroomingSettingsManager() {
  const [maxSlots, setMaxSlots] = useState(5)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('grooming_settings')
        .select('*')
        .single()

      if (data) setMaxSlots(data.max_daily_slots)
      setLoading(false)
    }
    fetch()
  }, [])

  async function save() {
    setSaving(true)
    await supabase
      .from('grooming_settings')
      .update({ max_daily_slots: maxSlots, updated_at: new Date().toISOString() })
      .gt('id', 0) // update all rows (there's only one)
    setSaving(false)
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
        <h2 className="text-xl font-bold text-gray-800">Capacidad de Peluquería</h2>
        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Máximo de citas de peluquería por día
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={20}
            value={maxSlots}
            onChange={e => setMaxSlots(parseInt(e.target.value))}
            className="flex-1 accent-primary"
          />
          <div className="w-16 text-center">
            <span className="text-3xl font-extrabold text-primary">{maxSlots}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Cuando se llenen las {maxSlots} citas de peluquería en un día, ese día ya no estará disponible para nuevas reservas de peluquería.
        </p>
      </div>
    </div>
  )
}
