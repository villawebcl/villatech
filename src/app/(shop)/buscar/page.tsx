export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import type { ProductWithCategory } from '@/types'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Búsqueda: "${q}"` : 'Buscar productos',
  }
}

async function SearchResults({ query }: { query: string }) {
  if (!query.trim()) return null

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: { category: true },
    orderBy: { isFeatured: 'desc' },
    take: 24,
  })

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-sm uppercase tracking-widest text-[#555555] mb-2">
          Sin resultados
        </p>
        <p className="text-sm text-[#888888]">
          No encontramos productos para &ldquo;{query}&rdquo;
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-[#888888] mb-6 font-display uppercase tracking-wider">
        {products.length} resultado{products.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(products as ProductWithCategory[]).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const { q } = await searchParams

  return (
    <div className="container-site py-10">
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="font-display text-3xl uppercase tracking-tight mb-6 text-center">
          Buscar
        </h1>

        <form method="get" action="/buscar" className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]"
          />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar productos, marcas, SKU…"
            className="input pl-11 text-base py-3"
            autoFocus
            autoComplete="off"
          />
        </form>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        }
      >
        {q ? <SearchResults query={q} /> : (
          <p className="text-center text-[#888888] text-sm">
            Escribe algo para buscar en el catálogo
          </p>
        )}
      </Suspense>
    </div>
  )
}
