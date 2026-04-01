'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { PriceDisplay } from './PriceDisplay'
import { getDiscountPercent } from '@/lib/utils'
import type { ProductWithCategory } from '@/types'

interface ProductCardProps {
  product: ProductWithCategory
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore()
  const discount = product.comparePrice
    ? getDiscountPercent(product.price, product.comparePrice)
    : 0
  const mainImage = product.images[0] || '/placeholder-product.jpg'

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (product.stock === 0) return
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: mainImage,
      quantity: 1,
      stock: product.stock,
      sku: product.sku,
    })
    openCart()
  }

  return (
    <article className="card group relative flex flex-col overflow-hidden transition-colors duration-150 hover:border-[#333333]">
      {/* Badges absolutos */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <span className="badge badge-success">-{discount}%</span>
        )}
        {product.isFeatured && (
          <span className="badge badge-accent">Destacado</span>
        )}
        {product.stock === 0 && (
          <span className="badge badge-error">Sin stock</span>
        )}
      </div>

      {/* Botón quick view */}
      <Link
        href={`/productos/${product.slug}`}
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 btn-ghost p-2 bg-[#0A0A0A]/80 border border-[#333333]"
        aria-label="Vista rápida"
      >
        <Eye size={14} />
      </Link>

      {/* Imagen */}
      <Link href={`/productos/${product.slug}`} className="block">
        <div className="relative aspect-square bg-[#111111] overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-contain p-6 transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Categoría */}
        <Link
          href={`/categorias/${product.category.slug}`}
          className="text-[10px] font-display text-[#888888] hover:text-[#C0C0C0] uppercase tracking-widest transition-colors"
        >
          {product.category.name}
        </Link>

        {/* Nombre */}
        <Link href={`/productos/${product.slug}`} className="flex-1">
          <h3 className="text-sm font-body text-[#FAFAFA] leading-snug line-clamp-2 group-hover:text-[#C0C0C0] transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-[#555555] font-display mt-1">
            SKU: {product.sku}
          </p>
        </Link>

        {/* Precio */}
        <PriceDisplay
          price={product.price}
          comparePrice={product.comparePrice}
          size="sm"
        />

        {/* Agregar al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn-primary w-full justify-center text-[11px] py-2.5 mt-auto"
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <ShoppingCart size={13} />
          {product.stock === 0 ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </article>
  )
}
