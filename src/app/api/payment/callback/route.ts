import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { confirmWebpayTransaction } from '@/lib/transbank'
import { fulfillPaidOrder } from '@/lib/orders'
import { getPublicAppUrl } from '@/lib/env'

function buildOrderUrl(orderId: string, accessToken: string, extraSearch?: Record<string, string>) {
  const url = new URL(`/orden/${orderId}`, getPublicAppUrl())
  url.searchParams.set('token', accessToken)
  if (extraSearch) {
    Object.entries(extraSearch).forEach(([key, value]) => url.searchParams.set(key, value))
  }
  return url
}

// Transbank hace POST a este endpoint con token_ws en el body (form-urlencoded)
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const token = formData.get('token_ws') as string | null

  if (!token) {
    // Transbank canceló — redirigir al carrito
    return NextResponse.redirect(new URL('/carro?payment=cancelled', getPublicAppUrl()))
  }

  // Buscar el pedido por token guardado
  const order = await prisma.order.findFirst({
    where: {
      paymentData: { path: ['token'], equals: token },
      status: 'PENDING',
    },
  })

  if (!order) {
    return NextResponse.redirect(new URL('/carro?payment=error', getPublicAppUrl()))
  }

  try {
    const result = await confirmWebpayTransaction(token)
    const accessToken = order.accessToken ?? order.id

    if (result.response_code === 0) {
      // Pago exitoso
      await prisma.$transaction(async (tx) => {
        await fulfillPaidOrder(tx, order.id, {
          paymentData: result as object,
          note: `Webpay confirmado. Autorización: ${result.authorization_code}`,
        })
      })

      return NextResponse.redirect(buildOrderUrl(order.id, accessToken, { payment: 'success' }))
    } else {
      // Pago rechazado
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'CANCELLED',
            note: `Webpay rechazado. Código: ${result.response_code}`,
          },
        }),
      ])

      return NextResponse.redirect(
        new URL(`/carro?payment=rejected`, getPublicAppUrl())
      )
    }
  } catch {
    return NextResponse.redirect(new URL('/carro?payment=error', getPublicAppUrl()))
  }
}
