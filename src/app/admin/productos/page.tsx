export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { AdminProductTable } from '@/components/admin/AdminTable'
import { revalidatePath } from 'next/cache'
import type { ProductWithCategory } from '@/types'

async function deleteProduct(id: string) {
  'use server'
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  })
  revalidatePath('/admin/productos')
}

async function toggleProduct(id: string, isActive: boolean) {
  'use server'
  await prisma.product.update({
    where: { id },
    data: { isActive },
  })
  revalidatePath('/admin/productos')
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight">Productos</h1>
          <p className="text-[#888888] text-sm mt-1">{products.length} productos en total</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          <Plus size={16} />
          Nuevo producto
        </Link>
      </div>

      <AdminProductTable
        products={products as ProductWithCategory[]}
        onDelete={deleteProduct}
        onToggleActive={toggleProduct}
      />
    </div>
  )
}
