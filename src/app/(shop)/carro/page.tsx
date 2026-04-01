'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatCLP } from '@/lib/utils'
import type { CouponValidationResult } from '@/types'

export default function CarroPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore()
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<CouponValidationResult | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const sub = subtotal()
  const discount = couponResult?.discount ?? 0
  const total = sub - discount

  async function validateCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal: sub }),
      })
      const data = await res.json()
      setCouponResult(data)
    } catch {
      setCouponResult({ valid: false, error: 'Error al validar el cupón' })
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCouponCode('')
    setCouponResult(null)
  }

  if (items.length === 0) {
    return (
      <div className="container-site py-20 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center">
          <ShoppingBag size={32} className="text-[#555555]" />
        </div>
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight">Carrito vacío</h1>
          <p className="text-[#888888] text-sm mt-2">
            No tienes productos en tu carrito todavía.
          </p>
        </div>
        <Link href="/productos" className="btn-primary">
          Explorar productos
          <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="container-site py-10">
      <h1 className="font-display text-3xl uppercase tracking-tight mb-8">
        Mi carrito
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-0 divide-y divide-[#222222] border border-[#222222] rounded-[2px]">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-5 hover:bg-[#111111] transition-colors">
              {/* Imagen */}
              <div className="relative w-24 h-24 flex-shrink-0 bg-[#111111] border border-[#222222] rounded-[2px] overflow-hidden">
                <Image
                  src={item.image || '/placeholder-product.jpg'}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                />
              </div>

              {/* Detalle */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/productos/${item.slug}`}
                  className="text-sm font-body text-[#FAFAFA] hover:text-[#C0C0C0] transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-[11px] text-[#555555] font-display mt-0.5">
                  SKU: {item.sku}
                </p>
                <p className="text-[11px] text-[#888888] mt-0.5">
                  {formatCLP(item.price)} c/u
                </p>

                <div className="flex items-center gap-4 mt-3">
                  {/* Cantidad */}
                  <div className="flex items-center border border-[#333333] rounded-[2px]">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-[#888888] hover:text-[#FAFAFA] transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-display">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-3 py-1.5 text-[#888888] hover:text-[#FAFAFA] transition-colors disabled:opacity-30"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <span className="font-display text-[#FAFAFA] text-sm">
                    {formatCLP(item.price * item.quantity)}
                  </span>
                </div>
              </div>

              {/* Eliminar */}
              <button
                onClick={() => removeItem(item.id)}
                className="btn-ghost p-2 text-[#555555] hover:text-[#E53E3E] self-start"
                aria-label="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="space-y-4">
          {/* Cupón */}
          <div className="card p-5">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-3 flex items-center gap-2">
              <Tag size={12} /> Cupón de descuento
            </h2>

            {couponResult?.valid ? (
              <div className="flex items-center justify-between bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-[2px] px-3 py-2">
                <div>
                  <p className="text-xs font-display text-[#1DB954] uppercase tracking-wider">
                    {couponCode.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-[#888888] mt-0.5">
                    -{formatCLP(discount)} de descuento
                  </p>
                </div>
                <button onClick={removeCoupon} className="btn-ghost p-1 text-[#888888] hover:text-[#E53E3E]">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CODIGO"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && validateCoupon()}
                  className="input flex-1 text-sm uppercase tracking-widest font-display"
                />
                <button
                  onClick={validateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="btn-secondary text-xs px-4 disabled:opacity-40"
                >
                  {couponLoading ? '…' : 'Aplicar'}
                </button>
              </div>
            )}

            {couponResult && !couponResult.valid && (
              <p className="text-[11px] text-[#E53E3E] mt-2">{couponResult.error}</p>
            )}
          </div>

          {/* Totales */}
          <div className="card p-5 space-y-3">
            <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-2">
              Resumen
            </h2>

            <div className="flex justify-between text-sm">
              <span className="text-[#888888]">Subtotal</span>
              <span className="font-display">{formatCLP(sub)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm text-[#1DB954]">
                <span>Descuento</span>
                <span className="font-display">-{formatCLP(discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-[#888888]">
              <span>Envío</span>
              <span>Calculado en checkout</span>
            </div>

            <hr className="divider" />

            <div className="flex justify-between">
              <span className="font-display text-sm uppercase tracking-wider">Total</span>
              <span className="font-display text-lg">{formatCLP(total)}</span>
            </div>

            <p className="text-[11px] text-[#888888]">IVA incluido en todos los precios</p>

            <Link
              href={`/checkout${couponResult?.valid ? `?coupon=${couponCode}` : ''}`}
              className="btn-primary w-full justify-center mt-4"
            >
              Proceder al checkout
              <ArrowRight size={16} />
            </Link>

            <Link href="/productos" className="btn-ghost w-full justify-center text-xs">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
