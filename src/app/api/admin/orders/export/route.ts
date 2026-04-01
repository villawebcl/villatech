import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { format } from 'date-fns'
import { OrderStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const statusParam = request.nextUrl.searchParams.get('status') as OrderStatus | null
  const allStatuses = Object.values(OrderStatus)

  const orders = await prisma.order.findMany({
    where: statusParam && allStatuses.includes(statusParam) ? { status: statusParam } : {},
    include: {
      items: { include: { product: { select: { name: true, sku: true } } } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const shipping = (addr: unknown): Record<string, string> =>
    typeof addr === 'object' && addr !== null
      ? (addr as Record<string, string>)
      : {}

  const header = [
    'N° Pedido', 'Fecha', 'Estado', 'Cliente', 'Email',
    'Subtotal', 'Descuento', 'Envío', 'Total',
    'Método pago', 'Región', 'Comuna', 'Productos',
  ]

  const rows = orders.map((o) => {
    const addr = shipping(o.shippingAddress)
    const products = o.items.map((i) => `${i.product.name} x${i.quantity}`).join(' | ')
    return [
      o.orderNumber,
      format(o.createdAt, 'yyyy-MM-dd HH:mm'),
      o.status,
      o.user?.email ?? o.guestEmail ?? '',
      o.guestEmail ?? '',
      o.subtotal,
      o.discount,
      o.shipping,
      o.total,
      o.paymentMethod,
      addr.region ?? '',
      addr.commune ?? '',
      products,
    ]
  })

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="villatech-pedidos-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
    },
  })
}
