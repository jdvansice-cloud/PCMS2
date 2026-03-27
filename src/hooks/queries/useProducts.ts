import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isConfigured } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export interface Product {
  id: string
  store_id: string
  name: string
  category?: string
  product_type: 'service' | 'retail' | 'medication' | 'vaccine' | 'food'
  sku?: string
  barcode?: string
  price: number
  cost_price: number
  wholesale_price?: number
  stock: number
  min_stock: number
  lot_number?: string
  expiry_date?: string
  supplier_id?: string
  is_controlled_senasica: boolean
  is_active: boolean
  is_taxable: boolean
  display_order: number
  created_at: string
  supplier?: { id: string; name: string }
}

export interface Supplier {
  id: string
  store_id: string
  name: string
  contact?: string
  phone?: string
  email?: string
}

export function useProducts(type?: string) {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id

  return useQuery({
    queryKey: ['products', storeId, type],
    queryFn: async () => {
      if (!storeId) return []
      let query = supabase
        .from('products')
        .select('*, supplier:suppliers(id, name)')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .order('name')
      if (type) query = query.eq('product_type', type)
      const { data, error } = await query
      if (error) throw error
      return (data || []) as Product[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()
  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase.from('products')
        .insert({ ...product, store_id: activeStore?.id }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase.from('products')
        .update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useSuppliers() {
  const { activeStore } = useTenant()
  const storeId = activeStore?.id
  return useQuery({
    queryKey: ['suppliers', storeId],
    queryFn: async () => {
      if (!storeId) return []
      const { data, error } = await supabase.from('suppliers').select('*').eq('store_id', storeId).order('name')
      if (error) throw error
      return (data || []) as Supplier[]
    },
    enabled: !!storeId && isConfigured,
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()
  return useMutation({
    mutationFn: async (supplier: Partial<Supplier>) => {
      const { data, error } = await supabase.from('suppliers')
        .insert({ ...supplier, store_id: activeStore?.id }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}
