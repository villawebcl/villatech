import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { confirmWebpayTransaction } from '@/lib/transbank'

function buildOrderUrl(orderId: string, accessToken: string, extraSearch?: Record<string, string>) {
  const url = new URL(`/orden/${orderId}`, process.env.NEXT_PUBLIC_URL!)
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
    return NextResponse.redirect(new URL('/carro?payment=cancelled', process.env.NEXT_PUBLIC_URL!))
  }

  // Buscar el pedido por token guardado
  const order = await prisma.order.findFirst({
    where: {
      paymentData: { path: ['token'], equals: token },
      status: 'PENDING',
    },
  })

  if (!order) {
    return NextResponse.redirect(new URL('/carro?payment=error', process.env.NEXT_PUBLIC_URL!))
  }

  try {
    const result = await confirmWebpayTransaction(token)
    const accessToken = order.accessToken ?? order.id

    if (result.response_code === 0) {
      // Pago exitoso
      await prisma.$transaction(async (tx) => {
        const orderWithItems = await tx.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        })

        if (!orderWithItems) throw new Error('Order not found')

        for (const item of orderWithItems.items) {
          const updateResult = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          })

          if (updateResult.count !== 1) {
            throw new Error('Insufficient stock')
          }
        }

        if (orderWithItems.couponId) {
          await tx.coupon.update({
            where: { id: orderWithItems.couponId },
            data: { usedCount: { increment: 1 } },
          })
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            paymentData: result as object,
          },
        })

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'PAID',
            note: `Webpay confirmado. Autorización: ${result.authorization_code}`,
          },
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
        new URL(`/carro?payment=rejected`, process.env.NEXT_PUBLIC_URL!)
      )
    }
  } catch {
    return NextResponse.redirect(new URL('/carro?payment=error', process.env.NEXT_PUBLIC_URL!))
  }
}
