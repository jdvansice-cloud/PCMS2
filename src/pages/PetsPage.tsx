import { useState, useMemo } from 'react'
import { Search, Plus, PawPrint, User, Edit, Eye, Heart, Scale } from 'lucide-react'
import { usePets, useCreatePet, useUpdatePet } from '../hooks/queries/usePets'
import { useOwners } from '../hooks/queries/useOwners'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { useToast } from '../components/Toast'
import { formatDate, formatWeight } from '../utils/formatters'
import type { Pet } from '../hooks/queries/usePets'

const SPECIES_OPTIONS = ['canino', 'felino', 'ave', 'reptil', 'roedor', 'otro']

export default function PetsPage() {
  const { data: pets = [], isLoading } = usePets()
  const { data: owners = [] } = useOwners()
  const createPet = useCreatePet()
  const updatePet = useUpdatePet()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Pet | null>(null)
  const [selected, setSelected] = useState<Pet | null>(null)

  const filtered = useMemo(() => {
    let result = pets
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p => {
        const ownerName = p.owner ? `${p.owner.first_name} ${p.owner.last_name || ''}`.toLowerCase() : ''
        return p.name.toLowerCase().includes(q) || ownerName.includes(q) || p.microchip_number?.includes(q)
      })
    }
    if (speciesFilter) {
      result = result.filter(p => p.species === speciesFilter)
    }
    return result
  }, [search, speciesFilter, pets])

  const handleSave = async (data: Partial<Pet>) => {
    try {
      if (editing) {
        await updatePet.mutateAsync({ id: editing.id, ...data })
        toast.success('Paciente actualizado')
      } else {
        await createPet.mutateAsync(data)
        toast.success('Paciente registrado')
      }
      setShowForm(false)
      setEditing(null)
    } catch {
      toast.error('Error al guardar')
    }
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Pacientes</h1>
          <p className="text-sm text-slate-500">{pets.length} pacientes registrados</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }} icon={<Plus size={16} />}>
          Nuevo Paciente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, propietario o chip..." className="input pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSpeciesFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!speciesFilter ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            Todos
          </button>
          {SPECIES_OPTIONS.slice(0, 4).map(sp => (
            <button key={sp} onClick={() => setSpeciesFilter(sp === speciesFilter ? '' : sp)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${sp === speciesFilter ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={<PawPrint size={48} />} title={search || speciesFilter ? 'Sin resultados' : 'Sin pacientes'}
          description={search ? 'Intenta con otra busqueda' : 'Registra tu primer paciente'}
          action={!search ? <Button onClick={() => setShowForm(true)} size="sm">Registrar Paciente</Button> : undefined} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(pet => (
            <div key={pet.id} className="card p-4 hover:shadow-soft transition-shadow cursor-pointer group" onClick={() => setSelected(pet)}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  {pet.photo_url ? (
                    <img src={pet.photo_url} alt={pet.name} className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <PawPrint size={22} className="text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{pet.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{pet.species} {pet.breed ? `· ${pet.breed}` : ''}</p>
                  {pet.owner && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                      <User size={12} /> {pet.owner.first_name} {pet.owner.last_name || ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  {pet.sex === 'M' ? '♂' : pet.sex === 'F' ? '♀' : '—'} {pet.sex === 'M' ? 'Macho' : pet.sex === 'F' ? 'Hembra' : 'Sin sexar'}
                </span>
                {pet.weight && <span className="text-xs text-slate-500 flex items-center gap-1"><Scale size={12} />{pet.weight} kg</span>}
                {pet.is_sterilized && <Badge variant="info" className="text-[10px]">Esterilizado</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <PetFormModal
          pet={editing}
          owners={owners}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSave={handleSave}
          loading={createPet.isPending || updatePet.isPending}
        />
      )}

      {/* Detail Modal */}
      {selected && (
        <PetDetailModal pet={selected} onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setShowForm(true); setSelected(null) }} />
      )}
    </div>
  )
}

/* ======================== Form Modal ======================== */
function PetFormModal({ pet, owners, onClose, onSave, loading }: {
  pet: Pet | null; owners: { id: string; first_name: string; last_name?: string }[]
  onClose: () => void; onSave: (data: Partial<Pet>) => void; loading: boolean
}) {
  const [form, setForm] = useState({
    owner_id: pet?.owner_id || '',
    name: pet?.name || '',
    species: pet?.species || 'canino',
    breed: pet?.breed || '',
    sex: pet?.sex || '',
    date_of_birth: pet?.date_of_birth || '',
    weight: pet?.weight?.toString() || '',
    microchip_number: pet?.microchip_number || '',
    color: pet?.color || '',
    allergies: pet?.allergies || '',
    is_sterilized: pet?.is_sterilized || false,
    notes: pet?.notes || '',
  })

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }))

  return (
    <Modal open onClose={onClose} title={pet ? 'Editar Paciente' : 'Nuevo Paciente'} size="lg">
      <form onSubmit={e => {
        e.preventDefault()
        onSave({ ...form, weight: form.weight ? parseFloat(form.weight) : undefined } as unknown as Partial<Pet>)
      }} className="space-y-4">
        {/* Owner selector */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Propietario *</label>
          <select value={form.owner_id} onChange={e => set('owner_id', e.target.value)} required className="input text-sm">
            <option value="">Seleccionar propietario...</option>
            {owners.map(o => (
              <option key={o.id} value={o.id}>{o.first_name} {o.last_name || ''}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre *" value={form.name} onChange={e => set('name', e.target.value)} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Especie *</label>
            <select value={form.species} onChange={e => set('species', e.target.value)} className="input text-sm">
              {SPECIES_OPTIONS.map(sp => <option key={sp} value={sp} className="capitalize">{sp}</option>)}
            </select>
          </div>
          <Input label="Raza" value={form.breed} onChange={e => set('breed', e.target.value)} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Sexo</label>
            <select value={form.sex} onChange={e => set('sex', e.target.value)} className="input text-sm">
              <option value="">—</option>
              <option value="M">Macho</option>
              <option value="F">Hembra</option>
              <option value="sin_sexar">Sin sexar</option>
            </select>
          </div>
          <Input label="Fecha de nacimiento" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
          <Input label="Peso (kg)" type="number" step="0.01" value={form.weight} onChange={e => set('weight', e.target.value)} />
          <Input label="No. Microchip" value={form.microchip_number} onChange={e => set('microchip_number', e.target.value)} />
          <Input label="Color" value={form.color} onChange={e => set('color', e.target.value)} />
        </div>

        <Input label="Alergias" value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="Separar con comas" />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_sterilized} onChange={e => set('is_sterilized', e.target.checked)}
            className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
          Esterilizado
        </label>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Notas</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="input" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{pet ? 'Guardar' : 'Registrar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

/* ======================== Detail Modal ======================== */
function PetDetailModal({ pet, onClose, onEdit }: { pet: Pet; onClose: () => void; onEdit: () => void }) {
  return (
    <Modal open onClose={onClose} title={pet.name} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
            {pet.photo_url ? <img src={pet.photo_url} alt={pet.name} className="w-16 h-16 rounded-2xl object-cover" /> : <PawPrint size={28} className="text-primary-600" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{pet.name}</h3>
            <p className="text-sm text-slate-500 capitalize">{pet.species} {pet.breed ? `· ${pet.breed}` : ''}</p>
            {pet.owner && <p className="text-xs text-slate-400 mt-0.5">Propietario: {pet.owner.first_name} {pet.owner.last_name || ''}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Sexo', value: pet.sex === 'M' ? 'Macho' : pet.sex === 'F' ? 'Hembra' : 'Sin sexar' },
            { label: 'Peso', value: pet.weight ? formatWeight(pet.weight) : '—' },
            { label: 'Nacimiento', value: pet.date_of_birth ? formatDate(pet.date_of_birth) : '—' },
            { label: 'Microchip', value: pet.microchip_number || '—' },
            { label: 'Color', value: pet.color || '—' },
            { label: 'Esterilizado', value: pet.is_sterilized ? 'Si' : 'No' },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-sm font-medium text-slate-700">{item.value}</p>
            </div>
          ))}
        </div>

        {pet.allergies && (
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-500 font-medium mb-1">Alergias</p>
            <p className="text-sm text-red-700">{pet.allergies}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button onClick={onEdit} icon={<Edit size={16} />}>Editar</Button>
        </div>
      </div>
    </Modal>
  )
}
