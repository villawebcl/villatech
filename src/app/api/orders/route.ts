import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { validateRut } from '@/lib/utils'
import { randomBytes } from 'node:crypto'

const OrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  shipping: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(8),
    street: z.string().min(1),
    number: z.string().min(1),
    apartment: z.string().optional(),
    commune: z.string().min(1),
    region: z.string().min(1),
    regionCode: z.string().min(1),
  }),
  invoiceType: z.enum(['BOLETA', 'FACTURA']),
  rut: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['webpay', 'transfer']),
}).superRefine((data, ctx) => {
  if (data.invoiceType !== 'FACTURA') return

  if (!data.rut?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['rut'],
      message: 'RUT requerido para factura',
    })
    return
  }

  if (!validateRut(data.rut)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['rut'],
      message: 'RUT inválido',
    })
  }
})

function generateOrderNumber() {
  const year = new Date().getFullYear()
  const suffix = randomBytes(3).toString('hex').toUpperCase()
  return `VT-${year}-${suffix}`
}

export async function POST(request: NextRequest) {
  const session = await auth()
  const body = await request.json()
  const parsed = OrderSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { items, shipping, invoiceType, rut, couponCode, paymentMethod } = parsed.data

  // Obtener productos y validar stock
  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Uno o más productos no están disponibles' }, { status: 400 })
  }

  const outOfStockProduct = items.find((item) => {
    const product = products.find((p) => p.id === item.productId)
    return product ? product.stock < item.quantity : false
  })

  if (outOfStockProduct) {
    const product = products.find((p) => p.id === outOfStockProduct.productId)!
    return NextResponse.json(
      { error: `Stock insuficiente para: ${product.name}` },
      { status: 400 }
    )
  }

  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!
    return { productId: item.productId, quantity: item.quantity, price: product.price }
  })

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  // Validar cupón
  let couponId: string | undefined
  let discount = 0

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
    })
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrder || subtotal >= coupon.minOrder)
    ) {
      couponId = coupon.id
      discount =
        coupon.type === 'PERCENT'
          ? Math.round(subtotal * (coupon.value / 100))
          : Math.min(coupon.value, subtotal)
    }
  }

  // Calcular envío (import dinámico para no ejecutar en edge)
  const { getShippingRate } = await import('@/lib/utils')
  const shippingCost = getShippingRate(shipping.regionCode)
  const total = subtotal - discount + shippingCost

  const orderNumber = generateOrderNumber()

  // Crear pedido en transacción
  const order = await prisma.order.create({
    data: {
      orderNumber,
      subtotal,
      shipping: shippingCost,
      discount,
      total,
      invoiceType,
      rut: invoiceType === 'FACTURA' ? rut : undefined,
      shippingAddress: shipping,
      paymentMethod,
      couponId,
      userId: session?.user.id,
      guestEmail: !session ? shipping.email : undefined,
      guestName: !session ? `${shipping.firstName} ${shipping.lastName}` : undefined,
      guestPhone: !session ? shipping.phone : undefined,
      items: {
        create: orderItems,
      },
      statusHistory: {
        create: {
          status: 'PENDING',
          note:
            paymentMethod === 'transfer'
              ? 'Pedido creado. Pendiente de coordinación por transferencia.'
              : 'Pedido creado',
        },
      },
    },
  })

  return NextResponse.json(
    {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderAccessToken: order.accessToken,
      subtotal,
      shipping: shippingCost,
      discount,
      total,
    },
    { status: 201 }
  )
}

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
