import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'

interface Props {
  onSelect: (date: string) => void
  onBack: () => void
}

export default function DatePicker({ onSelect, onBack }: Props) {
  const { t } = useTranslation()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set())
  const [closedDays, setClosedDays] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function fetchData() {
      const { data: hours } = await supabase
        .from('business_hours')
        .select('day_of_week, is_open')

      if (hours) {
        const closed = new Set(
          hours.filter(h => !h.is_open).map(h => h.day_of_week as number)
        )
        setClosedDays(closed)
      }

      const { data: blocked } = await supabase
        .from('blocked_dates')
        .select('blocked_date')

      if (blocked) {
        setBlockedDates(new Set(blocked.map(b => b.blocked_date)))
      }
    }
    fetchData()
  }, [])

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
    return false
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
            return (
              <button
                key={day}
                disabled={disabled}
                onClick={() => handleSelect(day)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-primary hover:text-white'
                  }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
