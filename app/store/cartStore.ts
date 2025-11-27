import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createClient } from "@/utils/supabase/client"
import type { CartItem, Product } from "@/lib/types"

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null

  // Totals
  subtotal: number
  shipping: number
  discount: number
  total: number

  // Products
  products: Product[]
  isLoadingProducts: boolean

  // Actions
  fetchProducts: () => Promise<void>
  addToCart: (product: Product, size: string, color: string, variantStock: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  calculateTotals: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      subtotal: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      products: [],
      isLoadingProducts: false,

      // Fetch products
      fetchProducts: async () => {
        try {
          set({ isLoadingProducts: true, error: null })

          const supabase = createClient()
          const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false })

          if (productsError) throw new Error(productsError.message)

          set({ products: products || [], isLoadingProducts: false })
        } catch (error) {
          console.error("Error fetching products:", error)
          set({
            error: error instanceof Error ? error.message : "Error fetching products",
            isLoadingProducts: false,
          })
        }
      },

      // 🛒 Add to cart WITH VARIANTS
      addToCart: (product, size, color, variantStock) => {
        const { items } = get()

        const existingItemIndex = items.findIndex(
          (item) =>
            item.product_id === product.id && item.size === size && item.color === color
        )

        if (existingItemIndex > -1) {
          const updatedItems = [...items]
          const item = updatedItems[existingItemIndex]

          // No permitir pasar stock
          if (item.quantity >= variantStock) return

          updatedItems[existingItemIndex].quantity += 1
          set({ items: updatedItems })
        } else {
          const newItem: CartItem = {
            id: `${product.id}_${size}_${color}_${Date.now()}`,
            name: product.title,
            price: product.price!,
            originalPrice: product.price!,
            quantity: 1,
            image: product.images?.[0] || "/placeholder.svg",
            size,
            color,
            product_id: product.id,
            variantStock,
          }

          set({ items: [...items, newItem] })
        }

        get().calculateTotals()
      },

      // Remove item
      removeFromCart: (itemId) => {
        const updatedItems = get().items.filter((item) => item.id !== itemId)
        set({ items: updatedItems })
        get().calculateTotals()
      },

      // Update quantity WITH STOCK LIMITS
      updateQuantity: (itemId, quantity) => {
        const { items } = get()

        const updatedItems = items
          .map((item) => {
            if (item.id === itemId) {
              // Eliminamos si ponen 0
              if (quantity < 1) return null

              // No dejar pasar stock
              const max = item.variantStock ?? item.quantity
              const safeQty = Math.min(quantity, max)

              return { ...item, quantity: safeQty }
            }
            return item
          })
          .filter(Boolean) as CartItem[]

        set({ items: updatedItems })
        get().calculateTotals()
      },

      clearCart: () => {
        set({ items: [] })
        get().calculateTotals()
      },

      calculateTotals: () => {
        const { items } = get();

        // Cantidad total de unidades en el carrito
        const totalUnits = items.reduce((total, item) => total + item.quantity, 0);

        // Subtotal normal
        const subtotal = items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        // Descuento automático por volumen
        let discount = 0;

        if (totalUnits >= 6) {
          // 10% de descuento
          discount = subtotal * 0.10;
        }

        // Calcular shipping (gratis si subtotal > 999)
        const shipping = subtotal > 999 ? 0 : 150;

        // Total final
        const total = subtotal - discount + shipping;

        set({ subtotal, discount, shipping, total });
      },

    }),
    {
      name: "alma-lucia-cart",
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)
