export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/ProductCard'
import { CategorySortSelect } from '@/components/product/CategorySortSelect'
import type { ProductWithCategory } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return { title: 'Categoría no encontrada' }
  return {
    title: category.name,
    description: `Productos de ${category.name} en VillaTech. Tecnología de calidad con envío a todo Chile.`,
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const limit = 12
  const skip = (page - 1) * limit
  const sortBy = sp.sort || 'newest'

  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const orderBy =
    sortBy === 'price_asc'
      ? { price: 'asc' as const }
      : sortBy === 'price_desc'
      ? { price: 'desc' as const }
      : { createdAt: 'desc' as const }

  const where = { isActive: true, categoryId: category.id }

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

  return (
    <div className="container-site py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#888888] mb-6 font-display uppercase tracking-wide">
        <Link href="/" className="hover:text-[#FAFAFA] transition-colors">Inicio</Link>
        <ChevronRight size={12} />
        <Link href="/productos" className="hover:text-[#FAFAFA] transition-colors">Productos</Link>
        <ChevronRight size={12} />
        <span className="text-[#FAFAFA]">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight">{category.name}</h1>
          <p className="text-[#888888] text-sm mt-1">
            {total} {total === 1 ? 'producto' : 'productos'} disponibles
          </p>
        </div>

        <CategorySortSelect value={sortBy} />
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-sm uppercase tracking-widest text-[#555555]">
            Sin productos en esta categoría
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {(products as ProductWithCategory[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Paginación simple */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/categorias/${slug}?page=${p}&sort=${sortBy}`}
              className={`w-9 h-9 flex items-center justify-center text-sm rounded-[2px] transition-colors font-display ${
                p === page
                  ? 'bg-[#FAFAFA] text-[#0A0A0A]'
                  : 'border border-[#333333] text-[#888888] hover:text-[#FAFAFA] hover:border-[#555555]'
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
