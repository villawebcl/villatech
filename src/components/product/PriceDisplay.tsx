import { formatCLP, getDiscountPercent } from '@/lib/utils'

interface PriceDisplayProps {
  price: number
  comparePrice?: number | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showIvaLabel?: boolean
}

const sizes = {
  sm: { price: 'text-base', compare: 'text-sm', badge: 'text-[10px]' },
  md: { price: 'text-xl', compare: 'text-sm', badge: 'text-[10px]' },
  lg: { price: 'text-2xl', compare: 'text-base', badge: 'text-xs' },
  xl: { price: 'text-3xl', compare: 'text-lg', badge: 'text-xs' },
}

export function PriceDisplay({
  price,
  comparePrice,
  size = 'md',
  showIvaLabel = false,
}: PriceDisplayProps) {
  const s = sizes[size]
  const discount = comparePrice ? getDiscountPercent(price, comparePrice) : 0

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`font-display font-bold text-[#FAFAFA] ${s.price}`}>
        {formatCLP(price)}
      </span>
      {comparePrice && comparePrice > price && (
        <span className={`font-body text-[#888888] line-through ${s.compare}`}>
          {formatCLP(comparePrice)}
        </span>
      )}
      {discount > 0 && (
        <span className={`badge badge-success ${s.badge}`}>
          -{discount}%
        </span>
      )}
      {showIvaLabel && (
        <span className="text-[11px] text-[#888888] font-body">
          IVA inc.
        </span>
      )}
    </div>
  )
}
