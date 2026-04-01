'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
}

export function Pagination({ page, totalPages }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  )

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Paginación">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
        className="btn-ghost p-2 disabled:opacity-30"
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1]
        const showEllipsis = prev && p - prev > 1
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="px-2 text-[#555555] font-display text-sm">…</span>
            )}
            <button
              onClick={() => goToPage(p)}
              className={`w-9 h-9 text-sm rounded-[2px] transition-colors font-display ${
                p === page
                  ? 'bg-[#FAFAFA] text-[#0A0A0A]'
                  : 'text-[#888888] hover:text-[#FAFAFA] hover:bg-[#1A1A1A]'
              }`}
            >
              {p}
            </button>
          </span>
        )
      })}

      <button
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages}
        className="btn-ghost p-2 disabled:opacity-30"
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  )
}
