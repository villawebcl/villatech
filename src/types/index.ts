import type { Product, Category, Order, OrderItem, User, Coupon } from '@prisma/client'
import type { PaymentMethod } from '@/lib/orders'

// ─── Producto con categoría ────────────────────────────────────────────────────
export type ProductWithCategory = Product & {
  category: Category
}

// ─── Item del carrito (estado local) ──────────────────────────────────────────
export interface CartItem {
  id: string        // product id
  name: string
  slug: string
  price: number
  image: string
  quantity: number
  stock: number
  sku: string
}

// ─── Estado del carrito ────────────────────────────────────────────────────────
export interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  totalItems: () => number
  subtotal: () => number
}

// ─── Pedido completo ───────────────────────────────────────────────────────────
export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[]
  user?: User | null
  coupon?: Coupon | null
}

// ─── Filtros de productos ──────────────────────────────────────────────────────
export interface ProductFilters {
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'featured'
  page?: number
  limit?: number
}

// ─── Respuesta paginada ────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

// ─── Dirección de envío ────────────────────────────────────────────────────────
export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  number: string
  apartment?: string
  commune: string
  region: string
  regionCode: string
}

// ─── Datos de checkout ────────────────────────────────────────────────────────
export interface CheckoutData {
  shipping: ShippingAddress
  invoiceType: 'BOLETA' | 'FACTURA'
  rut?: string
  couponCode?: string
  paymentMethod: PaymentMethod
}

// ─── Respuesta de validación de cupón ─────────────────────────────────────────
export interface CouponValidationResult {
  valid: boolean
  coupon?: Coupon
  discount?: number
  error?: string
}

// ─── Session augmentation ─────────────────────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: 'CUSTOMER' | 'ADMIN'
    }
  }
}
