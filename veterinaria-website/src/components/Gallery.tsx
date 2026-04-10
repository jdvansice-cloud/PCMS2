import { useTranslation } from 'react-i18next'
import {
  GalleryConsultation,
  GalleryGrooming,
  GallerySurgery,
  GalleryPetshop,
  GalleryFamily,
  GalleryPlaytime,
} from './illustrations'
import type { ComponentType } from 'react'

interface IllustrationProps {
  className?: string
}

const galleryItems: { bg: string; Illustration: ComponentType<IllustrationProps> }[] = [
  { bg: 'bg-primary/5', Illustration: GalleryConsultation },
  { bg: 'bg-blue-50', Illustration: GalleryGrooming },
  { bg: 'bg-rose-50', Illustration: GallerySurgery },
  { bg: 'bg-amber-50', Illustration: GalleryPetshop },
  { bg: 'bg-green-50', Illustration: GalleryFamily },
  { bg: 'bg-violet-50', Illustration: GalleryPlaytime },
]

export default function Gallery() {
  const { t } = useTranslation()

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          {t('gallery.title')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryItems.map(({ bg, Illustration }, i) => (
            <div
              key={i}
              className={`${bg} rounded-2xl aspect-square flex items-center justify-center p-4`}
            >
              <Illustration className="w-full h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
