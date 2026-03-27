import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useTenant } from '../../context/TenantContext'

export interface SaleLine {
  product_id?: string
  product_name: string
  quantity: number
  unit_price: number
  discount: number
  line_total: number
}

export interface PaymentEntry {
  method: string
  methodName: string
  amount: number
  reference?: string
  cashTendered?: number
  changeGiven?: number
}

export function useCreateSale() {
  const qc = useQueryClient()
  const { activeStore } = useTenant()

  return useMutation({
    mutationFn: async ({
      owner_id, lines, payments, subtotal, discount_amount, tax_amount, total, notes, created_by,
    }: {
      owner_id?: string; lines: SaleLine[]; payments: PaymentEntry[]
      subtotal: number; discount_amount: number; tax_amount: number; total: number
      notes?: string; created_by?: string
    }) => {
      // 1. Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          store_id: activeStore?.id, owner_id, status: 'completed',
          subtotal, discount_amount, tax_amount, total, notes, created_by,
        })
        .select()
        .single()
      if (saleError) throw saleError

      // 2. Insert sale lines
      if (lines.length > 0) {
        const { error: linesError } = await supabase
          .from('sale_lines')
          .insert(lines.map(l => ({ sale_id: sale.id, ...l })))
        if (linesError) throw linesError
      }

      // 3. Insert payments
      if (payments.length > 0) {
        const { error: payError } = await supabase
          .from('sale_payments')
          .insert(payments.map(p => ({
            sale_id: sale.id,
            payment_method: p.method,
            amount: p.amount,
            reference: p.reference,
            change_amount: p.changeGiven || 0,
            created_by,
          })))
        if (payError) throw payError
      }

      // 4. Deduct stock for retail products
      for (const line of lines) {
        if (line.product_id) {
          try {
            await supabase.rpc('decrement_stock', {
              p_product_id: line.product_id,
              p_quantity: line.quantity,
            })
          } catch {
            // Stock RPC may not exist yet — skip silently
          }
        }
      }

      return sale
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
