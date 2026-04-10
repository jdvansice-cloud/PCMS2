import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes, FaCalendarCheck, FaTag, FaShower, FaCut, FaCat, FaStethoscope, FaCalendarAlt, FaClock } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import { isGroomingService } from '../../lib/types'
import ServicePicker from './ServicePicker'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'
import PetInfoForm, { type PetInfo } from './PetInfoForm'
import BookingConfirmation from './BookingConfirmation'

type Step = 'service' | 'date' | 'time' | 'info' | 'done'

interface Props {
  open: boolean
  onClose: () => void
}

export default function BookingModal({ open, onClose }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('service')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [petInfo, setPetInfo] = useState<PetInfo | null>(null)
  const [submitting, setSubmitting] = useState(false)
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

  // Lock body scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  function handleService(s: string) {
    setService(s)
    setStep('date')
  }

  function handleDate(d: string) {
    setDate(d)
    if (isGroomingService(service)) {
      // Grooming: skip time, go straight to info
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

  function handleClose() {
    setStep('service')
    setService('')
    setDate('')
    setTime('')
    setPetInfo(null)
    onClose()
  }

  function reset() {
    setStep('service')
    setService('')
    setDate('')
    setTime('')
    setPetInfo(null)
  }

  if (!open) return null

  // Dynamic steps based on service type
  const steps: Step[] = isGrooming
    ? ['service', 'date', 'info']
    : ['service', 'date', 'time', 'info']
  const currentIdx = steps.indexOf(step)

  const serviceIcons: Record<string, typeof FaShower> = {
    bath: FaShower,
    bathCut: FaCut,
    catBath: FaCat,
    vetConsult: FaStethoscope,
  }

  function formatDateShort(dateStr: string) {
    const [, month, day] = dateStr.split('-').map(Number)
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    return `${day} ${t(`booking.${months[month - 1]}`)}`
  }

  function formatTime12(timeStr: string) {
    const [h, m] = timeStr.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  const ServiceIcon = service ? serviceIcons[service] || FaShower : null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FaCalendarCheck className="text-lg text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">{t('booking.title')}</h2>
              {discount && (
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                  <FaTag className="text-[10px]" />
                  {discount.percent}% {t('booking.discountOff')}{discount.label && ` — ${discount.label}`}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Progress bar */}
        {step !== 'done' && (
          <div className="flex items-center justify-center gap-2 py-4 bg-gray-50">
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

        {/* Selection summary bar */}
        {step !== 'service' && step !== 'done' && (
          <div className="mx-6 mt-4 flex flex-wrap items-center gap-2">
            {service && ServiceIcon && (
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full">
                <ServiceIcon className="text-xs" />
                {t(`booking.${service}`)}
              </div>
            )}
            {date && step !== 'date' && (
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full">
                <FaCalendarAlt className="text-xs" />
                {formatDateShort(date)}
              </div>
            )}
            {time && step !== 'time' && (
              <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-3 py-1.5 rounded-full">
                <FaClock className="text-xs" />
                {formatTime12(time)}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {step === 'service' && <ServicePicker onSelect={handleService} discount={discount} />}
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
    </div>
  )
}
