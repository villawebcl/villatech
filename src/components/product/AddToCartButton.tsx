'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { ProductWithCategory } from '@/types'

interface AddToCartButtonProps {
  product: ProductWithCategory
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCartStore()

  if (product.stock === 0) {
    return (
      <button disabled className="btn-primary w-full justify-center opacity-40 cursor-not-allowed">
        Sin stock disponible
      </button>
    )
  }

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images[0] || '/placeholder-product.jpg',
      quantity: qty,
      stock: product.stock,
      sku: product.sku,
    })
    setAdded(true)
    openCart()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* Selector de cantidad */}
      <div className="flex items-center gap-3">
        <label className="label whitespace-nowrap">Cantidad</label>
        <div className="flex items-center border border-[#333333] rounded-[2px]">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2.5 text-[#888888] hover:text-[#FAFAFA] transition-colors text-lg leading-none"
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span className="w-12 text-center font-display text-[#FAFAFA]">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="px-4 py-2.5 text-[#888888] hover:text-[#FAFAFA] transition-colors text-lg leading-none"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
        <span className="text-xs text-[#888888]">
          {product.stock <= 10 ? `(${product.stock} disponibles)` : ''}
        </span>
      </div>

      {/* Botón agregar */}
      <button
        onClick={handleAdd}
        className={`btn-primary w-full justify-center transition-all ${
          added ? 'bg-[#1DB954] text-[#0A0A0A]' : ''
        }`}
      >
        {added ? (
          <>
            <Check size={16} />
            ¡Agregado al carrito!
          </>
        ) : (
          <>
            <ShoppingCart size={16} />
            Agregar al carrito
          </>
        )}
      </button>
    </div>
  )
}
