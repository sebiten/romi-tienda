import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createClient } from "@/utils/supabase/client"
import type { CartItem, Product } from "@/lib/types"

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null

  // Cart calculations
  subtotal: number
  shipping: number
  discount: number
  total: number

  // Products from Supabase
  products: Product[]
  isLoadingProducts: boolean

  // Actions
  fetchProducts: () => Promise<void>
  addToCart: (product: Product, size: string, color: string) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  calculateTotals: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      error: null,
      subtotal: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      products: [],
      isLoadingProducts: false,

      // Fetch products from Supabase
      fetchProducts: async () => {
        try {
          set({ isLoadingProducts: true, error: null })

          const supabase = createClient()
          const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false })

          if (productsError) {
            throw new Error(productsError.message)
          }

          set({
            products: products || [],
            isLoadingProducts: false,
          })
        } catch (error) {
          console.error("Error fetching products:", error)
          set({
            error: error instanceof Error ? error.message : "Error fetching products",
            isLoadingProducts: false,
          })
        }
      },

      // Add item to cart
      addToCart: (product, size, color) => {
        const { items } = get()

        // Check if item already exists in cart with same size and color
        const existingItemIndex = items.findIndex(
          (item) => item.product_id === product.id && item.size === size && item.color === color,
        )

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += 1

          set({ items: updatedItems })
        } else {
          // Add new item if it doesn't exist
          const newItem: CartItem = {
            id: `${product.id}_${size}_${color}_${Date.now()}`,
            name: product.title,
            price: product.price!,
            originalPrice: product.price! || product.price!,
            quantity: 1,
            image: product.images?.[0] || "/placeholder.svg",
            size,
            color,
            product_id: product.id,
          }

          set({ items: [...items, newItem] })
        }

        // Recalculate totals
        get().calculateTotals()
      },

      // Remove item from cart
      removeFromCart: (itemId) => {
        const { items } = get()
        const updatedItems = items.filter((item) => item.id !== itemId)

        set({ items: updatedItems })
        get().calculateTotals()
      },

      // Update item quantity
      updateQuantity: (itemId, quantity) => {
        const { items } = get()

        if (quantity < 1) {
          // Remove item if quantity is less than 1
          get().removeFromCart(itemId)
          return
        }

        const updatedItems = items.map((item) => (item.id === itemId ? { ...item, quantity } : item))

        set({ items: updatedItems })
        get().calculateTotals()
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] })
        get().calculateTotals()
      },

      // Calculate totals
      calculateTotals: () => {
        const { items } = get()

        // Calculate subtotal
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

        // Calculate discount
        const discount = items.reduce((total, item) => total + (item.originalPrice - item.price) * item.quantity, 0)

        // Calculate shipping (free if subtotal > 999)
        const shipping = subtotal > 999 ? 0 : 150

        // Calculate total
        const total = subtotal + shipping

        set({ subtotal, discount, shipping, total })
      },
    }),
    {
      name: "alma-lucia-cart",
      // Only persist specific parts of the state
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
)

