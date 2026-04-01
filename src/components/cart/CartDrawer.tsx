'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatCLP } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)
  const sub = subtotal()

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeCart])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Carrito de compras"
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-[#0A0A0A] border-l border-[#222222] flex flex-col animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#C0C0C0]" />
            <h2 className="font-display text-sm uppercase tracking-widest text-[#FAFAFA]">
              Carrito
            </h2>
            {items.length > 0 && (
              <span className="badge badge-accent ml-1">{items.length}</span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="btn-ghost p-2"
            aria-label="Cerrar carrito"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center">
              <ShoppingBag size={24} className="text-[#555555]" />
            </div>
            <div>
              <p className="font-display text-sm text-[#FAFAFA] uppercase tracking-widest">
                Carrito vacío
              </p>
              <p className="text-sm text-[#888888] mt-1">
                Agrega productos para continuar
              </p>
            </div>
            <Link href="/productos" onClick={closeCart} className="btn-secondary mt-2">
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <ul className="flex-1 overflow-y-auto divide-y divide-[#222222]">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 p-4 hover:bg-[#111111] transition-colors">
                  {/* Imagen */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-[#111111] border border-[#222222] rounded-[2px] overflow-hidden">
                    <Image
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="80px"
                    />
                  </div>

                  {/* Detalle */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/productos/${item.slug}`}
                      onClick={closeCart}
                      className="text-sm text-[#FAFAFA] hover:text-[#C0C0C0] transition-colors line-clamp-2 leading-tight font-body"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[11px] text-[#888888] font-display mt-0.5">
                      SKU: {item.sku}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Cantidad */}
                      <div className="flex items-center gap-1 border border-[#333333] rounded-[2px]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-[#888888] hover:text-[#FAFAFA] transition-colors"
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-sm font-display text-[#FAFAFA]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-1.5 text-[#888888] hover:text-[#FAFAFA] transition-colors disabled:opacity-30"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Precio */}
                      <span className="font-display text-sm text-[#FAFAFA]">
                        {formatCLP(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn-ghost p-1 self-start text-[#555555] hover:text-[#E53E3E]"
                    aria-label="Eliminar del carrito"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-[#222222] p-6 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-[#888888] font-body text-sm">Subtotal</span>
                <span className="font-display text-lg text-[#FAFAFA]">
                  {formatCLP(sub)}
                </span>
              </div>
              <p className="text-[11px] text-[#888888]">
                IVA incluido · El envío se calcula en el checkout
              </p>
              <Link href="/checkout" onClick={closeCart} className="btn-primary w-full justify-center text-center">
                Ir al Checkout
              </Link>
              <Link href="/carro" onClick={closeCart} className="btn-secondary w-full justify-center text-center">
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  )
}
