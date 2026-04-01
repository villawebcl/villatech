import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createWebpayTransaction } from '@/lib/transbank'
import { z } from 'zod'

const Schema = z.object({
  orderId: z.string().cuid(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = Schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'orderId requerido' }, { status: 400 })
  }

  const { orderId } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: orderId, status: 'PENDING' },
  })

  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado o ya procesado' }, { status: 404 })
  }

  if (order.paymentMethod === 'webpay') {
    const { url, token } = await createWebpayTransaction(order.id, order.total)

    // Guardar token para verificar en el callback
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentData: { token, initiatedAt: new Date().toISOString() } },
    })

    return NextResponse.json({ redirectUrl: `${url}?token_ws=${token}` })
  }

  return NextResponse.json({ error: 'Método de pago no soportado' }, { status: 400 })
}
