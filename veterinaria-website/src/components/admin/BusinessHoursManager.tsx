import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { BusinessHours } from '../../lib/types'

const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export default function BusinessHoursManager() {
  const [hours, setHours] = useState<BusinessHours[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function fetchHours() {
    const { data } = await supabase
      .from('business_hours')
      .select('*')
      .order('day_of_week')

    if (data) setHours(data as BusinessHours[])
    setLoading(false)
  }

  useEffect(() => {
    fetchHours()
  }, [])

  function updateHour(idx: number, field: keyof BusinessHours, value: string | boolean | number) {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h))
  }

  async function save() {
    setSaving(true)
    for (const h of hours) {
      await supabase
        .from('business_hours')
        .update({
          is_open: h.is_open,
          open_time: h.open_time,
          close_time: h.close_time,
          slot_duration_minutes: h.slot_duration_minutes,
        })
        .eq('id', h.id)
    }
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
        <h2 className="text-xl font-bold text-gray-800">Horario de Atención</h2>
        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="space-y-3">
        {hours.map((h, i) => (
          <div key={h.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <div className="w-28 shrink-0">
              <span className="font-bold text-gray-700">{dayLabels[h.day_of_week]}</span>
            </div>

            <label className="flex items-center gap-2 shrink-0">
              <input
                type="checkbox"
                checked={h.is_open}
                onChange={e => updateHour(i, 'is_open', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm text-gray-600">Abierto</span>
            </label>

            {h.is_open && (
              <>
                <input
                  type="time"
                  value={h.open_time}
                  onChange={e => updateHour(i, 'open_time', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                />
                <span className="text-gray-400 text-sm">a</span>
                <input
                  type="time"
                  value={h.close_time}
                  onChange={e => updateHour(i, 'close_time', e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={15}
                    max={120}
                    step={15}
                    value={h.slot_duration_minutes}
                    onChange={e => updateHour(i, 'slot_duration_minutes', parseInt(e.target.value) || 60)}
                    className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center"
                  />
                  <span className="text-sm text-gray-500">min</span>
                </div>
              </>
            )}

            {!h.is_open && (
              <span className="text-sm text-red-400 font-medium">Cerrado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
