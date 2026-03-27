import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Heart, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { slug } = useParams<{ slug: string }>()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate(`/app/${slug}/dashboard`)
    } catch (err) {
      setError('Credenciales incorrectas. Verifica tu correo y contraseña.')
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electronico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@clinica.com"
              required
              autoFocus
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Iniciar sesion
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            ¿Olvidaste tu contraseña? Contacta al administrador.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Clinica: <span className="font-medium text-slate-500">{slug}</span>
        </p>
      </div>
    </div>
  )
}
