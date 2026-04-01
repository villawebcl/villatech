export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-tight">Nuevo producto</h1>
        <p className="text-[#888888] text-sm mt-1">Completa el formulario para agregar un producto al catálogo</p>
      </div>

      <ProductForm categories={categories} mode="create" />
    </div>
  )
}
