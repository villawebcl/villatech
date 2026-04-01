export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded-[2px]" />
        <div className="skeleton h-4 w-full rounded-[2px]" />
        <div className="skeleton h-4 w-3/4 rounded-[2px]" />
        <div className="skeleton h-5 w-24 rounded-[2px]" />
        <div className="skeleton h-9 w-full rounded-[2px]" />
      </div>
    </div>
  )
}
