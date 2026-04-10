import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaBars, FaTimes, FaGlobe } from 'react-icons/fa'
import { useBooking } from '../lib/BookingContext'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const { openBooking } = useBooking()

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
  }

  const links = [
    { href: '#home', label: t('nav.home') },
    { href: '#services', label: t('nav.services') },
    { href: '#sterilization', label: t('nav.sterilization') },
    { href: '#grooming', label: t('nav.grooming') },
    { href: '#about', label: t('nav.about') },
    { href: '#gallery', label: t('nav.gallery') },
    { href: '#contact', label: t('nav.contact') },
  ]

  return (
    <nav className="bg-primary text-white fixed top-0 w-full z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <a href="#home" className="text-xl font-bold tracking-tight">
          VETERINARIA <span className="text-white">Vida</span>
          <span className="text-accent font-extrabold">+</span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium hover:text-beige-light transition-colors"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={openBooking}
            className="text-sm font-bold bg-white/20 px-4 py-1.5 rounded-full hover:bg-white/30 transition cursor-pointer"
          >
            {t('nav.booking')}
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition cursor-pointer"
          >
            <FaGlobe />
            {i18n.language === 'es' ? 'ES' : 'EN'}
          </button>
        </div>

        <button
          className="md:hidden text-2xl cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-primary-dark px-4 pb-4 space-y-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block py-2 text-sm hover:text-beige-light"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { openBooking(); setOpen(false) }}
            className="block py-2 text-sm font-bold hover:text-beige-light cursor-pointer"
          >
            {t('nav.booking')}
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full cursor-pointer"
          >
            <FaGlobe />
            {i18n.language === 'es' ? 'ES' : 'EN'}
          </button>
        </div>
      )}
    </nav>
  )
}
