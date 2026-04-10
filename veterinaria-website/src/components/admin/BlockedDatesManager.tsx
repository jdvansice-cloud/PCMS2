import { useState, useEffect } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import type { BlockedDate } from '../../lib/types'

export default function BlockedDatesManager() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchBlocked() {
    const { data } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('blocked_date')

    if (data) setBlockedDates(data as BlockedDate[])
    setLoading(false)
  }

  useEffect(() => {
    fetchBlocked()
  }, [])

  async function addDate() {
    if (!newDate) return
    await supabase.from('blocked_dates').insert({
      blocked_date: newDate,
      reason: newReason || null,
    })
    setNewDate('')
    setNewReason('')
    fetchBlocked()
  }

  async function removeDate(id: number) {
    await supabase.from('blocked_dates').delete().eq('id', id)
    fetchBlocked()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Fechas Bloqueadas</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="date"
          value={newDate}
          onChange={e => setNewDate(e.target.value)}
          className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
        />
        <input
          placeholder="Razón (opcional)"
          value={newReason}
          onChange={e => setNewReason(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
        />
        <button
          onClick={addDate}
          className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <FaPlus /> Agregar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : blockedDates.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No hay fechas bloqueadas</p>
      ) : (
        <div className="space-y-2">
          {blockedDates.map(bd => (
            <div key={bd.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <span className="font-bold text-gray-700">
                  {new Date(bd.blocked_date + 'T00:00:00').toLocaleDateString('es-PA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {bd.reason && <span className="text-gray-400 ml-2">— {bd.reason}</span>}
              </div>
              <button
                onClick={() => removeDate(bd.id)}
                className="text-red-400 hover:text-red-600 p-2 cursor-pointer"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
