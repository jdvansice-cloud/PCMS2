import { useTranslation } from 'react-i18next'
import { FaShower, FaCut, FaCat, FaStethoscope, FaTag } from 'react-icons/fa'

interface Props {
  onSelect: (service: string) => void
  discount?: { percent: number; label: string } | null
}

const services = [
  { key: 'bath', icon: FaShower, priceKey: 'booking.bathPrice', price: 12.99 },
  { key: 'bathCut', icon: FaCut, priceKey: 'booking.bathCutPrice', price: 23.99 },
  { key: 'catBath', icon: FaCat, priceKey: 'booking.catBathPrice', price: 19.99 },
  { key: 'vetConsult', icon: FaStethoscope, priceKey: 'booking.vetConsultPrice', price: 0 },
]

export default function ServicePicker({ onSelect, discount }: Props) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        {t('booking.pickService')}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {services.map(({ key, icon: Icon, priceKey, price }) => {
          const hasDiscount = discount && discount.percent > 0
          const discountedPrice = hasDiscount
            ? (price * (1 - discount.percent / 100)).toFixed(2)
            : null

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-primary hover:shadow-md transition-all group cursor-pointer relative overflow-hidden"
            >
              {hasDiscount && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <FaTag className="text-[8px]" /> -{discount.percent}%
                </div>
              )}
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Icon className="text-2xl text-primary" />
              </div>
              <p className="font-bold text-gray-800 text-sm mb-1">
                {t(`booking.${key}`)}
              </p>
              {hasDiscount && price > 0 ? (
                <div>
                  <p className="text-gray-400 line-through text-sm">{t(priceKey)}</p>
                  <p className="text-green-600 font-bold text-lg">${discountedPrice}</p>
                </div>
              ) : (
                <p className="text-primary font-bold text-lg">
                  {t(priceKey)}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
