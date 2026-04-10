import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { BusinessHours, WebBooking } from '../../lib/types'

export function useAvailableSlots(date: string | null) {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!date) {
      setSlots([])
      return
    }

    async function fetchSlots() {
      setLoading(true)

      const dateObj = new Date(date + 'T00:00:00')
      const dayOfWeek = dateObj.getDay() // 0=Sun, 1=Mon, ...

      // Get business hours for this day
      const { data: hours } = await supabase
        .from('business_hours')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .single()

      if (!hours || !hours.is_open) {
        setSlots([])
        setLoading(false)
        return
      }

      // Check if date is blocked
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('id')
        .eq('blocked_date', date)

      if (blocked && blocked.length > 0) {
        setSlots([])
        setLoading(false)
        return
      }

      // Get existing bookings for this date
      const { data: bookings } = await supabase
        .from('web_bookings')
        .select('booking_time')
        .eq('booking_date', date)
        .neq('status', 'cancelled')

      const bookedTimes = new Set(
        (bookings as Pick<WebBooking, 'booking_time'>[] || []).map(b => b.booking_time)
      )

      // Generate available slots
      const bh = hours as BusinessHours
      const [openH, openM] = bh.open_time.split(':').map(Number)
      const [closeH, closeM] = bh.close_time.split(':').map(Number)
      const duration = bh.slot_duration_minutes

      const available: string[] = []
      let currentMin = openH * 60 + openM
      const endMin = closeH * 60 + closeM

      while (currentMin + duration <= endMin) {
        const h = Math.floor(currentMin / 60)
        const m = currentMin % 60
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`

        if (!bookedTimes.has(timeStr)) {
          available.push(timeStr)
        }

        currentMin += duration
      }

      setSlots(available)
      setLoading(false)
    }

    fetchSlots()
  }, [date])

  return { slots, loading }
}
