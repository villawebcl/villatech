export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCLP } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { OrderStatus } from '@prisma/client'

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

export default async function CuentaPage() {
  const session = await auth()
  if (!session) redirect('/auth/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container-site py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl uppercase tracking-tight">Mi cuenta</h1>
        <p className="text-[#888888] text-sm mt-1">{session.user.email}</p>
      </div>

      <div className="space-y-6">
        {/* Perfil */}
        <div className="card p-5">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-3">
            Datos personales
          </h2>
          <p className="text-sm text-[#FAFAFA]">{session.user.name ?? 'Sin nombre'}</p>
          <p className="text-sm text-[#888888]">{session.user.email}</p>
          <p className="text-xs text-[#555555] mt-2 font-display uppercase tracking-wider">
            Cuenta {session.user.role === 'ADMIN' ? 'administrador' : 'cliente'}
          </p>
        </div>

        {/* Pedidos */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-[#222222]">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
              Mis pedidos ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-[#555555] font-display text-xs uppercase tracking-widest">
                Sin pedidos
              </p>
              <Link href="/productos" className="btn-primary inline-flex">
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#222222]">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orden/${order.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#111111] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xs text-[#FAFAFA]">{order.orderNumber}</p>
                    <p className="text-xs text-[#888888] mt-0.5">
                      {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'} ·{' '}
                      {format(order.createdAt, "d 'de' MMM, yyyy", { locale: es })}
                    </p>
                  </div>
                  <span className={`badge flex-shrink-0 ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-display text-sm text-[#FAFAFA] whitespace-nowrap">
                    {formatCLP(order.total)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
