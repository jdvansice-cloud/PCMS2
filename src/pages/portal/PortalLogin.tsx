import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Heart, Mail, KeyRound } from 'lucide-react'

export default function PortalLogin() {
  const { slug } = useParams()
  const { signInWithOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithOtp(email)
      setStep('otp')
    } catch {
      setError('Error al enviar el codigo. Verifica tu correo.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email, otp)
      navigate(`/portal/${slug}/dashboard`)
    } catch {
      setError('Codigo incorrecto o expirado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-elevated p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart size={28} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Portal del Cliente</h1>
            <p className="text-sm text-slate-500 mt-1">Accede al expediente de tus mascotas</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-[38px] text-slate-400" size={18} />
                <Input
                  label="Correo electronico"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-400">Te enviaremos un codigo de acceso a tu correo.</p>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Enviar Codigo
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-slate-600 text-center">
                Enviamos un codigo a <strong>{email}</strong>
              </p>
              <div className="relative">
                <KeyRound className="absolute left-3 top-[38px] text-slate-400" size={18} />
                <Input
                  label="Codigo de verificacion"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Verificar
              </Button>
              <button type="button" onClick={() => { setStep('email'); setOtp('') }}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
                Usar otro correo
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Clinica: <span className="font-medium text-slate-500">{slug}</span>
        </p>
      </div>
    </div>
  )
}
