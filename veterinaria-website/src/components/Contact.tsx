import { useTranslation } from 'react-i18next'
import { FaPhone, FaWhatsapp, FaMapMarkerAlt, FaClock, FaInstagram, FaStar, FaGoogle } from 'react-icons/fa'

export default function Contact() {
  const { t } = useTranslation()

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          {t('contact.title')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            {/* Google Rating Badge */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
                <FaGoogle className="text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-extrabold text-gray-800">5.0</span>
                  <div className="flex text-yellow-400 ml-1">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                </div>
                <p className="text-sm text-gray-500">Google Reviews</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                <FaPhone />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('contact.phone')}</h3>
                <a href="tel:+5073961796" className="text-gray-600 hover:text-primary">(507) 396-1796</a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <FaWhatsapp />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('contact.whatsapp')}</h3>
                <a href="https://wa.me/50766386310" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600">
                  (507) 6638-6310
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('contact.address')}</h3>
                <p className="text-gray-600">{t('contact.addressText')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                <FaClock />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('contact.hours')}</h3>
                <p className="text-gray-600">{t('contact.hoursText')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center shrink-0">
                <FaInstagram />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{t('contact.followUs')}</h3>
                <a
                  href="https://www.instagram.com/veterinariavidamas/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600"
                >
                  @veterinariavidamas
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md h-80 lg:h-auto">
            <iframe
              title="Veterinaria Vida+ Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1970.4!2d-79.4328847!3d9.0458634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fab553eb7c5c58d%3A0xed1a6d6e2ee2491c!2sVeterinaria%20Vida%20M%C3%A1s!5e0!3m2!1ses!2spa!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '320px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
