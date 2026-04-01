interface StockBadgeProps {
  stock: number
}

export function StockBadge({ stock }: StockBadgeProps) {
  if (stock === 0) {
    return <span className="badge badge-error">Sin stock</span>
  }
  if (stock <= 5) {
    return (
      <span className="badge badge-warning">
        Últimas {stock} unidades
      </span>
    )
  }
  return <span className="badge badge-success">En stock</span>
}
