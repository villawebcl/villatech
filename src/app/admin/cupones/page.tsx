export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { formatCLP } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { revalidatePath } from 'next/cache'
import { Plus } from 'lucide-react'

async function createCoupon(formData: FormData) {
  'use server'
  const code = (formData.get('code') as string).toUpperCase().trim()
  const type = formData.get('type') as 'PERCENT' | 'FIXED'
  const value = parseInt(formData.get('value') as string)
  const minOrder = formData.get('minOrder') ? parseInt(formData.get('minOrder') as string) : null
  const maxUses = formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : null
  const expiresAt = formData.get('expiresAt') as string

  if (!code || !type || !value) return

  await prisma.coupon.create({
    data: {
      code,
      type,
      value,
      minOrder,
      maxUses,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })
  revalidatePath('/admin/cupones')
}

async function toggleCoupon(id: string, isActive: boolean) {
  'use server'
  await prisma.coupon.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/cupones')
}

export default async function AdminCuponesPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-tight">Cupones</h1>
        <p className="text-[#888888] text-sm mt-1">{coupons.length} cupones</p>
      </div>

      {/* Crear cupón */}
      <div className="card p-6 mb-8">
        <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-5">
          Crear cupón
        </h2>
        <form action={createCoupon} className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="label">Código</label>
            <input name="code" className="input font-display uppercase" placeholder="VERANO25" required />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select name="type" className="input" required>
              <option value="PERCENT">Porcentaje (%)</option>
              <option value="FIXED">Monto fijo (CLP)</option>
            </select>
          </div>
          <div>
            <label className="label">Valor</label>
            <input name="value" type="number" min="1" className="input font-display" placeholder="20" required />
          </div>
          <div>
            <label className="label">Compra mínima (CLP)</label>
            <input name="minOrder" type="number" min="0" className="input font-display" placeholder="Opcional" />
          </div>
          <div>
            <label className="label">Usos máximos</label>
            <input name="maxUses" type="number" min="1" className="input font-display" placeholder="Ilimitado" />
          </div>
          <div>
            <label className="label">Expira</label>
            <input name="expiresAt" type="date" className="input" />
          </div>
          <div className="col-span-2 md:col-span-3 flex justify-end">
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              Crear cupón
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="border border-[#222222] rounded-[2px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222] bg-[#111111]">
              {['Código', 'Tipo', 'Valor', 'Usos', 'Mín. compra', 'Expira', 'Estado', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-display text-[10px] uppercase tracking-widest text-[#888888]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {coupons.map((coupon) => {
              const expired = coupon.expiresAt && coupon.expiresAt < new Date()
              const exhausted = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses
              return (
                <tr key={coupon.id} className="hover:bg-[#111111] transition-colors">
                  <td className="px-4 py-3 font-display text-xs text-[#FAFAFA] tracking-widest">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#888888]">
                    {coupon.type === 'PERCENT' ? 'Porcentaje' : 'Monto fijo'}
                  </td>
                  <td className="px-4 py-3 font-display text-xs text-[#FAFAFA]">
                    {coupon.type === 'PERCENT' ? `${coupon.value}%` : formatCLP(coupon.value)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#888888]">
                    {coupon.usedCount}{coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#888888]">
                    {coupon.minOrder ? formatCLP(coupon.minOrder) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#888888]">
                    {coupon.expiresAt
                      ? format(coupon.expiresAt, 'd MMM yyyy', { locale: es })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {!coupon.isActive || expired || exhausted ? (
                      <span className="badge badge-error text-[9px]">
                        {expired ? 'Expirado' : exhausted ? 'Agotado' : 'Inactivo'}
                      </span>
                    ) : (
                      <span className="badge badge-success text-[9px]">Activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={async () => { 'use server'; await toggleCoupon(coupon.id, !coupon.isActive) }}>
                      <button type="submit" className="text-xs text-[#888888] hover:text-[#FAFAFA] transition-colors">
                        {coupon.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {coupons.length === 0 && (
          <div className="py-12 text-center text-[#555555] font-display text-xs uppercase tracking-widest">
            Sin cupones
          </div>
        )}
      </div>
    </div>
  )
}
