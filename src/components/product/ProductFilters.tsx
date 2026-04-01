'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import type { Category } from '@prisma/client'

interface ProductFiltersProps {
  categories: Category[]
  totalProducts: number
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'featured', label: 'Destacados' },
]

const PRICE_RANGES = [
  { label: 'Menos de $100.000', min: 0, max: 100000 },
  { label: '$100.000 – $300.000', min: 100000, max: 300000 },
  { label: '$300.000 – $600.000', min: 300000, max: 600000 },
  { label: '$600.000 – $1.000.000', min: 600000, max: 1000000 },
  { label: 'Más de $1.000.000', min: 1000000, max: undefined },
]

export function ProductFilters({ categories, totalProducts }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentCategory = searchParams.get('category') || ''
  const currentSort = searchParams.get('sort') || 'newest'
  const currentMin = searchParams.get('minPrice') || ''
  const currentMax = searchParams.get('maxPrice') || ''

  const createQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value)
        else params.delete(key)
      })
      return params.toString()
    },
    [searchParams]
  )

  function applyFilter(updates: Record<string, string | undefined>) {
    router.push(`${pathname}?${createQueryString(updates)}`)
  }

  function clearAllFilters() {
    router.push(pathname)
  }

  const hasActiveFilters = currentCategory || currentMin || currentMax

  const FiltersContent = (
    <div className="space-y-6">
      {/* Categorías */}
      <div>
        <h3 className="label mb-3">Categoría</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => applyFilter({ category: undefined })}
              className={`w-full text-left px-3 py-2 text-sm rounded-[2px] transition-colors ${
                !currentCategory
                  ? 'bg-[#FAFAFA] text-[#0A0A0A] font-display text-xs'
                  : 'text-[#888888] hover:text-[#FAFAFA] hover:bg-[#1A1A1A]'
              }`}
            >
              Todos los productos
              <span className="float-right text-[11px] opacity-60">{totalProducts}</span>
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => applyFilter({ category: cat.slug })}
                className={`w-full text-left px-3 py-2 text-sm rounded-[2px] transition-colors ${
                  currentCategory === cat.slug
                    ? 'bg-[#FAFAFA] text-[#0A0A0A] font-display text-xs'
                    : 'text-[#888888] hover:text-[#FAFAFA] hover:bg-[#1A1A1A]'
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <hr className="divider" />

      {/* Rango de precio */}
      <div>
        <h3 className="label mb-3">Precio</h3>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const active =
              currentMin === String(range.min) &&
              currentMax === String(range.max ?? '')
            return (
              <li key={range.label}>
                <button
                  onClick={() =>
                    applyFilter({
                      minPrice: String(range.min),
                      maxPrice: range.max ? String(range.max) : undefined,
                    })
                  }
                  className={`w-full text-left px-3 py-2 text-sm rounded-[2px] transition-colors ${
                    active
                      ? 'bg-[#FAFAFA] text-[#0A0A0A] font-display text-xs'
                      : 'text-[#888888] hover:text-[#FAFAFA] hover:bg-[#1A1A1A]'
                  }`}
                >
                  {range.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Limpiar filtros */}
      {hasActiveFilters && (
        <>
          <hr className="divider" />
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 text-sm text-[#E53E3E] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={14} />
            Limpiar filtros
          </button>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-20">
          {/* Sort (desktop) */}
          <div className="mb-6">
            <label className="label" htmlFor="sort-desktop">
              Ordenar por
            </label>
            <select
              id="sort-desktop"
              value={currentSort}
              onChange={(e) => applyFilter({ sort: e.target.value })}
              className="input text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <hr className="divider mb-6" />
          {FiltersContent}
        </div>
      </aside>

      {/* Mobile filter bar */}
      <div className="lg:hidden flex items-center gap-3 mb-6">
        <button
          onClick={() => setMobileOpen(true)}
          className="btn-secondary flex items-center gap-2 text-xs py-2 px-4"
        >
          <SlidersHorizontal size={14} />
          Filtros
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0C0C0]" />
          )}
        </button>
        <select
          value={currentSort}
          onChange={(e) => applyFilter({ sort: e.target.value })}
          className="input flex-1 text-sm py-2"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 max-w-[90vw] z-50 bg-[#0A0A0A] border-r border-[#222222] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222]">
              <h2 className="font-display text-xs uppercase tracking-widest">
                Filtros
              </h2>
              <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{FiltersContent}</div>
          </div>
        </>
      )}
    </>
  )
}
