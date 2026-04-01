import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartStore } from '@/types'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: CartItem) => {
        const existing = get().items.find((i) => i.id === product.id)
        if (existing) {
          const newQty = Math.min(existing.quantity + product.quantity, product.stock)
          set((state) => ({
            items: state.items.map((i) =>
              i.id === product.id ? { ...i, quantity: newQty } : i
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, product] }))
        }
      },

      removeItem: (id: string) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }))
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'villatech-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
