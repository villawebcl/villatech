export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatCLP } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { OrderStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

interface PageProps {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'En preparación',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'badge-warning',
  PAID: 'badge-success',
  PROCESSING: 'badge-accent',
  SHIPPED: 'badge-accent',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-error',
  REFUNDED: 'badge-error',
}

async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  'use server'
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderStatusHistory.create({
      data: { orderId, status, note: note || `Estado cambiado a ${STATUS_LABELS[status]}` },
    }),
  ])
  revalidatePath(`/admin/pedidos/${orderId}`)
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { id: true, name: true, images: true, sku: true } } } },
      user: { select: { email: true, name: true } },
      coupon: { select: { code: true } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) notFound()

  const shipping = order.shippingAddress as {
    firstName: string; lastName: string; email: string; phone: string;
    street: string; number: string; commune: string; region: string; apartment?: string
  }

  const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
    PENDING: ['PAID', 'CANCELLED'],
    PAID: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: ['REFUNDED'],
  }

  const nextStatuses = NEXT_STATUSES[order.status] ?? []

  return (
    <div className="p-8 max-w-4xl">
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/admin/pedidos" className="text-xs text-[#888888] hover:text-[#FAFAFA] transition-colors">
            ← Pedidos
          </Link>
          <h1 className="font-display text-2xl uppercase tracking-tight mt-2">
            {order.orderNumber}
          </h1>
          <p className="text-[#888888] text-sm mt-1">
            {format(order.createdAt, "d 'de' MMMM yyyy, HH:mm", { locale: es })}
          </p>
        </div>
        <span className={`badge ${STATUS_COLORS[order.status]} text-sm py-1.5 px-3`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-[#222222]">
              <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
                Productos
              </h2>
            </div>
            <ul className="divide-y divide-[#222222]">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-4">
                  <div className="relative w-14 h-14 flex-shrink-0 bg-[#0A0A0A] border border-[#222222] rounded-[2px] overflow-hidden">
                    <Image
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/productos/${item.product.id}/editar`}
                      className="text-sm text-[#FAFAFA] hover:text-[#C0C0C0] transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-[#888888] mt-0.5">{item.product.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#888888]">{item.quantity} × {formatCLP(item.price)}</p>
                    <p className="font-display text-sm text-[#FAFAFA] mt-0.5">
                      {formatCLP(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Historial de estados */}
          <div className="card p-5">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-4">
              Historial de estados
            </h2>
            <div className="space-y-3">
              {order.statusHistory.map((entry) => (
                <div key={entry.id} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0C0C0] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-display text-[10px] uppercase tracking-widest text-[#FAFAFA]">
                      {STATUS_LABELS[entry.status]}
                    </p>
                    {entry.note && <p className="text-xs text-[#888888] mt-0.5">{entry.note}</p>}
                    <p className="text-[11px] text-[#555555] mt-0.5">
                      {format(entry.createdAt, "d MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cambiar estado */}
          {nextStatuses.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-4">
                Cambiar estado
              </h2>
              <form
                action={async (formData: FormData) => {
                  'use server'
                  const newStatus = formData.get('status') as OrderStatus
                  const note = formData.get('note') as string
                  await updateOrderStatus(id, newStatus, note)
                }}
                className="space-y-3"
              >
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <button
                      key={status}
                      name="status"
                      value={status}
                      className={`badge cursor-pointer py-1.5 px-3 ${STATUS_COLORS[status]} hover:opacity-80 transition-opacity`}
                    >
                      → {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
                <input
                  name="note"
                  className="input text-sm"
                  placeholder="Nota opcional (ej: N° de seguimiento)"
                />
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cliente */}
          <div className="card p-5">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-3">
              Cliente
            </h2>
            <p className="text-sm text-[#FAFAFA]">{shipping.firstName} {shipping.lastName}</p>
            <p className="text-xs text-[#888888] mt-1">{shipping.email}</p>
            <p className="text-xs text-[#888888]">{shipping.phone}</p>
            {order.rut && (
              <p className="text-xs text-[#888888] mt-1">RUT: {order.rut}</p>
            )}
            <p className="text-xs text-[#555555] mt-2 uppercase tracking-wider font-display">
              {order.invoiceType}
            </p>
          </div>

          {/* Envío */}
          <div className="card p-5">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-3">
              Dirección de envío
            </h2>
            <p className="text-sm text-[#FAFAFA]">
              {shipping.street} {shipping.number}
              {shipping.apartment ? `, ${shipping.apartment}` : ''}
            </p>
            <p className="text-sm text-[#888888] mt-0.5">
              {shipping.commune}, {shipping.region}
            </p>
          </div>

          {/* Resumen de pago */}
          <div className="card p-5 space-y-2 text-sm">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-3">
              Pago
            </h2>
            <div className="flex justify-between">
              <span className="text-[#888888]">Subtotal</span>
              <span>{formatCLP(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#1DB954]">
                <span>Descuento {order.coupon?.code ? `(${order.coupon.code})` : ''}</span>
                <span>-{formatCLP(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#888888]">Envío</span>
              <span>{formatCLP(order.shipping)}</span>
            </div>
            <hr className="divider" />
            <div className="flex justify-between font-display">
              <span>Total</span>
              <span>{formatCLP(order.total)}</span>
            </div>
            <p className="text-xs text-[#555555] mt-1 capitalize">
              {order.paymentMethod === 'webpay' ? 'Webpay Plus' : 'MercadoPago'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
