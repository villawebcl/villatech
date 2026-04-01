export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatCLP } from '@/lib/utils'
import { startOfDay, startOfMonth } from 'date-fns'
import {
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
} from 'lucide-react'

async function getDashboardStats() {
  const today = startOfDay(new Date())
  const monthStart = startOfMonth(new Date())

  const [
    ordersToday,
    pendingOrders,
    monthRevenue,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      select: { id: true, name: true, stock: true, sku: true },
      orderBy: { stock: 'asc' },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        guestEmail: true,
        user: { select: { email: true } },
      },
    }),
  ])

  return {
    ordersToday,
    pendingOrders,
    monthRevenue: monthRevenue._sum.total ?? 0,
    lowStockProducts,
    recentOrders,
  }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'badge-warning',
  PAID: 'badge-success',
  PROCESSING: 'badge-accent',
  SHIPPED: 'badge-accent',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-error',
  REFUNDED: 'badge-error',
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const STAT_CARDS = [
    {
      label: 'Pedidos hoy',
      value: String(stats.ordersToday),
      icon: ShoppingBag,
      sub: 'pedidos recibidos',
    },
    {
      label: 'Pendientes de pago',
      value: String(stats.pendingOrders),
      icon: Clock,
      sub: 'esperando confirmación',
      alert: stats.pendingOrders > 0,
    },
    {
      label: 'Ingresos del mes',
      value: formatCLP(stats.monthRevenue),
      icon: TrendingUp,
      sub: new Date().toLocaleString('es-CL', { month: 'long', year: 'numeric' }),
    },
    {
      label: 'Stock bajo',
      value: String(stats.lowStockProducts.length),
      icon: Package,
      sub: 'productos bajo 5 unidades',
      alert: stats.lowStockProducts.length > 0,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-tight">Dashboard</h1>
        <p className="text-[#888888] text-sm mt-1">
          {new Date().toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <card.icon size={18} className={card.alert ? 'text-[#D97706]' : 'text-[#C0C0C0]'} />
              {card.alert && (
                <AlertTriangle size={14} className="text-[#D97706]" />
              )}
            </div>
            <p className="font-display text-2xl text-[#FAFAFA]">{card.value}</p>
            <p className="text-[11px] font-display text-[#888888] uppercase tracking-wider mt-1">
              {card.label}
            </p>
            <p className="text-xs text-[#555555] mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos pedidos */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-3 border-b border-[#222222] flex items-center justify-between">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
              Últimos pedidos
            </h2>
            <Link href="/admin/pedidos" className="text-xs text-[#888888] hover:text-[#FAFAFA] transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-[#222222]">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-[#111111] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xs text-[#FAFAFA]">{order.orderNumber}</p>
                  <p className="text-xs text-[#888888] mt-0.5 truncate">
                    {order.user?.email ?? order.guestEmail ?? 'Invitado'}
                  </p>
                </div>
                <span className={`badge ${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
                <span className="font-display text-sm text-[#FAFAFA] whitespace-nowrap">
                  {formatCLP(order.total)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stock bajo */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-[#222222]">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
              Stock bajo
            </h2>
          </div>
          <div className="divide-y divide-[#222222]">
            {stats.lowStockProducts.length === 0 ? (
              <p className="px-5 py-6 text-xs text-[#555555] text-center font-display uppercase tracking-widest">
                Sin alertas
              </p>
            ) : (
              stats.lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/productos/${p.id}/editar`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#111111] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-[#FAFAFA] truncate">{p.name}</p>
                    <p className="text-[11px] text-[#888888]">{p.sku}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ml-2 ${p.stock === 0 ? 'badge-error' : 'badge-warning'}`}>
                    {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
