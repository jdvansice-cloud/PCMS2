import { useTranslation } from 'react-i18next'
import { FaInstagram, FaWhatsapp, FaPhone } from 'react-icons/fa'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-primary text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              VETERINARIA Vida<span className="text-accent">+</span>
            </h3>
            <p className="text-white/70 text-sm">
              Juan Díaz, Ciudad Radial<br />
              Radiant Plaza, Local 1 y 2
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('nav.services')}</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>{t('services.clinic')}</li>
              <li>{t('services.lab')}</li>
              <li>{t('services.pharmacy')}</li>
              <li>{t('services.petshop')}</li>
              <li>{t('services.grooming')}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">{t('contact.title')}</h4>
            <div className="space-y-2 text-sm text-white/70">
              <a href="tel:+5073961796" className="flex items-center gap-2 hover:text-white">
                <FaPhone /> (507) 396-1796
              </a>
              <a href="https://wa.me/50766386310" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                <FaWhatsapp /> (507) 6638-6310
              </a>
              <a href="https://www.instagram.com/veterinariavidamas/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                <FaInstagram /> @veterinariavidamas
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 text-center text-sm text-white/50">
          © {new Date().getFullYear()} Veterinaria Vida+. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  )
}
