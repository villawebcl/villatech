export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { ProductFilters } from '@/components/product/ProductFilters'
import { Pagination } from '@/components/ui/Pagination'
import type { ProductWithCategory } from '@/types'

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Catálogo completo de productos de tecnología y computación en VillaTech Chile.',
}

interface PageProps {
  searchParams: Promise<{
    category?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
    q?: string
  }>
}

async function ProductGrid({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const limit = 12
  const skip = (page - 1) * limit

  const categorySlug = params.category
  const search = params.q
  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined
  const sortBy = params.sort || 'newest'

  const where = {
    isActive: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { sku: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      },
    }),
  }

  const orderBy =
    sortBy === 'price_asc'
      ? { price: 'asc' as const }
      : sortBy === 'price_desc'
      ? { price: 'desc' as const }
      : sortBy === 'featured'
      ? { isFeatured: 'desc' as const }
      : { createdAt: 'desc' as const }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center gap-4">
        <p className="font-display text-sm uppercase tracking-widest text-[#555555]">
          Sin resultados
        </p>
        <p className="text-[#888888] text-sm">
          {search
            ? `No encontramos productos para "${search}"`
            : 'No hay productos con los filtros seleccionados.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <p className="text-xs text-[#888888] mb-6 font-display uppercase tracking-wider">
        {total} {total === 1 ? 'producto' : 'productos'}
        {search && ` para "${search}"`}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {(products as ProductWithCategory[]).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="flex-1">
      <div className="skeleton h-4 w-24 mb-6 rounded-[2px]" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default async function ProductosPage({ searchParams }: PageProps) {
  const [categories, totalProducts] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.product.count({ where: { isActive: true } }),
  ])

  return (
    <div className="container-site py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl uppercase tracking-tight">Productos</h1>
        <p className="text-[#888888] text-sm mt-1">
          Equipos y componentes de tecnología con envío a todo Chile
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <Suspense>
          <ProductFilters categories={categories} totalProducts={totalProducts} />
        </Suspense>

        {/* Grid */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
