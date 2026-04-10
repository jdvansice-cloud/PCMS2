import { useTranslation } from 'react-i18next'
import { FaDog, FaCat, FaWhatsapp, FaCheckCircle } from 'react-icons/fa'

export default function Sterilization() {
  const { t } = useTranslation()
  const requirements = ['req1', 'req2', 'req3', 'req4'] as const

  const packages = [
    {
      icon: FaDog,
      titleKey: 'dogs' as const,
      price: 65,
      color: 'from-primary to-primary-dark',
      iconBg: 'bg-primary',
    },
    {
      icon: FaCat,
      titleKey: 'cats' as const,
      price: 45,
      color: 'from-accent to-red-700',
      iconBg: 'bg-accent',
    },
  ]

  return (
    <section id="sterilization" className="py-20 bg-primary text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border-2 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-4">
          {t('sterilization.title')}
        </h2>
        <p className="text-center text-white/60 mb-14 max-w-xl mx-auto text-lg">
          {t('sterilization.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {packages.map(({ icon: Icon, titleKey, price, color, iconBg }) => (
            <div
              key={titleKey}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-1 group"
            >
              {/* Colored header strip */}
              <div className={`bg-gradient-to-r ${color} p-6 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${iconBg} bg-opacity-30 backdrop-blur rounded-2xl flex items-center justify-center`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white">
                    {t(`sterilization.${titleKey}`)}
                  </h3>
                </div>
              </div>

              {/* Price */}
              <div className="px-8 pt-8 pb-4 text-center">
                <div className="inline-block">
                  <span className="text-gray-400 text-lg align-top">$</span>
                  <span className="text-6xl font-black text-gray-800">{price}</span>
                  <span className="text-gray-400 text-2xl">.00</span>
                </div>
              </div>

              {/* Requirements */}
              <div className="px-8 pb-8">
                <ul className="space-y-3">
                  {requirements.map((req) => (
                    <li key={req} className="flex items-center gap-3 text-gray-600">
                      <FaCheckCircle className="text-green-500 shrink-0" />
                      <span>{t(`sterilization.${req}`)}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="https://wa.me/50766386310"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r ${color} text-white font-bold py-3 px-6 rounded-full transition-transform hover:scale-105`}
                >
                  <FaWhatsapp className="text-xl" />
                  {t('hero.cta')}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
