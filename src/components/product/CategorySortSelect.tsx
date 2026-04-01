'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface CategorySortSelectProps {
  value: string
}

export function CategorySortSelect({ value }: CategorySortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', nextValue)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="input w-auto text-sm py-2"
    >
      <option value="newest">Más recientes</option>
      <option value="price_asc">Menor precio</option>
      <option value="price_desc">Mayor precio</option>
    </select>
  )
}
