'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Trash2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown } from 'lucide-react'
import { formatCLP } from '@/lib/utils'
import type { ProductWithCategory } from '@/types'

interface AdminProductTableProps {
  products: ProductWithCategory[]
  onDelete: (id: string) => Promise<void>
  onToggleActive: (id: string, isActive: boolean) => Promise<void>
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean
  direction: 'asc' | 'desc'
}) {
  if (!active) return <ChevronUp size={12} className="opacity-30" />
  return direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
}

export function AdminProductTable({
  products,
  onDelete,
  onToggleActive,
}: AdminProductTableProps) {
  const [, startTransition] = useTransition()
  const [sortField, setSortField] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')

  function handleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = products
    .filter((p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortField === 'name') return a.name.localeCompare(b.name) * mul
      if (sortField === 'price') return (a.price - b.price) * mul
      if (sortField === 'stock') return (a.stock - b.stock) * mul
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * mul
    })

  return (
    <div>
      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full sm:max-w-sm"
        />
      </div>

      {/* Tabla */}
      <div className="border border-[#222222] rounded-[2px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222222] bg-[#111111]">
                <th className="px-4 py-3 text-left w-12" />
                <th
                  className="px-4 py-3 text-left font-display text-[10px] uppercase tracking-widest text-[#888888] cursor-pointer hover:text-[#FAFAFA]"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    Producto <SortIcon active={sortField === 'name'} direction={sortDir} />
                  </span>
                </th>
                <th className="px-4 py-3 text-left font-display text-[10px] uppercase tracking-widest text-[#888888]">
                  Categoría
                </th>
                <th
                  className="px-4 py-3 text-right font-display text-[10px] uppercase tracking-widest text-[#888888] cursor-pointer hover:text-[#FAFAFA]"
                  onClick={() => handleSort('price')}
                >
                  <span className="flex items-center justify-end gap-1">
                    Precio <SortIcon active={sortField === 'price'} direction={sortDir} />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-center font-display text-[10px] uppercase tracking-widest text-[#888888] cursor-pointer hover:text-[#FAFAFA]"
                  onClick={() => handleSort('stock')}
                >
                  <span className="flex items-center justify-center gap-1">
                    Stock <SortIcon active={sortField === 'stock'} direction={sortDir} />
                  </span>
                </th>
                <th className="px-4 py-3 text-center font-display text-[10px] uppercase tracking-widest text-[#888888]">
                  Estado
                </th>
                <th className="px-4 py-3 text-right font-display text-[10px] uppercase tracking-widest text-[#888888]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-[#111111] transition-colors">
                  {/* Imagen */}
                  <td className="px-4 py-3">
                    <div className="relative w-10 h-10 bg-[#0A0A0A] border border-[#222222] rounded-[2px] overflow-hidden">
                      <Image
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                      />
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3">
                    <p className="text-[#FAFAFA] text-xs font-body line-clamp-2 max-w-xs">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-[#555555] font-display mt-0.5">{product.sku}</p>
                  </td>

                  {/* Categoría */}
                  <td className="px-4 py-3 text-xs text-[#888888]">{product.category.name}</td>

                  {/* Precio */}
                  <td className="px-4 py-3 text-right font-display text-xs text-[#FAFAFA] whitespace-nowrap">
                    {formatCLP(product.price)}
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${
                      product.stock === 0
                        ? 'badge-error'
                        : product.stock <= 5
                        ? 'badge-warning'
                        : 'badge-success'
                    }`}>
                      {product.stock}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        startTransition(() => onToggleActive(product.id, !product.isActive))
                      }
                      className="btn-ghost p-1 mx-auto"
                      title={product.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {product.isActive ? (
                        <ToggleRight size={20} className="text-[#1DB954]" />
                      ) : (
                        <ToggleLeft size={20} className="text-[#555555]" />
                      )}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/productos/${product.id}/editar`}
                        className="btn-ghost p-2"
                        title="Editar"
                      >
                        <Edit size={13} />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${product.name}"?`)) {
                            startTransition(() => onDelete(product.id))
                          }
                        }}
                        className="btn-ghost p-2 hover:text-[#E53E3E]"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-[#555555] font-display text-xs uppercase tracking-widest">
            Sin productos
          </div>
        )}
      </div>

      <p className="text-xs text-[#555555] mt-3">
        {filtered.length} de {products.length} productos
      </p>
    </div>
  )
}
