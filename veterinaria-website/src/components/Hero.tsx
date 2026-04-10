import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaWhatsapp, FaCalendarCheck, FaTag } from 'react-icons/fa'
import { supabase } from '../lib/supabase'

const photos = [
  { src: '/images/hero-vet-cat.png', alt: 'Veterinario examinando gato' },
  { src: '/images/hero-pharmacy.png', alt: 'Farmacia veterinaria' },
  { src: '/images/hero-pug.png', alt: 'Consulta veterinaria con pug' },
  { src: '/images/hero-grooming.png', alt: 'Peluquería canina Vida+' },
  { src: '/images/hero-petshop.png', alt: 'Pet Shop Vida+' },
]

export default function Hero() {
  const { t } = useTranslation()
  const [discount, setDiscount] = useState<{ percent: number; label: string } | null>(null)

  useEffect(() => {
    async function fetchPromo() {
      const { data } = await supabase
        .from('promo_settings')
        .select('*')
        .eq('is_active', true)
        .single()

      if (data && data.discount_percent > 0) {
        setDiscount({ percent: data.discount_percent, label: data.label || '' })
      }
    }
    fetchPromo()
  }, [])

  return (
    <section
      id="home"
      className="bg-primary min-h-screen flex items-center text-white pt-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Logo + text + CTA */}
          <div className="text-center lg:text-left">
            <img src="/images/logo.png" alt="Veterinaria Vida+" className="w-72 md:w-96 mx-auto lg:mx-0 mb-8" />

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              {t('hero.subtitle')}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-6">
              {/* Book Online */}
              <div className="flex flex-col items-center gap-2">
                <a
                  href="#booking"
                  className="inline-flex items-center gap-2 bg-white text-primary font-bold py-4 px-8 rounded-full text-lg transition-transform hover:scale-105 shadow-lg"
                >
                  <FaCalendarCheck className="text-xl" />
                  {t('hero.bookOnline')}
                </a>
                {discount && (
                  <div className="flex items-center gap-1.5 bg-yellow-400 text-gray-900 font-bold text-sm px-4 py-1.5 rounded-full animate-pulse shadow-md">
                    <FaTag className="text-xs" />
                    {discount.percent}% {t('hero.discount')}
                    {discount.label && ` — ${discount.label}`}
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col items-center gap-2">
                <a
                  href="https://wa.me/50766386310"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-transform hover:scale-105"
                >
                  <FaWhatsapp className="text-2xl" />
                  {t('hero.cta')}
                </a>
                <span className="text-white font-bold text-lg tracking-wide">+507 6638-6310</span>
              </div>
            </div>
          </div>

          {/* Right: Photo collage */}
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0 lg:ml-auto">
            {photos.map((photo, i) => (
              <div
                key={i}
                className={`rounded-2xl overflow-hidden shadow-lg ${
                  i === 4 ? 'col-span-2 aspect-video' : 'aspect-square'
                }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
