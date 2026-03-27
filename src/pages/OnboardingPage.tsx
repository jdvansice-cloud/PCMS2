import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Building, User, MapPin, Check, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../components/Toast'
import { supabase, isConfigured } from '../lib/supabase'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { num: 1, label: 'Clinica', icon: <Building size={18} /> },
  { num: 2, label: 'Administrador', icon: <User size={18} /> },
  { num: 3, label: 'Sucursal', icon: <MapPin size={18} /> },
  { num: 4, label: 'Listo', icon: <Check size={18} /> },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)

  const [org, setOrg] = useState({
    name: '', slug: '', phone: '', email: '', ruc: '', country: 'MX',
  })
  const [admin, setAdmin] = useState({
    full_name: '', email: '', password: '', password_confirm: '',
  })
  const [branch, setBranch] = useState({
    name: 'Sucursal Principal', address: '', phone: '',
  })

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleOrgNameChange = (name: string) => {
    setOrg(prev => ({ ...prev, name, slug: prev.slug || slugify(name) }))
  }

  const canNext = () => {
    if (step === 1) return org.name.trim() && org.slug.trim()
    if (step === 2) return admin.full_name.trim() && admin.email.trim() && admin.password.length >= 6 && admin.password === admin.password_confirm
    if (step === 3) return branch.name.trim()
    return true
  }

  const handleCreate = async () => {
    if (!isConfigured) {
      toast.info('Conecta Supabase para crear organizaciones')
      setStep(4)
      return
    }

    setLoading(true)
    try {
      // 1. Check slug availability
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', org.slug)
        .maybeSingle()

      if (existing) {
        toast.error('Ese nombre de URL ya esta en uso. Elige otro.')
        setLoading(false)
        setStep(1)
        return
      }

      // 2. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: admin.email,
        password: admin.password,
        options: { data: { full_name: admin.full_name } },
      })
      if (authError) throw authError

      // 3. Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: org.name, slug: org.slug, phone: org.phone || undefined,
          email: org.email || undefined, ruc: org.ruc || undefined,
          country: org.country,
        })
        .select()
        .single()
      if (companyError) throw companyError

      // 4. Create subscription (free tier, no payment)
      await supabase.from('subscriptions').insert({
        company_id: company.id, plan: 'pro', status: 'active',
      })

      // 5. Create branch
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({
          company_id: company.id, name: branch.name,
          address: branch.address || undefined, phone: branch.phone || undefined,
        })
        .select()
        .single()
      if (storeError) throw storeError

      // 6. Create admin user
      const { error: userError } = await supabase
        .from('users')
        .insert({
          auth_id: authData.user?.id,
          company_id: company.id, store_id: store.id,
          email: admin.email, full_name: admin.full_name,
          role: 'admin', is_active: true,
        })
      if (userError) throw userError

      // 7. Create default roles
      const roles = [
        { company_id: company.id, name: 'Administrador', is_default: true, permissions: { dashboard: { view: true }, clients: { view: true, create: true, edit: true, delete: true }, pets: { view: true, create: true, edit: true, delete: true }, appointments: { view: true, create: true, edit: true, delete: true }, medical_records: { view: true, create: true, edit: true, delete: true }, pos: { view: true, create: true, edit: true }, inventory: { view: true, create: true, edit: true, delete: true }, settings: { view: true, edit: true }, users: { view: true, create: true, edit: true, delete: true } } },
        { company_id: company.id, name: 'Veterinario', is_default: true, permissions: { dashboard: { view: true }, clients: { view: true, create: true, edit: true }, pets: { view: true, create: true, edit: true }, appointments: { view: true, create: true, edit: true }, medical_records: { view: true, create: true, edit: true }, pos: { view: true } } },
        { company_id: company.id, name: 'Recepcionista', is_default: true, permissions: { dashboard: { view: true }, clients: { view: true, create: true, edit: true }, pets: { view: true, create: true }, appointments: { view: true, create: true, edit: true }, pos: { view: true, create: true } } },
      ]
      await supabase.from('roles').insert(roles)

      // 8. Create default payment methods
      await supabase.from('payment_methods').insert([
        { store_id: store.id, name: 'Efectivo', icon: 'banknote', is_active: true, display_order: 1 },
        { store_id: store.id, name: 'Tarjeta', icon: 'credit-card', is_active: true, display_order: 2 },
        { store_id: store.id, name: 'Transferencia', icon: 'building', is_active: true, display_order: 3 },
      ])

      toast.success('Clinica creada exitosamente')
      setStep(4)
    } catch (err) {
      console.error('Onboarding error:', err)
      toast.error('Error al crear la clinica. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart size={28} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Registrar Clinica</h1>
          <p className="text-sm text-slate-500 mt-1">Configura tu clinica en 3 sencillos pasos</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s.num ? 'bg-success-500 text-white' :
                step === s.num ? 'bg-primary-500 text-white shadow-md' :
                'bg-slate-200 text-slate-400'
              }`}>
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-slate-700' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${step > s.num ? 'bg-success-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-elevated p-8 animate-scale-in">
          {/* Step 1: Organization */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Building size={20} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Datos de la Clinica</h2>
                  <p className="text-xs text-slate-500">Informacion basica de tu organizacion</p>
                </div>
              </div>

              <Input label="Nombre de la clinica *" value={org.name}
                onChange={e => handleOrgNameChange(e.target.value)} placeholder="Veterinaria Mi Mascota" required />

              <div>
                <Input label="URL de acceso *" value={org.slug}
                  onChange={e => setOrg(prev => ({ ...prev, slug: slugify(e.target.value) }))}
                  placeholder="mi-mascota" />
                <p className="text-xs text-slate-400 mt-1">
                  Tu equipo accedera en: <code className="bg-slate-100 px-1.5 py-0.5 rounded">/login/{org.slug || 'tu-clinica'}</code>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Telefono" value={org.phone} onChange={e => setOrg(prev => ({ ...prev, phone: e.target.value }))} />
                <Input label="Correo" type="email" value={org.email} onChange={e => setOrg(prev => ({ ...prev, email: e.target.value }))} />
              </div>

              <Input label="RFC / RUC" value={org.ruc} onChange={e => setOrg(prev => ({ ...prev, ruc: e.target.value }))} />
            </div>
          )}

          {/* Step 2: Admin User */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Administrador</h2>
                  <p className="text-xs text-slate-500">Cuenta del administrador principal</p>
                </div>
              </div>

              <Input label="Nombre completo *" value={admin.full_name}
                onChange={e => setAdmin(prev => ({ ...prev, full_name: e.target.value }))} required />
              <Input label="Correo electronico *" type="email" value={admin.email}
                onChange={e => setAdmin(prev => ({ ...prev, email: e.target.value }))} required />
              <Input label="Contraseña *" type="password" value={admin.password}
                onChange={e => setAdmin(prev => ({ ...prev, password: e.target.value }))}
                helperText="Minimo 6 caracteres" required />
              <Input label="Confirmar contraseña *" type="password" value={admin.password_confirm}
                onChange={e => setAdmin(prev => ({ ...prev, password_confirm: e.target.value }))}
                error={admin.password_confirm && admin.password !== admin.password_confirm ? 'Las contraseñas no coinciden' : undefined}
                required />
            </div>
          )}

          {/* Step 3: Branch */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <MapPin size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Sucursal</h2>
                  <p className="text-xs text-slate-500">Datos de tu primera sucursal</p>
                </div>
              </div>

              <Input label="Nombre de la sucursal *" value={branch.name}
                onChange={e => setBranch(prev => ({ ...prev, name: e.target.value }))} required />
              <Input label="Direccion" value={branch.address}
                onChange={e => setBranch(prev => ({ ...prev, address: e.target.value }))} />
              <Input label="Telefono" value={branch.phone}
                onChange={e => setBranch(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-success-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Tu clinica esta lista</h2>
              <p className="text-sm text-slate-500 mb-6">
                <strong>{org.name}</strong> ha sido creada exitosamente. Ahora puedes iniciar sesion.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">URL staff:</span><code className="text-primary-600">/login/{org.slug}</code></div>
                <div className="flex justify-between"><span className="text-slate-500">URL clientes:</span><code className="text-primary-600">/portal/{org.slug}</code></div>
                <div className="flex justify-between"><span className="text-slate-500">Plan:</span><span className="font-medium">Pro (sin costo)</span></div>
              </div>
              <Button onClick={() => navigate(`/login/${org.slug}`)} size="lg" className="w-full">
                Ir a iniciar sesion
              </Button>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
              {step > 1 ? (
                <Button variant="ghost" onClick={() => setStep((step - 1) as Step)} icon={<ChevronLeft size={16} />}>
                  Anterior
                </Button>
              ) : (
                <a href="/" className="btn-ghost text-sm flex items-center gap-2 px-4 py-2">
                  <ChevronLeft size={16} /> Inicio
                </a>
              )}

              {step < 3 ? (
                <Button onClick={() => setStep((step + 1) as Step)} disabled={!canNext()}>
                  Siguiente <ChevronRight size={16} />
                </Button>
              ) : (
                <Button onClick={handleCreate} loading={loading} disabled={!canNext()}>
                  Crear Clinica <Sparkles size={16} />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
