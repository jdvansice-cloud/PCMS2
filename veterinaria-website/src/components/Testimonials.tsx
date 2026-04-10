import { useTranslation } from 'react-i18next'
import { FaStar, FaQuoteLeft } from 'react-icons/fa'

const testimonialKeys = ['t1', 't2', 't3'] as const

export default function Testimonials() {
  const { t } = useTranslation()

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-4">
          {t('testimonials.title')}
        </h2>
        <div className="flex justify-center gap-1 text-yellow-400 text-xl mb-12">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialKeys.map((key) => (
            <div
              key={key}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow relative"
            >
              <FaQuoteLeft className="text-primary/10 text-4xl absolute top-6 right-6" />
              <div className="flex gap-1 text-yellow-400 mb-5 text-sm">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t(`testimonials.${key}`)}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  {t(`testimonials.${key}Author`).charAt(0)}
                </div>
                <span className="font-bold text-gray-800">{t(`testimonials.${key}Author`)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
