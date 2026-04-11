import { useTranslation } from 'react-i18next'
import { FaCat } from 'react-icons/fa'

const STORAGE_BASE = 'https://wwwvwuzbfbyvoerwigid.supabase.co/storage/v1/object/public/site-images'
const SIZE_BASE = `${STORAGE_BASE}/dog-sizes`

const packages = [
  { num: 1, key: 'pkg1', img: `${STORAGE_BASE}/perro-bano.png` },
  { num: 2, key: 'pkg2', img: `${STORAGE_BASE}/perro-corte.png` },
  { num: 3, key: 'pkg3', img: `${STORAGE_BASE}/gato-bano.png` },
] as const

const dogSizes = [
  { key: 'small', label: 'sizeSmall', lbs: 'sizeSmallLbs', img: `${SIZE_BASE}/pequeno.png` },
  { key: 'medium', label: 'sizeMedium', lbs: 'sizeMediumLbs', img: `${SIZE_BASE}/mediano.png` },
  { key: 'large', label: 'sizeLarge', lbs: 'sizeLargeLbs', img: `${SIZE_BASE}/grande.png` },
  { key: 'xl', label: 'sizeXL', lbs: 'sizeXLLbs', img: `${SIZE_BASE}/xl.png` },
] as const

const bathPrices = ['$12.99', '$15.99', '$19.99', '$25.99']
const bathCutPrices = ['$23.99', '$29.99', '$35.99', '$45.99']

export default function Grooming() {
  const { t } = useTranslation()

  return (
    <section id="grooming" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          {t('groomingSection.title')}
        </h2>

        {/* Service cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map(({ num, key, img }) => {
            const items = t(`groomingSection.${key}Items`, { returnObjects: true }) as string[]
            return (
              <div
                key={key}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:shadow-xl transition-shadow"
              >
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

                <div className="flex justify-center mb-6">
                  <img
                    src={img}
                    alt={t(`groomingSection.${key}Title`)}
                    className="h-32 w-auto object-contain rounded-xl"
                  />
                </div>

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

        {/* Pricing by size — unified card design */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-primary/5 px-8 py-6 border-b border-gray-100">
            <h3 className="text-2xl font-extrabold text-gray-800 text-center">
              {t('groomingSection.sizeChartTitle')}
            </h3>
          </div>

          {/* Dog services pricing */}
          <div className="p-6 md:p-8">
            {/* Size row with icons — visual reference */}
            <div className="grid grid-cols-4 gap-3 md:gap-4 mb-6">
              {dogSizes.map(({ key, label, lbs, img }) => (
                <div key={key} className="text-center">
                  <div className="flex justify-center items-end h-32 md:h-40 mb-2">
                    <img
                      src={img}
                      alt={t(`groomingSection.${label}`)}
                      className="h-full w-auto object-contain rounded-lg"
                    />
                  </div>
                  <p className="font-extrabold text-gray-800 text-sm md:text-base">
                    {t(`groomingSection.${label}`)}
                  </p>
                  <p className="text-[11px] text-gray-400">{t(`groomingSection.${lbs}`)}</p>
                </div>
              ))}
            </div>

            {/* Bath row */}
            <div className="bg-gray-50 rounded-xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">
                {t('groomingSection.pkg1Title')}
              </p>
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {bathPrices.map((price, i) => (
                  <div key={i} className="text-center">
                    <span className="text-lg md:text-xl font-extrabold text-primary">{price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bath & Cut row */}
            <div className="bg-gray-50 rounded-xl p-4 mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">
                {t('groomingSection.pkg2Title')}
              </p>
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {bathCutPrices.map((price, i) => (
                  <div key={i} className="text-center">
                    <span className="text-lg md:text-xl font-extrabold text-primary">{price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cat bath — separate, simple */}
            <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaCat className="text-primary text-lg" />
                <span className="font-bold text-gray-800">{t('groomingSection.pkg3Title')}</span>
              </div>
              <span className="text-xl font-extrabold text-primary">{t('groomingSection.pkg3Price')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
