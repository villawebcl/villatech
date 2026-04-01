export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Package, ShieldCheck, Truck } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductGallery } from '@/components/product/ProductGallery'
import { PriceDisplay } from '@/components/product/PriceDisplay'
import { StockBadge } from '@/components/product/StockBadge'
import { SpecsTable } from '@/components/product/SpecsTable'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductWithCategory } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    select: { name: true, description: true, images: true },
  })
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  })

  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    include: { category: true },
    take: 4,
    orderBy: { isFeatured: 'desc' },
  })

  const specs = product.specs as Record<string, string>

  return (
    <div className="container-site py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#888888] mb-8 font-display uppercase tracking-wide">
        <Link href="/" className="hover:text-[#FAFAFA] transition-colors">Inicio</Link>
        <ChevronRight size={12} />
        <Link href="/productos" className="hover:text-[#FAFAFA] transition-colors">Productos</Link>
        <ChevronRight size={12} />
        <Link
          href={`/categorias/${product.category.slug}`}
          className="hover:text-[#FAFAFA] transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#FAFAFA] truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Producto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Galería */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Info */}
        <div className="flex flex-col gap-6">
          {/* Categoría + SKU */}
          <div className="flex items-center justify-between">
            <Link
              href={`/categorias/${product.category.slug}`}
              className="text-xs font-display text-[#888888] hover:text-[#C0C0C0] uppercase tracking-widest transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-xs font-display text-[#555555]">SKU: {product.sku}</span>
          </div>

          {/* Nombre */}
          <h1 className="font-display text-2xl lg:text-3xl leading-tight text-[#FAFAFA]">
            {product.name}
          </h1>

          {/* Precio + stock */}
          <div className="flex items-center gap-4 flex-wrap">
            <PriceDisplay
              price={product.price}
              comparePrice={product.comparePrice}
              size="xl"
              showIvaLabel
            />
            <StockBadge stock={product.stock} />
          </div>

          <hr className="divider" />

          {/* Descripción */}
          <p className="text-[#888888] text-sm leading-relaxed font-body">
            {product.description}
          </p>

          {/* Agregar al carrito */}
          <AddToCartButton product={product as ProductWithCategory} />

          <hr className="divider" />

          {/* Beneficios */}
          <div className="space-y-3">
            {[
              { icon: Truck, text: 'Envío a todo Chile por Starken o Chilexpress' },
              { icon: ShieldCheck, text: 'Garantía oficial de fábrica' },
              { icon: Package, text: 'Producto original sellado' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-[#888888]">
                <Icon size={14} className="text-[#C0C0C0] flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Especificaciones técnicas */}
      {Object.keys(specs).length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl uppercase tracking-tight mb-6">
            Especificaciones técnicas
          </h2>
          <div className="max-w-2xl">
            <SpecsTable specs={specs} />
          </div>
        </section>
      )}

      {/* Productos relacionados */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-xl uppercase tracking-tight">
              Productos relacionados
            </h2>
            <Link
              href={`/categorias/${product.category.slug}`}
              className="text-sm text-[#888888] hover:text-[#FAFAFA] transition-colors"
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(related as ProductWithCategory[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
