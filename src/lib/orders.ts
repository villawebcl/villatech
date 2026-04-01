import { Prisma } from '@prisma/client'
import { formatCLP } from './utils'

export type PaymentMethod = 'webpay' | 'transfer'

export const WHATSAPP_TRANSFER_NUMBER = '56973283737'

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  webpay: 'Webpay Plus',
  transfer: 'Transferencia / WhatsApp',
}

interface TransferWhatsappData {
  origin?: string
  orderId: string
  orderNumber: string
  accessToken?: string | null
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shipping: {
    street: string
    number: string
    apartment?: string
    commune: string
    region: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shippingCost: number
  discount: number
  total: number
}

export function getPaymentMethodLabel(method: string) {
  return PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method
}

export function buildOrderAccessUrl(origin: string | undefined, orderId: string, accessToken?: string | null) {
  if (!origin) return ''

  const url = new URL(`/orden/${orderId}`, origin)
  if (accessToken) {
    url.searchParams.set('token', accessToken)
  }

  return url.toString()
}

function buildTransferWhatsappMessage(data: TransferWhatsappData) {
  const orderUrl = buildOrderAccessUrl(data.origin, data.orderId, data.accessToken)
  const shippingAddress = [
    `${data.shipping.street} ${data.shipping.number}`,
    data.shipping.apartment,
    `${data.shipping.commune}, ${data.shipping.region}`,
  ]
    .filter(Boolean)
    .join(', ')

  const lines = [
    `Hola, quiero pagar por transferencia el pedido ${data.orderNumber}.`,
    '',
    'Productos:',
    ...data.items.map((item) => `- ${item.quantity} x ${item.name} (${formatCLP(item.price * item.quantity)})`),
    '',
    `Cliente: ${data.customer.firstName} ${data.customer.lastName}`,
    `Email: ${data.customer.email}`,
    `Teléfono: ${data.customer.phone}`,
    `Dirección: ${shippingAddress}`,
    '',
    `Subtotal: ${formatCLP(data.subtotal)}`,
    `Envío: ${formatCLP(data.shippingCost)}`,
  ]

  if (data.discount > 0) {
    lines.push(`Descuento: -${formatCLP(data.discount)}`)
  }

  lines.push(`Total: ${formatCLP(data.total)}`)

  if (orderUrl) {
    lines.push('', `Detalle del pedido: ${orderUrl}`)
  }

  return lines.join('\n')
}

export function buildTransferWhatsappUrl(data: TransferWhatsappData) {
  return `https://wa.me/${WHATSAPP_TRANSFER_NUMBER}?text=${encodeURIComponent(
    buildTransferWhatsappMessage(data)
  )}`
}

export async function fulfillPaidOrder(
  tx: Prisma.TransactionClient,
  orderId: string,
  options?: {
    note?: string
    paymentData?: Prisma.InputJsonValue
  }
) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status !== 'PENDING') {
    throw new Error('Order is not pending')
  }

  for (const item of order.items) {
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

  if (order.couponId) {
    await tx.coupon.update({
      where: { id: order.couponId },
      data: { usedCount: { increment: 1 } },
    })
  }

  await tx.order.update({
    where: { id: orderId },
    data: {
      status: 'PAID',
      ...(options?.paymentData !== undefined ? { paymentData: options.paymentData } : {}),
    },
  })

  await tx.orderStatusHistory.create({
    data: {
      orderId,
      status: 'PAID',
      note: options?.note ?? 'Pago confirmado manualmente',
    },
  })
}
