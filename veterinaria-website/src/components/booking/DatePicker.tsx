import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import { isGroomingService } from '../../lib/types'

interface Props {
  onSelect: (date: string) => void
  onBack: () => void
  service: string
}

export default function DatePicker({ onSelect, onBack, service }: Props) {
  const { t } = useTranslation()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())
  const [closedDays, setClosedDays] = useState<Set<number>>(new Set())
  // For grooming: dates that are fully booked
  const [fullGroomingDates, setFullGroomingDates] = useState<Set<string>>(new Set())

  const isGrooming = isGroomingService(service)

  useEffect(() => {
    async function fetchData() {
      // Blocked dates
      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('blocked_date')

      if (blocked) {
        setBlockedDates(new Set(blocked.map(b => b.blocked_date)))
      }

      if (isGrooming) {
        // For grooming: use business_hours for clinic open days
        const { data: hours } = await supabase
          .from('business_hours')
          .select('day_of_week, is_open')

        if (hours) {
          setClosedDays(new Set(
            hours.filter(h => !h.is_open).map(h => h.day_of_week as number)
          ))
        }
      } else {
        // For consults: use dr_availability for days the doctor is available
        const { data: drHours } = await supabase
          .from('dr_availability')
          .select('day_of_week, is_available')

        if (drHours) {
          // A day is "closed" for consults if there are no available ranges
          const availableDays = new Set(
            drHours.filter(h => h.is_available).map(h => h.day_of_week as number)
          )
          const closed = new Set<number>()
          for (let d = 0; d < 7; d++) {
            if (!availableDays.has(d)) closed.add(d)
          }
          setClosedDays(closed)
        }
      }
    }
    fetchData()
  }, [isGrooming])

  // For grooming: check capacity for current month
  useEffect(() => {
    if (!isGrooming) return

    async function fetchGroomingCapacity() {
      // Get max daily slots
      const { data: settings } = await supabase
        .from('grooming_settings')
        .select('max_daily_slots')
        .single()

      if (!settings) return

      const maxSlots = settings.max_daily_slots

      // Get all grooming bookings for visible month range
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month + 2 > 12 ? 1 : month + 2).padStart(2, '0')}-01`

      const { data: bookings } = await supabase
        .from('web_bookings')
        .select('booking_date, service')
        .gte('booking_date', startDate)
        .lt('booking_date', endDate)
        .neq('status', 'cancelled')
        .in('service', ['bath', 'bathCut', 'catBath'])

      if (bookings) {
        const countByDate: Record<string, number> = {}
        bookings.forEach(b => {
          countByDate[b.booking_date] = (countByDate[b.booking_date] || 0) + 1
        })

        const full = new Set<string>()
        Object.entries(countByDate).forEach(([date, count]) => {
          if (count >= maxSlots) full.add(date)
        })
        setFullGroomingDates(full)
      }
    }
    fetchGroomingCapacity()
  }, [isGrooming, currentMonth])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayNames = [
    t('booking.sun'), t('booking.mon'), t('booking.tue'),
    t('booking.wed'), t('booking.thu'), t('booking.fri'), t('booking.sat')
  ]

  const monthNames = [
    t('booking.jan'), t('booking.feb'), t('booking.mar'), t('booking.apr'),
    t('booking.may'), t('booking.jun'), t('booking.jul'), t('booking.aug'),
    t('booking.sep'), t('booking.oct'), t('booking.nov'), t('booking.dec')
  ]

  function isDisabled(day: number) {
    const date = new Date(year, month, day)
    if (date < today) return true
    if (closedDays.has(date.getDay())) return true
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (blockedDates.has(dateStr)) return true
    if (isGrooming && fullGroomingDates.has(dateStr)) return true
    return false
  }

  function isFull(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return isGrooming && fullGroomingDates.has(dateStr)
  }

  function handleSelect(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onSelect(dateStr)
  }

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  return (
    <div>
      <button onClick={onBack} className="text-primary font-medium mb-4 flex items-center gap-1 hover:underline cursor-pointer">
        <FaChevronLeft className="text-xs" /> {t('booking.back')}
      </button>

      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        {t('booking.pickDate')}
      </h3>

      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <FaChevronLeft className="text-gray-600" />
          </button>
          <span className="font-bold text-gray-800">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {dayNames.map(d => (
            <div key={d} className="font-bold text-gray-400 py-2">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const disabled = isDisabled(day)
            const full = isFull(day)
            return (
              <button
                key={day}
                disabled={disabled}
                onClick={() => handleSelect(day)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer relative
                  ${disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-primary hover:text-white'
                  }`}
                title={full ? t('booking.dateFull') : undefined}
              >
                {day}
                {full && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
