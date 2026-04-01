export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCLP } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { OrderStatus } from '@prisma/client'

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'Procesando',
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

const ALL_STATUSES = Object.values(OrderStatus)

export default async function AdminPedidosPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const statusFilter = sp.status as OrderStatus | undefined
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where = {
    ...(statusFilter && ALL_STATUSES.includes(statusFilter) && { status: statusFilter }),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        items: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight">Pedidos</h1>
          <p className="text-[#888888] text-sm mt-1">{total} pedidos</p>
        </div>
        <a
          href={`/api/admin/orders/export?status=${statusFilter ?? ''}`}
          className="btn-secondary text-xs py-2 px-4"
        >
          Exportar CSV
        </a>
      </div>

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/pedidos"
          className={`badge text-xs py-1.5 px-3 ${
            !statusFilter ? 'badge-accent' : 'border-[#333333] text-[#888888] hover:text-[#FAFAFA]'
          }`}
        >
          Todos ({total})
        </Link>
        {ALL_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/pedidos?status=${status}`}
            className={`badge text-xs py-1.5 px-3 ${
              statusFilter === status ? STATUS_COLORS[status] : 'border-[#333333] text-[#888888] hover:text-[#FAFAFA]'
            }`}
          >
            {STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {/* Tabla */}
      <div className="border border-[#222222] rounded-[2px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222] bg-[#111111]">
              {['Pedido', 'Cliente', 'Items', 'Total', 'Estado', 'Fecha', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-display text-[10px] uppercase tracking-widest text-[#888888]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#111111] transition-colors">
                <td className="px-4 py-3 font-display text-xs text-[#FAFAFA]">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3 text-xs text-[#888888]">
                  {order.user?.email ?? order.guestEmail ?? 'Invitado'}
                </td>
                <td className="px-4 py-3 text-center text-xs text-[#888888]">
                  {order.items.length}
                </td>
                <td className="px-4 py-3 font-display text-xs text-[#FAFAFA] whitespace-nowrap">
                  {formatCLP(order.total)}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#888888] whitespace-nowrap">
                  {format(order.createdAt, 'd MMM yyyy', { locale: es })}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-xs text-[#888888] hover:text-[#FAFAFA] transition-colors"
                  >
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="py-12 text-center text-[#555555] font-display text-xs uppercase tracking-widest">
            Sin pedidos
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/pedidos?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}`}
              className={`w-9 h-9 flex items-center justify-center text-sm rounded-[2px] transition-colors font-display ${
                p === page
                  ? 'bg-[#FAFAFA] text-[#0A0A0A]'
                  : 'border border-[#333333] text-[#888888] hover:text-[#FAFAFA]'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
