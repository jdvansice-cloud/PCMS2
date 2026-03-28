import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Heart, Mail, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react'

export default function LoginPage() {
  const { slug } = useParams<{ slug: string }>()
  const { signInWithOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithOtp(email)
      setStep('code')
    } catch {
      setError('Error al enviar el codigo. Verifica tu correo.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp(email, otpCode)
      navigate(`/app/${slug}/dashboard`)
    } catch {
      setError('Codigo incorrecto o expirado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithOtp(email)
      setError('')
    } catch {
      setError('Error al reenviar el codigo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-elevated p-8 animate-scale-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart size={28} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">PCMS</h1>
            <p className="text-sm text-slate-500 mt-1">Sistema de Gestion Veterinaria</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-[34px] text-slate-400" size={16} />
                <Input
                  label="Correo electronico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@clinica.com"
                  className="pl-9"
                  required
                  autoFocus
                />
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                Enviar codigo de acceso
              </Button>

              <p className="text-center text-xs text-slate-400">
                Te enviaremos un codigo de 6 digitos a tu correo.
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Email badge */}
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <Mail size={16} className="text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 truncate">{email}</p>
                  <p className="text-xs text-blue-600">Codigo enviado</p>
                </div>
                <button type="button" onClick={() => { setStep('email'); setOtpCode(''); setError('') }}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium shrink-0">
                  Cambiar
                </button>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Codigo de verificacion</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="input pl-9 text-center text-xl tracking-[0.5em] font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" loading={loading} disabled={otpCode.length < 6} className="w-full" size="lg">
                  Iniciar sesion
                </Button>
              </form>

              <button type="button" onClick={handleResend} disabled={loading}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1.5 py-1">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Reenviar codigo
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Clinica: <span className="font-medium text-slate-500">{slug}</span>
        </p>
      </div>
    </div>
  )
}
