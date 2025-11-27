"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Check } from "lucide-react"
import { useCartStore } from "@/app/store/cartStore"
import type { Product } from "@/lib/types"
import Link from "next/link"

interface AddToCartButtonProps {
  product: Product
  selectedSize: string | null
  selectedColor: string | null
  className?: string
  currentStock: number
}

export function AddToCartButton({
  product,
  selectedSize,
  selectedColor,
  currentStock,
  className = "",
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const [showViewCart, setShowViewCart] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)
  const cartItems = useCartStore.getState().items

  const qtyInCart = cartItems
    .filter(
      (it) =>
        it.product_id === product.id &&
        it.size === selectedSize &&
        it.color === selectedColor
    )
    .reduce((acc, it) => acc + it.quantity, 0)

  const maxReached = qtyInCart >= currentStock

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return
    if (maxReached) return

    addToCart(product, selectedSize, selectedColor, currentStock)

    setIsAdded(true)
    setShowViewCart(true)

    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="space-y-3 w-full">
      {/* Botón principal */}
      <Button
        onClick={handleAddToCart}
        disabled={maxReached || currentStock === 0}
        className={`
          w-full h-14 text-lg font-medium rounded-xl transition-all duration-300 
          flex items-center justify-center gap-2 ${className}
          ${maxReached || currentStock === 0
            ? "bg-gray-400 cursor-not-allowed text-white"
            : isAdded
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-beige-700 hover:bg-beige-800 text-beige-50"
          }
        `}
      >
        {maxReached || currentStock === 0 ? (
          <>Sin stock disponible</>
        ) : isAdded ? (
          <>
            <Check className="w-5 h-5" />
            Añadido al Carrito
          </>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5" />
            Añadir al Carrito
          </>
        )}
      </Button>

      {/* Botón secundario: Ver Carrito */}
      {showViewCart && (
        <Link href="/carrito" className="block w-full">
          <Button
            className="
              w-full h-12 text-base rounded-xl border border-beige-300 
              text-beige-800 bg-beige-100 hover:bg-beige-200 transition-all
            "
          >
            Ver carrito 🛒
          </Button>
        </Link>
      )}
    </div>
  )
}
