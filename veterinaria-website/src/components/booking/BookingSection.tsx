import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCalendarCheck, FaTag } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import { isGroomingService } from '../../lib/types'
import ServicePicker from './ServicePicker'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'
import PetInfoForm, { type PetInfo } from './PetInfoForm'
import BookingConfirmation from './BookingConfirmation'

type Step = 'service' | 'date' | 'time' | 'info' | 'done'

export default function BookingSection() {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('service')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [petInfo, setPetInfo] = useState<PetInfo | null>(null)
  const [discount, setDiscount] = useState<{ percent: number; label: string } | null>(null)

  const isGrooming = isGroomingService(service)

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

  function handleService(s: string) {
    setService(s)
    setStep('date')
  }

  function handleDate(d: string) {
    setDate(d)
    if (isGroomingService(service)) {
      setTime('')
      setStep('info')
    } else {
      setStep('time')
    }
  }

  function handleTime(t: string) {
    setTime(t)
    setStep('info')
  }

  async function handleSubmit(info: PetInfo) {
    setSubmitting(true)
    try {
      const { error } = await supabase.from('web_bookings').insert({
        service,
        booking_date: date,
        booking_time: time || null,
        pet_name: info.petName,
        pet_type: info.petType,
        owner_name: info.ownerName,
        owner_phone: info.ownerPhone,
        owner_email: info.ownerEmail || null,
        notes: info.notes || null,
        status: 'pending',
      })

      if (error) throw error

      setPetInfo(info)

      supabase.functions.invoke('send-email', {
        body: { service, date, time, ...info },
      }).catch(() => {})

      setStep('done')
    } catch (err) {
      console.error('Booking error:', err)
      alert(t('booking.error'))
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setStep('service')
    setService('')
    setDate('')
    setTime('')
    setPetInfo(null)
  }

  // Dynamic steps
  const steps: Step[] = isGrooming
    ? ['service', 'date', 'info']
    : ['service', 'date', 'time', 'info']
  const currentIdx = steps.indexOf(step)

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-4">
            <FaCalendarCheck className="text-2xl text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">
            {t('booking.title')}
          </h2>
          <p className="text-gray-500">{t('booking.subtitle')}</p>
          {discount && (
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold text-sm px-5 py-2 rounded-full mt-4 shadow-sm">
              <FaTag />
              {discount.percent}% {t('booking.discountOff')}
              {discount.label && ` — ${discount.label}`}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {step !== 'done' && (
          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${i <= currentIdx ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < currentIdx ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {step === 'service' && <ServicePicker onSelect={handleService} />}
          {step === 'date' && <DatePicker onSelect={handleDate} onBack={() => setStep('service')} service={service} />}
          {step === 'time' && <TimePicker date={date} onSelect={handleTime} onBack={() => setStep('date')} />}
          {step === 'info' && (
            <PetInfoForm
              onSubmit={handleSubmit}
              onBack={() => setStep(isGrooming ? 'date' : 'time')}
              submitting={submitting}
            />
          )}
          {step === 'done' && <BookingConfirmation onReset={reset} service={service} date={date} time={time} petName={petInfo?.petName || ''} ownerName={petInfo?.ownerName || ''} />}
        </div>
      </div>
    </section>
  )
}
