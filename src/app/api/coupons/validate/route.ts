import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const Schema = z.object({
  code: z.string().min(1).max(50),
  subtotal: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = Schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ valid: false, error: 'Datos inválidos' }, { status: 400 })
  }

  const { code, subtotal } = parsed.data

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!coupon) {
    return NextResponse.json({ valid: false, error: 'Cupón no encontrado' })
  }

  if (!coupon.isActive) {
    return NextResponse.json({ valid: false, error: 'Cupón inactivo' })
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: 'Cupón expirado' })
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: 'Cupón agotado' })
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return NextResponse.json({
      valid: false,
      error: `Compra mínima de ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(coupon.minOrder)} requerida`,
    })
  }

  const discount =
    coupon.type === 'PERCENT'
      ? Math.round(subtotal * (coupon.value / 100))
      : Math.min(coupon.value, subtotal)

  return NextResponse.json({ valid: true, coupon, discount })
}
