import { useState, useEffect } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import type { DrAvailability } from '../../lib/types'

const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface DayGroup {
  day: number
  ranges: DrAvailability[]
}

export default function DrAvailabilityManager() {
  const [days, setDays] = useState<DayGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    const { data } = await supabase
      .from('dr_availability')
      .select('*')
      .order('day_of_week')
      .order('start_time')

    if (data) {
      const grouped: DayGroup[] = []
      for (let d = 0; d < 7; d++) {
        const ranges = (data as DrAvailability[]).filter(r => r.day_of_week === d)
        grouped.push({ day: d, ranges })
      }
      setDays(grouped)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  function updateRange(dayIdx: number, rangeIdx: number, field: keyof DrAvailability, value: string | boolean | number) {
    setDays(prev => prev.map((dg, di) => {
      if (di !== dayIdx) return dg
      return {
        ...dg,
        ranges: dg.ranges.map((r, ri) => ri === rangeIdx ? { ...r, [field]: value } : r),
      }
    }))
  }

  function addRange(dayIdx: number) {
    setDays(prev => prev.map((dg, di) => {
      if (di !== dayIdx) return dg
      const newRange: DrAvailability = {
        id: -Date.now(), // temp negative id for new rows
        day_of_week: dg.day,
        is_available: true,
        start_time: '14:00',
        end_time: '17:30',
        slot_duration_minutes: 60,
      }
      return { ...dg, ranges: [...dg.ranges, newRange] }
    }))
  }

  function removeRange(dayIdx: number, rangeIdx: number) {
    setDays(prev => prev.map((dg, di) => {
      if (di !== dayIdx) return dg
      return { ...dg, ranges: dg.ranges.filter((_, ri) => ri !== rangeIdx) }
    }))
  }

  async function save() {
    setSaving(true)

    // Delete all existing rows and re-insert
    await supabase.from('dr_availability').delete().gte('id', 0)

    const rows = days.flatMap(dg => {
      if (dg.ranges.length === 0) {
        // Day with no ranges = not available
        return [{
          day_of_week: dg.day,
          is_available: false,
          start_time: '09:00',
          end_time: '17:30',
          slot_duration_minutes: 60,
        }]
      }
      return dg.ranges.map(r => ({
        day_of_week: r.day_of_week,
        is_available: r.is_available,
        start_time: r.start_time,
        end_time: r.end_time,
        slot_duration_minutes: r.slot_duration_minutes,
      }))
    })

    await supabase.from('dr_availability').insert(rows)
    await fetchData()
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
        <h2 className="text-xl font-bold text-gray-800">Disponibilidad del Dr.</h2>
        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-white font-bold px-6 py-2 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="space-y-4">
        {days.map((dg, dayIdx) => {
          const hasRanges = dg.ranges.length > 0
          const allDisabled = hasRanges && dg.ranges.every(r => !r.is_available)

          return (
            <div key={dg.day} className="bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-700 w-28">{dayLabels[dg.day]}</span>
                {(!hasRanges || allDisabled) && (
                  <span className="text-sm text-red-400 font-medium">No disponible</span>
                )}
                <button
                  onClick={() => addRange(dayIdx)}
                  className="flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  <FaPlus className="text-[10px]" /> Agregar horario
                </button>
              </div>

              {dg.ranges.map((r, rangeIdx) => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-3 ml-0 sm:ml-4 mb-2 bg-white rounded-lg px-3 py-2">
                  <label className="flex items-center gap-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={r.is_available}
                      onChange={e => updateRange(dayIdx, rangeIdx, 'is_available', e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-gray-600">Activo</span>
                  </label>

                  {r.is_available && (
                    <>
                      <input
                        type="time"
                        value={r.start_time}
                        onChange={e => updateRange(dayIdx, rangeIdx, 'start_time', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                      />
                      <span className="text-gray-400 text-sm">a</span>
                      <input
                        type="time"
                        value={r.end_time}
                        onChange={e => updateRange(dayIdx, rangeIdx, 'end_time', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={15}
                          max={120}
                          step={15}
                          value={r.slot_duration_minutes}
                          onChange={e => updateRange(dayIdx, rangeIdx, 'slot_duration_minutes', parseInt(e.target.value) || 60)}
                          className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center"
                        />
                        <span className="text-sm text-gray-500">min</span>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => removeRange(dayIdx, rangeIdx)}
                    className="text-red-400 hover:text-red-600 ml-auto cursor-pointer p-1"
                    title="Eliminar"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
