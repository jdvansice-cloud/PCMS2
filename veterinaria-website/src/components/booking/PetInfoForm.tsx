import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronLeft } from 'react-icons/fa'

interface Props {
  onSubmit: (info: PetInfo) => void
  onBack: () => void
  submitting: boolean
}

export interface PetInfo {
  petName: string
  petType: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  notes: string
}

export default function PetInfoForm({ onSubmit, onBack, submitting }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState<PetInfo>({
    petName: '',
    petType: 'dog',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    notes: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  function update(field: keyof PetInfo, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <button onClick={onBack} className="text-primary font-medium mb-4 flex items-center gap-1 hover:underline cursor-pointer">
        <FaChevronLeft className="text-xs" /> {t('booking.back')}
      </button>

      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        {t('booking.petInfo')}
      </h3>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">{t('booking.petName')} *</label>
          <input
            required
            value={form.petName}
            onChange={e => update('petName', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">{t('booking.petType')} *</label>
          <select
            value={form.petType}
            onChange={e => update('petType', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
          >
            <option value="dog">{t('booking.dog')}</option>
            <option value="cat">{t('booking.cat')}</option>
            <option value="other">{t('booking.other')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">{t('booking.ownerName')} *</label>
          <input
            required
            value={form.ownerName}
            onChange={e => update('ownerName', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">{t('booking.ownerPhone')} *</label>
          <input
            required
            type="tel"
            value={form.ownerPhone}
            onChange={e => update('ownerPhone', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">{t('booking.ownerEmail')}</label>
          <input
            type="email"
            value={form.ownerEmail}
            onChange={e => update('ownerEmail', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">{t('booking.notes')}</label>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {submitting ? t('booking.submitting') : t('booking.confirm')}
        </button>
      </form>
    </div>
  )
}
