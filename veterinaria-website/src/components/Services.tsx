import { useTranslation } from 'react-i18next'
import {
  ServiceClinic,
  ServiceLab,
  ServicePharmacy,
  ServicePetshop,
  ServiceGrooming,
  ServiceFuneral,
} from './illustrations'
import type { ComponentType } from 'react'

interface IllustrationProps {
  className?: string
}

const serviceKeys: { key: string; icon: ComponentType<IllustrationProps> }[] = [
  { key: 'clinic', icon: ServiceClinic },
  { key: 'lab', icon: ServiceLab },
  { key: 'pharmacy', icon: ServicePharmacy },
  { key: 'petshop', icon: ServicePetshop },
  { key: 'grooming', icon: ServiceGrooming },
  { key: 'funeral', icon: ServiceFuneral },
]

export default function Services() {
  const { t } = useTranslation()

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          {t('services.title')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceKeys.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="bg-white rounded-2xl shadow-md p-8 text-center hover:shadow-xl transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
                <Icon className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {t(`services.${key}`)}
              </h3>
              <p className="text-gray-600">{t(`services.${key}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
