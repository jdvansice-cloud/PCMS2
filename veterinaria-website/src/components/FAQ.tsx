import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronDown } from 'react-icons/fa'

const faqKeys = ['q1', 'q2', 'q3', 'q5', 'q6'] as const

export default function FAQ() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-4">
          {t('faq.title')}
        </h2>
        <p className="text-center text-gray-500 mb-12 text-lg">
          {t('faq.subtitle')}
        </p>

        <div className="space-y-3">
          {faqKeys.map((key, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={key}
                className="bg-white rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-lg font-semibold text-gray-800 pr-4">
                    {t(`faq.${key}Question`)}
                  </span>
                  <FaChevronDown
                    className={`text-primary shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 text-gray-600 leading-relaxed">
                    {t(`faq.${key}Answer`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
