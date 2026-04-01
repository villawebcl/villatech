export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { formatCLP } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminClientesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const limit = 25
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { orders: true } },
        orders: {
          where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
          select: { total: true },
        },
      },
    }),
    prisma.user.count(),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-tight">Clientes</h1>
        <p className="text-[#888888] text-sm mt-1">{total} clientes registrados</p>
      </div>

      <div className="border border-[#222222] rounded-[2px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222] bg-[#111111]">
              {['Nombre / Email', 'Rol', 'Pedidos', 'Gasto total', 'Registrado'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-display text-[10px] uppercase tracking-widest text-[#888888]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {users.map((user) => {
              const totalSpent = user.orders.reduce((sum, o) => sum + o.total, 0)
              return (
                <tr key={user.id} className="hover:bg-[#111111] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-xs text-[#FAFAFA]">{user.name ?? '(sin nombre)'}</p>
                    <p className="text-[11px] text-[#888888]">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-accent' : 'badge-success'} text-[9px]`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#888888] text-center">
                    {user._count.orders}
                  </td>
                  <td className="px-4 py-3 font-display text-xs text-[#FAFAFA]">
                    {totalSpent > 0 ? formatCLP(totalSpent) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#888888]">
                    {format(user.createdAt, 'd MMM yyyy', { locale: es })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-12 text-center text-[#555555] font-display text-xs uppercase tracking-widest">
            Sin clientes registrados
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/clientes?page=${p}`}
              className={`w-9 h-9 flex items-center justify-center text-sm rounded-[2px] transition-colors font-display ${
                p === page
                  ? 'bg-[#FAFAFA] text-[#0A0A0A]'
                  : 'border border-[#333333] text-[#888888] hover:text-[#FAFAFA]'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
