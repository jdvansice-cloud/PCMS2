import { useTranslation } from 'react-i18next'
import { FaCheckCircle, FaShower, FaCut, FaCat, FaStethoscope, FaCalendarAlt, FaClock, FaPaw, FaUser, FaTag } from 'react-icons/fa'

interface Props {
  onReset: () => void
  service: string
  date: string
  time: string
  petName: string
  ownerName: string
  discount?: { percent: number; label: string } | null
}

const serviceIcons: Record<string, typeof FaShower> = {
  bath: FaShower,
  bathCut: FaCut,
  catBath: FaCat,
  vetConsult: FaStethoscope,
}

function formatDate(dateStr: string, t: (key: string) => string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
  return `${day} ${t(`booking.${months[month - 1]}`)} ${year}`
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function BookingConfirmation({ onReset, service, date, time, petName, ownerName, discount }: Props) {
  const { t } = useTranslation()
  const Icon = serviceIcons[service] || FaShower

  return (
    <div className="text-center py-8">
      <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {t('booking.successTitle')}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {t('booking.successMsg')}
      </p>

      {/* Booking details card */}
      <div className="bg-gray-50 rounded-2xl p-5 max-w-sm mx-auto mb-8 text-left">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          {t('booking.yourAppointment')}
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('booking.summaryService')}</p>
              <p className="font-bold text-gray-800">{t(`booking.${service}`)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaPaw className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('booking.petName')}</p>
              <p className="font-bold text-gray-800">{petName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaUser className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('booking.ownerName')}</p>
              <p className="font-bold text-gray-800">{ownerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaCalendarAlt className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('booking.summaryDate')}</p>
              <p className="font-bold text-gray-800">{formatDate(date, t)}</p>
            </div>
          </div>
          {time && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaClock className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{t('booking.summaryTime')}</p>
                <p className="font-bold text-gray-800">{formatTime(time)}</p>
              </div>
            </div>
          )}
          {discount && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaTag className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{t('booking.discountOff')}</p>
                <p className="font-bold text-yellow-600">
                  {discount.percent}% {t('booking.discountOff')}{discount.label && ` — ${discount.label}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onReset}
        className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
      >
        {t('booking.bookAnother')}
      </button>
    </div>
  )
}
