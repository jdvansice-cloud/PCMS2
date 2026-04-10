import { useTranslation } from 'react-i18next'
import { FaCheckCircle } from 'react-icons/fa'

interface Props {
  onReset: () => void
}

export default function BookingConfirmation({ onReset }: Props) {
  const { t } = useTranslation()

  return (
    <div className="text-center py-8">
      <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {t('booking.successTitle')}
      </h3>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        {t('booking.successMsg')}
      </p>
      <button
        onClick={onReset}
        className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-colors cursor-pointer"
      >
        {t('booking.bookAnother')}
      </button>
    </div>
  )
}
