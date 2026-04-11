import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCalendarCheck, FaTag, FaTruck, FaTimes } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import { isGroomingService } from '../../lib/types'
import ServicePicker from './ServicePicker'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'
import PetInfoForm, { type PetInfo } from './PetInfoForm'
import LocationPicker from './LocationPicker'
import BookingConfirmation from './BookingConfirmation'

type Step = 'service' | 'date' | 'time' | 'pickup' | 'location' | 'info' | 'done'

export default function BookingSection() {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('service')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [needsPickup, setNeedsPickup] = useState(false)
  const [pickupLocation, setPickupLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
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
      setStep('pickup')
    } else {
      setStep('time')
    }
  }

  function handleTime(t: string) {
    setTime(t)
    setStep('pickup')
  }

  function handlePickupYes() {
    setNeedsPickup(true)
    setStep('location')
  }

  function handlePickupNo() {
    setNeedsPickup(false)
    setPickupLocation(null)
    setStep('info')
  }

  function handleLocation(loc: { lat: number; lng: number; address: string }) {
    setPickupLocation(loc)
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
        pet_size: info.petSize || null,
        owner_name: info.ownerName,
        owner_phone: info.ownerPhone,
        owner_email: info.ownerEmail || null,
        notes: info.notes || null,
        needs_pickup: needsPickup,
        pickup_lat: pickupLocation?.lat || null,
        pickup_lng: pickupLocation?.lng || null,
        pickup_address: pickupLocation?.address || null,
        status: 'pending',
      })

      if (error) throw error

      setPetInfo(info)

      supabase.functions.invoke('send-email', {
        body: { service, date, time, needsPickup, pickupAddress: pickupLocation?.address, ...info },
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
    setNeedsPickup(false)
    setPickupLocation(null)
    setPetInfo(null)
  }

  const progressSteps: Step[] = isGrooming
    ? ['service', 'date', 'pickup', 'info']
    : ['service', 'date', 'time', 'pickup', 'info']
  const currentIdx = step === 'location'
    ? progressSteps.indexOf('pickup')
    : progressSteps.indexOf(step)

  const prevStepBeforePickup = isGrooming ? 'date' : 'time'

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
            {progressSteps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${i <= currentIdx ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {i + 1}
                </div>
                {i < progressSteps.length - 1 && (
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
          {step === 'pickup' && (
            <PickupQuestion
              onYes={handlePickupYes}
              onNo={handlePickupNo}
              onBack={() => setStep(prevStepBeforePickup as Step)}
            />
          )}
          {step === 'location' && (
            <LocationPicker
              onSelect={handleLocation}
              onBack={() => setStep('pickup')}
            />
          )}
          {step === 'info' && (
            <PetInfoForm
              onSubmit={handleSubmit}
              onBack={() => setStep(needsPickup ? 'location' : 'pickup')}
              submitting={submitting}
              service={service}
            />
          )}
          {step === 'done' && <BookingConfirmation onReset={reset} service={service} date={date} time={time} petName={petInfo?.petName || ''} ownerName={petInfo?.ownerName || ''} discount={discount} />}
        </div>
      </div>
    </section>
  )
}

function PickupQuestion({ onYes, onNo, onBack }: { onYes: () => void; onNo: () => void; onBack: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {t('booking.pickupQuestion')}
      </h3>
      <p className="text-gray-500 text-sm mb-8">
        {t('booking.pickupQuestionHint')}
      </p>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
        <button
          onClick={onYes}
          className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-primary hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <FaTruck className="text-2xl text-green-600" />
          </div>
          <p className="font-bold text-gray-800">{t('booking.yes')}</p>
        </button>

        <button
          onClick={onNo}
          className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-primary hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-200 transition-colors">
            <FaTimes className="text-2xl text-gray-500" />
          </div>
          <p className="font-bold text-gray-800">{t('booking.no')}</p>
        </button>
      </div>

      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        {t('booking.back')}
      </button>
    </div>
  )
}
