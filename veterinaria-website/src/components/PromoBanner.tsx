import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTag } from 'react-icons/fa'
import { supabase } from '../lib/supabase'

export default function PromoBanner() {
  const { t } = useTranslation()
  const [promo, setPromo] = useState<{ percent: number; label: string } | null>(null)

  useEffect(() => {
    async function fetchPromo() {
      const { data } = await supabase
        .from('promo_settings')
        .select('*')
        .eq('is_active', true)
        .single()

      if (data && data.discount_percent > 0) {
        setPromo({ percent: data.discount_percent, label: data.label || '' })
        document.documentElement.setAttribute('data-promo', 'true')
      }
    }
    fetchPromo()
  }, [])

  if (!promo) return null

  const message = `${promo.percent}% ${t('promoBanner.off')}${promo.label ? ` — ${promo.label}` : ''}`

  const repeated = Array(8).fill(message)

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-400 text-gray-900 overflow-hidden whitespace-nowrap h-9">
      <div className="animate-ticker inline-flex">
        {repeated.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-bold px-8 py-1.5">
            <FaTag className="text-xs" />
            {msg}
          </span>
        ))}
        {repeated.map((msg, i) => (
          <span key={`dup-${i}`} className="inline-flex items-center gap-2 text-sm font-bold px-8 py-1.5">
            <FaTag className="text-xs" />
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
