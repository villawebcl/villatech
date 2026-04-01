export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ])

  if (!product) notFound()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-tight">Editar producto</h1>
        <p className="text-[#888888] text-sm mt-1">{product.name}</p>
      </div>

      <ProductForm
        categories={categories}
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice ?? undefined,
          stock: product.stock,
          sku: product.sku,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          images: product.images,
          specs: (product.specs ?? {}) as Record<string, string>,
        }}
      />
    </div>
  )
}
