import { useTranslation } from 'react-i18next'
import { FaChevronLeft } from 'react-icons/fa'
import { useAvailableSlots } from './useAvailableSlots'

interface Props {
  date: string
  onSelect: (time: string) => void
  onBack: () => void
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function TimePicker({ date, onSelect, onBack }: Props) {
  const { t } = useTranslation()
  const { slots, loading } = useAvailableSlots(date)

  const dateObj = new Date(date + 'T00:00:00')
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      <button onClick={onBack} className="text-primary font-medium mb-4 flex items-center gap-1 hover:underline cursor-pointer">
        <FaChevronLeft className="text-xs" /> {t('booking.back')}
      </button>

      <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
        {t('booking.pickTime')}
      </h3>
      <p className="text-gray-500 text-center mb-6 capitalize">{formattedDate}</p>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : slots.length === 0 ? (
        <p className="text-center text-gray-500 py-8">{t('booking.noSlots')}</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-md mx-auto">
          {slots.map(time => (
            <button
              key={time}
              onClick={() => onSelect(time)}
              className="py-3 px-4 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:border-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              {formatTime(time)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
