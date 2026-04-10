import { useTranslation } from 'react-i18next'
import { FaShower, FaCut, FaCat, FaStethoscope } from 'react-icons/fa'

interface Props {
  onSelect: (service: string) => void
}

const services = [
  { key: 'bath', icon: FaShower, priceKey: 'booking.bathPrice' },
  { key: 'bathCut', icon: FaCut, priceKey: 'booking.bathCutPrice' },
  { key: 'catBath', icon: FaCat, priceKey: 'booking.catBathPrice' },
  { key: 'vetConsult', icon: FaStethoscope, priceKey: 'booking.vetConsultPrice' },
]

export default function ServicePicker({ onSelect }: Props) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        {t('booking.pickService')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {services.map(({ key, icon: Icon, priceKey }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-primary hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
              <Icon className="text-2xl text-primary" />
            </div>
            <p className="font-bold text-gray-800 text-sm mb-1">
              {t(`booking.${key}`)}
            </p>
            <p className="text-primary font-bold text-lg">
              {t(priceKey)}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
