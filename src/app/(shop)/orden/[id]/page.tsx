export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Package, Truck, Clock, XCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { formatCLP } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  PENDING: { label: 'Pendiente de pago', icon: Clock, color: 'text-[#D97706]' },
  PAID: { label: 'Pago confirmado', icon: CheckCircle, color: 'text-[#1DB954]' },
  PROCESSING: { label: 'En preparación', icon: Package, color: 'text-[#C0C0C0]' },
  SHIPPED: { label: 'En camino', icon: Truck, color: 'text-[#C0C0C0]' },
  DELIVERED: { label: 'Entregado', icon: CheckCircle, color: 'text-[#1DB954]' },
  CANCELLED: { label: 'Cancelado', icon: XCircle, color: 'text-[#E53E3E]' },
  REFUNDED: { label: 'Reembolsado', icon: XCircle, color: 'text-[#888888]' },
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { token } = await searchParams
  const session = await auth()

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!order) notFound()

  const canViewAsOwner = Boolean(session?.user.role === 'ADMIN' || (session?.user.id && order.userId === session.user.id))
  const canViewAsGuest = Boolean(token && token === order.accessToken)

  if (!canViewAsOwner && !canViewAsGuest) {
    if (!session) {
      redirect('/auth/login')
    }
    notFound()
  }

  const statusInfo = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING
  const StatusIcon = statusInfo.icon
  const shipping = order.shippingAddress as {
    firstName: string; lastName: string; street: string; number: string;
    commune: string; region: string; apartment?: string
  }

  return (
    <div className="container-site py-10 max-w-3xl">
      {/* Encabezado */}
      <div className="text-center mb-10">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 mb-4 ${
          order.status === 'PAID' || order.status === 'DELIVERED'
            ? 'border-[#1DB954]/40 bg-[#1DB954]/10'
            : order.status === 'CANCELLED'
            ? 'border-[#E53E3E]/40 bg-[#E53E3E]/10'
            : 'border-[#333333] bg-[#111111]'
        }`}>
          <StatusIcon size={28} className={statusInfo.color} />
        </div>

        <h1 className="font-display text-2xl uppercase tracking-tight">
          {order.status === 'PAID' ? '¡Gracias por tu compra!' : 'Tu pedido'}
        </h1>
        <p className="text-[#888888] text-sm mt-2">
          Pedido{' '}
          <span className="font-display text-[#FAFAFA]">{order.orderNumber}</span>
          {' · '}
          {format(order.createdAt, "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items */}
        <div className="card overflow-hidden md:col-span-2">
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
                  <p className="text-sm text-[#FAFAFA] line-clamp-1">{item.product.name}</p>
                  <p className="text-xs text-[#888888] mt-0.5">
                    {item.quantity} × {formatCLP(item.price)}
                  </p>
                </div>
                <span className="font-display text-sm text-[#FAFAFA]">
                  {formatCLP(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dirección de envío */}
        <div className="card p-5">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-3">
            Dirección de envío
          </h2>
          <p className="text-sm text-[#FAFAFA]">
            {shipping.firstName} {shipping.lastName}
          </p>
          <p className="text-sm text-[#888888] mt-1">
            {shipping.street} {shipping.number}
            {shipping.apartment ? `, ${shipping.apartment}` : ''}
          </p>
          <p className="text-sm text-[#888888]">
            {shipping.commune}, {shipping.region}
          </p>
        </div>

        {/* Resumen de pago */}
        <div className="card p-5">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-3">
            Resumen de pago
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888888]">Subtotal</span>
              <span>{formatCLP(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#1DB954]">
                <span>Descuento</span>
                <span>-{formatCLP(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#888888]">Envío</span>
              <span>{formatCLP(order.shipping)}</span>
            </div>
            <hr className="divider" />
            <div className="flex justify-between font-display text-base">
              <span>Total</span>
              <span>{formatCLP(order.total)}</span>
            </div>
            <p className="text-xs text-[#888888] mt-1">
              Pagado con {order.paymentMethod === 'webpay' ? 'Webpay Plus' : 'MercadoPago'}
            </p>
          </div>
        </div>

        {/* Estado del pedido */}
        <div className="card p-5 md:col-span-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-4">
            Estado del pedido
          </h2>
          <div className="space-y-3">
            {order.statusHistory.map((entry) => {
              const cfg = STATUS_CONFIG[entry.status]
              return (
                <div key={entry.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0C0C0] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#FAFAFA] font-display text-xs uppercase tracking-wider">
                      {cfg?.label ?? entry.status}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-[#888888] mt-0.5">{entry.note}</p>
                    )}
                    <p className="text-[11px] text-[#555555] mt-0.5">
                      {format(entry.createdAt, "d MMM yyyy, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        <Link href="/productos" className="btn-primary">
          Seguir comprando
        </Link>
        <Link href="/cuenta" className="btn-secondary">
          Mis pedidos
        </Link>
      </div>
    </div>
  )
}
