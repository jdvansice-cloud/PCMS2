import { useTranslation } from 'react-i18next'
import { FaShieldAlt, FaHandHoldingHeart, FaClock } from 'react-icons/fa'
import { VetTeam } from './illustrations'

export default function AboutUs() {
  const { t } = useTranslation()

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          {t('about.title')}
        </h2>

        <VetTeam className="w-64 md:w-80 h-auto mx-auto mb-10" />

        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-lg text-gray-700 mb-4">{t('about.text1')}</p>
          <p className="text-lg text-gray-700">{t('about.text2')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
              <FaShieldAlt className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {t('about.title') === 'Sobre Nosotros' ? 'Confianza' : 'Trust'}
            </h3>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
              <FaHandHoldingHeart className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {t('about.title') === 'Sobre Nosotros' ? 'Amor' : 'Love'}
            </h3>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
              <FaClock className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {t('about.title') === 'Sobre Nosotros' ? 'Dedicación' : 'Dedication'}
            </h3>
          </div>
        </div>
      </div>
    </section>
  )
}
