import { useTranslation } from 'react-i18next'
import { FaClock } from 'react-icons/fa'

const schedule = [
  { dayKey: 'mon', open: null },
  { dayKey: 'tue', open: '9:00 AM – 5:30 PM' },
  { dayKey: 'wed', open: '9:00 AM – 5:30 PM' },
  { dayKey: 'thu', open: '9:00 AM – 5:30 PM' },
  { dayKey: 'fri', open: '9:00 AM – 5:30 PM' },
  { dayKey: 'sat', open: '9:00 AM – 5:30 PM' },
  { dayKey: 'sun', open: '9:00 AM – 5:30 PM' },
]

function getCurrentDay() {
  return new Date().getDay() // 0=Sun, 1=Mon...
}

export default function Hours() {
  const { t } = useTranslation()
  const today = getCurrentDay()
  const dayIndexMap = [6, 0, 1, 2, 3, 4, 5] // map JS day (0=Sun) to schedule index

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 text-primary rounded-full mb-4">
            <FaClock className="text-2xl" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">
            {t('hours.title')}
          </h2>
        </div>

        <div className="bg-gray-50 rounded-3xl p-6 md:p-10 shadow-sm">
          <div className="space-y-0 divide-y divide-gray-200">
            {schedule.map((day, i) => {
              const isToday = dayIndexMap[today] === i
              return (
                <div
                  key={day.dayKey}
                  className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors ${
                    isToday ? 'bg-primary/5 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isToday && (
                      <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    )}
                    <span className={`text-lg ${isToday ? 'text-primary' : 'text-gray-700'}`}>
                      {t(`hours.${day.dayKey}`)}
                    </span>
                  </div>
                  <span
                    className={`text-lg ${
                      day.open
                        ? isToday
                          ? 'text-primary'
                          : 'text-gray-600'
                        : 'text-accent font-semibold'
                    }`}
                  >
                    {day.open ?? t('hours.closed')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
