import { useTranslation } from 'react-i18next'
import { FaPaw, FaCut, FaCat } from 'react-icons/fa'

const packages = [
  { num: 1, key: 'pkg1', Icon: FaPaw },
  { num: 2, key: 'pkg2', Icon: FaCut },
  { num: 3, key: 'pkg3', Icon: FaCat },
] as const

export default function Grooming() {
  const { t } = useTranslation()

  return (
    <section id="grooming" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          {t('groomingSection.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map(({ num, key, Icon }) => {
            const items = t(`groomingSection.${key}Items`, { returnObjects: true }) as string[]
            return (
              <div
                key={key}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:shadow-xl transition-shadow"
              >
                {/* Number badge + title */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {num}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-800 uppercase tracking-wide">
                      {t(`groomingSection.${key}Title`)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t(`groomingSection.${key}From`)}{' '}
                      <span className="text-2xl font-extrabold text-primary">
                        {t(`groomingSection.${key}Price`)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <Icon className="text-primary/20 text-5xl" />
                </div>

                {/* Service list */}
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
