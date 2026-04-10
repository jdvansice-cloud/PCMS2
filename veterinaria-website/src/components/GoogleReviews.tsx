import { useTranslation } from 'react-i18next'
import { FaStar, FaGoogle } from 'react-icons/fa'

export default function GoogleReviews() {
  const { t } = useTranslation()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6 shadow-lg">
              <FaGoogle className="text-3xl text-blue-500" />
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold mb-4">
              {t('reviews.title')}
            </h3>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-5xl font-black">5.0</span>
              <div className="flex gap-1 text-yellow-400 text-2xl">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
            </div>

            <p className="text-white/70 mb-8 text-lg">
              {t('reviews.subtitle')}
            </p>

            <a
              href="https://g.page/r/CR5wjl9/NCliEB0/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-transform hover:scale-105"
            >
              <FaGoogle />
              {t('reviews.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
